#!/usr/bin/env python3
"""
Remove unused imports / destructured names reported by `tsc --noUnusedLocals`
for files under the given path prefixes (pure-refactor helper).

Usage: prune_unused.py PREFIX [PREFIX ...]
"""
import re, subprocess, sys, collections

prefixes = sys.argv[1:]
out = subprocess.run('npx tsc --noEmit --noUnusedLocals', shell=True, capture_output=True, text=True).stdout
todo = collections.defaultdict(list)
whole = collections.defaultdict(set)  # TS6192: entire import statement unused
for l in out.split('\n'):
    m = re.match(r"(.+?)\((\d+),(\d+)\): error TS6(?:133|196): '(\w+)'", l)
    if m and any(m.group(1).startswith(p) for p in prefixes):
        todo[m.group(1)].append((int(m.group(2)), int(m.group(3)), m.group(4)))
    m = re.match(r"(.+?)\((\d+),\d+\): error TS6192", l)
    if m and any(m.group(1).startswith(p) for p in prefixes):
        whole[m.group(1)].add(int(m.group(2)))
        todo.setdefault(m.group(1), [])

for path, items in todo.items():
    lines = open(path).read().split('\n')
    for ln, col, name in sorted(items, reverse=True):
        line = lines[ln - 1]
        i = col - 1
        if line[i:i + len(name)] != name:
            if col == 1 and line.startswith('import '):
                whole[path].add(ln)  # sole import of the statement
            else:
                print('skip (position mismatch)', path, ln, name)
            continue
        after = line[i + len(name):]
        m = re.match(r',\s*', after)
        if m:
            line = line[:i] + after[m.end():]
        else:
            before = line[:i]
            line = re.sub(r',\s*$', '', before) + after
        lines[ln - 1] = line
    # delete whole unused import statements (bottom-up so line numbers stay valid)
    for ln in sorted(whole.get(path, ()), reverse=True):
        j = ln - 1
        while not re.search(r"from\s+['\"]", lines[j]):
            j += 1
        del lines[ln - 1:j + 1]
    text = '\n'.join(lines)
    # drop whitespace-only lines inside multi-line import braces
    text = re.sub(r"(import (?:type )?\{[^}]*\})", lambda m: re.sub(r"\n[ \t]+(?=\n)", '', m.group(1)), text)
    text = re.sub(r"import (?:type )?\{\s*\} from '[^']+'\n", '', text)
    # multi-line import blocks left blank-only
    text = re.sub(r"\{\n\s*\n\}", '{}', text)
    open(path, 'w').write(text)
    print('pruned', path, sorted({n for _, _, n in items}))
