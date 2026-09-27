#!/usr/bin/env python3
"""Validate project-plan/curriculum.yaml and regenerate the catalogue section of CURRICULUM.md.

Checks:
  * lesson ids are unique slugs; every prereq exists; the prerequisite graph is acyclic
  * a prerequisite never lives in a later tier than the lesson that needs it
  * every audit item in source-notes/AUDIT.md is mapped to at least one lesson, and every mapped id exists
Usage:  python3 project-plan/tools/curriculum.py [--check]   (--check = validate only, don't rewrite CURRICULUM.md)
"""
import re
import sys
from collections import defaultdict, deque
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
YAML_PATH = ROOT / "project-plan" / "curriculum.yaml"
MD_PATH = ROOT / "project-plan" / "CURRICULUM.md"
AUDIT_PATH = ROOT / "source-notes" / "AUDIT.md"
CHECKPOINTS_DIR = ROOT / "app" / "src" / "content" / "checkpoints"   # tier-N.mdx exists once checkpoint N is written
BEGIN, END = "<!-- BEGIN GENERATED CATALOGUE -->", "<!-- END GENERATED CATALOGUE -->"


def fail(errors):
    for e in errors:
        print("ERROR:", e)
    sys.exit(1)


def main():
    data = yaml.safe_load(YAML_PATH.read_text())
    tiers = {int(k): v for k, v in data["tiers"].items()}
    lessons = data["lessons"]
    by_id = {}
    errors = []
    for l in lessons:
        if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", l["id"]):
            errors.append(f"bad id slug: {l['id']}")
        if l["id"] in by_id:
            errors.append(f"duplicate id: {l['id']}")
        if not l.get("label") or len(l["label"]) > 45:
            errors.append(f"{l['id']}: missing or too long `label` (sidebar name, max 45 chars)")
        if l["tier"] not in tiers:
            errors.append(f"{l['id']}: unknown tier {l['tier']}")
        l.setdefault("status", "todo")
        by_id[l["id"]] = l
    for l in lessons:
        for p in l["prereqs"]:
            if p not in by_id:
                errors.append(f"{l['id']}: unknown prereq {p}")
            elif by_id[p]["tier"] > l["tier"]:
                errors.append(f"{l['id']} (tier {l['tier']}) depends on later-tier {p} (tier {by_id[p]['tier']})")
    if errors:
        fail(errors)

    # topological order (Kahn), stable by (tier, file order)
    order_index = {l["id"]: i for i, l in enumerate(lessons)}
    indeg = {i: 0 for i in by_id}
    children = defaultdict(list)
    for l in lessons:
        for p in l["prereqs"]:
            indeg[l["id"]] += 1
            children[p].append(l["id"])
    ready = sorted([i for i, d in indeg.items() if d == 0], key=lambda i: (by_id[i]["tier"], order_index[i]))
    topo = []
    while ready:
        n = ready.pop(0)
        topo.append(n)
        for c in children[n]:
            indeg[c] -= 1
            if indeg[c] == 0:
                ready.append(c)
                ready.sort(key=lambda i: (by_id[i]["tier"], order_index[i]))
    if len(topo) != len(lessons):
        fail([f"cycle detected among: {sorted(set(by_id) - set(topo))}"])

    # audit coverage
    audit_ids = re.findall(r"^\| ([0-9O]+\.[0-9]+) \|", AUDIT_PATH.read_text(), flags=re.M)
    audit_set = set(audit_ids)
    mapped = defaultdict(list)
    for l in lessons:
        for a in l["audit"]:
            mapped[a].append(l["id"])
            if a not in audit_set:
                errors.append(f"{l['id']}: audit item {a} not found in AUDIT.md")
    unmapped = [a for a in audit_ids if a not in mapped]
    if unmapped:
        errors.append(f"audit items not mapped to any lesson: {unmapped}")
    if errors:
        fail(errors)

    unlocks = defaultdict(list)
    for l in lessons:
        for p in l["prereqs"]:
            unlocks[p].append(l["id"])

    # tier-level graph (transitive reduction) for the overview diagram
    tier_edges = set()
    for l in lessons:
        for p in l["prereqs"]:
            a, b = by_id[p]["tier"], l["tier"]
            if a != b:
                tier_edges.add((a, b))
    reach = {t: set() for t in tiers}
    for t in sorted(tiers, reverse=True):
        for (a, b) in tier_edges:
            if a == t:
                reach[t] |= {b} | reach[b]
    reduced = sorted((a, b) for (a, b) in tier_edges
                     if not any((a, c) in tier_edges and b in reach[c] for c in tiers if c not in (a, b)))

    counts = defaultdict(int)
    for l in lessons:
        counts[l["tier"]] += 1
    gap_count = sum(1 for l in lessons if l["sources"] == ["gap"])
    note_keys = sorted({s for l in lessons for s in l["sources"] if s != "gap"})

    out = []
    out.append(f"_Generated from `curriculum.yaml` by `tools/curriculum.py`. Don't edit this section by hand._\n")
    out.append(f"**{len(lessons)} lessons** in **{len(tiers)} tiers** (+ {len(tiers)} Level-up Checkpoints). "
               f"{len(audit_ids)} audit items mapped. Lessons that are pure gap-fill: {gap_count}. "
               f"Source notes used: {', '.join(note_keys)}.\n")
    out.append("### Tier overview (transitive reduction of tier dependencies)\n")
    out.append("```mermaid\nflowchart TD")
    level_of = {t: lv["name"] for lv in data["levels"] for t in lv["tiers"]}
    for t, name in sorted(tiers.items()):
        out.append(f'  T{t}["T{t} · {name}<br/>{counts[t]} lessons · {level_of[t]}"]')
    for a, b in reduced:
        out.append(f"  T{a} --> T{b}")
    out.append("```\n")
    for t, name in sorted(tiers.items()):
        out.append(f"### Tier {t} — {name} ({level_of[t]})\n")
        out.append("| # | ID | Lesson | Prerequisites | Unlocks | Sources | Audit items | Status |")
        out.append("|---|---|---|---|---|---|---|---|")
        tier_lessons = [i for i in topo if by_id[i]["tier"] == t]
        for n, i in enumerate(tier_lessons, 1):
            l = by_id[i]
            pre = ", ".join(f"`{p}`" for p in l["prereqs"]) or "–"
            unl = ", ".join(f"`{u}`" for u in unlocks[i]) or "–"
            src = ", ".join(l["sources"])
            aud = ", ".join(l["audit"]) or "–"
            out.append(f"| {t}.{n} | `{i}` | **{l['label']}**: {l['title']} | {pre} | {unl} | {src} | {aud} | {l['status']} |")
        cp_status = "done" if (CHECKPOINTS_DIR / f"tier-{t}.mdx").exists() else "todo"
        out.append(f"| {t}.✓ | `checkpoint-{t}` | **Level-up Checkpoint {t}**: quiz + coding challenge + mock interview round | all tier {t} | – | – | – | {cp_status} |")
        out.append("")
    out.append("### Build order (topological)\n")
    out.append(" → ".join(f"`{i}`" for i in topo) + "\n")
    generated = "\n".join(out)

    print(f"OK: {len(lessons)} lessons, {len(tiers)} tiers, {sum(len(l['prereqs']) for l in lessons)} edges, "
          f"acyclic, {len(audit_ids)}/{len(audit_ids)} audit items mapped")
    if "--check" in sys.argv:
        return
    md = MD_PATH.read_text()
    if BEGIN not in md or END not in md:
        fail([f"markers {BEGIN} / {END} not found in {MD_PATH}"])
    head, rest = md.split(BEGIN, 1)
    _, tail = rest.split(END, 1)
    MD_PATH.write_text(head + BEGIN + "\n" + generated + "\n" + END + tail)
    print(f"wrote catalogue to {MD_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
