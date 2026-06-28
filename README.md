# GrowData Hub

An open, structured dataset of indoor cultivation equipment — specs, airflow ratings, compatibility info, and pricing — organized as machine-readable JSON files.

No Amazon links. No affiliate clutter. Just the data.

**Browse online:** [unserioes24.github.io/growdata-hub](https://unserioes24.github.io/growdata-hub/)

---

## What's in here

| Category | Products | Brands |
|---|---|---|
| [`carbon-filters/`](./data/carbon-filters) | 211 | 28 |
| [`circulation-fans/`](./data/circulation-fans) | 62 | 10 |
| [`grow-controller-accessories/`](./data/grow-controller-accessories) | 276 | 14 |
| [`grow-controller-compatibility/`](./data/grow-controller-compatibility) | 167 controllers | 15 |
| [`grow-controllers/`](./data/grow-controllers) | 170 | 15 |
| [`grow-light-fixtures/`](./data/grow-light-fixtures) | 261 | 26 |
| [`grow-tents/`](./data/grow-tents) | 299 | 18 |
| [`humidifiers/`](./data/humidifiers) | 19 | 7 |
| [`inline-duct-fans/`](./data/inline-duct-fans) | 253 | 20 |

---

## Directory structure

```
data/
  {category}/
    {brand}/
      {series}/
        {model}.json
```

**Example:**

```
data/
  carbon-filters/
    ac-infinity/
      australian-charcoal-carbon-filter/
        duct-carbon-filter-4.json
        duct-carbon-filter-6.json
        ...
  inline-duct-fans/
    ac-infinity/
      cloudline-t-series/
        cloudline-t4.json
        cloudline-t6.json
        ...
  grow-controllers/
    ac-infinity/
      general/
        controller-69-pro.json
        controller-ai-.json
```

For `grow-controller-compatibility`, the structure is:

```
data/
  grow-controller-compatibility/
    {brand}/
      {controller-model}.json    ← contains an array of compatible devices
```

---

## JSON format

Each product file contains all known specs for that product. Fields depend on the category. Common fields across all categories:

| Field | Type | Description |
|---|---|---|
| `brand` | string | Manufacturer name |
| `series` | string | Product series / line |
| `model` | string | Full model name |
| `status` | string | `active` \| `discontinued` |
| `source_url` | string | URL of the data source |
| `source_type` | string | `manufacturer` \| `retailer` \| … |
| `source_date` | string | Date data was last verified (ISO 8601) |
| `confidence_level` | string | `A` (manufacturer-verified) → `D` (estimated) |
| `uvp_amount` | number | List price |
| `uvp_currency` | string | Currency code (EUR, USD, …) |
| `notes` | string | Free-text notes and caveats |

**Example — carbon filter:**

```json
{
  "brand": "AC Infinity",
  "series": "Australian Charcoal Carbon Filter",
  "model": "Duct Carbon Filter 6\"",
  "status": "active",
  "filter_type": "inline_carbon_filter",
  "carbon_type": "Australian Virgin RC412, 1200+ IAV",
  "carbon_bed_thickness_mm": 38.0,
  "flange_diameter_mm": 150.0,
  "duct_size_label": "6 inch",
  "length_mm": 400.0,
  "diameter_mm": 227.0,
  "max_airflow_m3_h": 696.6,
  "recommended_airflow_m3_h": 522.4,
  "pre_filter_included": true,
  "reversible": true,
  "refillable": false,
  "uvp_amount": 69.99,
  "uvp_currency": "USD",
  "source_url": "https://acinfinity.com/...",
  "source_type": "manufacturer",
  "source_date": "2026-06-27",
  "confidence_level": "A"
}
```

**Example — controller compatibility:**

```json
{
  "controller_model": "AC Infinity Controller 69 Pro",
  "compatible_devices": [
    {
      "compatible_product_category": "ec_fan",
      "compatible_brand": "AC Infinity",
      "compatible_series": "CLOUDLINE, CLOUDRAY, AIRLIFT",
      "compatibility_level": "full",
      "connector_or_protocol": "UIS",
      "requires_adapter_or_module": false,
      "source_url": "https://...",
      "confidence_level": "A"
    }
  ]
}
```

---

## Contributing

Contributions are very welcome. This dataset only grows through community effort.

**What we're looking for:**

- New products or missing models (especially non-US / EU brands)
- Corrections to specs or pricing
- New product categories (humidifiers, CO2 equipment, nutrients, etc.)
- Data for brands not yet covered

**How to contribute:**

1. Fork the repository
2. Add or edit JSON files under `data/` following the existing structure
3. Keep Amazon URLs and ASINs out — source from manufacturer or retailer pages directly
4. Include `source_url`, `source_type`, `source_date`, and `confidence_level` in every file
5. Open a Pull Request with a short description of what you added or changed

**Confidence levels:**

| Level | Meaning |
|---|---|
| `A` | Verified directly from manufacturer — manufacturer page, official PDF, or manual |
| `B` | Mix of manufacturer and retailer/marketplace/independent test sources — plausible but not confirmed by a datasheet |
| `C` | Primarily retailer data, unverified or partially estimated |
| `D` | Very thin or heavily incomplete — needs verification |

**Not sure where to start?** Look for products with `confidence_level: "C"` or `"D"` — those need the most attention.

---

## Data quality

- All airflow values are in **m³/h**
- All dimensions are in **mm** unless the field name says otherwise
- All weights are in **kg**
- Prices are raw list prices (`uvp_amount`) in the currency given by `uvp_currency`
- `null` means "not known / not applicable"
- Boolean fields (`true`/`false`) represent yes/no specs

---

## Validation

Run the schema and logic validator locally:

```bash
pip install jsonschema>=4.0
python validate.py            # validate all categories
python validate.py grow-tents # validate a single category
```

Exit code 0 = clean, 1 = errors found, 2 = setup problem.

---

## GitHub Pages browser

A searchable web interface is live at **[unserioes24.github.io/growdata-hub](https://unserioes24.github.io/growdata-hub/)**.

It is deployed automatically on every push to `main` via GitHub Actions (`.github/workflows/pages.yml`). To enable it on a fork: go to **Settings → Pages → Source → GitHub Actions**.

To rebuild the catalog locally after updating JSON files:

```bash
python build_catalog.py
```

Then commit the updated `catalog/` files along with your data changes.

---

## License

[MIT](./LICENSE)
