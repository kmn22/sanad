#!/usr/bin/env python3
"""
Move top-level declarations of a TS/TSX file into separate files (pure refactor).

Usage:
  extract.py FILE --list
  extract.py FILE OUTDIR  File.tsx=DeclA,DeclB  consts.ts=CONST_A,CONST_B ...

- Declarations moved are `export`ed and re-imported by the original file.
- Imports for every new file are derived from the original import block,
  based on identifier usage (run prune_unused.py afterwards to drop leftovers).
- Relative imports are rewritten for the new directory depth.
"""
import re, sys, os

DECL = re.compile(r'^(export\s+)?(default\s+)?(async\s+)?(function|const|let|interface|type|enum|class)\s+(\w+)')


def parse(path):
    lines = open(path).read().split('\n')
    # ---- import statements ----
    imports, i, first_decl = [], 0, None
    while i < len(lines):
        l = lines[i]
        if l.startswith('import '):
            j = i
            while not re.search(r"from\s+['\"][^'\"]+['\"]|^import\s+['\"]", lines[j]):
                j += 1
            imports.append((i, j, '\n'.join(lines[i:j + 1])))
            i = j + 1
            continue
        if DECL.match(l):
            first_decl = i
            break
        i += 1
    # ---- declarations ----
    starts = [k for k, l in enumerate(lines) if DECL.match(l) and (first_decl is not None and k >= first_decl)]
    # attach leading comment lines
    adj = []
    for s in starts:
        while s > 0 and lines[s - 1].strip().startswith(('//', '/*', '*', '*/')):
            s -= 1
        adj.append(s)
    decls = []
    for n, s in enumerate(adj):
        e = (adj[n + 1] if n + 1 < len(adj) else len(lines)) - 1
        while e > s and not lines[e].strip():
            e -= 1
        name = DECL.match(lines[starts[n]]).group(5)
        decls.append(dict(name=name, start=s, end=e))
    return lines, imports, decls


def import_symbols(stmt):
    """-> list of (symbol, kind) kind in default|named|star"""
    m = re.match(r"import\s+(type\s+)?(.*?)\s+from\s+['\"]([^'\"]+)['\"]", stmt, re.S)
    if not m:
        return [], None
    clause, mod = m.group(2), m.group(3)
    out = []
    named = re.search(r'\{(.*)\}', clause, re.S)
    if named:
        for part in named.group(1).split(','):
            part = part.strip()
            if part:
                out.append((part.split(' as ')[-1].strip().replace('type ', ''), 'named', part))
        clause = clause.replace(named.group(0), '')
    star = re.search(r'\*\s+as\s+(\w+)', clause)
    if star:
        out.append((star.group(1), 'star', star.group(0)))
    else:
        d = clause.strip().strip(',').strip()
        if d:
            out.append((d, 'default', d))
    return out, mod


def used(text, name):
    return re.search(r'(?<![\w.$])' + re.escape(name) + r'(?![\w$])', text) is not None


def rewrite_mod(mod, extra_depth=1):
    if mod.startswith('./'):
        return '../' * extra_depth + mod[2:]
    if mod.startswith('../'):
        return '../' * extra_depth + mod
    return mod


def build_imports(text, imports, has_default_react=True):
    by_mod = {}
    for _, _, stmt in imports:
        syms, mod = import_symbols(stmt)
        if mod is None:
            continue
        type_only = bool(re.match(r'import\s+type\b', stmt))
        for sym, kind, raw in syms:
            if used(text, sym):
                by_mod.setdefault((mod, type_only), []).append((kind, raw))
    out = []
    for (mod, type_only), items in by_mod.items():
        m = rewrite_mod(mod)
        t = 'type ' if type_only else ''
        d = [r for k, r in items if k == 'default']
        s = [r for k, r in items if k == 'star']
        n = [r for k, r in items if k == 'named']
        parts = []
        if d: parts.append(d[0])
        if s: parts.append(s[0])
        if n: parts.append('{ ' + ', '.join(n) + ' }')
        out.append(f"import {t}{', '.join(parts)} from '{m}'")
    return out


def main():
    path = sys.argv[1]
    lines, imports, decls = parse(path)
    if sys.argv[2] == '--list':
        for d in decls:
            print(f"{d['start']+1:5d}-{d['end']+1:5d}  {d['name']}")
        return
    outdir = sys.argv[2]
    groups = {}
    for spec in sys.argv[3:]:
        fname, names = spec.split('=')
        groups[fname] = names.split(',')
    base_dir = os.path.dirname(path)
    sub = os.path.join(base_dir, outdir)
    os.makedirs(sub, exist_ok=True)
    by_name = {d['name']: d for d in decls}
    moved = {}  # decl name -> module file stem
    for fname, names in groups.items():
        for n in names:
            moved[n] = os.path.splitext(fname)[0]
    is_client = lines[0].strip() in ("'use client'", '"use client"')
    for fname, names in groups.items():
        chunk_lines = []
        for n in names:
            d = by_name[n]
            c = lines[d['start']:d['end'] + 1]
            for k, l in enumerate(c):
                if DECL.match(l) and not l.startswith('export'):
                    c[k] = 'export ' + l
                    break
            chunk_lines += c + ['']
        text = '\n'.join(chunk_lines)
        imps = build_imports(text, imports)
        # sibling imports
        for other, stem in {(m, s) for m, s in moved.items()}:
            if stem == os.path.splitext(fname)[0] or other in names:
                continue
            if used(text, other):
                imps.append(f"import {{ {other} }} from './{stem}'")
        header = []
        if is_client and fname.endswith('.tsx'):
            header = ["'use client'", '']
        body = '\n'.join(header + imps) + '\n\n' + text.rstrip() + '\n'
        open(os.path.join(sub, fname), 'w').write(body)
        print('wrote', os.path.join(sub, fname))
    # ---- rewrite original ----
    drop = set()
    for n in moved:
        d = by_name[n]
        drop.update(range(d['start'], d['end'] + 1))
    kept = [l for k, l in enumerate(lines) if k not in drop]
    new_imports = {}
    remaining_text = '\n'.join(kept)
    for n, stem in moved.items():
        if used(remaining_text, n):
            new_imports.setdefault(stem, []).append(n)
    last_import_end = max(e for _, e, _ in imports)
    # position of last import in kept list = same index (imports precede all decls)
    ins = [f"import {{ {', '.join(v)} }} from './{outdir}/{k}'" for k, v in new_imports.items()]
    kept[last_import_end + 1:last_import_end + 1] = ins
    out = '\n'.join(kept)
    out = re.sub(r'\n{3,}', '\n\n', out)
    open(path, 'w').write(out)
    print('rewrote', path)


if __name__ == "__main__":
    main()
