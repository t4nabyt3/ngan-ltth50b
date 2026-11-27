import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Download, X } from 'lucide-react'
import { codFeeVnd, formatVnd } from '../data/commerce'

const product = ['Chọn sản phẩm và phiên bản', 'Thêm vào giỏ và kiểm tra ưu đãi.', 'Mở trang sản phẩm, chọn phiên bản và số lượng. Kiểm tra giỏ và chọn voucher nếu có.']
const address = ['Thông tin giao hàng', 'Chọn khu vực để tính phí và ngày nhận.', 'Nhập thông tin liên hệ và chọn tỉnh/thành. Đơn chỉ có sản phẩm số bỏ qua địa chỉ giao hàng.']
const payment = ['Chọn cách thanh toán', 'Xem tổng tiền và chọn phương thức.', 'Kiểm tra đơn và tổng tiền VNĐ, rồi chọn một trong bốn nhánh thanh toán bên dưới.']
const paymentBranches = [
  ['Visa / Mastercard', 'Thẻ quốc tế', 'Chọn loại thẻ rồi theo dõi xác nhận tự động ở trang Chờ thanh toán. Trang không yêu cầu số thẻ.'],
  ['PayPal', 'Ví điện tử', 'Trang Chờ thanh toán mô phỏng phản hồi từ ví và tự mở chi tiết đơn.'],
  ['Chuyển khoản QR', 'QR minh họa', 'Xem QR minh họa cùng tổng tiền. Trang Chờ thanh toán tự mô phỏng đối soát chuyển khoản.'],
  ['COD', 'Thu tiền khi giao', `Áp dụng cho đơn có hàng vật lý. Phí thu hộ ${formatVnd(codFeeVnd)} được cộng vào tổng đơn.`],
]
const confirmed = ['Đơn được xác nhận', 'Đã xác nhận thanh toán hoặc duyệt COD.', 'Nếu thanh toán trả trước, xác nhận giao dịch trước khi xử lý. Với COD, duyệt đơn trước khi nhập hàng.']
const fulfillment = [
  ['Hàng đặt nhập', 'Nhập hàng, thông quan và giao nội địa.', 'Dự kiến 12–18 ngày làm việc tại Hà Nội và TP.HCM, 14–22 ngày tại khu vực khác.'],
  ['Sản phẩm số', 'Giao số sau khi xác nhận thanh toán.', 'Đơn chỉ có sản phẩm số hoàn tất sau khi thanh toán mô phỏng được xác nhận.'],
]

function FlowNode({ item, onOpen, accent }) {
  return <button type="button" className={`flow-node${accent ? ' flow-node-accent' : ''}`} aria-haspopup="dialog" onClick={() => onOpen(item)}>
    <strong>{item[0]}</strong><small>{item[1]}</small>
  </button>
}

function Connector({ arrow = true }) {
  return <span className={`flow-edge${arrow ? ' flow-edge-arrow' : ''}`} aria-hidden="true" />
}

function Branches({ items, onOpen, merge = false, label }) {
  return <>
    <Connector arrow={false} />
    <ul className={`flow-lanes ${merge ? 'flow-lanes-payment' : 'flow-lanes-delivery'}`} aria-label={label}>
      {items.map((item) => <li key={item[0]}>
        <span className="flow-rail" aria-hidden="true"><Connector /></span>
        <FlowNode item={item} onOpen={onOpen} />
        {merge && <span className="flow-rail flow-rail-return" aria-hidden="true"><Connector arrow={false} /></span>}
      </li>)}
    </ul>
    {merge && <Connector />}
  </>
}

export default function SalesFlow({ onCatalog }) {
  const [selected, setSelected] = useState(null)
  const dialog = useRef(null)
  useEffect(() => {
    const modal = dialog.current
    if (selected && !modal.open) modal.showModal()
  }, [selected])

  return (
    <main className="flow-screen">
      <div className="flow-page page-shell">
        <header className="flow-heading">
          <h1>Quy trình bán hàng<em>.</em></h1>
          <p>Bấm vào từng khối để xem chi tiết.</p>
        </header>
        <section className="flow-board" aria-label="Sơ đồ quy trình bán hàng">
          <FlowNode item={product} onOpen={setSelected} />
          <Connector />
          <FlowNode item={address} onOpen={setSelected} />
          <Connector />
          <FlowNode item={payment} onOpen={setSelected} accent />
          <Branches items={paymentBranches} onOpen={setSelected} merge label="Phương thức thanh toán" />
          <FlowNode item={confirmed} onOpen={setSelected} accent />
          <Branches items={fulfillment} onOpen={setSelected} label="Cách giao đơn" />
        </section>
        <dialog className="flow-detail" ref={dialog} onClose={() => setSelected(null)} aria-labelledby="flow-detail-title">
          <div className="flow-detail-head">
            <h2 id="flow-detail-title">{selected?.[0]}</h2>
            <button type="button" aria-label="Đóng chi tiết" onClick={() => dialog.current.close()}><X size={19} /></button>
          </div>
          <p>{selected?.[2]}</p>
          {selected === product && <button className="back-link" onClick={() => { dialog.current.close(); onCatalog() }}>Xem danh mục <ArrowUpRight size={14} /></button>}
        </dialog>
        <a className="flow-download" href="/docs/Try-Hack-My-Shop-Bao-Cao.pdf" download><Download size={17} aria-hidden="true" /> Tải báo cáo PDF</a>
      </div>
    </main>
  )
}
