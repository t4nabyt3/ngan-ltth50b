import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Check, ExternalLink, Menu, Moon, Package, Search, ShoppingBag, Sun, X } from 'lucide-react'
import CartDrawer from './components/CartDrawer'
import HeroVideo from './components/HeroVideo'
import Checkout, { OrderSuccess, PaymentPending } from './components/Checkout'
import ProductCard from './components/ProductCard'
import ProductPage from './components/ProductPage'
import SalesFlow from './components/SalesFlow'
import VoucherStrip from './components/VoucherStrip'
import { optionsById, products, productsById } from './data/products'
import { blackFridayPrice, blackFridayRate, isBlackFridayOffer, promotions, quoteCart } from './data/commerce'
import { hasPendingPayment, nextOrderUpdate, orderSteps } from './data/orderSimulation'
import { sanitizeCart } from './security/validation'

const themes = { yellow: 'Vàng', lime: 'Xanh lá', blue: 'Xanh lam' }
const pageSize = 12
const categories = ['Tất cả', ...new Set(products.map((p) => p.category))]
const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd')
const searchText = new Map(products.map((p) => [p.id, normalize([p.name, p.description, p.category, ...p.highlights].join(' '))]))
const validOptions = new Set([...optionsById].filter(([, { option }]) => option.available).map(([id]) => id))

function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

function Header({ cartCount, onOpenCart, onShop, onCatalog, onFlow, flowActive, orderPath, orderActive, onOrder, theme, onThemeChange, mode, onModeChange }) {
  const [open, setOpen] = useState(false)
  const dark = mode === 'dark'
  const select = (action) => {
    setOpen(false)
    action()
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="wordmark" onClick={() => select(onShop)}>Try Hack My Shop<span>.</span></button>
        <nav id="main-navigation" className={`main-nav ${open ? 'mobile-open' : ''}`} aria-label="Điều hướng chính">
          <button className="nav-link" onClick={() => select(() => onCatalog(false))}>Sản phẩm</button>
          <button className="nav-link" onClick={() => select(() => onCatalog(true))}>Black Friday</button>
          <button className="nav-link" aria-current={flowActive ? 'page' : undefined} onClick={() => select(onFlow)}>Quy trình bán hàng</button>
          {orderPath && <a className="nav-link" href={orderPath} aria-current={orderActive ? 'page' : undefined} onClick={(event) => onOrder(event, () => setOpen(false))}>Đơn hàng</a>}
        </nav>
        <div className="header-actions">
          <button type="button" className="mode-toggle" role="switch" aria-checked={dark} aria-label="Chế độ tối" title={dark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'} onClick={() => onModeChange(dark ? 'light' : 'dark')}>
            {dark ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
            <span>{dark ? 'Tối' : 'Sáng'}</span>
          </button>
          <div className="theme-picker" role="group" aria-label="Màu giao diện">
            {Object.entries(themes).map(([id, label]) => <button key={id} className={`theme-swatch theme-swatch-${id}`} aria-pressed={theme === id} aria-label={label} title={label} onClick={() => onThemeChange(id)} />)}
          </div>
          <button className="cart-trigger" onClick={onOpenCart} aria-label={`Mở giỏ hàng, ${cartCount} sản phẩm`}><ShoppingBag size={17} /><span>Giỏ hàng</span><b>{cartCount}</b></button>
          <button className="mobile-menu-button" aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
    </header>
  )
}

function Hero({ onCatalog }) {

  return (
    <section className="hero-section campaign-hero">
      <div className="hero-inner page-shell">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="live-dot" /> BLACK FRIDAY</div>
          <h1>Try Hack<br /><em>My Shop.</em></h1>
          <p className="hero-description">Thiết bị Hak5 cho phòng lab an ninh mạng, lớp học và kiểm thử có ủy quyền.</p>
          <div className="hero-actions">
            <button className="button button-acid" onClick={() => onCatalog(true)}>Xem ưu đãi <ArrowUpRight size={17} /></button>
            <button className="hero-text-link" onClick={() => onCatalog(false)}>Xem danh mục</button>
          </div>
          <div className="campaign-code"><code>−{blackFridayRate}%</code><span>Tự áp dụng cho thiết bị Black Friday.</span></div>
        </div>
        <div className="hero-visual campaign-visual glitch-box">
          <HeroVideo />
          <a href="/product/pager" className="hero-device">WiFi Pineapple Pager <ArrowUpRight size={13} /></a>
        </div>
      </div>
    </section>
  )
}

const catalogPrice = (product) => isBlackFridayOffer(product) ? blackFridayPrice(product.priceCents) : product.priceCents

const sorters = {
  price: (a, b) => catalogPrice(a) - catalogPrice(b),
  expensive: (a, b) => catalogPrice(b) - catalogPrice(a),
  name: (a, b) => a.name.localeCompare(b.name, 'vi'),
}

function Catalog({ onAdd, onDetail, deals, setDeals, code, onSelectVoucher }) {
  const [category, setCategory] = useState('Tất cả')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const filtered = useMemo(() => {
    const terms = normalize(search.trim()).split(/\s+/).filter(Boolean)
    const matches = products.filter((p) => (!deals || isBlackFridayOffer(p)) && (category === 'Tất cả' || p.category === category) && terms.every((term) => searchText.get(p.id).includes(term)))
    return sorters[sort] ? matches.sort((a, b) => Number(b.available) - Number(a.available) || sorters[sort](a, b)) : matches
  }, [search, category, deals, sort])
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pages)
  const first = (currentPage - 1) * pageSize
  const update = (setter, value) => { setter(value); setPage(1) }
  const paginate = (next) => {
    setPage(next)
    document.getElementById('products')?.scrollIntoView({ block: 'start' })
  }

  useEffect(() => {
    const shortcut = (event) => {
      if (event.key !== '/' || event.ctrlKey || event.altKey || event.metaKey || event.target.closest?.('input,textarea,select,[contenteditable]')) return
      event.preventDefault()
      document.getElementById('site-search')?.focus()
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [])

  return (
    <section id="products" className="products-section page-shell">
      <div className="section-heading">
        <div><h2>{deals ? <>Ưu đãi <em>Black Friday.</em></> : <>Danh mục <em>Hak5.</em></>}</h2>
          <p className="catalog-count" aria-live="polite">{filtered.length} sản phẩm{deals && ' được giảm giá tự động'}</p>

        </div>
        {deals && <button className="back-link" onClick={() => update(setDeals, false)}>Về toàn bộ danh mục</button>}
      </div>
      {!deals && <VoucherStrip code={code} onSelect={onSelectVoucher} />}
      <div className="catalog-toolbar">
        <label className="catalog-search"><Search size={18} /><input id="site-search" type="search" value={search} onChange={(event) => update(setSearch, event.target.value)} placeholder="Tìm tên hoặc loại thiết bị" aria-label="Tìm sản phẩm" maxLength={80} /><kbd>/</kbd></label>
        <label className="sort-control"><span>Sắp xếp</span><select className="ui-select" value={sort} onChange={(event) => update(setSort, event.target.value)} aria-label="Sắp xếp sản phẩm"><option value="featured">Nổi bật</option><option value="price">Giá tăng dần</option><option value="expensive">Giá giảm dần</option><option value="name">Tên A–Z</option></select></label>
      </div>
      <div className="category-tabs" role="group" aria-label="Danh mục sản phẩm">
        {categories.map((item) => <button key={item} type="button" aria-pressed={item === category} className={`category-tab ${item === category ? 'selected' : ''}`} onClick={() => update(setCategory, item)}>{item}</button>)}
      </div>
      {filtered.length ? <div className="product-grid">{filtered.slice(first, first + pageSize).map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} onDetail={onDetail} />)}</div>
        : <div className="no-results"><h3>Không tìm thấy sản phẩm</h3><button type="button" onClick={() => { setSearch(''); setCategory('Tất cả'); setPage(1) }}>Xóa bộ lọc</button></div>}
      {pages > 1 && <nav className="catalog-pagination" aria-label="Phân trang danh mục">
        <button className="button button-dark" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Trang trước</button>
        <span>Trang {currentPage} / {pages}</span>
        <button className="button button-dark" onClick={() => paginate(currentPage + 1)} disabled={currentPage === pages}>Trang sau</button>
      </nav>}
    </section>
  )
}

function Footer({ onCatalog, onFlow }) {
  return (
    <footer className="site-footer">
      <div className="page-shell shop-footer">
        <p className="wordmark">Try Hack My Shop<span>.</span></p>
        <div>
          <button onClick={() => onCatalog(false)}>Danh mục</button>
          <button onClick={onFlow}>Quy trình bán hàng</button>
          <a className="inline-flex items-center gap-1" href="https://shop.hak5.org/" target="_blank" rel="noreferrer">Nguồn Hak5 <ExternalLink size={13} /></a>
        </div>
      </div>
    </footer>
  )
}

function readRoute() {
  const path = location.pathname.replace(/\/$/, '') || '/'
  if (path.startsWith('/product/')) return { view: 'product', id: path.slice(9) }
  if (path === '/quy-trinh') return { view: 'flow' }
  if (path === '/checkout') return { view: 'checkout' }
  if (path === '/order/payment') return { view: 'payment' }
  if (path === '/order/success') return { view: 'success' }
  if (path === '/you-got-a-trap') return { view: 'guard' }
  return { view: 'shop' }
}

export default function App() {
  const [route, setRoute] = useState(readRoute)
  const [mode, setMode] = useState(() => readStorage('thm-color-mode', 'light') === 'dark' ? 'dark' : 'light')
  const [theme, setTheme] = useState(() => {
    const saved = readStorage('thm-theme-v2', null)
    try { return Object.hasOwn(themes, saved) ? saved : Object.hasOwn(themes, localStorage.getItem('thm-theme')) ? localStorage.getItem('thm-theme') : 'yellow' }
    catch { return 'yellow' }
  })
  const [cart, setCart] = useState(() => sanitizeCart(readStorage('thm-cart', []), validOptions))
  const [drawer, setDrawer] = useState(false)
  const [deals, setDeals] = useState(false)
  const [code, setCode] = useState(() => {
    const saved = readStorage('thm-voucher', '')
    return typeof saved === 'string' && Object.hasOwn(promotions, saved) ? saved : ''
  })
  const [order, setOrder] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('thm-demo-order') ?? 'null')
      return saved?.id && saved.quote && Number.isInteger(saved.stage) && Number.isFinite(saved.paymentRun?.startedAt) ? saved : null
    } catch { return null }
  })
  const [toast, setToast] = useState('')
  const items = useMemo(() => cart.map(({ id, quantity }) => ({ ...optionsById.get(id), quantity })), [cart])
  const quote = quoteCart(items, code)
  const active = productsById.get(route.id)

  useEffect(() => {
    const onPop = () => { setRoute(readRoute()); setDrawer(false) }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.dataset.mode = mode
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', mode === 'dark' ? '#181b16' : '#fbfaf6')
    try { localStorage.setItem('thm-color-mode', JSON.stringify(mode)) } catch { /* Optional preference. */ }
  }, [mode])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('thm-theme-v2', JSON.stringify(theme)) } catch { /* Optional preference. */ }
  }, [theme])

  useEffect(() => {
    try { localStorage.setItem('thm-cart', JSON.stringify(cart)) } catch { /* The in-memory cart still works. */ }
  }, [cart])

  useEffect(() => {
    try { localStorage.setItem('thm-voucher', JSON.stringify(code)) } catch { /* In-memory selection still works. */ }
  }, [code])

  useEffect(() => {
    try {
      if (order) sessionStorage.setItem('thm-demo-order', JSON.stringify(order))
      else sessionStorage.removeItem('thm-demo-order')
    } catch { /* The demo can run in memory. */ }
  }, [order])

  const selectVoucher = (value) => {
    setCode(value)
    setToast(value ? `Đã chọn ${value} cho đơn tiếp theo` : 'Đã bỏ mã ưu đãi')
  }

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2300)
    return () => clearTimeout(timer)
  }, [toast])

  const navigate = useCallback((path, replace = false) => {
    if (location.pathname !== path) {
      if (replace) history.replaceState({}, '', path)
      else history.pushState({}, '', path)
    }
    setRoute(readRoute())
    setDrawer(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const openProduct = (product) => navigate(`/product/${product.id}`)
  const openCatalog = (showDeals) => {
    setDeals(showDeals)
    if (route.view !== 'shop') navigate('/')
    requestAnimationFrame(() => document.getElementById('products')?.scrollIntoView())
  }

  const addToCart = (product, option, quantity = 1) => {
    if (!option || !validOptions.has(option.id)) return
    const existing = cart.find((item) => item.id === option.id)?.quantity ?? 0
    setCart((previous) => sanitizeCart([...previous, { id: option.id, quantity }], validOptions))
    setToast(existing >= 10 ? 'Tối đa 10 sản phẩm mỗi biến thể.' : `Đã thêm ${product.name} vào giỏ`)
  }

  const changeQuantity = (id, quantity) => {
    setCart((previous) => sanitizeCart(previous.map((item) => item.id === id ? { id, quantity } : item), validOptions))
  }

  const placeOrder = ({ payment, zone }) => {
    const createdAt = new Date().toISOString()
    setOrder({
      id: `THM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      quote: quoteCart(items, code, { payment, zone }),
      code,
      method: payment,
      stage: 0,
      createdAt,
      paymentRun: { startedAt: Date.now(), fail: false },
    })
    setCart([])
    setCode('')
    navigate(payment === 'cod' ? '/order/success' : '/order/payment')
  }

  const restartPayment = (fail) => {
    setOrder((previous) => previous && { ...previous, paymentRun: { startedAt: Date.now(), fail } })
  }

  useEffect(() => {
    if (!order) return
    const update = () => {
      const next = nextOrderUpdate(order, Date.now())
      if (next?.stage === undefined) return
      setOrder((previous) => previous === order ? { ...previous, stage: next.stage } : previous)
    }
    const next = nextOrderUpdate(order, Date.now())
    if (!next) return
    const timer = setTimeout(update, next.delay ?? 0)
    return () => clearTimeout(timer)
  }, [order])

  const orderPath = order && (hasPendingPayment(order) ? '/order/payment' : '/order/success')
  useEffect(() => {
    if (route.view === 'payment' && orderPath === '/order/success') navigate(orderPath, true)
  }, [route.view, orderPath, navigate])

  const openOrder = (event, closeMenu) => {
    if (event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return
    event.preventDefault()
    closeMenu?.()
    navigate(orderPath)
  }

  return (
    <div className="app-shell">
      <Header cartCount={items.reduce((n, item) => n + item.quantity, 0)} onOpenCart={() => setDrawer(true)} onShop={() => { setDeals(false); navigate('/') }} onCatalog={openCatalog} onFlow={() => navigate('/quy-trinh')} flowActive={route.view === 'flow'} orderPath={orderPath} orderActive={['payment', 'success'].includes(route.view)} onOrder={openOrder} theme={theme} onThemeChange={setTheme} mode={mode} onModeChange={setMode} />
      {route.view === 'shop' && <main>
        {order && <div className="page-shell">
          <a className="shop-order-link" href={orderPath} onClick={openOrder}>
            <Package size={19} aria-hidden="true" />
            <span><strong>{orderSteps(order)[order.stage]}</strong><small>{order.id}</small></span>
            <span className="shop-order-action">{hasPendingPayment(order) ? 'Xem thanh toán' : 'Theo dõi đơn'}</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>}
        <Hero onCatalog={openCatalog} /><Catalog key={String(deals)} onAdd={addToCart} onDetail={openProduct} deals={deals} setDeals={setDeals} code={code} onSelectVoucher={selectVoucher} /></main>}
      {route.view === 'product' && active && <ProductPage key={active.id} product={active} onBack={() => openCatalog(deals)} onAdd={addToCart} onOpenProduct={openProduct} />}
      {route.view === 'flow' && <SalesFlow onCatalog={() => openCatalog(false)} />}
      {route.view === 'checkout' && <Checkout items={items} code={code} setCode={setCode} onBack={() => openCatalog(false)} onPlaceOrder={placeOrder} />}
      {route.view === 'payment' && <PaymentPending order={order} onRestart={restartPayment} onContinue={() => openCatalog(false)} />}
      {route.view === 'success' && <OrderSuccess order={order} onViewPayment={() => navigate('/order/payment', true)} onContinue={() => openCatalog(false)} />}
      {(route.view === 'guard' || (route.view === 'product' && !active)) && <main className="page-shell py-20"><h1 className="text-4xl font-extrabold">{route.view === 'guard' ? 'Yêu cầu không hợp lệ' : 'Không tìm thấy sản phẩm'}</h1><button className="back-link mt-6" onClick={() => openCatalog(false)}>Về danh mục</button></main>}
      <Footer onCatalog={openCatalog} onFlow={() => navigate('/quy-trinh')} />
      <CartDrawer open={drawer} items={items} quote={quote} code={code} onClose={() => setDrawer(false)} onChangeQty={changeQuantity} onCheckout={() => navigate('/checkout')} />
      {toast && <div className="toast-message" role="status"><Check size={17} />{toast}</div>}
    </div>
  )
}
