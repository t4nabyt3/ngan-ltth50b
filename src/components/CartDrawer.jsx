import { useEffect, useRef } from 'react'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { formatPrice } from '../data/products'

export default function CartDrawer({ open, items, subtotal, onClose, onChangeQty, onRemove, onCheckout }) {
  const closeButtonRef = useRef(null)
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="cart-drawer" aria-label="Giỏ hàng" aria-modal="true" role="dialog">
        <div className="drawer-header">
          <div>
            <span className="eyebrow">ĐƠN HÀNG TẠM TÍNH</span>
            <h2>Giỏ hàng <span>({totalQuantity})</span></h2>
          </div>
          <button ref={closeButtonRef} className="icon-button" onClick={onClose} aria-label="Đóng giỏ hàng"><X size={20} /></button>
        </div>
        {items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon"><ShoppingBag size={26} /></div>
            <h3>Chưa có sản phẩm</h3>
            <p>Chọn một thiết bị để xem thử quy trình đặt hàng.</p>
            <button className="button button-dark" onClick={onClose}>Tiếp tục xem sản phẩm</button>
          </div>
        ) : (
          <>
            <div className="cart-items" aria-live="polite">
              {items.map(({ product, quantity }) => (
                <div className="cart-item" key={product.id}>
                  <div className="cart-item-image"><img src={product.fallbackImage} alt={product.imageAlt} /></div>
                  <div className="cart-item-info">
                    <h3>{product.shortName}</h3>
                    <strong>{formatPrice(product.price)}</strong>
                    <div className="quantity-control" aria-label={`Số lượng ${product.shortName}`}>
                      <button onClick={() => onChangeQty(product.id, quantity - 1)} aria-label={`Giảm ${product.shortName}`} disabled={quantity <= 1}><Minus size={13} /></button>
                      <span aria-live="polite">{quantity}</span>
                      <button onClick={() => onChangeQty(product.id, quantity + 1)} aria-label={`Tăng ${product.shortName}`} disabled={quantity >= 10}><Plus size={13} /></button>
                    </div>
                  </div>
                  <button className="remove-item" onClick={() => onRemove(product.id)} aria-label={`Xóa ${product.shortName} khỏi giỏ`}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <div className="drawer-summary">
              <div className="summary-line"><span>Tạm tính</span><strong>{formatPrice(subtotal)}</strong></div>
              <p>Chưa bao gồm vận chuyển và thuế. Đây là đơn hàng mô phỏng, không phát sinh thanh toán.</p>
              <button className="button button-acid button-full" onClick={onCheckout}>Tiếp tục thanh toán <span>↗</span></button>
              <button className="continue-link" onClick={onClose}>Tiếp tục xem sản phẩm</button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
