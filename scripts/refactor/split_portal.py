import re, os
base = 'src/app/portal/[token]'
src = open(f'{base}/client-portal-unified-view.tsx').read().split('\n')
L = lambda a, b: src[a-1:b]          # inclusive, 1-indexed
def trim(lines):
    while lines and not lines[-1].strip(): lines.pop()
    return lines
def dedent(lines, n):
    return [l[n:] if l[:n].strip() == '' else l for l in lines]

lucide = re.findall(r'\b(\w+)\b', '\n'.join(L(6, 42)))
lucide = [n for n in lucide if n[0].isupper() or n[0].islower()]
ui = {'Card': "import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'",
      'Badge': "import { Badge } from '@/components/ui/badge'",
      'Button': "import { Button } from '@/components/ui/button'",
      'Input': "import { Input } from '@/components/ui/input'"}
types = ['PortalInvoice', 'PortalDocument', 'PortalRequestItem', 'PortalFileItem']

def used(text, name): return re.search(r'(?<![\w.])' + name + r'\b', text) is not None

def imports_for(text, hook_file=False):
    out = ["'use client'", '']
    if hook_file:
        out.append("import React, { useState, useEffect, useRef } from 'react'")
        out.append("import { useRouter } from 'next/navigation'")
    lu = sorted({n for n in lucide if n not in ('import','from') and used(text, n) and n in LUCIDE_SET})
    if lu: out.append('import {\n  ' + ',\n  '.join(lu) + ',\n} from \'lucide-react\'')
    for k, v in ui.items():
        if re.search(r'<' + k, text) or (k == 'Card' and re.search(r'<Card', text)): out.append(v)
    if used(text, 'toast'): out.append("import { toast } from 'sonner'")
    if used(text, 'GLOSSARY_ITEMS'): out.append("import { GLOSSARY_ITEMS } from '@/lib/portal-glossary'")
    return out

LUCIDE_SET = set(re.findall(r'\b(\w+)\b', '\n'.join(L(6, 42)))) - {'import', 'from', 'lucide', 'react'}

# ---- names defined in hook scope ----
hook_body = L(133, 536) + L(705, 713)
names = []
for l in hook_body:
    m = re.match(r'  const \[(\w+), (\w+)\]', l) or re.match(r'  const \[(\w+)\]', l)
    if m: names += [g for g in m.groups() if g]; continue
    m = re.match(r'  const (\w+) =', l) or re.match(r'  (?:async )?function (\w+)', l)
    if m: names.append(m.group(1))
names += ['isExpired']
props_names = ['token', 'workspace', 'client', 'caseData', 'initialDocs', 'initialRequests', 'initialFiles', 'allowUpload', 'expiresAt']
all_names = list(dict.fromkeys(props_names + names))
# Names only used via the hook's own state internals (e.g. handlers) are still exposed; harmless.

os.makedirs(f'{base}/_lib', exist_ok=True)
os.makedirs(f'{base}/_components', exist_ok=True)

# ---- types.ts ----
types_src = '\n'.join(L(50, 93)) + '\n\nexport interface PortalViewProps {\n' + '\n'.join(L(95, 116)) + '\n}\n'
open(f'{base}/_lib/types.ts', 'w').write(types_src)

# ---- hook ----
hook_text = '\n'.join(hook_body)
hdr = imports_for(hook_text, True)
hdr.append("import { GLOSSARY_ITEMS } from '@/lib/portal-glossary'")
hdr.append("import type { PortalInvoice, PortalDocument, PortalViewProps } from './types'")
hdr = [h for h in hdr if not (h.startswith("import { GLOSSARY_ITEMS") and hdr.count(h) > 1)]
hdr = list(dict.fromkeys(hdr))
hook = '\n'.join(hdr) + '\n\n'
hook += '/** State, effects and handlers for the client portal. UI lives in ../_components. */\n'
hook += 'export function usePortalView({\n  token,\n  workspace,\n  client,\n  caseData,\n  documents: initialDocs,\n  requests: initialRequests,\n  files: initialFiles,\n  allowUpload,\n  expiresAt,\n}: PortalViewProps) {\n'
hook += '\n'.join(L(133, 536)) + '\n\n'
hook += '  const isExpired = new Date(expiresAt) <= new Date()\n\n'
hook += '\n'.join(L(705, 713)) + '\n\n'
hook += '  return {\n' + ''.join(f'    {n},\n' for n in all_names) + '  }\n}\n\nexport type PortalView = ReturnType<typeof usePortalView>\n'
open(f'{base}/_lib/use-portal-view.ts', 'w').write(hook)

# ---- components ----
def make(name, lines, ded):
    text = '\n'.join(lines)
    used_names = [n for n in all_names if used(text, n)]
    imp = imports_for(text)
    tl = [t for t in types if used(text, t)]
    if tl: imp.append("import type { " + ', '.join(tl) + " } from '../_lib/types'")
    imp.append("import type { PortalView } from '../_lib/use-portal-view'")
    body = '\n'.join(dedent(lines, ded))
    code = '\n'.join(imp) + '\n\n'
    if used_names:
        code += f'export function {name}({{ v }}: {{ v: PortalView }}) {{\n  const {{ {", ".join(used_names)} }} = v\n  return (\n    <>\n{body}\n    </>\n  )\n}}\n'
    else:
        code += f'export function {name}() {{\n  return (\n    <>\n{body}\n    </>\n  )\n}}\n'
    open(f'{base}/_components/{name}.tsx', 'w').write(code)
    return used_names

def screen(name, a, b):
    # a..b is a `return ( ... )` body; strip the return wrapper
    lines = L(a + 1, b - 1)
    make(name, dedent(lines, 4), 0)
    return bool(make.__dict__ or True)

specs = []
tab_starts = [762, 936, 1049, 1161, 1252, 1365, 1482, 1610]
tab_names = ['HomeTab', 'CaseTimelineTab', 'SessionsTab', 'DocumentsTab', 'InvoicesTab', 'MessagesTab', 'SettingsTab', 'MoreTab']
tab_ends = tab_starts[1:] + [1684]
mod_starts = [1767, 1930, 2038, 2132, 2167, 2224, 2269]
mod_names = ['DocumentReviewModal', 'SignatureModal', 'PaymentModal', 'ZatcaStatusModal', 'ReceiptModal', 'DataDeletionModal', 'GlossaryModal']
mod_ends = mod_starts[1:] + [2311]

jsx = {}
for n, s, e in zip(tab_names, tab_starts, tab_ends):
    jsx[n] = make(n, trim(L(s, e - 1)), 2)
for n, s, e in zip(mod_names, mod_starts, mod_ends):
    jsx[n] = make(n, trim(L(s, e - 1)), 0)
jsx['BottomNav'] = make('BottomNav', trim(L(1686, 1766)), 0)
jsx['PortalHeader'] = make('PortalHeader', L(717, 758), 4)
jsx['ExpiredScreen'] = make('ExpiredScreen', dedent(L(555, 579), 2), 2)   # contains <div ...> root
jsx['ActivationScreen'] = make('ActivationScreen', dedent(L(583, 702), 2), 2)
jsx['SessionCheckScreen'] = make('SessionCheckScreen', dedent(L(543, 548), 2), 2)

# ---- main view ----
def tag(n): return f'<{n} v={{v}} />' if jsx[n] else f'<{n} />'
main = "'use client'\n\nimport { usePortalView } from './_lib/use-portal-view'\nimport type { PortalViewProps } from './_lib/types'\n"
for n in jsx: main += f"import {{ {n} }} from './_components/{n}'\n"
main += "\nexport type { PortalInvoice, PortalDocument, PortalRequestItem, PortalFileItem } from './_lib/types'\nexport { GLOSSARY_ITEMS, type GlossaryEntry } from '@/lib/portal-glossary'\n\n"
main += "export default function ClientPortalUnifiedView(props: PortalViewProps) {\n  const v = usePortalView(props)\n\n"
main += f"  if (v.checkingSession) return {tag('SessionCheckScreen')}\n  if (v.isExpired) return {tag('ExpiredScreen')}\n  if (!v.isActivated) return {tag('ActivationScreen')}\n\n"
main += '  return (\n    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-20 md:pb-6" dir="rtl">\n'
main += f"      {tag('PortalHeader')}\n\n      <main className=\"max-w-md md:max-w-2xl mx-auto w-full p-4 space-y-4 flex-1\">\n"
for n in tab_names: main += f"        {tag(n)}\n"
main += f"      </main>\n\n      {tag('BottomNav')}\n\n"
for n in mod_names: main += f"      {tag(n)}\n"
main += '    </div>\n  )\n}\n'
open(f'{base}/client-portal-unified-view.tsx', 'w').write(main)
print('ok', {k: v for k, v in jsx.items()})
