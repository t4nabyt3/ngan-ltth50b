import { ArrowUpRight, Plus } from 'lucide-react'
import { blackFridayRate, isBlackFridayOffer } from '../data/commerce'
import OfferPrice from './OfferPrice'

export default function ProductCard({ product, onAdd, onDetail }) {
  const open = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onDetail(product)
  }
  const href = `/product/${product.id}`
  const offer = isBlackFridayOffer(product)
  const from = product.configurable || product.options.length > 1
  const option = product.options.find((item) => item.available)

  return (
    <article className={`product-card glitch-box${offer ? ' product-card-offer' : ''}`}>
      <div className="product-image-wrap">
        <a className="product-image-open" href={href} onClick={open} aria-label={`Xem chi tiết ${product.name}`}>
          {product.image ? <img className="product-image" src={product.image} alt="" loading="lazy" decoding="async" /> : <span className="image-unavailable">Hak5 chưa có ảnh riêng</span>}
        </a>
        {offer && <span className="offer-badge">BLACK FRIDAY <b>−{blackFridayRate}%</b></span>}
        {!product.available && <span className="product-badge">{product.configurable ? 'Tùy cấu hình' : 'Hết hàng'}</span>}
      </div>
      <div className="product-card-content">
        <div className="product-meta"><span>{product.category}</span></div>
        <h3><a href={href} onClick={open}>{product.name}</a></h3>
        <p>{product.description}</p>
        <div className="product-card-bottom">
          <div>
            <span className="price-label">{offer ? (from ? 'Giá ưu đãi từ' : 'Giá ưu đãi') : from ? 'Giá từ' : 'Giá tham chiếu'}</span>
            <OfferPrice cents={product.priceCents} offer={offer} />
          </div>
          {product.available && (product.options.length > 1
            ? <a className="add-button" href={href} onClick={open} title="Chọn phiên bản" aria-label={`Chọn phiên bản ${product.name}`}><ArrowUpRight size={18} /></a>
            : <button className="add-button" onClick={() => onAdd(product, option)} title="Thêm vào giỏ" aria-label={`Thêm ${product.name} vào giỏ`}><Plus size={18} /></button>)}
        </div>
      </div>
    </article>
  )
}
