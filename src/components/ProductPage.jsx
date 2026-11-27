import { useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CircleCheck,
  ExternalLink,
  Fingerprint,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react'
import ProductCard from './ProductCard'
import { formatPrice, products } from '../data/products'

export default function ProductPage({ product, onBack, onAdd, onOpenProduct, cartQuantity = 0 }) {
  const [useFallback, setUseFallback] = useState(false)
  const [quantity, setQuantity] = useState(1)

  if (!product) return null

  const relatedProducts = products.filter((item) => item.id !== product.id)
  const imageSrc = useFallback ? product.fallbackImage : product.imageUrl

  return (
    <main className="product-detail-page">
      <div className="page-shell">
        <div className="product-breadcrumbs">
          <button onClick={onBack}><ArrowLeft size={15} /> Tất cả sản phẩm</button>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <strong>{product.shortName}</strong>
        </div>

        <section className="product-detail-hero">
          <div className="product-detail-visual">
            <div className="product-detail-grid" />
            <span className="product-detail-index">{product.tag}</span>
            <span className="product-detail-badge">{product.badge}</span>
            <div className="product-detail-orbit product-detail-orbit-a" />
            <div className="product-detail-orbit product-detail-orbit-b" />
            <img
              src={imageSrc}
              alt={product.imageAlt}
              onError={() => setUseFallback(true)}
            />
            <span className="product-detail-image-caption">PRODUCT VISUAL / {product.id.toUpperCase()}</span>
          </div>

          <div className="product-detail-copy">
            <div className="section-eyebrow"><span>CHI TIẾT SẢN PHẨM</span> / {product.category.toUpperCase()}</div>
            <div className="product-detail-status"><i /> THIẾT BỊ KIỂM THỬ CHUYÊN DỤNG</div>
            <h1>{product.name}<em>.</em></h1>
            <p className="product-detail-description">{product.description}</p>

            <div className="product-detail-price-row">
              <div>
                <span>GIÁ THAM CHIẾU</span>
                <strong>{formatPrice(product.price)}</strong>
                <small>{product.sourcePrice} · Theo nguồn Hak5</small>
              </div>
              <span className="product-detail-price-note">USD<br />REFERENCE</span>
            </div>

            <div className="product-buy-row">
              <div className="product-quantity" aria-label="Chọn số lượng">
                <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1} aria-label="Giảm số lượng">−</button>
                <output aria-live="polite">{quantity}</output>
                <button type="button" onClick={() => setQuantity((current) => Math.min(Math.max(1, 10 - cartQuantity), current + 1))} disabled={quantity + cartQuantity >= 10} aria-label="Tăng số lượng">+</button>
              </div>
              <small className="product-cart-count">Đang có {cartQuantity} trong giỏ</small>
            </div>
            <div className="product-detail-actions">
              <button className="button button-acid" disabled={cartQuantity >= 10} onClick={() => { onAdd(product, quantity); setQuantity(1) }}>
                <ShoppingBag size={17} /> {cartQuantity >= 10 ? 'Đã đạt giới hạn' : `Thêm ${quantity} vào giỏ`} <ArrowUpRight size={16} />
              </button>
              <a href={product.sourceUrl} target="_blank" rel="noreferrer">
                Xem tại Hak5 <ExternalLink size={14} />
              </a>
            </div>
            <div className="product-detail-assurance">
              <span><ShieldCheck size={16} /> Demo mua hàng an toàn</span>
              <span><PackageCheck size={16} /> Thanh toán mô phỏng</span>
            </div>
          </div>
        </section>

        <section className="product-information-grid">
          <article className="product-info-panel product-highlights-panel">
            <div className="product-info-heading"><span>01 / TÍNH NĂNG</span><Fingerprint size={19} /></div>
            <h2>Điểm nổi bật<br /><em>của thiết bị.</em></h2>
            <div className="product-feature-list">
              {product.highlights.map((highlight) => (
                <div key={highlight}><span><Check size={14} /></span>{highlight}</div>
              ))}
            </div>
          </article>
          <article className="product-info-panel product-usage-panel">
            <div className="product-info-heading"><span>02 / MỤC ĐÍCH SỬ DỤNG</span><ShieldCheck size={19} /></div>
            <h2>Thiết kế cho<br /><em>mục tiêu rõ ràng.</em></h2>
            <p>{product.suitableFor}</p>
            <div className="product-usage-note">
              <CircleCheck size={17} />
              <span>Chỉ sử dụng trong môi trường lab hoặc hệ thống mà bạn có quyền kiểm thử bằng văn bản.</span>
            </div>
          </article>
          <article className="product-info-panel product-reference-panel">
            <div className="product-info-heading"><span>03 / THÔNG TIN SẢN PHẨM</span><ArrowUpRight size={19} /></div>
            <div className="product-data-row"><span>Tên sản phẩm</span><strong>{product.name}</strong></div>
            <div className="product-data-row"><span>Danh mục</span><strong>{product.category}</strong></div>
            <div className="product-data-row"><span>Mã tham chiếu</span><strong>{product.id}</strong></div>
            <div className="product-data-row"><span>Nguồn dữ liệu</span><a href={product.sourceUrl} target="_blank" rel="noreferrer">Hak5 Shop ↗</a></div>
            <p className="product-source-note">Giá và thông tin hiển thị là dữ liệu tham chiếu, có thể thay đổi theo phiên bản và chính sách của nhà sản xuất.</p>
          </article>
        </section>

        <section className="related-products-section">
          <div className="related-products-heading">
            <div><div className="section-eyebrow"><span>SẢN PHẨM LIÊN QUAN</span></div><h2>Tiếp tục khám phá.</h2></div>
            <button className="back-link" onClick={onBack}>Về danh mục <ArrowUpRight size={15} /></button>
          </div>
          <div className="product-grid related-product-grid">
            {relatedProducts.map((item, index) => (
              <ProductCard key={item.id} product={item} index={index} onAdd={onAdd} onDetail={onOpenProduct} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
