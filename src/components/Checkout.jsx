import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Clock3, CreditCard, Landmark, PackageCheck, ShoppingBag, Truck, Wallet, X } from 'lucide-react'
import {
  codFeeVnd, deliveryDates, deliveryZones, formatVnd, freeShippingAt, importCostRate,
  isBlackFridayOffer, promotions, quoteCart, usdToVnd,
} from '../data/commerce'
import { hasPendingPayment, orderSteps, paymentDuration } from '../data/orderSimulation'
import { cleanText, validateCheckoutForm } from '../security/validation'
import OfferPrice from './OfferPrice'

const methods = {
  visa: { title: 'Visa', detail: 'Thẻ quốc tế · mô phỏng', icon: CreditCard },
  mastercard: { title: 'Mastercard', detail: 'Thẻ quốc tế · mô phỏng', icon: CreditCard },
  paypal: { title: 'PayPal', detail: 'Ví điện tử · mô phỏng', icon: Wallet },
  bank: { title: 'Chuyển khoản QR', detail: 'Mã QR minh họa', icon: Landmark },
  cod: { title: 'Thanh toán khi nhận hàng (COD)', detail: `Phí thu hộ ${formatVnd(codFeeVnd)}`, icon: PackageCheck },
}

const fields = [
  { name: 'fullName', label: 'Họ và tên', maxLength: 80, autoComplete: 'name', placeholder: 'Nguyễn Minh Anh', wide: true },
  { name: 'phone', label: 'Số điện thoại', maxLength: 18, autoComplete: 'tel', type: 'tel', placeholder: '0901 234 567' },
  { name: 'email', label: 'Email (tùy chọn)', maxLength: 254, autoComplete: 'email', type: 'email', placeholder: 'ban@email.com' },
  { name: 'address', label: 'Địa chỉ nhận hàng', maxLength: 240, autoComplete: 'street-address', placeholder: 'Số nhà, đường, phường/xã', wide: true },
]

function Totals({ quote, code }) {
  return (
    <div className="checkout-totals">
      <div className="summary-line"><span>Tiền hàng theo giá gốc</span><strong>{formatVnd(quote.subtotalVnd)}</strong></div>
      {quote.saleDiscountVnd > 0 && <div className="summary-line offer-savings"><span>Ưu đãi Black Friday</span><strong>−{formatVnd(quote.saleDiscountVnd)}</strong></div>}
      {quote.discountVnd > 0 && <div className="summary-line"><span>Giảm giá ({code})</span><strong>−{formatVnd(quote.discountVnd)}</strong></div>}
      {quote.ships && <>
        <div className="summary-line"><span>Chi phí nhập hàng ước tính ({importCostRate}%)</span><strong>{formatVnd(quote.importVnd)}</strong></div>
        <div className="summary-line"><span>Giao nội địa</span><strong>{quote.shippingVnd === null ? 'Chọn tỉnh/thành' : quote.shippingVnd ? formatVnd(quote.shippingVnd) : 'Miễn phí'}</strong></div>
      </>}
      {quote.codVnd > 0 && <div className="summary-line"><span>Phí thu hộ COD</span><strong>{formatVnd(quote.codVnd)}</strong></div>}
      <div className="summary-total"><span>{quote.shippingVnd === null ? 'Tổng dự kiến' : 'Tổng cộng'}</span><strong>{formatVnd(quote.totalVnd)}</strong></div>
    </div>
  )
}

function DeliveryEstimate({ quote, now }) {
  if (!quote.ships) return <div className="checkout-delivery"><PackageCheck size={19} aria-hidden="true" /><div><strong>Giao sản phẩm số</strong><p>Sau khi xác nhận thanh toán mô phỏng.</p></div></div>
  const days = quote.delivery?.businessDays
  return (
    <div className="checkout-delivery">
      <Truck size={20} aria-hidden="true" />
      <div><strong>Hàng đặt nhập · {days ? `${days[0]}–${days[1]}` : '12–22'} ngày làm việc</strong>
        {days && <p>Dự kiến nhận {deliveryDates(days, now)}</p>}
        <p>Gồm vận chuyển quốc tế, thông quan và giao nội địa. Mốc dự kiến chưa tính ngày lễ.</p>
      </div>
    </div>
  )
}

function PromoInput({ code, setCode, quote }) {
  const [draft, setDraft] = useState(code)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const apply = (event) => {
    event.preventDefault()
    const value = draft.trim().toUpperCase()
    setNotice('')
    if (value === 'BF15' && quote.saleDiscountVnd > 0) {
      setError('')
      setNotice('Giá Black Friday đã tự áp dụng cho sản phẩm ưu đãi.')
      return
    }
    if (!Object.hasOwn(promotions, value)) {
      setError(value === 'BF15' ? 'Giỏ hàng chưa có thiết bị Black Friday.' : 'Mã ưu đãi không hợp lệ.')
      return
    }
    setError('')
    setCode(value)
  }

  return (
    <form className="promo-form" onSubmit={apply}>
      <label className="field" htmlFor="promo-code"><span>Mã ưu đãi</span></label>
      <div className="flex gap-2"><input id="promo-code" placeholder="Nhập mã" maxLength={20} value={draft} onChange={(event) => { setDraft(event.target.value); setError(''); setNotice('') }} /><button className="button button-dark" type="submit">Áp dụng</button></div>
      {notice && quote.saleDiscountVnd > 0 && <p role="status">{notice}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
      {code && <div className="promo-applied" role="status"><span>{code} · {promotions[code].label}</span><button type="button" onClick={() => { setCode(''); setDraft(''); setError('') }}>Bỏ mã</button></div>}
      {code === 'STUDENT10' && quote.discountVnd === 0 && <p>Giỏ hiện chưa có hàng giá thường để áp dụng mã này.</p>}
      {code === 'FREESHIP' && !quote.ships && <p>Mã giao nội địa áp dụng cho đơn có hàng vật lý.</p>}
      <p>Giá Black Friday tự áp dụng. STUDENT10 giảm 10% cho hàng giá thường. FREESHIP miễn phí giao hàng. Miễn phí giao nội địa từ {formatVnd(freeShippingAt)} theo giá gốc.</p>
    </form>
  )
}

function PaymentOptions({ quote, payment, setPayment }) {
  return (
    <>
      <fieldset className="payment-choices">
        <legend className="sr-only">Chọn phương thức thanh toán</legend>
        {Object.entries(methods).filter(([id]) => quote.ships || id !== 'cod').map(([id, { title, detail, icon: Icon }]) => (
          <label key={id} className={`checkout-method ${payment === id ? 'selected' : ''}`}>
            <input type="radio" name="payment" value={id} checked={payment === id} onChange={() => setPayment(id)} />
            <span className="checkout-method-icon"><Icon size={19} aria-hidden="true" /></span>
            <span><strong>{title}</strong><small>{detail}</small></span>
            <span className="payment-radio" aria-hidden="true" />
          </label>
        ))}
      </fieldset>
      {payment === 'bank' ? <div className="checkout-qr">
        <img src="/media/qr-chuyen-khoan-demo.png" width="94" height="94" alt="Mã QR minh họa, chỉ chứa chữ DEMO" />
        <div><strong>QR minh họa</strong><p>Số tiền mô phỏng <b>{formatVnd(quote.totalVnd)}</b></p><p>Mã chỉ chứa văn bản demo. Vui lòng không chuyển tiền.</p></div>
      </div> : <p className="checkout-method-note">{payment === 'cod' ? 'Phí thu hộ đã cộng vào tổng đơn. Thanh toán mô phỏng khi nhận hàng.' : 'Sau khi đặt hàng, trang Chờ thanh toán sẽ tự chạy mô phỏng. Trang không yêu cầu số thẻ, CVV hay OTP.'}</p>}
    </>
  )
}

export default function Checkout({ items, code, setCode, onBack, onPlaceOrder }) {
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', address: '', zone: '', province: '', note: '' })
  const [payment, setPayment] = useState('visa')
  const [errors, setErrors] = useState({})
  const [review, setReview] = useState(null)
  const heading = useRef(null)
  const reviewing = review?.items === items
  const step = reviewing ? 2 : 1
  const activePayment = reviewing ? payment : ''
  const quote = quoteCart(items, code, { zone: form.zone, payment: activePayment })

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [step])

  function update(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: '', form: '' }))
  }

  function submit(event) {
    event.preventDefault()
    const result = validateCheckoutForm({ ...form, payment: 'visa', address: quote.ships ? form.address : 'Giao sản phẩm số' })
    const nextErrors = { ...result.errors }
    const email = cleanText(form.email, 254)
    const province = cleanText(form.province, 80)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Nhập địa chỉ email hợp lệ.'
    if (quote.ships && !quote.delivery) nextErrors.zone = 'Chọn tỉnh hoặc thành phố nhận hàng.'
    if (quote.ships && form.zone === 'other' && !/^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]{1,79}$/u.test(province)) nextErrors.province = 'Nhập tên tỉnh hoặc thành phố.'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      event.currentTarget.elements.namedItem(Object.keys(nextErrors)[0])?.focus?.()
      return
    }
    setErrors({})
    setPayment('visa')
    setReview({ ...result.data, email, province, items })
  }

  if (!items.length) return <main className="checkout-page page-shell"><h1 className="text-4xl font-extrabold">Giỏ hàng đang trống</h1><button className="button button-dark mt-5" onClick={onBack}>Về danh mục</button></main>

  return (
    <main className="checkout-screen">
      <div className="checkout-frame">
        <header className="checkout-frame-header">
          <div className="checkout-identity"><ShoppingBag size={17} aria-hidden="true" /> <span>Try Hack My Shop</span></div>
          <span className="checkout-mode">ĐẶT HÀNG MÔ PHỎNG</span>
          <button type="button" className="checkout-close" onClick={onBack} aria-label="Đóng thanh toán"><X size={21} /></button>
        </header>
        <div className="checkout-columns">
          <section className="checkout-step" aria-labelledby="checkout-step-title">
            <ol className="checkout-steps" aria-label="Các bước đặt hàng">
              <li className="reached" aria-current={step === 1 ? 'step' : undefined}>01 <span>Giao hàng</span></li>
              <li className={reviewing ? 'reached' : ''} aria-current={reviewing ? 'step' : undefined}>02 <span>Thanh toán</span></li>
            </ol>
            <h1 id="checkout-step-title" ref={heading} tabIndex={-1}>{reviewing ? 'Chọn cách thanh toán' : quote.ships ? 'Thông tin giao hàng' : 'Thông tin liên hệ'}</h1>
            {reviewing ? <>
              <div className="checkout-contact-review">
                <div><strong>{review.fullName} · {review.phone}</strong>
                  {quote.ships && <p>{review.address}, {form.zone === 'other' ? review.province : quote.delivery.name}</p>}
                  {review.email && <p>{review.email}</p>}
                  {review.note && <p>Ghi chú · {review.note}</p>}
                </div>
                <button type="button" className="back-link" onClick={() => setReview(null)}><ArrowLeft size={15} /> Sửa thông tin</button>
              </div>
              <PaymentOptions quote={quote} payment={payment} setPayment={setPayment} />
              <button type="button" className="button button-acid checkout-primary" onClick={() => onPlaceOrder({ payment, zone: form.zone })}>Đặt hàng · {formatVnd(quote.totalVnd)} <ArrowRight size={17} /></button>
            </> : <form className="checkout-fields" onSubmit={submit} noValidate>
              <div className="checkout-field-grid">
                {fields.filter(({ name }) => quote.ships || name !== 'address').map(({ name, label, wide, ...attributes }) => (
                  <label className={`checkout-field ${wide ? 'full-field' : ''}`} key={name}><span>{label}</span>
                    <input {...attributes} name={name} value={form[name]} onChange={update} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `error-${name}` : undefined} required={name !== 'email'} />
                    {errors[name] && <small id={`error-${name}`} className="field-error">{errors[name]}</small>}
                  </label>
                ))}
                {quote.ships && <>
                  <label className="checkout-field"><span id="checkout-zone-label">Tỉnh / Thành phố</span>
                    <select className="ui-select" name="zone" aria-labelledby="checkout-zone-label" value={form.zone} onChange={update} aria-invalid={Boolean(errors.zone)} aria-describedby={errors.zone ? 'error-zone' : undefined} required>
                      <option value="">Chọn khu vực</option>
                      {Object.entries(deliveryZones).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}
                    </select>
                    {errors.zone && <small id="error-zone" className="field-error">{errors.zone}</small>}
                  </label>
                  <label className="checkout-field"><span>Ghi chú (tùy chọn)</span><input name="note" value={form.note} maxLength={300} placeholder="Ghi chú giao hàng" onChange={update} /></label>
                  {form.zone === 'other' && <label className="checkout-field full-field"><span>Tên tỉnh / thành phố</span>
                    <input name="province" value={form.province} maxLength={80} autoComplete="address-level1" placeholder="Ví dụ: Đà Nẵng" onChange={update} aria-invalid={Boolean(errors.province)} aria-describedby={errors.province ? 'error-province' : undefined} required />
                    {errors.province && <small id="error-province" className="field-error">{errors.province}</small>}
                  </label>}
                </>}
              </div>
              {errors.form && <p className="form-error" role="alert">{errors.form}</p>}
              <button className="button button-acid checkout-primary" type="submit">Tiếp tục thanh toán <ArrowRight size={17} /></button>
            </form>}
          </section>
          <aside className="checkout-summary" aria-label="Tóm tắt đơn hàng">
            <h2>Đơn hàng của bạn</h2>
            <ul className="checkout-items">
              {items.map(({ product, option, quantity }) => <li className="checkout-item" key={option.id}>
                <div className="checkout-thumb">{(option.image || product.image) && <img src={option.image || product.image} alt="" />}<span aria-label={`Số lượng ${quantity}`}>{quantity}</span></div>
                <div className="checkout-item-copy"><strong>{product.name}</strong>{product.options.length > 1 && <small>{option.label}</small>}<OfferPrice cents={option.cents} quantity={quantity} offer={isBlackFridayOffer(product, option.available)} /></div>
              </li>)}
            </ul>
            <DeliveryEstimate quote={quote} />
            <Totals quote={quote} code={code} />
            <PromoInput code={code} setCode={setCode} quote={quote} />
            <p className="checkout-rate">Tỷ giá tham chiếu 27/11/2026 · 1 USD = {formatVnd(usdToVnd)}. Chi phí nhập hàng là ước tính của bản mô phỏng.</p>
          </aside>
        </div>
      </div>
    </main>
  )
}

function EmptyOrder({ onContinue }) {
  return <main className="success-page page-shell"><div className="success-card"><h1>Chưa có đơn trong phiên này</h1><button className="button button-dark mt-4" onClick={onContinue}>Về danh mục</button></div></main>
}

const paymentSteps = [
  { start: 0, title: 'Tạo yêu cầu thanh toán', detail: 'Tạo yêu cầu thử với mã đơn, phương thức đã chọn và tổng phải trả.' },
  { start: 2100, title: 'Đối chiếu thông tin', detail: 'Mô phỏng kiểm tra mã đơn và số tiền giữa website và bên thanh toán.' },
  { start: 4200, title: 'Chờ phản hồi', detail: 'Mô phỏng bên thanh toán gửi kết quả xử lý yêu cầu.' },
  { start: 5900, title: 'Nhận kết quả', detail: 'Sau khi nhận kết quả thành công, website xác nhận thanh toán và mở chi tiết đơn hàng.' },
]

export function PaymentPending({ order, onRestart, onContinue }) {
  const startedAt = order?.paymentRun.startedAt
  const fail = order?.paymentRun.fail
  const id = order?.id
  const shouldFinish = order && !hasPendingPayment(order)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!id || shouldFinish) return
    const tick = () => {
      const current = Math.max(0, Date.now() - startedAt)
      setElapsed(current)
      if (current < paymentDuration) return
      clearInterval(timer)
    }
    const timer = setInterval(tick, 160)
    tick()
    return () => clearInterval(timer)
  }, [id, startedAt, shouldFinish])

  if (!order) return <EmptyOrder onContinue={onContinue} />
  if (shouldFinish) return null

  const current = paymentSteps.filter((step) => step.start <= elapsed).length - 1
  const failed = fail && elapsed >= paymentSteps.at(-1).start
  const paid = !fail && current === paymentSteps.length - 1
  const status = failed ? 'Thanh toán mô phỏng thất bại' : paid ? 'Đã xác nhận · Đang mở chi tiết đơn' : paymentSteps[current].title

  return (
    <main className="payment-screen">
      <div className="page-shell payment-frame">
        <header className="payment-frame-header">
          <Clock3 size={19} aria-hidden="true" /><span>Thanh toán mô phỏng</span>
        </header>
        <div className="payment-frame-columns">
          <section className="payment-run">
            <h1>Chờ thanh toán<em>.</em></h1>
            <p>Tiến trình tự chạy. Trang sẽ mở chi tiết đơn sau khi nhận kết quả thành công.</p>
            <p className={`payment-state${failed ? ' payment-state-error' : ''}`} role="status">{status}</p>
            <progress aria-label="Tiến độ mô phỏng thanh toán" max={paymentDuration} value={Math.min(elapsed, failed ? paymentSteps.at(-1).start : paymentDuration)} />
            <ol className="payment-run-steps" aria-label="Các bước mô phỏng">
              {paymentSteps.map((step, index) => (
                <li key={step.title} className={index <= current ? 'reached' : ''} aria-current={index === current ? 'step' : undefined}>
                  <span className="payment-step-number" aria-hidden="true">{index < current ? <Check size={16} /> : String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{failed && index === current ? 'Bên thanh toán trả về kết quả lỗi mô phỏng. Đơn vẫn chờ thanh toán, bạn có thể thử lại.' : step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            {failed
              ? <button className="button button-acid" onClick={() => { setElapsed(0); onRestart(false) }}>Thử lại <ArrowRight size={16} /></button>
              : !fail && !paid && <button className="back-link" onClick={() => { setElapsed(0); onRestart(true) }}>Thử tình huống thất bại</button>}
          </section>
          <aside className="payment-summary" aria-label="Thông tin giao dịch">
            <h2>Thông tin giao dịch</h2>
            <dl><dt>Mã đơn</dt><dd>{order.id}</dd><dt>Phương thức</dt><dd>{methods[order.method].title}</dd><dt>Tổng phải trả</dt><dd>{formatVnd(order.quote.totalVnd)}</dd></dl>
            <p>Đây là giao dịch mô phỏng. Hệ thống chỉ cập nhật trạng thái đơn trong phiên hiện tại.</p>
            <button className="back-link" onClick={onContinue}>Tiếp tục mua sắm</button>
          </aside>
        </div>
      </div>
    </main>
  )
}

export function OrderSuccess({ order, onViewPayment, onContinue }) {
  const steps = order ? orderSteps(order) : []
  const stage = order?.stage
  const unpaid = order && hasPendingPayment(order)

  if (!order) return <EmptyOrder onContinue={onContinue} />

  return (
    <main className="success-page page-shell">
      <section className="success-card">
        <div className="success-icon"><Check size={33} /></div>
        <h1>Theo dõi đơn hàng<em>.</em></h1>
        <p className="success-copy">{unpaid ? 'Đơn đang chờ thanh toán mô phỏng.' : 'Tiến độ đơn mô phỏng tự cập nhật trong phiên này.'}</p>
        <div className="order-id-card"><span>MÃ ĐƠN</span><strong>{order.id}</strong></div>
        <p className="order-method">{methods[order.method].title}</p>
        <DeliveryEstimate quote={order.quote} now={new Date(order.createdAt)} />
        <Totals quote={order.quote} code={order.code} />
        <ol className="order-timeline" aria-label="Tiến độ đơn hàng" aria-live="polite">
          {steps.map((step, index) => <li key={step} className={index <= stage ? 'reached' : ''} aria-current={index === stage ? 'step' : undefined}>{step}</li>)}
        </ol>
        {unpaid && <button className="button button-acid button-full" onClick={onViewPayment}>Xem trang chờ thanh toán <ArrowRight size={16} /></button>}
        <button className="back-link mt-4" onClick={onContinue}>Tiếp tục mua sắm</button>
      </section>
    </main>
  )
}
