from pathlib import Path
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Polygon, FancyArrowPatch

OUT = Path(__file__).resolve().parents[1] / 'docs' / 'sales-flow.png'
OUT.parent.mkdir(parents=True, exist_ok=True)
fig, ax = plt.subplots(figsize=(10, 11), dpi=220)
fig.patch.set_facecolor('#F4F5F0')
ax.set_facecolor('#F4F5F0')
ax.set_xlim(0, 10)
ax.set_ylim(-0.95, 12)
ax.axis('off')

INK = '#171D19'
MUTED = '#697465'
GREEN = '#D3F36B'
PALE = '#E9F0DC'
WHITE = '#FBFCF8'
ORANGE = '#F0C6A9'
BORDER = '#AFBBA0'


def box(x, y, w, h, title, subtitle='', fill=WHITE, edge=BORDER, title_color=INK, fontsize=9.5):
    patch = FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.10,rounding_size=0.12',
                           linewidth=1.1, edgecolor=edge, facecolor=fill)
    ax.add_patch(patch)
    if subtitle:
        ax.text(x+w/2, y+h*0.63, title, ha='center', va='center', fontsize=fontsize,
                color=title_color, fontweight='bold', family='DejaVu Sans')
        ax.text(x+w/2, y+h*0.28, subtitle, ha='center', va='center', fontsize=7.1,
                color=MUTED, family='DejaVu Sans')
    else:
        ax.text(x+w/2, y+h/2, title, ha='center', va='center', fontsize=fontsize,
                color=title_color, fontweight='bold', family='DejaVu Sans')
    return (x, y, w, h)


def arrow(start, end, color=MUTED, rad=0.0, text=None, text_offset=(0, 0)):
    patch = FancyArrowPatch(start, end, arrowstyle='-|>', mutation_scale=12, linewidth=1.15,
                            color=color, connectionstyle=f'arc3,rad={rad}')
    ax.add_patch(patch)
    if text:
        mx = (start[0]+end[0])/2 + text_offset[0]
        my = (start[1]+end[1])/2 + text_offset[1]
        ax.text(mx, my, text, ha='center', va='center', fontsize=7,
                color=color, family='DejaVu Sans', bbox=dict(facecolor='#F4F5F0', edgecolor='none', pad=1.1))

# Title
ax.text(0.35, 11.55, 'SALES PROCESS / TRY HACK MY SHOP', fontsize=13, fontweight='bold', color=INK, family='DejaVu Sans')
ax.text(0.35, 11.22, 'FLOW MÔ PHỎNG TỪ KHÁM PHÁ SẢN PHẨM ĐẾN HOÀN TẤT ĐƠN HÀNG', fontsize=7.4,
        color=MUTED, family='DejaVu Sans')

# Main process
box(3.3, 10.15, 3.4, .62, 'BẮT ĐẦU', 'Khách truy cập website', fill=GREEN, edge=GREEN)
box(3.05, 9.05, 3.9, .7, '1. Xem / tìm kiếm sản phẩm', 'Đọc mô tả, giá tham chiếu, nguồn sản phẩm')
box(3.05, 7.95, 3.9, .7, '2. Thêm vào giỏ hàng', 'Chọn số lượng; xem và chỉnh sửa giỏ')
box(3.05, 6.85, 3.9, .7, '3. Nhập thông tin nhận hàng', 'Họ tên · Số điện thoại · Địa chỉ')
arrow((5, 10.15), (5, 9.78))
arrow((5, 9.05), (5, 8.68))
arrow((5, 7.95), (5, 7.58))

# Payment method branches
ax.text(5, 6.27, '4. CHỌN PHƯƠNG THỨC THANH TOÁN', ha='center', fontsize=8, color=MUTED,
        fontweight='bold', family='DejaVu Sans')
box(.45, 5.15, 2.75, .8, 'COD', 'Xác nhận khi nhận hàng', fill=PALE, edge='#A9BF6B')
box(3.62, 5.15, 2.75, .8, 'Chuyển khoản', 'Tạo mã tham chiếu; chờ xác minh', fill=WHITE)
box(6.8, 5.15, 2.75, .8, 'Ví điện tử', 'Cổng ví giả lập; không thu tiền', fill=WHITE)
arrow((5, 6.85), (1.82, 5.95), color='#8DA641', rad=.06)
arrow((5, 6.85), (5, 5.95))
arrow((5, 6.85), (8.18, 5.95), rad=-.06)

box(3.1, 3.95, 3.8, .78, '5. Tạo mã đơn hàng', 'Trạng thái demo: CHỜ XỬ LÝ', fill=GREEN, edge=GREEN)
arrow((1.82, 5.15), (4.15, 4.73), color='#8DA641', rad=-.05)
arrow((5, 5.15), (5, 4.73))
arrow((8.18, 5.15), (5.85, 4.73), rad=.05)

box(3.05, 2.78, 3.9, .75, '6. Xác minh đơn hàng', 'Đối chiếu giá, số lượng, liên hệ và thanh toán')
arrow((5, 3.95), (5, 3.53))

# Decision diamond
coords = [(5, 1.9), (6.1, 2.35), (5, 2.8), (3.9, 2.35)]
ax.add_patch(Polygon(coords, closed=True, facecolor=WHITE, edgecolor='#9AAA7B', linewidth=1.2))
ax.text(5, 2.35, 'HỢP LỆ?', ha='center', va='center', fontsize=8.2, fontweight='bold', color=INK, family='DejaVu Sans')
arrow((5, 2.78), (5, 2.8))

box(.25, .75, 3.45, .72, 'TẠM GIỮ / THÔNG BÁO', 'Yêu cầu bổ sung, điều chỉnh hoặc hủy đơn', fill='#F8EDE6', edge='#D8A68D')
box(6.3, .75, 3.45, .72, '7. ĐÓNG GÓI & GIAO HÀNG', 'Bàn giao vận chuyển · cập nhật trạng thái', fill=PALE, edge='#A9BF6B')
arrow((3.9, 2.35), (2.05, 1.47), color='#C27D5C', text='KHÔNG', text_offset=(-.08, .12))
arrow((6.1, 2.35), (8.0, 1.47), color='#829B3A', text='CÓ', text_offset=(.08, .12))

box(6.3, -.22, 3.45, .62, '8. GIAO THÀNH CÔNG / ĐÓNG ĐƠN', 'Đối soát COD hoặc trạng thái đã thanh toán', fill=GREEN, edge=GREEN, fontsize=8.2)
arrow((8.02, .75), (8.02, .4), color='#829B3A')

# Security callout
ax.text(.45, -.68, 'KIỂM SOÁT XUYÊN SUỐT: HTTPS · xác thực máy chủ · log/audit · phân quyền · tối thiểu hóa dữ liệu · đối soát trạng thái giao dịch',
        fontsize=6.6, color=MUTED, family='DejaVu Sans')

plt.savefig(OUT, bbox_inches='tight', facecolor=fig.get_facecolor(), transparent=False)
plt.close(fig)
print(OUT)
