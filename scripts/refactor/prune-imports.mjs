#!/usr/bin/env node
/**
 * prune-imports.mjs — remove unused import specifiers, keeping the repo's
 * import style. Usage: node scripts/refactor/prune-imports.mjs <file...>
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const ROOT = process.cwd()

// ---- prune unused imports (AST identifier scan, repo-style output) ----
function usedIdentifiers(file) {
  const used = new Set()
  const visit = (node) => {
    if (ts.isImportDeclaration(node) || (ts.isExportDeclaration(node) && node.moduleSpecifier)) return
    if (ts.isIdentifier(node)) used.add(node.text)
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(file, visit)
  return used
}
function formatImport(defaultName, nsName, named, from, typeOnlyDecl) {
  const head = typeOnlyDecl ? 'import type ' : 'import '
  const parts = []
  if (defaultName) parts.push(defaultName)
  if (nsName) parts.push(`* as ${nsName}`)
  if (named.length) {
    const one = `{ ${named.join(', ')} }`
    parts.push(one.length > 90 ? `{\n${named.map((n) => `  ${n},`).join('\n')}\n}` : one)
  }
  return `${head}${parts.join(', ')} from '${from}'`
}
export function prune(f) {
  const src = fs.readFileSync(f, 'utf8')
  const file = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, f.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const used = usedIdentifiers(file)
  const edits = []
  for (const stmt of file.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue
    const clause = stmt.importClause
    const from = stmt.moduleSpecifier.text
    const def = clause.name && used.has(clause.name.text) ? clause.name.text : null
    let ns = null
    const named = []
    if (clause.namedBindings) {
      if (ts.isNamespaceImport(clause.namedBindings)) {
        if (used.has(clause.namedBindings.name.text)) ns = clause.namedBindings.name.text
      } else {
        for (const el of clause.namedBindings.elements) {
          if (!used.has(el.name.text)) continue
          named.push(el.getText(file).replace(/\s+/g, ' '))
        }
      }
    }
    const replacement = def || ns || named.length ? formatImport(def, ns, named, from, clause.isTypeOnly) : ''
    edits.push({ start: stmt.getStart(), end: stmt.getEnd(), text: replacement })
  }
  let out = src
  for (const e of edits.sort((a, b) => b.start - a.start)) {
    let end = e.end
    if (!e.text && out[end] === '\n') end++
    out = out.slice(0, e.start) + e.text + out.slice(end)
  }
  out = out.replace(/\n{3,}/g, '\n\n')
  fs.writeFileSync(f, out)
  console.log(`${path.relative(ROOT, f)}: ${out.split('\n').length} lines`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const f of process.argv.slice(2)) prune(path.resolve(ROOT, f))
}
