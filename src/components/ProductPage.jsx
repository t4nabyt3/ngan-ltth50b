import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, ExternalLink, ShoppingBag } from 'lucide-react'
import ProductCard from './ProductCard'
import { products } from '../data/products'
import { blackFridayPrice, blackFridayRate, formatCents, isBlackFridayOffer } from '../data/commerce'
import OfferPrice from './OfferPrice'

export default function ProductPage({ product, onBack, onAdd, onOpenProduct }) {
  const [optionId, setOptionId] = useState(() => (product.options.find((item) => item.available && item.cents === product.priceCents) || product.options[0])?.id)
  const [quantity, setQuantity] = useState(1)
  const option = product.options.find((item) => item.id === optionId)
  const offer = isBlackFridayOffer(product, option?.available)
  const image = option?.image || product.image
  const related = products.filter((item) => item.id !== product.id && item.category === product.category && item.available).slice(0, 3)

  return (
    <main className="product-detail-page">
      <div className="page-shell">
        <div className="product-breadcrumbs"><button onClick={onBack}><ArrowLeft size={16} /> Danh mục</button><span>/</span><span>{product.category}</span></div>
        <section className="product-detail-hero">
          <div className="product-detail-visual glitch-box">
            {offer && <span className="offer-badge">BLACK FRIDAY <b>−{blackFridayRate}%</b></span>}
            {image ? <img src={image} alt={product.name} /> : <span className="image-unavailable">Hak5 chưa có ảnh riêng</span>}
          </div>
          <div className="product-detail-copy">
            <div className="section-eyebrow">{product.category}</div>
            <h1>{product.name}</h1>
            <p className="product-detail-description">{product.description}</p>
            <div className="product-detail-price-row"><div><span>{offer ? 'GIÁ BLACK FRIDAY' : product.configurable ? 'GIÁ TỪ' : 'GIÁ THAM CHIẾU'}</span><OfferPrice cents={option?.cents ?? product.priceCents} offer={offer} /><small>{product.configurable ? 'Chọn cấu hình trên trang Hak5' : option.available ? (offer ? 'Tự áp dụng khi thêm vào giỏ' : 'Có thể đặt thử') : 'Hak5 báo hết hàng'}</small></div></div>
            {!product.digital && option?.available && <p className="import-product-note">Hàng đặt nhập · Dự kiến 12–22 ngày làm việc. Phí nhập và giao hàng tính khi đặt.</p>}
            {product.options.length > 1 && <label className="field option-field"><span>Phiên bản</span><select className="ui-select" value={optionId} onChange={(event) => { setOptionId(event.target.value); setQuantity(1) }}>
              {product.options.map((item) => <option key={item.id} value={item.id}>{item.label} · {formatCents(isBlackFridayOffer(product, item.available) ? blackFridayPrice(item.cents) : item.cents)}{item.available ? '' : ' · Hết hàng'}</option>)}
            </select>{image && !option.image && <small>Ảnh có thể minh họa phiên bản khác trong cùng dòng.</small>}</label>}
            {option?.available && <div className="product-buy-row">
              <div className="product-quantity" aria-label="Số lượng">
                <button type="button" onClick={() => setQuantity(quantity - 1)} disabled={quantity === 1} aria-label="Giảm số lượng">−</button>
                <output>{quantity}</output>
                <button type="button" onClick={() => setQuantity(quantity + 1)} disabled={quantity === 10} aria-label="Tăng số lượng">+</button>
              </div>
              <span className="text-sm text-neutral-600">{product.digital ? 'Sản phẩm số' : 'Tối đa 10 món mỗi biến thể'}</span>
            </div>}
            <div className="product-detail-actions">
              {!product.configurable && <button className="button button-acid" disabled={!option.available} onClick={() => { onAdd(product, option, quantity); setQuantity(1) }}><ShoppingBag size={17} />{option.available ? 'Thêm vào giỏ' : 'Hết hàng'}</button>}
              <a href={product.sourceUrl} target="_blank" rel="noreferrer">{product.configurable ? 'Xem cấu hình tại Hak5' : 'Nguồn Hak5'} <ExternalLink size={14} /></a>
            </div>
          </div>
        </section>
        <section className="product-details-panels" aria-label="Thông tin sản phẩm">
          <article><h2>Tính năng</h2><ul>{product.highlights.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><h2>Thông số</h2><ul>{product.specs.map((item) => <li key={item}>{item}</li>)}{option?.sku && <li>SKU Hak5: {option.sku}</li>}</ul>{!product.specs.length && <p>Hak5 chưa công bố thêm thông số trên trang sản phẩm.</p>}</article>
        </section>
        {related.length > 0 && <section className="related-products-section"><div className="related-products-heading"><h2>Cùng danh mục</h2><button className="back-link" onClick={onBack}>Về danh mục <ArrowUpRight size={15} /></button></div>
          <div className="product-grid related-product-grid">{related.map((item) => <ProductCard key={item.id} product={item} onAdd={onAdd} onDetail={onOpenProduct} />)}</div>
        </section>}
      </div>
    </main>
  )
}
