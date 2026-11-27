import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CircleCheck,
  CreditCard,
  Fingerprint,
  LockKeyhole,
  Menu,
  PackageCheck,
  RadioTower,
  Search,
  ShieldCheck,
  ShoppingBag,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import HeroScene from './components/HeroScene'
import ProductCard from './components/ProductCard'
import CartDrawer from './components/CartDrawer'
import ProductPage from './components/ProductPage'
import { formatPrice, products } from './data/products'
import { containsSuspiciousText, sanitizeCart, validateCheckoutForm } from './security/validation'

const colorThemes = [
  { id: 'yellow', label: 'Vàng', className: 'theme-swatch-yellow', color: '#e7bd3f' },
  { id: 'lime', label: 'Xanh lá', className: 'theme-swatch-lime', color: '#a5c66b' },
  { id: 'blue', label: 'Xanh lam', className: 'theme-swatch-blue', color: '#78b9c8' },
]

const paymentMethods = [
  { id: 'cod', title: 'Thanh toán khi nhận hàng', subtitle: 'COD · Trả tiền cho đơn vị giao hàng', icon: PackageCheck },
  { id: 'bank', title: 'Chuyển khoản ngân hàng', subtitle: 'Mô phỏng xác nhận giao dịch qua mã tham chiếu', icon: CreditCard },
  { id: 'wallet', title: 'Ví điện tử', subtitle: 'Mô phỏng ví điện tử · Không kết nối cổng thật', icon: Wallet },
]

function ThemePicker({ selectedTheme, onChange }) {
  return (
    <div className="theme-picker" role="group" aria-label="Chọn màu giao diện">
      {colorThemes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          className={`theme-swatch ${theme.className}`}
          aria-label={`Dùng màu ${theme.label}`}
          aria-pressed={selectedTheme === theme.id}
          title={`Màu ${theme.label}`}
          onClick={() => onChange(theme.id)}
        />
      ))}
    </div>
  )
}

function Header({ cartCount, onOpenCart, searchValue, onSearch, view, onNavigate, onNavigateSection, selectedTheme, onThemeChange }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleShortcuts = (event) => {
      const target = event.target
      const isTyping = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      if (event.key === '/' && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        document.getElementById('site-search')?.focus()
      }
      if (event.key === 'Escape' && target?.id === 'site-search') {
        onSearch('')
        target.blur()
      }
    }
    window.addEventListener('keydown', handleShortcuts)
    return () => window.removeEventListener('keydown', handleShortcuts)
  }, [onSearch])
  const go = (destination) => {
    setMobileOpen(false)
    onNavigate(destination)
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="brand" onClick={() => go('shop')} aria-label="Try Hack My Shop - Trang chủ">
          <span className="brand-mark">TH<span>M</span></span>
          <span className="brand-name">TRY HACK<br />MY SHOP<span className="brand-period">.</span></span>
        </button>
        <nav id="main-navigation" className={`main-nav ${mobileOpen ? 'mobile-open' : ''}`}>
          <button className={view === 'shop' ? 'nav-link active' : 'nav-link'} onClick={() => go('shop')}>Cửa hàng</button>
          <button className="nav-link" onClick={() => { setMobileOpen(false); onNavigateSection('about') }}>Về dự án</button>
          <button className="nav-link" onClick={() => { setMobileOpen(false); onNavigateSection('security') }}>An toàn giao dịch</button>
        </nav>
        <div className="header-actions">
          <ThemePicker selectedTheme={selectedTheme} onChange={onThemeChange} />
          <label className="header-search">
            <Search size={16} />
            <input id="site-search" type="search" value={searchValue} onChange={(event) => onSearch(event.target.value.slice(0, 80))} placeholder="Tìm sản phẩm..." aria-label="Tìm sản phẩm" maxLength={80} autoComplete="off" />
            <kbd>/</kbd>
          </label>
          <button className="cart-trigger" onClick={onOpenCart} aria-label={`Mở giỏ hàng, có ${cartCount} sản phẩm`}>
            <ShoppingBag size={18} />
            <span>Giỏ hàng</span>
            <b>{cartCount}</b>
          </button>
          <button
            className="mobile-menu-button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Mở menu"
            aria-expanded={mobileOpen}
            aria-controls="main-navigation"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  )
}

function Hero({ onShop, accentColor }) {
  return (
    <section className="hero-section">
      <div className="hero-inner page-shell">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="live-dot" /> THIẾT BỊ KIỂM THỬ BẢO MẬT
          </div>
          <h1>Công cụ<br /><em>pentest.</em></h1>
          <p className="hero-description">
            Khám phá ba thiết bị tham chiếu từ Hak5 dành cho bài lab Wi-Fi,
            USB HID và kiểm thử endpoint. Đây là cửa hàng mô phỏng, không xử lý
            đơn hàng hoặc thanh toán thật.
          </p>
          <div className="hero-actions">
            <button className="button button-acid" onClick={onShop}>
              Xem sản phẩm <ArrowUpRight size={17} />
            </button>
            <a className="hero-text-link" href="#about">Tìm hiểu dự án</a>
          </div>
          <div className="hero-proof">
            <div className="proof-avatars"><ShieldCheck size={18} /></div>
            <div>
              <strong>Dự án học tập</strong>
              <small>Chỉ dùng thiết bị trong môi trường được cho phép</small>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <HeroScene accentColor={accentColor} />
          <div className="hero-visual-card">
            <span>BA NHÓM THIẾT BỊ</span>
            <strong>Wi-Fi · USB HID · Endpoint</strong>
          </div>
        </div>

        <div className="hero-bottom-line">
          <span>TRY HACK MY SHOP</span>
          <span>KIỂM THỬ CÓ ỦY QUYỀN</span>
        </div>
      </div>
    </section>
  )
}

function TrustStrip() {
  const items = [
    { icon: ShieldCheck, title: 'Ưu tiên bảo mật', text: 'Thiết kế theo nguyên tắc tối thiểu dữ liệu' },
    { icon: RadioTower, title: 'Thiết bị chuyên dụng', text: 'Thông tin tham chiếu từ Hak5' },
    { icon: Zap, title: 'Demo tương tác', text: 'Giỏ hàng và checkout mô phỏng' },
  ]
  return (
    <section className="trust-strip page-shell">
      {items.map(({ icon: Icon, title, text }, index) => (
        <div className="trust-item" key={title}>
          <div className="trust-icon"><Icon size={19} /></div>
          <div><strong>{title}</strong><span>{text}</span></div>
          {index !== items.length - 1 && <div className="trust-divider" />}
        </div>
      ))}
    </section>
  )
}

function ProductSection({ searchValue, onSearch, onAdd, onDetail, cartQuantities }) {
  const [activeCategory, setActiveCategory] = useState('Tất cả')
  const [sortBy, setSortBy] = useState('featured')
  const categories = ['Tất cả', ...new Set(products.map((product) => product.category))]
  const filtered = useMemo(() => {
    const query = searchValue.trim().toLocaleLowerCase('vi')
    const matching = products.filter((product) => {
      const matchesCategory = activeCategory === 'Tất cả' || product.category === activeCategory
      const searchable = `${product.name} ${product.description} ${product.category} ${product.highlights.join(' ')}`.toLocaleLowerCase('vi')
      return matchesCategory && searchable.includes(query)
    })

    if (sortBy === 'price-low') return matching.sort((a, b) => a.price - b.price)
    if (sortBy === 'price-high') return matching.sort((a, b) => b.price - a.price)
    if (sortBy === 'name') return matching.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    return matching
  }, [activeCategory, searchValue, sortBy])

  return (
    <section className="products-section page-shell" id="products">
      <div className="section-heading">
        <div>
          <div className="section-eyebrow"><span>02</span> / DANH MỤC</div>
          <h2>Danh sách<br /><em>thiết bị.</em></h2>
        </div>
        <div className="section-intro">
          <p>Lọc theo nhóm thiết bị, tìm nhanh theo tên hoặc tính năng, rồi mở trang chi tiết để xem thông tin trước khi thêm vào giỏ.</p>
          <span className="catalog-count" aria-live="polite">{filtered.length} / {products.length} SẢN PHẨM PHÙ HỢP</span>
        </div>
      </div>
      <div className="catalog-toolbar">
        <div className="category-tabs" role="group" aria-label="Lọc theo danh mục">
          {categories.map((category) => (
            <button key={category} type="button" aria-pressed={activeCategory === category} className={activeCategory === category ? 'category-tab selected' : 'category-tab'} onClick={() => setActiveCategory(category)}>{category}</button>
          ))}
        </div>
        <label className="sort-control"><span>Sắp xếp</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sắp xếp sản phẩm">
            <option value="featured">Mặc định</option>
            <option value="price-low">Giá: thấp đến cao</option>
            <option value="price-high">Giá: cao đến thấp</option>
            <option value="name">Tên A–Z</option>
          </select>
        </label>
      </div>
      {filtered.length > 0 ? (
        <div className="product-grid" aria-live="polite">
          {filtered.map((product, index) => <ProductCard key={product.id} product={product} index={index} onAdd={onAdd} onDetail={onDetail} quantityInCart={cartQuantities[product.id] || 0} />)}
        </div>
      ) : (
        <div className="no-results" role="status"><Search size={22} /><h3>Không tìm thấy sản phẩm</h3><p>Không có kết quả cho “{searchValue.trim()}”. Thử từ khóa khác hoặc xóa bộ lọc.</p><button type="button" onClick={() => { onSearch(''); setActiveCategory('Tất cả'); setSortBy('featured') }}>Xóa bộ lọc</button></div>
      )}
      <div className="source-disclaimer"><span className="source-disclaimer-mark">i</span><p>Giá và mô tả là dữ liệu tham chiếu từ Hak5, có thể thay đổi theo phiên bản và tình trạng hàng. Try Hack My Shop là dự án mô phỏng, không phải đại lý của Hak5.</p></div>
    </section>
  )
}

function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="page-shell about-inner">
        <div className="about-copy">
          <div className="section-eyebrow"><span>03</span> / VỀ DỰ ÁN</div>
          <h2>Một cửa hàng<br /><em>mô phỏng.</em></h2>
          <p>Try Hack My Shop là website thương mại điện tử mô phỏng, lấy cảm hứng từ nhóm thiết bị kiểm thử của Hak5. Dự án tập trung vào trải nghiệm xem sản phẩm, quản lý giỏ hàng, nhập thông tin nhận hàng và lựa chọn phương thức thanh toán.</p>
          <div className="about-note"><Fingerprint size={20} /><span>Chỉ sử dụng thiết bị và kỹ thuật trong môi trường lab hoặc phạm vi được chủ sở hữu hệ thống cho phép.</span></div>
        </div>
        <div className="about-metrics">
          <div className="metric-card metric-dark"><span>01 / SẢN PHẨM</span><strong>3<span>+</span></strong><p>Sản phẩm có dữ liệu tham chiếu</p><div className="metric-line" /></div>
          <div className="metric-card metric-acid"><span>02 / THANH TOÁN</span><strong>03</strong><p>Phương thức thanh toán mô phỏng</p><div className="metric-line" /></div>
          <div className="metric-card metric-light"><span>03 / BẢO MẬT</span><strong>01</strong><p>Luồng xác thực đơn hàng đề xuất</p><div className="metric-line" /></div>
        </div>
      </div>
    </section>
  )
}

function SecuritySection() {
  const controls = [
    { icon: LockKeyhole, title: 'Bảo vệ dữ liệu khách hàng', text: 'Chỉ thu thập họ tên, số điện thoại và địa chỉ cần cho giao hàng. Không lưu thông tin thanh toán nhạy cảm trong trình duyệt; triển khai thật cần HTTPS, mã hóa dữ liệu lưu trữ và phân quyền truy cập.' },
    { icon: BadgeCheck, title: 'Xác thực đơn hàng', text: 'Tạo mã đơn hàng duy nhất, kiểm tra định dạng số điện thoại, xác nhận lại địa chỉ và đối chiếu trạng thái thanh toán trước khi chuyển đơn sang đóng gói.' },
    { icon: ShieldCheck, title: 'Giảm rủi ro thanh toán', text: 'Không nhận số thẻ trực tiếp. Dùng cổng thanh toán uy tín, xác minh webhook phía máy chủ, chống gửi lặp giao dịch và chỉ xác nhận đơn sau khi trạng thái được kiểm tra.' },
  ]
  return (
    <section className="security-section page-shell" id="security">
      <div className="security-heading">
        <div><div className="section-eyebrow"><span>04</span> / AN TOÀN GIAO DỊCH</div><h2>Bảo vệ dữ liệu<br />và <em>giao dịch.</em></h2></div>
        <p>Thiết kế thương mại điện tử tốt không chỉ dừng ở giao diện. Quy trình phải kiểm soát dữ liệu, danh tính đơn hàng và trạng thái giao dịch ở từng bước.</p>
      </div>
      <div className="security-grid">
        {controls.map(({ icon: Icon, title, text }, index) => (
          <article className="security-card" key={title}>
            <div className="security-card-top"><div className="security-card-icon"><Icon size={20} /></div><span>0{index + 1} / CONTROL</span></div>
            <h3>{title}</h3><p>{text}</p><div className="security-card-foot"><span>NGUYÊN TẮC KIỂM SOÁT</span><ArrowUpRight size={16} /></div>
          </article>
        ))}
      </div>
      <div className="security-bottom-note"><span className="live-dot" /> <strong>Thông tin triển khai:</strong> website hiện tại là bản front-end demo. Các biện pháp như HTTPS, OTP, mã hóa phía máy chủ, cổng thanh toán và webhook là yêu cầu đề xuất khi đưa vào vận hành thật.</div>
    </section>
  )
}

function Footer({ onNavigate, onNavigateSection }) {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-main">
        <div className="footer-brand-block">
          <div className="brand brand-static"><span className="brand-mark">TH<span>M</span></span><span className="brand-name">TRY HACK<br />MY SHOP<span className="brand-period">.</span></span></div>
          <p>Thiết bị kiểm thử.<br />Dùng đúng phạm vi.</p>
        </div>
        <div className="footer-col"><span>ĐIỀU HƯỚNG</span><button onClick={() => onNavigateSection('products')}>Sản phẩm</button><button onClick={() => onNavigateSection('about')}>Về dự án</button><button onClick={() => onNavigateSection('security')}>An toàn giao dịch</button></div>
        <div className="footer-col"><span>NGUỒN THAM KHẢO</span><a href="https://shop.hak5.org" target="_blank" rel="noreferrer">Hak5 Shop ↗</a><a href="https://shop.hak5.org/pages/about" target="_blank" rel="noreferrer">About Hak5 ↗</a><a href="https://shop.hak5.org/pages/policy" target="_blank" rel="noreferrer">Shop policies ↗</a></div>
        <div className="footer-ethics"><ShieldCheck size={22} /><strong>Authorized use only.</strong><p>Các thiết bị được mô tả dành cho nghiên cứu, đào tạo và đánh giá bảo mật có ủy quyền. Người dùng chịu trách nhiệm tuân thủ pháp luật và phạm vi được phê duyệt.</p></div>
      </div>
      <div className="page-shell footer-bottom"><span>© 2026 TRY HACK MY SHOP · STUDENT PROJECT</span><span className="footer-signature">ngan-ltth50b-kiemtralan1</span></div>
    </footer>
  )
}

function Checkout({ items, subtotal, onBack, onPlaceOrder }) {
  const [form, setForm] = useState({ fullName: '', phone: '', address: '', payment: 'cod', note: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [website, setWebsite] = useState('')
  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const submit = (event) => {
    event.preventDefault()
    setErrors({})

    // Hidden honeypot: ordinary visitors never see or fill this field.
    if (website.trim()) {
      window.location.replace('/you-got-a-trap?from=guard')
      return
    }

    const result = validateCheckoutForm(form)

    if (result.suspicious) {
      window.location.replace('/you-got-a-trap?from=guard')
      return
    }

    if (!result.valid) {
      setErrors(result.errors)
      const firstInvalidField = Object.keys(result.errors)[0]
      document.querySelector(`[name="${firstInvalidField}"]`)?.focus()
      return
    }

    if (items.length === 0) {
      setErrors({ form: 'Giỏ hàng đang trống. Hãy thêm ít nhất một sản phẩm trước khi đặt hàng.' })
      return
    }

    setSubmitting(true)
    onPlaceOrder(result.data)
  }

  return (
    <main className="checkout-page page-shell">
      <button className="back-link" type="button" onClick={onBack}><ArrowLeft size={16} /> Quay lại cửa hàng</button>
      <div className="checkout-title"><div className="section-eyebrow"><span>05</span> / THANH TOÁN</div><h1>Thông tin<br /><em>đặt hàng.</em></h1><p>Đây là bước thanh toán mô phỏng. Không có khoản tiền nào được thu và dữ liệu không được gửi đến máy chủ.</p></div>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submit} noValidate>
          <div className="honeypot-field" aria-hidden="true"><label htmlFor="companyWebsite">Company website</label><input id="companyWebsite" name="companyWebsite" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" /></div>
          <section className="form-panel">
            <div className="form-panel-heading"><span>01</span><div><h2>Thông tin khách hàng</h2><p>Các trường có dấu * là bắt buộc.</p></div></div>
            <div className="field-grid">
              <label className="field full-field"><span>Họ và tên <b>*</b></span><input name="fullName" value={form.fullName} onChange={(event) => update('fullName', event.target.value)} placeholder="Nguyễn Văn A" autoComplete="name" required maxLength={80} onBlur={() => { const result = validateCheckoutForm(form); setErrors((current) => ({ ...current, fullName: result.errors.fullName || '' })) }} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'error-fullName' : undefined} />{errors.fullName && <small className="field-error" id="error-fullName">{errors.fullName}</small>}</label>
              <label className="field"><span>Số điện thoại <b>*</b></span><input name="phone" type="tel" inputMode="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="090 123 4567" autoComplete="tel" required maxLength={18} onBlur={() => { const result = validateCheckoutForm(form); setErrors((current) => ({ ...current, phone: result.errors.phone || '' })) }} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'error-phone' : undefined} />{errors.phone && <small className="field-error" id="error-phone">{errors.phone}</small>}</label>
              <label className="field full-field"><span>Địa chỉ nhận hàng <b>*</b></span><input name="address" value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố" autoComplete="street-address" required maxLength={240} onBlur={() => { const result = validateCheckoutForm(form); setErrors((current) => ({ ...current, address: result.errors.address || '' })) }} aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? 'error-address' : undefined} />{errors.address && <small className="field-error" id="error-address">{errors.address}</small>}</label>
              <label className="field full-field"><span>Ghi chú <small>(không bắt buộc)</small></span><textarea name="note" value={form.note} onChange={(event) => update('note', event.target.value)} placeholder="Hướng dẫn giao hàng hoặc ghi chú cho cửa hàng..." maxLength={300} rows={3} /></label>
            </div>
          </section>
          <section className="form-panel">
            <div className="form-panel-heading"><span>02</span><div><h2>Phương thức thanh toán</h2><p>Chọn một phương thức. Tất cả đều chỉ phục vụ demo.</p></div></div>
            <div className="payment-options">
              {paymentMethods.map(({ id, title, subtitle, icon: Icon }) => (
                <label className={`payment-option ${form.payment === id ? 'selected' : ''}`} key={id}>
                  <input type="radio" name="payment" value={id} checked={form.payment === id} onChange={(event) => update('payment', event.target.value)} />
                  <span className="payment-radio" />
                  <span className="payment-icon"><Icon size={19} /></span>
                  <span className="payment-copy"><strong>{title}</strong><small>{subtitle}</small></span>
                  {form.payment === id && <CircleCheck className="payment-check" size={18} />}
                </label>
              ))}
            </div>
            {errors.payment && <small className="field-error" role="alert">{errors.payment}</small>}
            {form.payment === 'bank' && <div className="payment-notice"><strong>Chuyển khoản (mô phỏng)</strong><p>Không hiển thị số tài khoản và không yêu cầu chuyển tiền. Trong hệ thống thật, thông tin nhận tiền phải được cấu hình và xác minh ở phía máy chủ.</p><span>Nội dung: THM-[MÃ ĐƠN HÀNG]</span></div>}
            {form.payment === 'wallet' && <div className="payment-notice"><strong>Ví điện tử (mô phỏng)</strong><p>Không tạo QR và không kết nối ví. Không nhập mật khẩu, OTP hoặc thông tin ví vào website demo.</p><span>Trạng thái: CHỜ XÁC NHẬN</span></div>}
            {form.payment === 'cod' && <div className="payment-notice cod-notice"><strong>Thanh toán khi nhận hàng</strong><p>Đơn hàng thật cần được xác nhận số điện thoại và địa chỉ trước khi bàn giao cho đơn vị vận chuyển.</p></div>}
          </section>
          {errors.form && <div className="form-error" role="alert">{errors.form}</div>}
          <div className="checkout-submit-row"><div className="checkout-security"><LockKeyhole size={17} /><span>Không gửi dữ liệu đến máy chủ.<br />Không lưu thông tin thanh toán nhạy cảm.</span></div><button className="button button-acid" type="submit" disabled={submitting || items.length === 0}>{submitting ? 'Đang xử lý...' : 'Tạo đơn mô phỏng'} <ArrowUpRight size={17} /></button></div>
        </form>
        <aside className="order-summary">
          <div className="order-summary-title"><span>TÓM TẮT ĐƠN HÀNG</span><strong>{items.length} sản phẩm</strong></div>
          {items.map(({ product, quantity }) => <div className="order-product" key={product.id}><div className="order-product-image"><img src={product.fallbackImage} alt="" /></div><div><strong>{product.shortName}</strong><small>Số lượng: {quantity}</small></div><b>{formatPrice(product.price * quantity)}</b></div>)}
          <div className="order-summary-divider" />
          <div className="summary-line"><span>Tạm tính</span><strong>{formatPrice(subtotal)}</strong></div>
          <div className="summary-line"><span>Vận chuyển</span><span className="free-note">Chưa tính</span></div>
          <div className="summary-total"><span>Tổng tham chiếu</span><strong>{formatPrice(subtotal)}</strong></div>
          <div className="summary-security"><ShieldCheck size={18} /><p><strong>Không thu thập dữ liệu thẻ</strong><br />Không nhập số thẻ, CVV, OTP hoặc mật khẩu ví tại đây.</p></div>
        </aside>
      </div>
    </main>
  )
}

function OrderSuccess({ order, onContinue }) {
  if (!order) return (
    <main className="success-page page-shell"><div className="success-card"><div className="section-eyebrow">KHÔNG CÓ ĐƠN HÀNG TRONG PHIÊN NÀY</div><h1>Chưa có<br /><em>đơn demo.</em></h1><p className="success-copy">Đơn hàng chỉ tồn tại trong phiên trình duyệt hiện tại. Hãy quay lại cửa hàng để tạo một đơn mô phỏng mới.</p><button className="button button-acid button-full" onClick={onContinue}>Về cửa hàng <ArrowUpRight size={17} /></button></div></main>
  )
  const paymentText = paymentMethods.find((item) => item.id === order.customer.payment)?.title
  return (
    <main className="success-page page-shell">
      <div className="success-card">
        <div className="success-icon"><CircleCheck size={36} /></div>
        <div className="section-eyebrow">ORDER SIMULATION / COMPLETED</div>
        <h1>Đơn hàng đã<br /><em>được ghi nhận.</em></h1>
        <p className="success-copy">Đây là kết quả mô phỏng ở phía trình duyệt. Không có khoản thanh toán hoặc yêu cầu vận chuyển thật nào được tạo.</p>
        <div className="order-id-card"><span>MÃ ĐƠN HÀNG</span><strong>{order.id}</strong><button onClick={() => navigator.clipboard?.writeText(order.id)}>Sao chép mã</button></div>
        <div className="success-details">
          <div><span>Khách hàng</span><strong>{order.customer.fullName}</strong></div>
          <div><span>Điện thoại</span><strong>{order.customer.phone}</strong></div>
          <div><span>Phương thức thanh toán</span><strong>{paymentText}</strong></div>
          <div><span>Tổng tham chiếu</span><strong>{formatPrice(order.subtotal)}</strong></div>
        </div>
        <div className="success-status"><span className="status-dot" /><div><strong>Đã tạo đơn demo · Chờ xử lý</strong><small>Trong hệ thống thật, đơn cần được xác minh trước khi đóng gói.</small></div></div>
        <button className="button button-acid button-full" onClick={onContinue}>Quay về cửa hàng <ArrowUpRight size={17} /></button>
      </div>
    </main>
  )
}

function readRoute() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
  if (pathname === '/you-got-a-trap' && new URLSearchParams(window.location.search).get('from') === 'guard') {
    return { view: 'trap', productId: null }
  }
  if (pathname === '/you-got-a-trap') return { view: 'shop', productId: null }

  const productMatch = pathname.match(/^\/product\/([^/]+)$/)
  if (productMatch) {
    try {
      const product = products.find((item) => item.id === decodeURIComponent(productMatch[1]))
      if (product) return { view: 'product', productId: product.id }
    } catch {
      return { view: 'shop', productId: null }
    }
  }
  if (pathname === '/checkout') return { view: 'checkout', productId: null }
  if (pathname === '/order/success') return { view: 'success', productId: null }
  return { view: 'shop', productId: null }
}

function TrapPage({ onReturn }) {
  return (
    <main className="trap-page">
      <section className="trap-card">
        <p className="trap-status">YÊU CẦU BẤT THƯỜNG ĐÃ ĐƯỢC CHUYỂN HƯỚNG</p>
        <div className="trap-mark">THM<span>!</span></div>
        <h1>ahaha<br /><em>hello hacker.</em></h1>
        <p className="trap-copy">
          Yêu cầu này không được tiếp tục. Đây là trang decoy của dự án học tập;
          trang không thực hiện tấn công ngược và không thu thập thông tin cá nhân.
        </p>
        <button type="button" className="button button-acid" onClick={onReturn}>
          Quay về trang chính <ArrowUpRight size={16} />
        </button>
        <small className="trap-signature">ngan-ltth50b-kiemtralan1</small>
      </section>
    </main>
  )
}

export default function App() {
  const validProductIds = useMemo(() => new Set(products.map((product) => product.id)), [])
  const [selectedTheme, setSelectedTheme] = useState(() => {
    try {
      const savedTheme = window.localStorage.getItem('thm-theme')
      return colorThemes.some((theme) => theme.id === savedTheme) ? savedTheme : 'yellow'
    } catch {
      return 'yellow'
    }
  })
  const currentTheme = colorThemes.find((theme) => theme.id === selectedTheme) || colorThemes[0]
  const [cart, setCart] = useState(() => {
    try {
      const rawCart = JSON.parse(window.localStorage.getItem('thm-cart') || '[]')
      return sanitizeCart(rawCart, new Set(products.map((product) => product.id)))
    } catch {
      return []
    }
  })
  const [initialRoute] = useState(readRoute)
  const [view, setView] = useState(initialRoute.view)
  const [activeProductId, setActiveProductId] = useState(initialRoute.productId)
  const [cartOpen, setCartOpen] = useState(false)
  const activeProduct = products.find((item) => item.id === activeProductId) || null
  const [searchValue, setSearchValue] = useState('')
  const [order, setOrder] = useState(null)
  const [toast, setToast] = useState('')

  const updateSearch = (value) => {
    if (containsSuspiciousText({ note: value })) {
      window.location.replace('/you-got-a-trap?from=guard')
      return
    }

    setSearchValue(value.slice(0, 80))
  }

  const navigateTo = (destination) => {
    const paths = { shop: '/', checkout: '/checkout', success: '/order/success' }
    const nextPath = paths[destination] || '/'
    if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath)
    setView(destination)
    setActiveProductId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateToProduct = (product) => {
    const nextPath = `/product/${encodeURIComponent(product.id)}`
    if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath)
    setActiveProductId(product.id)
    setView('product')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateToSection = (sectionId) => {
    const isShop = view === 'shop'
    if (!isShop) navigateTo('shop')
    window.setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }), isShop ? 0 : 80)
  }

  useEffect(() => {
    document.documentElement.dataset.theme = selectedTheme

    try {
      window.localStorage.setItem('thm-theme', selectedTheme)
    } catch {
      // Website vẫn hoạt động nếu trình duyệt không cho lưu tùy chọn màu.
    }
  }, [selectedTheme])

  useEffect(() => {
    const handlePopState = () => {
      const route = readRoute()
      setView(route.view)
      setActiveProductId(route.productId)
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('thm-cart', JSON.stringify(sanitizeCart(cart, validProductIds)))
    } catch {
      setToast('Trình duyệt đang chặn lưu giỏ hàng; giỏ chỉ tồn tại trong phiên này.')
    }
  }, [cart, validProductIds])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const cartItems = useMemo(() => cart.map((entry) => {
    const product = products.find((item) => item.id === entry.id)
    return product ? { product, quantity: entry.quantity } : null
  }).filter(Boolean), [cart])
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartQuantities = useMemo(() => Object.fromEntries(cart.map((item) => [item.id, item.quantity])), [cart])
  const subtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)

  const addToCart = (product, quantity = 1) => {
    if (!validProductIds.has(product?.id)) return
    const safeQuantity = Number.isSafeInteger(quantity) ? Math.min(10, Math.max(1, quantity)) : 1
    const existingQuantity = cart.find((item) => item.id === product.id)?.quantity || 0
    const nextQuantity = Math.min(10, existingQuantity + safeQuantity)
    setCart((current) => {
      const found = current.find((item) => item.id === product.id)
      if (found) return current.map((item) => item.id === product.id ? { ...item, quantity: nextQuantity } : item)
      return [...current, { id: product.id, quantity: nextQuantity }]
    })
    setToast(nextQuantity === 10 && existingQuantity + safeQuantity > 10
      ? `Giới hạn 10 sản phẩm cho ${product.shortName}`
      : `Đã thêm ${Math.min(safeQuantity, 10 - existingQuantity)} × ${product.shortName}`)
  }

  const changeQty = (id, quantity) => {
    if (!validProductIds.has(id)) return
    if (!Number.isInteger(quantity)) return

    if (quantity < 1) {
      setCart((current) => current.filter((item) => item.id !== id))
      return
    }
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.min(quantity, 10) } : item))
  }

  const placeOrder = (customer) => {
    const newOrder = {
      id: `THM-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      customer,
      items: cartItems,
      subtotal,
    }
    setOrder(newOrder)
    setCart([])
    setCartOpen(false)
    navigateTo('success')
  }

  const startCheckout = () => {
    if (cartItems.length === 0) return
    setCartOpen(false)
    navigateTo('checkout')
  }

  const goShop = () => {
    setOrder(null)
    navigateTo('shop')
  }

  return (
    <div className="app-shell">
      {view !== 'trap' && (
        <Header
          cartCount={cartCount}
          onOpenCart={() => setCartOpen(true)}
          searchValue={searchValue}
          onSearch={updateSearch}
          view={view}
          onNavigate={navigateTo}
          onNavigateSection={navigateToSection}
          selectedTheme={selectedTheme}
          onThemeChange={setSelectedTheme}
        />
      )}
      {view === 'shop' && <>
        <Hero onShop={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} accentColor={currentTheme.color} />
        <TrustStrip />
        <ProductSection searchValue={searchValue} onSearch={updateSearch} onAdd={addToCart} onDetail={navigateToProduct} cartQuantities={cartQuantities} />
        <AboutSection />
        <SecuritySection />
        <Footer onNavigate={navigateTo} onNavigateSection={navigateToSection} />
      </>}
      {view === 'product' && activeProduct && <><ProductPage product={activeProduct} onBack={goShop} onAdd={addToCart} onOpenProduct={navigateToProduct} cartQuantity={cartQuantities[activeProduct?.id] || 0} /><Footer onNavigate={navigateTo} onNavigateSection={navigateToSection} /></>}
      {view === 'checkout' && <><Checkout items={cartItems} subtotal={subtotal} onBack={goShop} onPlaceOrder={placeOrder} /><Footer onNavigate={navigateTo} onNavigateSection={navigateToSection} /></>}
      {view === 'success' && <><OrderSuccess order={order} onContinue={goShop} /><Footer onNavigate={navigateTo} onNavigateSection={navigateToSection} /></>}
      {view === 'trap' && <TrapPage onReturn={goShop} />}
      {view !== 'trap' && <CartDrawer open={cartOpen} items={cartItems} subtotal={subtotal} onClose={() => setCartOpen(false)} onChangeQty={changeQty} onRemove={(id) => setCart((current) => current.filter((item) => item.id !== id))} onCheckout={startCheckout} />}
      {view !== 'trap' && toast && <div className="toast-message" role="status" aria-live="polite"><CircleCheck size={17} />{toast}</div>}
    </div>
  )
}
