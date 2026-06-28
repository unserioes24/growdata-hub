#!/usr/bin/env python3
"""Generate docs/data/index.json from the structured data/ directory."""

import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
OUT_FILE = ROOT / "docs" / "data" / "index.json"

CATEGORIES_ORDER = [
    "carbon-filters",
    "circulation-fans",
    "grow-controller-accessories",
    "grow-controller-compatibility",
    "grow-controllers",
    "grow-light-fixtures",
    "grow-tents",
    "inline-duct-fans",
]

CATEGORY_LABELS = {
    "carbon-filters": "Carbon Filters",
    "circulation-fans": "Circulation Fans",
    "grow-controller-accessories": "Controller Accessories",
    "grow-controller-compatibility": "Controller Compatibility",
    "grow-controllers": "Grow Controllers",
    "grow-light-fixtures": "Light Fixtures",
    "grow-tents": "Grow Tents",
    "inline-duct-fans": "Inline Duct Fans",
}


def main():
    products = []
    counts = {}

    for category in CATEGORIES_ORDER:
        cat_dir = DATA_DIR / category
        if not cat_dir.exists():
            continue
        for p in sorted(cat_dir.rglob("*.json")):
            try:
                with open(p, encoding="utf-8") as f:
                    obj = json.load(f)
            except (json.JSONDecodeError, OSError) as exc:
                print(f"WARNING: skipping {p}: {exc}", file=sys.stderr)
                continue
            obj["_category"] = category
            obj["_path"] = p.relative_to(DATA_DIR).as_posix()
            products.append(obj)
            counts[category] = counts.get(category, 0) + 1

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, separators=(",", ":"), ensure_ascii=False)

    total = len(products)
    size_kb = OUT_FILE.stat().st_size / 1024
    print(f"Generated {OUT_FILE} — {total} products, {size_kb:.0f} KB")
    for cat in CATEGORIES_ORDER:
        if cat in counts:
            print(f"  {CATEGORY_LABELS[cat]}: {counts[cat]}")


if __name__ == "__main__":
    main()
