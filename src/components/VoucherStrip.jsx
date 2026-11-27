import { Check, GraduationCap, Truck } from 'lucide-react'
import { promotions } from '../data/commerce'

const vouchers = [
  { code: 'STUDENT10', value: `−${promotions.STUDENT10.rate}%`, title: 'Ưu đãi học sinh, sinh viên', conditions: 'Áp dụng cho hàng giá thường.', icon: GraduationCap },
  { code: 'FREESHIP', value: '0 đ', title: 'Phí giao nội địa', conditions: 'Áp dụng cho đơn có hàng vật lý.', icon: Truck },
]

export default function VoucherStrip({ code, onSelect }) {
  return <section className="voucher-strip" aria-labelledby="voucher-title">
    <div className="voucher-heading"><h2 id="voucher-title">Voucher của shop</h2><p>Chọn một mã cho đơn hàng.</p></div>
    <div className="voucher-grid">
      {vouchers.map(({ code: id, value, title, conditions, icon: Icon }) => <article className="shop-voucher" key={id}>
        <div className="voucher-value"><Icon size={19} aria-hidden="true" /><strong>{value}</strong></div>
        <div className="voucher-info"><h3>{title}</h3><p>{conditions}</p><code>{id}</code></div>
        <button type="button" aria-pressed={code === id} aria-label={`Chọn mã ${id}`} className="voucher-action" onClick={() => onSelect(code === id ? '' : id)}>
          {code === id ? <><Check size={15} aria-hidden="true" /> Đã chọn</> : 'Dùng mã'}
        </button>
      </article>)}
    </div>
  </section>
}
