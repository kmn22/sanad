#!/usr/bin/env python3
"""
Split ONE large React view component into: a state hook + one component per JSX section.
Pure refactor: code is moved, not rewritten.

Usage:
  split_view.py FILE OUTDIR ComponentName useHookName StateTypeName "SectionName:START-END" ...

Requirements (checked loosely):
  * `export function ComponentName({ a, b }: Type) {` on one line
  * the component has exactly one top-level `  return (` whose root element
    is a single wrapper; sections are line ranges (1-indexed, inclusive) of the
    children of that wrapper. Run `prune_unused.py` afterwards.
"""
import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import extract as ex


def split_top(s):
    parts, depth, cur = [], 0, ''
    for ch in s:
        if ch in '([{<': depth += 1
        elif ch in ')]}>': depth -= 1
        if ch == ',' and depth == 0:
            parts.append(cur); cur = ''
        else:
            cur += ch
    if cur.strip(): parts.append(cur)
    return parts


def main():
    path, outdir, comp, hook, state_t = sys.argv[1:6]
    sections = []
    for spec in sys.argv[6:]:
        name, rng = spec.split(':')
        a, b = rng.split('-')
        sections.append((name, int(a), int(b)))

    lines, imports, decls = ex.parse(path)
    d = next(x for x in decls if x['name'] == comp)
    sig_i = next(i for i in range(d['start'], d['end']) if re.match(r'export\s+(default\s+)?function\s+' + comp + r'\b', lines[i]))
    sig = lines[sig_i]
    m = re.match(r'export\s+(?:default\s+)?function\s+\w+\((.*)\)\s*\{\s*$', sig)
    export_kw = 'export default function' if re.match(r'export\s+default', sig) else 'export function'
    params = m.group(1)
    dm = re.match(r'\{(.*)\}\s*:\s*(.*)$', params, re.S)
    if dm:
        destruct, type_text = dm.group(1), dm.group(2)
        prop_names = [re.match(r'\s*(\w+)', p).group(1) for p in split_top(destruct)]
        hook_params = '{' + destruct + '}: ' + type_text
        main_params = 'props: ' + type_text
    elif params.strip() == '':
        prop_names, hook_params, main_params = [], '', ''
    else:
        raise SystemExit('unsupported signature: ' + sig)

    ret_i = next(i for i in range(sig_i + 1, d['end']) if lines[i] == '  return (')
    body = lines[sig_i + 1:ret_i]
    root_open = lines[ret_i + 1]
    root_close = lines[d['end'] - 2]
    assert root_close.strip().startswith('</') or root_close.strip().startswith('<'), root_close

    names = []
    for l in body:
        mm = (re.match(r'  const \[([^\]]*)\]', l) or re.match(r'  const \{([^}]*)\}', l))
        if mm:
            for p in mm.group(1).split(','):
                p = p.strip().split(':')[-1].split('=')[0].strip()
                if p and p.isidentifier(): names.append(p)
            continue
        mm = re.match(r'  const (\w+)\b', l) or re.match(r'  (?:async )?function (\w+)', l)
        if mm: names.append(mm.group(1))
    all_names = list(dict.fromkeys(prop_names + names))

    base = os.path.dirname(path)
    sub = os.path.join(base, outdir)
    os.makedirs(sub, exist_ok=True)
    client = lines[0].strip() in ("'use client'", '"use client"')

    def fix_imports(imps):
        res = []
        for s in imps:
            s = s.replace(f"'../{outdir}/", "'./")
            res.append(s)
        return res

    # ---- hook ----
    body_text = '\n'.join(body)
    imps = fix_imports(ex.build_imports(body_text + '\n' + hook_params, imports))
    hook_code = ("'use client'\n\n" if client else '') + '\n'.join(imps) + '\n\n'
    hook_code += f'export function {hook}({hook_params}) {{\n' + body_text.rstrip() + '\n\n'
    hook_code += '  return {\n' + ''.join(f'    {n},\n' for n in all_names) + '  }\n}\n\n'
    hook_code += f'export type {state_t} = ReturnType<typeof {hook}>\n'
    hook_file = re.sub(r'(?<!^)(?=[A-Z])', '-', hook).lower().replace('use-', 'use-', 1)
    hook_file = hook_file if hook_file.startswith('use-') else 'use-' + hook_file
    open(os.path.join(sub, hook_file + '.ts'), 'w').write(hook_code)

    # ---- sections ----
    used_sections = []
    for name, a, b in sections:
        text_lines = lines[a - 1:b]
        text = '\n'.join(text_lines)
        un = [n for n in all_names if ex.used(text, n)]
        imps = fix_imports(ex.build_imports(text, imports))
        imps.append(f"import type {{ {state_t} }} from './{hook_file}'")
        head = ("'use client'\n\n" if client else '') + '\n'.join(imps) + '\n\n'
        if un:
            code = head + f'export function {name}({{ v }}: {{ v: {state_t} }}) {{\n  const {{ {", ".join(un)} }} = v\n  return (\n    <>\n{text}\n    </>\n  )\n}}\n'
        else:
            code = head + f'export function {name}() {{\n  return (\n    <>\n{text}\n    </>\n  )\n}}\n'
        open(os.path.join(sub, name + '.tsx'), 'w').write(code)
        used_sections.append((name, bool(un)))

    # ---- rewrite original component ----
    new = [f'{export_kw} {comp}({main_params}) {{']
    new.append(f'  const v = {hook}(props)' if dm else f'  const v = {hook}()')
    new.append('')
    new.append('  return (')
    first_a, last_b = sections[0][1], sections[-1][2]
    new += lines[ret_i + 1:first_a - 1]            # wrapper opening lines (root, <main>, grid ...)
    for name, has in used_sections:
        new.append(f'      <{name} v={{v}} />' if has else f'      <{name} />')
    new += lines[last_b:d['end'] - 2 + 1]          # wrapper closing lines
    new.append('  )')
    new.append('}')
    out = lines[:sig_i] + new + lines[d['end'] + 1:]
    # imports for new modules
    last_imp = max(e for _, e, _ in imports)
    add = [f"import {{ {hook} }} from './{outdir}/{hook_file}'"] + \
          [f"import {{ {n} }} from './{outdir}/{n}'" for n, _ in used_sections]
    out[last_imp + 1:last_imp + 1] = add
    open(path, 'w').write(re.sub(r'\n{3,}', '\n\n', '\n'.join(out)))
    print('hook:', hook_file, 'names:', len(all_names), 'sections:', [n for n, _ in used_sections])


main()
