#!/usr/bin/env node
/**
 * split-module.mjs — behaviour-preserving splitter for oversized TS/TSX files.
 *
 * Usage: node scripts/refactor/split-module.mjs <config.json>
 *
 * Config shape:
 * {
 *   "source": "src/components/sanad/CaseDetailDrawer.tsx",
 *   "modules": {
 *     "src/components/sanad/case-detail/meta.ts": { "symbols": ["STAGE_COLORS"], "useClient": false },
 *     ...
 *   }
 * }
 *
 * Every top-level statement whose declared name is listed under a module is
 * moved there (with its leading comments). Everything else stays in `source`.
 * Each output receives the original import block plus imports of all sibling
 * modules' symbols; TypeScript's organizeImports then prunes what is unused.
 * Moved symbols that were exported from `source` are re-exported from it, so
 * existing importers keep working.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ts = require('typescript')
import { prune } from './prune-imports.mjs'

const ROOT = process.cwd()
const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const srcPath = path.resolve(ROOT, cfg.source)
const text = fs.readFileSync(srcPath, 'utf8')
const sf = ts.createSourceFile(srcPath, text, ts.ScriptTarget.Latest, true, srcPath.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)

const symbolToModule = new Map()
for (const [mod, spec] of Object.entries(cfg.modules)) for (const s of spec.symbols) symbolToModule.set(s, mod)

function declNames(stmt) {
  if (ts.isFunctionDeclaration(stmt) || ts.isClassDeclaration(stmt) || ts.isInterfaceDeclaration(stmt) || ts.isTypeAliasDeclaration(stmt) || ts.isEnumDeclaration(stmt)) {
    return stmt.name ? [stmt.name.text] : []
  }
  if (ts.isVariableStatement(stmt)) return stmt.declarationList.declarations.filter((d) => ts.isIdentifier(d.name)).map((d) => d.name.text)
  return []
}
const isTypeOnly = (stmt) => ts.isInterfaceDeclaration(stmt) || ts.isTypeAliasDeclaration(stmt)
const hasExport = (stmt) => (ts.getCombinedModifierFlags?.(stmt) ?? 0) & ts.ModifierFlags.Export || stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
const hasDefault = (stmt) => stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)

let useClient = false
const importTexts = []
const mainParts = []
const outputs = new Map(Object.keys(cfg.modules).map((m) => [m, { parts: [], symbols: [] }]))
const reexports = new Map() // module -> [{name, type}]

for (const stmt of sf.statements) {
  const full = text.slice(stmt.getFullStart(), stmt.getEnd())
  if (ts.isExpressionStatement(stmt) && ts.isStringLiteral(stmt.expression) && stmt.expression.text === 'use client') { useClient = true; continue }
  if (ts.isImportDeclaration(stmt)) { importTexts.push(full.trim()); continue }
  const names = declNames(stmt)
  const target = names.map((n) => symbolToModule.get(n)).find(Boolean)
  if (!target) { mainParts.push(full); continue }
  if (hasDefault(stmt)) throw new Error(`Refusing to move default export ${names}`)
  const out = outputs.get(target)
  let body = full
  if (hasExport(stmt)) {
    for (const n of names) (reexports.get(target) ?? reexports.set(target, []).get(target)).push({ name: n, type: isTypeOnly(stmt) })
  } else {
    const start = stmt.getStart() - stmt.getFullStart()
    body = full.slice(0, start) + 'export ' + full.slice(start)
  }
  out.parts.push(body)
  for (const n of names) out.symbols.push({ name: n, type: isTypeOnly(stmt) })
}

for (const [mod, spec] of Object.entries(cfg.modules)) {
  const declared = new Set(outputs.get(mod).symbols.map((s) => s.name))
  for (const s of spec.symbols) if (!declared.has(s)) throw new Error(`Symbol ${s} not found at top level of ${cfg.source}`)
}

const SRC = path.join(ROOT, 'src')
function spec(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).replace(/\.(tsx?|mts)$/, '')
  // Prefer the @/ alias whenever the relative path climbs out of the directory.
  if (rel.startsWith('..') && toFile.startsWith(SRC + path.sep)) {
    return '@/' + path.relative(SRC, toFile).replace(/\.(tsx?|mts)$/, '').split(path.sep).join('/')
  }
  if (!rel.startsWith('.')) rel = './' + rel
  return rel
}
function rewriteRelativeImports(importText, fromFile) {
  // Original relative specifiers are relative to the source file's directory.
  return importText.replace(/from\s+(['"])(\.{1,2}\/[^'"]+)\1/g, (m, q, s) => {
    const abs = path.resolve(path.dirname(srcPath), s)
    let rel = path.relative(path.dirname(fromFile), abs)
    if (!rel.startsWith('.')) rel = './' + rel
    return `from ${q}${rel}${q}`
  })
}
function siblingImports(fromFile, excludeMain) {
  const lines = []
  for (const [mod, out] of outputs) {
    const abs = path.resolve(ROOT, mod)
    if (abs === fromFile || !out.symbols.length) continue
    const names = out.symbols.map((s) => (s.type ? `type ${s.name}` : s.name)).join(', ')
    lines.push(`import { ${names} } from '${spec(fromFile, abs)}'`)
  }
  return lines
}

const written = []
for (const [mod, out] of outputs) {
  const abs = path.resolve(ROOT, mod)
  const wantClient = cfg.modules[mod].useClient ?? useClient
  const header = [
    ...(wantClient ? ["'use client'", ''] : []),
    ...importTexts.map((i) => rewriteRelativeImports(i, abs)),
    ...siblingImports(abs),
  ].join('\n')
  const body = out.parts.join('').replace(/^\s*\n/, '')
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, `${header}\n\n${body.trimEnd()}\n`)
  written.push(abs)
}

const mainReexports = []
for (const [mod, list] of reexports) {
  const values = list.filter((s) => !s.type).map((s) => s.name)
  const types = list.filter((s) => s.type).map((s) => s.name)
  const from = spec(srcPath, path.resolve(ROOT, mod))
  if (values.length) mainReexports.push(`export { ${values.join(', ')} } from '${from}'`)
  if (types.length) mainReexports.push(`export type { ${types.join(', ')} } from '${from}'`)
}
const mainHeader = [...(useClient ? ["'use client'", ''] : []), ...importTexts, ...siblingImports(srcPath), ...mainReexports].join('\n')
fs.writeFileSync(srcPath, `${mainHeader}\n${mainParts.join('').replace(/^\s*\n/, '\n').trimEnd()}\n`)
written.push(srcPath)

for (const f of written) prune(f)
