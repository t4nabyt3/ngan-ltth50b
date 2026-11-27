import { useEffect, useState } from 'react'
import { ArrowUpRight, Check, Heart, Plus } from 'lucide-react'
import { formatPrice } from '../data/products'

export default function ProductCard({
  product,
  index,
  onAdd,
  onDetail,
  quantityInCart = 0,
  isSaved = false,
  onToggleSaved,
}) {
  const [useFallback, setUseFallback] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (!justAdded) return undefined
    const timer = window.setTimeout(() => setJustAdded(false), 1100)
    return () => window.clearTimeout(timer)
  }, [justAdded])

  const handleAdd = () => {
    onAdd(product)
    setJustAdded(true)
  }

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <button
          className="product-image-open"
          type="button"
          onClick={() => onDetail(product)}
          aria-label={`Xem chi tiết ${product.name}`}
        >
          <span className="product-index">{product.tag}</span>
          <img
            className="product-image"
            src={useFallback ? product.fallbackImage : product.imageUrl}
            alt={product.imageAlt}
            loading="lazy"
            onError={() => setUseFallback(true)}
          />
          <span className="image-open-label">Xem sản phẩm <ArrowUpRight size={14} /></span>
        </button>
        <span className="product-badge">{product.badge}</span>
        {onToggleSaved && (
          <button
            className={`save-product-button ${isSaved ? 'is-saved' : ''}`}
            type="button"
            onClick={() => onToggleSaved(product.id)}
            aria-pressed={isSaved}
            aria-label={isSaved ? `Bỏ lưu ${product.name}` : `Lưu ${product.name}`}
            title={isSaved ? 'Bỏ lưu sản phẩm' : 'Lưu sản phẩm'}
          >
            <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <div className="product-card-content">
        <div className="product-meta"><span>{product.category}</span><span className="product-dot" /></div>
        <h3><button type="button" onClick={() => onDetail(product)}>{product.name}</button></h3>
        <p>{product.description}</p>
        <button className="product-details-link" type="button" onClick={() => onDetail(product)}>
          Thông tin sản phẩm <ArrowUpRight size={14} />
        </button>
        <div className="product-card-bottom">
          <div>
            <span className="price-label">Giá tham chiếu</span>
            <strong>{formatPrice(product.price)}</strong>
            {quantityInCart > 0 && <small className="in-cart-note" aria-live="polite">Đang có {quantityInCart} trong giỏ</small>}
          </div>
          <button
            className={`add-button ${justAdded ? 'is-added' : ''}`}
            type="button"
            onClick={handleAdd}
            aria-label={quantityInCart >= 10 ? `${product.name} đã đạt giới hạn` : `Thêm ${product.name} vào giỏ hàng`}
            title={quantityInCart >= 10 ? 'Đã đạt giới hạn 10 sản phẩm' : 'Thêm vào giỏ hàng'}
            disabled={quantityInCart >= 10}
          >
            {justAdded ? <Check size={18} /> : <Plus size={18} />}
          </button>
        </div>
      </div>
    </article>
  )
}
