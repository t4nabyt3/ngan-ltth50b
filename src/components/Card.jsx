import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { formatPrice } from '../data/product'

const Card = () => {
  return (
    <div  className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="cart-drawer" aria-label="Giỏ hàng" aria-modal="true" role="dialog">
        
      </aside>
    </div>
  )
}

export default Card
