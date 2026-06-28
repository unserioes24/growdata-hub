/* GrowData Hub — single-page app */

const PAGE_SIZE = 24

const ICONS = {
  filter: `<svg viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  fan:    `<svg viewBox="0 0 24 24"><path d="M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/><path d="M12 2a4 4 0 0 1 0 8c-1 0-2 .5-2.5 1.5S8 14 7 14a4 4 0 0 1 0-8c1 0 2-.5 2.5-1.5S11 2 12 2z"/><path d="M12 22a4 4 0 0 1 0-8c1 0 2-.5 2.5-1.5S16 10 17 10a4 4 0 0 1 0 8c-1 0-2 .5-2.5 1.5S13 22 12 22z"/><path d="M2 12a4 4 0 0 1 8 0c0 1 .5 2 1.5 2.5S14 16 14 17a4 4 0 0 1-8 0c0-1-.5-2-1.5-2.5S2 13 2 12z"/><path d="M22 12a4 4 0 0 1-8 0c0-1-.5-2-1.5-2.5S10 8 10 7a4 4 0 0 1 8 0c0 1 .5 2 1.5 2.5S22 11 22 12z"/></svg>`,
  plug:   `<svg viewBox="0 0 24 24"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8H6a2 2 0 0 0-2 2v2a7 7 0 0 0 14 0v-2a2 2 0 0 0-2-2Z"/></svg>`,
  link:   `<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  sliders:`<svg viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
  sun:    `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`,
  tent:   `<svg viewBox="0 0 24 24"><path d="M3.5 21 14 3"/><path d="M20.5 21 10 3"/><path d="M15.5 21 12 15l-3.5 6"/><path d="M2 21h20"/></svg>`,
  wind:     `<svg viewBox="0 0 24 24"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`,
  droplets: `<svg viewBox="0 0 24 24"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>`,
}

const CAT_COLORS = {
  'carbon-filters':               '#3fb950',
  'circulation-fans':             '#388bfd',
  'grow-controller-accessories':  '#bc8cff',
  'grow-controller-compatibility':'#e3b341',
  'grow-controllers':             '#f0883e',
  'grow-light-fixtures':          '#ffd33d',
  'grow-tents':                   '#79c0ff',
  'humidifiers':                  '#22d3ee',
  'inline-duct-fans':             '#56d364',
}

const KEY_SPECS = {
  'carbon-filters':               ['flange_diameter_mm', 'max_airflow_m3_h', 'recommended_airflow_m3_h', 'carbon_bed_thickness_mm'],
  'circulation-fans':             ['blade_diameter_cm', 'airflow_m3_h', 'power_watts_max', 'speed_levels'],
  'grow-controller-accessories':  ['type', 'price_amount'],
  'grow-controller-compatibility':['controller_model'],
  'grow-controllers':             ['controller_type', 'max_device_count', 'wifi', 'app_control'],
  'grow-light-fixtures':          ['power_watts', 'ppf_umol_s', 'efficacy_umol_j'],
  'grow-tents':                   ['width_cm', 'depth_cm', 'height_cm', 'area_m2'],
  'humidifiers':                  ['humidifier_type', 'tank_capacity_l', 'mist_output_ml_h_max', 'vpd_control', 'wifi'],
  'inline-duct-fans':             ['flange_diameter_mm', 'max_airflow_m3_h', 'motor_type', 'static_pressure_pa'],
}

// ── State ───────────────────────────────────────────────────────────────────
const state = {
  catalog: null,         // catalog/index.json
  catData: null,         // { id, products[] }
  product: null,         // full product JSON
  view: 'home',          // 'home' | 'category' | 'product'
  category: null,
  productPath: null,
  search: '',
  brandFilter: '',
  statusFilter: '',
  confFilter: '',
  shown: PAGE_SIZE,
}

// ── Utilities ───────────────────────────────────────────────────────────────
function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

async function fetchJSON(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return r.json()
}

function fieldLabel(key) {
  const MAP = {
    'm3':'m³','m3_h':'m³/h','m2':'m²','pa':'Pa','db':'dB',
    'vpd':'VPD','co2':'CO₂','ph':'pH','ec':'EC','ppf':'PPF',
    'ppfd':'PPFD','dli':'DLI','led':'LED','ir':'IR','uv':'UV',
    'ac':'AC','dc':'DC','rpm':'RPM','cfm':'CFM','wifi':'Wi-Fi',
    'mqtt':'MQTT','api':'API','uvp':'List Price','url':'URL',
  }
  return key.split('_').map(p => MAP[p.toLowerCase()] ?? (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')
}

function formatVal(key, val) {
  if (val === null || val === undefined) return null
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') {
    const k = key.toLowerCase()
    if (k.endsWith('_mm'))      return `${val} mm`
    if (k.endsWith('_cm'))      return `${val} cm`
    if (k.endsWith('_m2'))      return `${val} m²`
    if (k.endsWith('_m3'))      return `${val} m³`
    if (k.endsWith('_m3_h'))    return `${val} m³/h`
    if (k.endsWith('_kg'))      return `${val} kg`
    if (k.endsWith('_pa'))      return `${val} Pa`
    if (k.includes('_watts'))   return `${val} W`
    if (k.endsWith('_w') && !k.includes('width')) return `${val} W`
    if (k.includes('_db'))      return `${val} dB`
    if (k.includes('percent'))  return `${val}%`
    if (k.endsWith('_c') && k.includes('temp')) return `${val} °C`
    if (k.endsWith('_v') && !k.includes('vpd') && !k.includes('level')) return `${val} V`
    if (k.endsWith('_a') && k.includes('amp'))  return `${val} A`
    if (k.includes('_umol_j'))  return `${val} µmol/J`
    if (k.includes('_umol'))    return `${val} µmol/s`
    return val.toLocaleString('en')
  }
  return String(val)
}

function formatPreviewVal(key, val) {
  const f = formatVal(key, val)
  if (f === null) return null
  if (typeof f === 'boolean') return f ? 'Yes' : 'No'
  return f
}

function fieldGroup(key) {
  if (['brand','series','model','name','controller_model','status','revision','notes','filter_role'].includes(key)) return null
  if (key === 'compatible_devices') return null
  if (key.startsWith('sensor_'))   return 'Sensor Capabilities'
  if (key.startsWith('control_'))  return 'Control Capabilities'
  if (key.startsWith('ai_'))       return 'AI Features'
  if (key.startsWith('uvp_') || key.startsWith('price_')) return 'Pricing'
  if (key.startsWith('source_') || key === 'confidence_level') return 'Data Source'
  if (key.startsWith('compatible_') || key.startsWith('supported_')) return 'Compatibility'
  const physical = ['width_cm','depth_cm','height_cm','area_m2','volume_m3','length_mm',
    'diameter_mm','weight_kg','flange_diameter_mm','blade_diameter_cm',
    'fan_diameter_cm','pole_diameter_mm','carbon_bed_thickness_mm',
    'carbon_weight_kg','housing_material','duct_size_label']
  if (physical.includes(key)) return 'Physical Specs'
  const perf = ['max_airflow_m3_h','recommended_airflow_m3_h','min_airflow_m3_h',
    'airflow_m3_h','static_pressure_pa','noise_db_min','noise_db_max',
    'power_watts','power_watts_min','power_watts_max','power_draw_w',
    'ppf_umol_s','ppfd_umol_m2_s','efficacy_umol_j','pressure_drop_pa',
    'speed_rpm_min','speed_rpm_max','speed_levels']
  if (perf.includes(key)) return 'Performance'
  return 'Details'
}

function confBadge(c) {
  if (!c) return ''
  const cls = { A: 'conf-a', B: 'conf-b', C: 'conf-c', D: 'conf-d' }[c] || 'conf-d'
  return `<span class="badge badge-${cls}">Conf. ${esc(c)}</span>`
}

function statusBadge(s) {
  if (!s || s === 'active') return `<span class="badge badge-active">Active</span>`
  return `<span class="badge badge-disc">Discontinued</span>`
}

function priceStr(specs, data) {
  const amt = specs?.uvp_amount ?? data?.uvp_amount
  const cur = specs?.uvp_currency ?? data?.uvp_currency
  if (!amt) return ''
  return `${cur ? esc(cur) + ' ' : ''}${Number(amt).toFixed(2)}`
}

// ── Routing ─────────────────────────────────────────────────────────────────
function navigate(view, category, productPath) {
  state.view = view
  state.category = category ?? null
  state.productPath = productPath ?? null
  state.search = ''
  state.brandFilter = ''
  state.statusFilter = ''
  state.confFilter = ''
  state.shown = PAGE_SIZE
  render()
}

// ── Fetch helpers ────────────────────────────────────────────────────────────
async function ensureCatalog() {
  if (!state.catalog) state.catalog = await fetchJSON('catalog/index.json')
}

async function ensureCatData(id) {
  if (state.catData?.id !== id) {
    const products = await fetchJSON(`catalog/${id}.json`)
    state.catData = { id, products }
  }
}

// ── Render ───────────────────────────────────────────────────────────────────
const app = () => document.getElementById('app')

function showLoading() { app().innerHTML = `<div class="loading"><div class="spinner"></div><span>Loading…</span></div>` }

async function render() {
  try {
    if (state.view === 'home') {
      await ensureCatalog()
      renderHome()
    } else if (state.view === 'category') {
      showLoading()
      await ensureCatalog()
      await ensureCatData(state.category)
      renderCategory()
    } else if (state.view === 'product') {
      showLoading()
      const product = await fetchJSON(state.productPath)
      state.product = product
      renderProduct()
    }
  } catch (e) {
    app().innerHTML = `<div class="empty-state"><div style="font-size:2rem">⚠️</div><p>Failed to load: ${esc(e.message)}</p></div>`
  }
}

// ── Home view ────────────────────────────────────────────────────────────────
function renderHome() {
  const cats = state.catalog.categories
  const totalProducts = cats.reduce((s, c) => s + c.total, 0)
  const totalCats = cats.length

  const tiles = cats.map(c => {
    const color = CAT_COLORS[c.id] || '#768390'
    const icon = ICONS[c.icon] || ICONS.plug
    return `
      <button class="cat-card" data-id="${esc(c.id)}" style="--accent-color:${color}" aria-label="${esc(c.label)}">
        <span class="cat-icon">${icon}</span>
        <span class="cat-text">
          <span class="cat-name">${esc(c.label)}</span>
          <span class="cat-desc">${esc(c.description)}</span>
          <span class="cat-count">${c.total.toLocaleString('en')} products</span>
        </span>
      </button>`
  }).join('')

  app().innerHTML = `
    <div class="fade-in">
      <div class="hero">
        <h1>GrowData Hub</h1>
        <p>Open, structured dataset of indoor cultivation equipment. No affiliate links, no paywalls.</p>
        <p class="hero-meta"><strong>${totalProducts.toLocaleString('en')}</strong> products across <strong>${totalCats}</strong> categories — MIT licensed</p>
      </div>
      <div class="category-grid">${tiles}</div>
    </div>`

  document.querySelectorAll('.cat-card').forEach(btn => {
    btn.onclick = () => navigate('category', btn.dataset.id)
  })
  document.getElementById('search-wrap').classList.add('hidden')
}

// ── Category view ────────────────────────────────────────────────────────────
function getFiltered() {
  let list = state.catData.products
  const q = state.search.toLowerCase()
  if (q) list = list.filter(p =>
    (p.brand || '').toLowerCase().includes(q) ||
    (p.model || '').toLowerCase().includes(q) ||
    (p.series || '').toLowerCase().includes(q)
  )
  if (state.brandFilter) list = list.filter(p => p.brand === state.brandFilter)
  if (state.statusFilter) list = list.filter(p => (p.status || 'active') === state.statusFilter)
  if (state.confFilter) list = list.filter(p => p.confidence_level === state.confFilter)
  return list
}

function renderCategory() {
  const catMeta = state.catalog.categories.find(c => c.id === state.category) ?? {}
  const color = CAT_COLORS[state.category] || '#768390'
  const allBrands = [...new Set(state.catData.products.map(p => p.brand).filter(Boolean))].sort()

  app().innerHTML = buildCategoryHTML(catMeta, color, allBrands)
  attachCategoryEvents()
  document.getElementById('search-wrap').classList.remove('hidden')
}

function buildCategoryHTML(catMeta, color, allBrands) {
  const filtered = getFiltered()
  const shown = filtered.slice(0, state.shown)

  const brandOpts = allBrands.map(b => `<option value="${esc(b)}" ${state.brandFilter === b ? 'selected' : ''}>${esc(b)}</option>`).join('')

  const cards = shown.map(p => productCardHTML(p, state.category)).join('')

  const moreBtn = filtered.length > state.shown
    ? `<div class="load-more-wrap"><button class="btn" id="load-more">Show more (${filtered.length - state.shown} remaining)</button></div>`
    : ''

  return `
    <div class="fade-in">
      <nav class="breadcrumb" aria-label="breadcrumb">
        <button class="breadcrumb-link" id="bc-home">Home</button>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">${esc(catMeta.label ?? state.category)}</span>
      </nav>

      <div class="cat-view-header">
        <div class="cat-icon" style="color:${color};background:rgba(0,0,0,.2);border:1px solid ${color}33;border-radius:8px">
          ${ICONS[catMeta.icon] || ICONS.plug}
        </div>
        <h2>${esc(catMeta.label ?? state.category)}</h2>
        <span class="total-badge">${filtered.length} / ${state.catData.products.length}</span>
      </div>

      <div class="controls-row">
        <select class="filter-select" id="f-brand" aria-label="Filter by brand">
          <option value="">All brands</option>
          ${brandOpts}
        </select>
        <select class="filter-select" id="f-status" aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="active" ${state.statusFilter==='active'?'selected':''}>Active</option>
          <option value="discontinued" ${state.statusFilter==='discontinued'?'selected':''}>Discontinued</option>
        </select>
        <select class="filter-select" id="f-conf" aria-label="Filter by confidence">
          <option value="">Any confidence</option>
          <option value="A" ${state.confFilter==='A'?'selected':''}>A — Manufacturer</option>
          <option value="B" ${state.confFilter==='B'?'selected':''}>B — Retailer</option>
          <option value="C" ${state.confFilter==='C'?'selected':''}>C — Inferred</option>
          <option value="D" ${state.confFilter==='D'?'selected':''}>D — Estimated</option>
        </select>
      </div>

      ${cards.length
        ? `<div class="products-grid" id="products-grid">${cards}</div>${moreBtn}`
        : `<div class="empty-state"><div style="font-size:2rem">🔍</div><p>No products match your filters.</p></div>`
      }
    </div>`
}

function productCardHTML(p, catId) {
  const price = priceStr(p.specs, null)
  const chips = buildSpecChips(p.specs, catId)
  return `
    <button class="product-card" data-path="${esc(p.path)}" aria-label="${esc(p.model)}">
      <span class="card-brand">${esc(p.brand || '')}</span>
      <span class="card-model">${esc(p.model || '–')}</span>
      ${p.series ? `<span class="card-series">${esc(p.series)}</span>` : ''}
      <span class="card-meta">
        ${statusBadge(p.status)}
        ${confBadge(p.confidence_level)}
      </span>
      ${chips ? `<span class="card-specs">${chips}</span>` : ''}
      ${price ? `<span class="card-price"><strong>${esc(price)}</strong><em>list price</em></span>` : ''}
    </button>`
}

function buildSpecChips(specs, catId) {
  if (!specs) return ''
  const keys = KEY_SPECS[catId] || []
  return keys.filter(k => specs[k] != null).map(k => {
    const v = formatPreviewVal(k, specs[k])
    if (v === null) return ''
    const label = fieldLabel(k).replace(' Diameter','').replace(' Airflow','').replace(' Amount','')
    return `<span class="spec-chip"><em>${esc(label)}:</em> ${esc(String(v))}</span>`
  }).join('')
}

function attachCategoryEvents() {
  document.getElementById('bc-home')?.addEventListener('click', () => navigate('home'))
  document.getElementById('f-brand')?.addEventListener('change', e => { state.brandFilter = e.target.value; state.shown = PAGE_SIZE; refreshCategoryGrid() })
  document.getElementById('f-status')?.addEventListener('change', e => { state.statusFilter = e.target.value; state.shown = PAGE_SIZE; refreshCategoryGrid() })
  document.getElementById('f-conf')?.addEventListener('change', e => { state.confFilter = e.target.value; state.shown = PAGE_SIZE; refreshCategoryGrid() })
  document.getElementById('load-more')?.addEventListener('click', () => { state.shown += PAGE_SIZE; refreshCategoryGrid() })
  attachProductCardEvents()

  const search = document.getElementById('search')
  if (search) {
    search.value = state.search
    search.oninput = e => { state.search = e.target.value; state.shown = PAGE_SIZE; refreshCategoryGrid() }
  }
}

function refreshCategoryGrid() {
  const catMeta = state.catalog.categories.find(c => c.id === state.category) ?? {}
  const color = CAT_COLORS[state.category] || '#768390'
  const allBrands = [...new Set(state.catData.products.map(p => p.brand).filter(Boolean))].sort()
  app().innerHTML = buildCategoryHTML(catMeta, color, allBrands)
  attachCategoryEvents()
}

function attachProductCardEvents() {
  document.querySelectorAll('.product-card').forEach(btn => {
    btn.addEventListener('click', () => navigate('product', state.category, btn.dataset.path))
  })
}

// ── Product detail view ──────────────────────────────────────────────────────
function renderProduct() {
  const d = state.product
  const catId = state.category ?? guessCat(state.productPath)
  const catMeta = state.catalog?.categories.find(c => c.id === catId) ?? {}
  const color = CAT_COLORS[catId] || '#768390'

  app().innerHTML = buildProductHTML(d, catId, catMeta, color)
  attachProductEvents()
  document.getElementById('search-wrap').classList.add('hidden')
}

function guessCat(path) {
  if (!path) return null
  const m = path.match(/^data\/([^/]+)\//)
  return m ? m[1] : null
}

function buildProductHTML(d, catId, catMeta, color) {
  const isCompat = catId === 'grow-controller-compatibility'
  const title = isCompat ? (d.controller_model || 'Controller') : (d.model || d.name || '–')
  const brand = isCompat ? '' : (d.brand || '')
  const series = isCompat ? '' : (d.series || d.compatible_series || '')
  const status = isCompat ? 'active' : (d.status || 'active')
  const conf = isCompat ? null : d.confidence_level

  const keySpecsBar = buildKeySpecsBar(d, catId, isCompat)
  const sections = isCompat ? buildCompatSections(d) : buildSpecSections(d)

  return `
    <div class="product-detail fade-in">
      <nav class="breadcrumb" aria-label="breadcrumb">
        <button class="breadcrumb-link" id="bc-home">Home</button>
        <span class="breadcrumb-sep">›</span>
        <button class="breadcrumb-link" id="bc-cat">${esc(catMeta.label ?? catId)}</button>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">${esc(title)}</span>
      </nav>

      <div class="detail-header">
        ${brand ? `<div class="detail-brand">${esc(brand)}</div>` : ''}
        <div class="detail-model">${esc(title)}</div>
        ${series ? `<div class="detail-series">${esc(series)}</div>` : ''}
        <div class="detail-badges">
          ${statusBadge(status)}
          ${confBadge(conf)}
        </div>
        ${keySpecsBar}
      </div>

      <div class="spec-sections">${sections}</div>
    </div>`
}

function buildKeySpecsBar(d, catId, isCompat) {
  if (isCompat) {
    const count = (d.compatible_devices || []).length
    return `<div class="key-specs-bar"><div class="key-spec"><span class="key-spec-label">Compatible Devices</span><span class="key-spec-value">${count}</span></div></div>`
  }
  const keys = KEY_SPECS[catId] || []
  const items = keys
    .filter(k => d[k] != null)
    .map(k => {
      const fv = formatVal(k, d[k])
      if (fv === null) return ''
      const display = typeof fv === 'boolean' ? (fv ? 'Yes' : 'No') : esc(String(fv))
      return `<div class="key-spec"><span class="key-spec-label">${esc(fieldLabel(k))}</span><span class="key-spec-value">${display}</span></div>`
    }).filter(Boolean)
  if (!items.length) return ''
  return `<div class="key-specs-bar">${items.join('')}</div>`
}

function buildCompatSections(d) {
  const devices = d.compatible_devices || []
  if (!devices.length) return `<div class="spec-section"><div class="spec-section-header">Compatible Devices</div><div class="compat-list"><div class="compat-item" style="color:var(--text-3)">No devices listed.</div></div></div>`

  const items = devices.map(dev => {
    const product = [dev.compatible_brand, dev.compatible_series].filter(Boolean).join(' — ')
    const level = dev.compatibility_level ? `<span class="badge badge-active">${esc(dev.compatibility_level)}</span>` : ''
    const connector = dev.connector_or_protocol ? `<span>🔌 ${esc(dev.connector_or_protocol)}</span>` : ''
    const adapter = dev.requires_adapter_or_module === true ? `<span>Adapter required</span>` : ''
    const cat = dev.compatible_product_category ? `<span>Type: ${esc(dev.compatible_product_category)}</span>` : ''
    const src = dev.source_url ? `<a class="source-link" href="${esc(dev.source_url)}" target="_blank" rel="noopener">Source ↗</a>` : ''
    return `
      <div class="compat-item">
        <div class="compat-item-header">
          ${level}
          <span class="compat-product">${esc(product || '–')}</span>
        </div>
        <div class="compat-item-meta">${[cat, connector, adapter, src].filter(Boolean).join('')}</div>
      </div>`
  }).join('')

  return `<div class="spec-section"><div class="spec-section-header">Compatible Devices (${devices.length})</div><div class="compat-list">${items}</div></div>`
}

function buildSpecSections(d) {
  const groups = {}
  for (const [key, val] of Object.entries(d)) {
    if (val === null || val === undefined) continue
    const g = fieldGroup(key)
    if (!g) continue
    if (!groups[g]) groups[g] = []
    groups[g].push([key, val])
  }

  const ORDER = ['Performance', 'Physical Specs', 'Details', 'Compatibility',
                  'Control Capabilities', 'Sensor Capabilities', 'AI Features', 'Pricing', 'Data Source']

  return ORDER.filter(g => groups[g]).map(g => {
    const rows = groups[g].map(([key, val]) => {
      const fv = formatVal(key, val)
      if (fv === null) return ''
      let display
      if (typeof fv === 'boolean') {
        display = fv
          ? `<span class="val-bool-true">✓ Yes</span>`
          : `<span class="val-bool-false">✗ No</span>`
      } else if (key.endsWith('_url')) {
        display = `<a class="source-link" href="${esc(String(val))}" target="_blank" rel="noopener">${esc(String(val).replace(/^https?:\/\//, '').split('/')[0])} ↗</a>`
      } else {
        display = esc(String(fv))
      }
      return `<tr><td>${esc(fieldLabel(key))}</td><td>${display}</td></tr>`
    }).filter(Boolean).join('')
    if (!rows) return ''
    return `
      <div class="spec-section">
        <div class="spec-section-header">${esc(g)}</div>
        <table class="spec-table"><tbody>${rows}</tbody></table>
      </div>`
  }).join('')
}

function attachProductEvents() {
  document.getElementById('bc-home')?.addEventListener('click', () => navigate('home'))
  document.getElementById('bc-cat')?.addEventListener('click', () => {
    const catId = state.category ?? guessCat(state.productPath)
    navigate('category', catId)
  })
}

// ── Bootstrap ────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('logo-btn').addEventListener('click', () => navigate('home'))
  await render()
})
