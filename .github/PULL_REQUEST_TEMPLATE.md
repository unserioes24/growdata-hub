## What does this PR change?

<!-- Brief summary: new products, data corrections, schema update, etc. -->

---

## Category

- [ ] carbon-filters
- [ ] circulation-fans
- [ ] grow-controller-accessories
- [ ] grow-controller-compatibility
- [ ] grow-controllers
- [ ] grow-light-fixtures
- [ ] grow-tents
- [ ] inline-duct-fans
- [ ] Other (schemas, tooling, site)

## Type of change

- [ ] New product(s) / model(s)
- [ ] Data correction
- [ ] New brand
- [ ] New category
- [ ] Schema or tooling update
- [ ] Site / UI change

---

## Checklist

- [ ] JSON files are placed under `data/{category}/{brand}/{series}/{model}.json`
- [ ] Every file includes `source_url`, `source_type`, `source_date`, and `confidence_level`
- [ ] No Amazon URLs or ASINs in any file
- [ ] All airflow values are in **m³/h**, dimensions in **mm** (unless field name says otherwise), weights in **kg**
- [ ] `null` is used for unknown fields — not `""`, `0`, or `"unknown"`
- [ ] `validate.py` passes with no errors (`python3 validate.py`)
- [ ] `build_catalog.py` runs without errors (only needed if `data/` files changed)

---

## Source(s)

<!-- List the manufacturer or retailer URLs used. No Amazon links. -->

- 

## Notes

<!-- Anything reviewers should know: regional variants, model revisions, assumptions made, fields left as null because data is unavailable, etc. -->
