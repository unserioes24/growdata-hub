#!/usr/bin/env python3
"""Generate catalog/ from the data/ tree. Run after any data change."""

import json
import re
from datetime import date
from pathlib import Path

BASE = Path(__file__).parent
DATA = BASE / "data"
OUT  = BASE / "catalog"

CATEGORIES = {
    "carbon-filters":               {"label": "Carbon Filters",           "description": "Inline activated carbon filters for odor removal",            "icon": "filter",   "color": "#3fb950"},
    "circulation-fans":             {"label": "Circulation Fans",         "description": "Clip, floor, wall, and pedestal fans for air circulation",    "icon": "fan",      "color": "#388bfd"},
    "grow-controller-accessories":  {"label": "Controller Accessories",   "description": "Sensors, adapters, cables, and expansion modules",            "icon": "plug",     "color": "#bc8cff"},
    "grow-controller-compatibility":{"label": "Controller Compat.",       "description": "Which devices pair with which controllers",                   "icon": "link",     "color": "#e3b341"},
    "grow-controllers":             {"label": "Grow Controllers",         "description": "Climate, fan, and environmental automation controllers",       "icon": "sliders",  "color": "#f0883e"},
    "grow-light-fixtures":          {"label": "Grow Lights",              "description": "LED and HID grow light fixtures",                             "icon": "sun",      "color": "#ffd33d"},
    "grow-tents":                   {"label": "Grow Tents",               "description": "Reflective indoor grow tents",                                "icon": "tent",     "color": "#79c0ff"},
    "inline-duct-fans":             {"label": "Inline Duct Fans",         "description": "Mixed-flow and centrifugal extraction fans",                  "icon": "wind",     "color": "#56d364"},
}

PREVIEW = {
    "carbon-filters":               ["flange_diameter_mm", "max_airflow_m3_h", "recommended_airflow_m3_h", "uvp_amount", "uvp_currency"],
    "circulation-fans":             ["fan_category", "blade_diameter_cm", "airflow_m3_h", "power_watts_max", "uvp_amount", "uvp_currency"],
    "grow-controller-accessories":  ["type", "price_amount", "price_currency"],
    "grow-controller-compatibility":[],
    "grow-controllers":             ["controller_type", "max_device_count", "max_ports", "wifi", "app_control", "uvp_amount", "uvp_currency"],
    "grow-light-fixtures":          ["power_watts", "ppf_umol_s", "efficacy_umol_j", "area_width_cm", "area_depth_cm", "uvp_amount", "uvp_currency"],
    "grow-tents":                   ["width_cm", "depth_cm", "height_cm", "area_m2", "uvp_amount", "uvp_currency"],
    "inline-duct-fans":             ["flange_diameter_mm", "max_airflow_m3_h", "motor_type", "static_pressure_pa", "uvp_amount", "uvp_currency"],
}

BRAND_RE = re.compile(
    r"^(AC Infinity|Spider Farmer|Mars Hydro|VIVOSUN|GrowControl|TrolMaster|"
    r"Autopilot|Bluelab|GSE|Gavita|GrowDirector|SMSCOM|Inkbird|TechGrow|CLI-mate)\b"
)


def compat_entry(data, rel_path):
    ctrl = data.get("controller_model", "")
    m = BRAND_RE.match(ctrl)
    brand = m.group(1) if m else (ctrl.split()[0] if ctrl else "Unknown")
    model = ctrl.replace(brand, "").strip() or ctrl
    return {
        "brand": brand, "series": None, "model": model,
        "status": "active", "confidence_level": None,
        "path": rel_path,
        "specs": {"compatible_devices": len(data.get("compatible_devices", []))},
    }


def build(cat_id):
    fields = PREVIEW.get(cat_id, [])
    products = []
    for f in sorted((DATA / cat_id).rglob("*.json")):
        try:
            d = json.loads(f.read_text("utf-8"))
        except Exception:
            continue
        rel = str(f.relative_to(BASE)).replace("\\", "/")
        if cat_id == "grow-controller-compatibility":
            products.append(compat_entry(d, rel))
        else:
            specs = {k: d[k] for k in fields if d.get(k) is not None}
            products.append({
                "brand": d.get("brand") or "Unknown",
                "series": d.get("series") or d.get("compatible_series"),
                "model": d.get("model") or d.get("name") or d.get("controller_model", ""),
                "status": d.get("status") or "active",
                "confidence_level": d.get("confidence_level"),
                "path": rel,
                "specs": specs,
            })
    return products


def main():
    OUT.mkdir(exist_ok=True)
    index_cats = []

    for cat_id, meta in CATEGORIES.items():
        if not (DATA / cat_id).exists():
            continue
        products = build(cat_id)
        (OUT / f"{cat_id}.json").write_text(
            json.dumps(products, ensure_ascii=False, separators=(",", ":")),
            "utf-8",
        )
        index_cats.append({**meta, "id": cat_id, "total": len(products)})
        print(f"  {cat_id}: {len(products)}")

    (OUT / "index.json").write_text(
        json.dumps({"generated": str(date.today()), "categories": index_cats},
                   ensure_ascii=False, indent=2),
        "utf-8",
    )
    print(f"\nDone → catalog/")


if __name__ == "__main__":
    main()
