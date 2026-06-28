#!/usr/bin/env python3
"""
Validate GrowData Hub JSON files against category schemas and run logical consistency checks.

Usage:
    python validate.py [--data-dir data] [--schema-dir schemas] [category ...]

Exit codes:
    0  All files valid
    1  One or more validation errors found
    2  Missing schema or data directory, or jsonschema not installed
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

try:
    from jsonschema import Draft7Validator
except ImportError:
    print(
        "ERROR: jsonschema is not installed.\n"
        "       Run: pip install jsonschema>=4.0",
        file=sys.stderr,
    )
    sys.exit(2)


CATEGORY_SCHEMAS = {
    "carbon-filters": "carbon-filters.schema.json",
    "circulation-fans": "circulation-fans.schema.json",
    "grow-controller-accessories": "grow-controller-accessories.schema.json",
    "grow-controller-compatibility": "grow-controller-compatibility.schema.json",
    "grow-controllers": "grow-controllers.schema.json",
    "grow-light-fixtures": "grow-light-fixtures.schema.json",
    "grow-tents": "grow-tents.schema.json",
    "inline-duct-fans": "inline-duct-fans.schema.json",
}

DATE_FIELDS = ("source_date", "uvp_source_date")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _is_num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def _valid_date(s):
    if s is None:
        return True
    try:
        datetime.strptime(str(s), "%Y-%m-%d")
        return True
    except ValueError:
        return False


def _minmax_check(data, min_field, max_field):
    lo = data.get(min_field)
    hi = data.get(max_field)
    if lo is not None and hi is not None and _is_num(lo) and _is_num(hi) and lo > hi:
        return f"{min_field} ({lo}) > {max_field} ({hi})"
    return None


# ---------------------------------------------------------------------------
# Per-category logical checks
# ---------------------------------------------------------------------------

def _check_carbon_filter(data):
    errs = []
    e = _minmax_check(data, "recommended_airflow_m3_h", "max_airflow_m3_h")
    if e:
        errs.append(e)
    e = _minmax_check(data, "min_airflow_m3_h", "recommended_airflow_m3_h")
    if e:
        errs.append(e)
    e = _minmax_check(data, "lifetime_months_min", "lifetime_months_max")
    if e:
        errs.append(e)
    h = data.get("humidity_limit_percent")
    if h is not None and _is_num(h) and not (0 <= h <= 100):
        errs.append(f"humidity_limit_percent ({h}) out of range 0–100")
    return errs


def _check_circulation_fans(data):
    errs = []
    for mn, mx in [
        ("noise_db_min", "noise_db_max"),
        ("power_watts_min", "power_watts_max"),
        ("recommended_tent_min_cm", "recommended_tent_max_cm"),
        ("rpm_min", "rpm_max"),
    ]:
        e = _minmax_check(data, mn, mx)
        if e:
            errs.append(e)
    return errs


def _check_inline_fans(data):
    errs = []
    for mn, mx in [
        ("noise_db_min", "noise_db_max"),
        ("power_watts_min", "power_watts_max"),
    ]:
        e = _minmax_check(data, mn, mx)
        if e:
            errs.append(e)
    rec = data.get("recommended_airflow_m3_h")
    mx = data.get("max_airflow_m3_h")
    if rec is not None and mx is not None and _is_num(rec) and _is_num(mx) and rec > mx:
        errs.append(f"recommended_airflow_m3_h ({rec}) > max_airflow_m3_h ({mx})")
    return errs


def _check_grow_tents(data):
    errs = []
    for dim in ("width_cm", "depth_cm", "height_cm"):
        v = data.get(dim)
        if v is not None and _is_num(v) and v <= 0:
            errs.append(f"{dim} must be > 0, got {v}")
    w = data.get("width_cm")
    d = data.get("depth_cm")
    a = data.get("area_m2")
    if w and d and a and _is_num(w) and _is_num(d) and _is_num(a):
        expected = w * d / 10000
        if abs(expected - a) > 0.01:
            errs.append(
                f"area_m2 ({a}) inconsistent with width_cm × depth_cm / 10000 "
                f"(expected ≈ {expected:.4f})"
            )
    return errs


def _check_grow_lights(data):
    errs = []
    ppf = data.get("ppf_umol_s")
    power = data.get("power_watts")
    eff = data.get("efficacy_umol_j")
    if (
        ppf is not None
        and power is not None
        and eff is not None
        and _is_num(ppf)
        and _is_num(power)
        and _is_num(eff)
        and power > 0
        and eff > 0
    ):
        expected = power * eff
        if abs(expected - ppf) / expected > 0.10:
            errs.append(
                f"ppf_umol_s ({ppf}) inconsistent with power_watts × efficacy_umol_j "
                f"({expected:.1f}); difference {abs(expected - ppf) / expected * 100:.1f}%"
            )
    return errs


CUSTOM_CHECKS = {
    "carbon-filters": _check_carbon_filter,
    "circulation-fans": _check_circulation_fans,
    "inline-duct-fans": _check_inline_fans,
    "grow-tents": _check_grow_tents,
    "grow-light-fixtures": _check_grow_lights,
}


# ---------------------------------------------------------------------------
# File-level validation
# ---------------------------------------------------------------------------

def _date_fields_for(data):
    """Return all date-like field values to check (handles nested structures)."""
    pairs = []
    for field in DATE_FIELDS:
        if field in data:
            pairs.append((field, data[field]))
    # Check inside compatible_devices list (compatibility files)
    devices = data.get("compatible_devices")
    if isinstance(devices, list):
        for i, item in enumerate(devices):
            if isinstance(item, dict):
                for field in DATE_FIELDS:
                    if field in item:
                        pairs.append((f"compatible_devices[{i}].{field}", item[field]))
    return pairs


def validate_file(filepath, schema, category):
    errors = []
    rel = str(Path(filepath).relative_to(Path.cwd()) if Path(filepath).is_absolute() else filepath)

    try:
        with open(filepath, encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as exc:
        return [(rel, f"[json] {exc}")]

    # Schema validation
    validator = Draft7Validator(schema)
    for err in sorted(validator.iter_errors(data), key=lambda e: list(e.absolute_path)):
        path_str = " > ".join(str(p) for p in err.absolute_path) or "(root)"
        errors.append((rel, f"[schema] {path_str}: {err.message}"))

    # Date format checks
    for field_path, val in _date_fields_for(data):
        if not _valid_date(val):
            errors.append((rel, f"[date] {field_path}: '{val}' is not YYYY-MM-DD"))

    # Logical cross-field checks
    check_fn = CUSTOM_CHECKS.get(category)
    if check_fn:
        for msg in check_fn(data):
            errors.append((rel, f"[logic] {msg}"))

    return errors


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Validate GrowData Hub JSON files against schemas and logical rules."
    )
    parser.add_argument("--data-dir", default="data", help="Root data directory (default: data)")
    parser.add_argument(
        "--schema-dir", default="schemas", help="Schemas directory (default: schemas)"
    )
    parser.add_argument(
        "categories",
        nargs="*",
        help="Limit validation to specific categories (default: all)",
    )
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    schema_dir = Path(args.schema_dir)

    if not data_dir.exists():
        print(f"ERROR: data directory not found: {data_dir}", file=sys.stderr)
        sys.exit(2)
    if not schema_dir.exists():
        print(f"ERROR: schemas directory not found: {schema_dir}", file=sys.stderr)
        sys.exit(2)

    target_categories = set(args.categories) if args.categories else set(CATEGORY_SCHEMAS)

    # Load schemas
    schemas = {}
    for cat, schema_file in CATEGORY_SCHEMAS.items():
        schema_path = schema_dir / schema_file
        if not schema_path.exists():
            print(f"WARNING: schema file missing: {schema_path}", file=sys.stderr)
            continue
        with open(schema_path, encoding="utf-8") as f:
            schemas[cat] = json.load(f)

    all_errors = []
    total_files = 0

    for category in sorted(target_categories):
        if category not in CATEGORY_SCHEMAS:
            print(f"WARNING: unknown category '{category}'", file=sys.stderr)
            continue
        schema = schemas.get(category)
        if schema is None:
            continue
        cat_dir = data_dir / category
        if not cat_dir.exists():
            continue

        json_files = sorted(cat_dir.rglob("*.json"))
        for filepath in json_files:
            total_files += 1
            file_errors = validate_file(str(filepath), schema, category)
            all_errors.extend(file_errors)

    # Report
    if all_errors:
        print(f"\nFAILED — {len(all_errors)} error(s) across {total_files} files:\n")
        current_file = None
        for filepath, msg in all_errors:
            if filepath != current_file:
                print(f"  {filepath}")
                current_file = filepath
            print(f"    {msg}")
        print()
        sys.exit(1)
    else:
        print(f"OK — {total_files} files validated with 0 errors.")
        sys.exit(0)


if __name__ == "__main__":
    main()
