/**
 * ============================================================================
 * Maqar (مقر) AST-Safe Module Specifier Codemod (`scripts/codemod-sanad-to-maqar.mts`)
 * ============================================================================
 *
 * Uses the TypeScript Compiler AST (`ts.createSourceFile`) to safely rewrite
 * legacy `@/components/sanad/*`, `@/lib/sanad/*`, and relative `../src/lib/sanad/*`
 * specifiers inside static `import`/`export` declarations and dynamic `import()`
 * calls without touching third-party dependencies or Arabic legal terminology.
 */

import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const ROOTS = ['src', 'tests', 'e2e']
const MODULE_REWRITES: Array<[RegExp, string]> = [
  [/^@\/components\/sanad(\/.*|$)/, '@/components/core$1'],
  [/^@\/lib\/sanad(\/.*|$)/, '@/lib/core$1'],
  [/^(\.\.?\/.*\/)sanad(\/.*|$)/, '$1core$2'],
]

function collectTsFiles(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) collectTsFiles(full, acc)
    else if (/\.(ts|tsx|mts)$/.test(entry.name)) acc.push(full)
  }
  return acc
}

function rewriteSpecifier(spec: string): string | null {
  for (const [pattern, replacement] of MODULE_REWRITES) {
    if (pattern.test(spec)) return spec.replace(pattern, replacement)
  }
  return null
}

let updatedFiles = 0
let totalRewrites = 0

for (const root of ROOTS) {
  for (const filePath of collectTsFiles(root)) {
    const sourceText = fs.readFileSync(filePath, 'utf8')
    const sf = ts.createSourceFile(
      filePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    )

    const edits: Array<{ start: number; end: number; quote: string; next: string }> = []

    const visit = (node: ts.Node) => {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const next = rewriteSpecifier(node.moduleSpecifier.text)
        if (next) {
          const raw = sourceText.slice(
            node.moduleSpecifier.getStart(sf),
            node.moduleSpecifier.getEnd()
          )
          edits.push({
            start: node.moduleSpecifier.getStart(sf),
            end: node.moduleSpecifier.getEnd(),
            quote: raw[0],
            next,
          })
        }
      }

      if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        const arg = node.arguments[0]
        const next = rewriteSpecifier(arg.text)
        if (next) {
          const raw = sourceText.slice(arg.getStart(sf), arg.getEnd())
          edits.push({
            start: arg.getStart(sf),
            end: arg.getEnd(),
            quote: raw[0],
            next,
          })
        }
      }

      ts.forEachChild(node, visit)
    }

    visit(sf)

    if (edits.length > 0) {
      edits.sort((a, b) => b.start - a.start)
      let mutated = sourceText
      for (const e of edits) {
        mutated = `${mutated.slice(0, e.start)}${e.quote}${e.next}${e.quote}${mutated.slice(
          e.end
        )}`
      }
      fs.writeFileSync(filePath, mutated, 'utf8')
      updatedFiles++
      totalRewrites += edits.length
    }
  }
}

console.log(
  `✅ [Maqar AST Codemod] Rewrote ${totalRewrites} module specifier(s) across ${updatedFiles} TypeScript/TSX files.`
)

