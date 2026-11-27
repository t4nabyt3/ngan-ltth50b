import { useEffect, useRef } from 'react'
import { ArrowUpRight, Minus, Plus, Trash2, X } from 'lucide-react'
import { formatVnd, freeShippingAt, isBlackFridayOffer } from '../data/commerce'
import OfferPrice from './OfferPrice'

export default function CartDrawer({ open, items, quote, code, onClose, onChangeQty, onCheckout }) {
  const dialog = useRef(null)

  useEffect(() => {
    const element = dialog.current
    if (!open) {
      if (element.open) element.close()
      return
    }
    element.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      if (element.open) element.close()
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <dialog ref={dialog} className="shop-dialog" aria-labelledby="cart-title" onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="cart-drawer">
        <div className="drawer-header">
          <h2 id="cart-title">Giỏ hàng ({items.reduce((total, item) => total + item.quantity, 0)})</h2>
          <button className="icon-button" onClick={onClose} aria-label="Đóng giỏ hàng"><X size={20} /></button>
        </div>
        {items.length === 0 ? <div className="empty-cart"><h3>Giỏ hàng đang trống</h3><button className="button button-dark" onClick={onClose}>Tiếp tục mua sắm</button></div> : <>
          <div className="cart-items">
            {items.map(({ product, option, quantity }) => <div className="cart-item" key={option.id}>
              <div className="cart-item-image">{(option.image || product.image) && <img src={option.image || product.image} alt="" />}</div>
              <div className="cart-item-info">
                <h3>{product.name}</h3>
                {product.options.length > 1 && <small className="block text-neutral-600">{option.label}</small>}
                <OfferPrice cents={option.cents} quantity={quantity} offer={isBlackFridayOffer(product, option.available)} />
                <div className="quantity-control" aria-label="Số lượng">
                  <button onClick={() => onChangeQty(option.id, quantity - 1)} aria-label={`Giảm ${product.name}`} disabled={quantity <= 1}><Minus size={13} /></button>
                  <span>{quantity}</span>
                  <button onClick={() => onChangeQty(option.id, quantity + 1)} aria-label={`Tăng ${product.name}`} disabled={quantity >= 10}><Plus size={13} /></button>
                </div>
              </div>
              <button className="remove-item" onClick={() => onChangeQty(option.id, 0)} aria-label={`Xóa ${product.name}`}><Trash2 size={16} /></button>
            </div>)}
          </div>
          <div className="drawer-summary">
            <div className="summary-line"><span>Tạm tính</span><strong>{formatVnd(quote.merchandiseVnd)}</strong></div>
            {quote.saleDiscountVnd > 0 && <p className="offer-savings">Tiết kiệm {formatVnd(quote.saleDiscountVnd)} với Black Friday</p>}
            {code && <p>Mã đã chọn <strong>{code}</strong></p>}
            {quote.ships && <p>Miễn phí giao nội địa từ {formatVnd(freeShippingAt)} theo giá gốc hoặc dùng FREESHIP.</p>}
            <button className="button button-acid button-full" onClick={onCheckout}>Tiếp tục thanh toán <ArrowUpRight size={16} /></button>
          </div>
        </>}
      </div>
    </dialog>
  )
}
