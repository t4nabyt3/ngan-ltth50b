from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'Try-Hack-My-Shop_Bao-cao-quy-trinh-va-an-toan-giao-dich.docx'
FLOW = ROOT / 'docs' / 'sales-flow.png'

INK = '18201A'
MUTED = '687365'
GREEN = 'D3F36B'
PALE = 'EEF3E2'
LIGHT = 'F5F7F1'
LINE = 'DCE3D5'
ORANGE = 'F3E6DE'
WHITE = 'FFFFFF'


def set_cell_shading(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = tcPr.find(qn('w:shd'))
    if shd is None:
        shd = OxmlElement('w:shd')
        tcPr.append(shd)
    shd.set(qn('w:fill'), fill)


def set_cell_margins(cell, top=95, start=110, bottom=95, end=110):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcMar = tcPr.first_child_found_in('w:tcMar')
    if tcMar is None:
        tcMar = OxmlElement('w:tcMar')
        tcPr.append(tcMar)
    for m, v in [('top', top), ('start', start), ('bottom', bottom), ('end', end)]:
        node = tcMar.find(qn(f'w:{m}'))
        if node is None:
            node = OxmlElement(f'w:{m}')
            tcMar.append(node)
        node.set(qn('w:w'), str(v))
        node.set(qn('w:type'), 'dxa')


def set_repeat_table_header(row):
    trPr = row._tr.get_or_add_trPr()
    tblHeader = OxmlElement('w:tblHeader')
    tblHeader.set(qn('w:val'), 'true')
    trPr.append(tblHeader)


def set_row_cant_split(row):
    trPr = row._tr.get_or_add_trPr()
    cant = OxmlElement('w:cantSplit')
    trPr.append(cant)


def set_run_font(run, size=9, bold=False, color=INK, name='Aptos', italic=False):
    run.font.name = name
    run._element.rPr.rFonts.set(qn('w:eastAsia'), name)
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = RGBColor.from_string(color)


def add_p(doc, text='', size=9, color=INK, bold=False, before=0, after=5, align=None, italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = 1.12
    if align is not None:
        p.alignment = align
    r = p.add_run(text)
    set_run_font(r, size, bold, color, italic=italic)
    return p


def add_rich_p(doc, parts, size=9, after=5, before=0):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = 1.14
    for text, bold, color, italic in parts:
        r = p.add_run(text)
        set_run_font(r, size, bold, color, italic=italic)
    return p


def add_heading(doc, text, level=1, kicker=None, page_break=False):
    if kicker:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(4)
        if page_break:
            p.paragraph_format.page_break_before = True
        r = p.add_run(kicker.upper())
        set_run_font(r, 8, True, '839342', 'Aptos')
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(5 if level == 1 else 3)
    if page_break and not kicker:
        p.paragraph_format.page_break_before = True
    p.paragraph_format.space_after = Pt(8 if level == 1 else 4)
    r = p.add_run(text)
    set_run_font(r, 21 if level == 1 else 13, True, INK)
    return p


def add_bullet(doc, text, level=0, size=8.5, color=INK):
    p = doc.add_paragraph(style='List Bullet' if level == 0 else 'List Bullet 2')
    p.paragraph_format.left_indent = Inches(.2 + level * .18)
    p.paragraph_format.first_line_indent = Inches(-.12)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.08
    r = p.add_run(text)
    set_run_font(r, size, False, color)
    return p


def add_table(doc, headers, rows, widths=None, font_size=8, header_fill=INK, alternating=True):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.style = 'Table Grid'
    for i, header in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = ''
        set_cell_shading(cell, header_fill)
        set_cell_margins(cell)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(header)
        set_run_font(r, font_size, True, WHITE)
    set_repeat_table_header(table.rows[0])
    for ridx, row in enumerate(rows):
        cells = table.add_row().cells
        set_row_cant_split(table.rows[-1])
        for i, value in enumerate(row):
            cell = cells[i]
            cell.text = ''
            set_cell_shading(cell, WHITE if (not alternating or ridx % 2 == 0) else LIGHT)
            set_cell_margins(cell, top=85, start=110, bottom=85, end=110)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.08
            r = p.add_run(str(value))
            set_run_font(r, font_size, False, INK)
        if widths:
            for cell, width in zip(cells, widths):
                cell.width = Inches(width)
    if widths:
        for cell, width in zip(table.rows[0].cells, widths):
            cell.width = Inches(width)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)
    return table


def add_hyperlink(paragraph, text, url, color='718B31'):
    part = paragraph.part
    r_id = part.relate_to(url, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink', is_external=True)
    hyperlink = OxmlElement('w:hyperlink')
    hyperlink.set(qn('r:id'), r_id)
    new_run = OxmlElement('w:r')
    rPr = OxmlElement('w:rPr')
    c = OxmlElement('w:color'); c.set(qn('w:val'), color); rPr.append(c)
    u = OxmlElement('w:u'); u.set(qn('w:val'), 'single'); rPr.append(u)
    sz = OxmlElement('w:sz'); sz.set(qn('w:val'), '16'); rPr.append(sz)
    new_run.append(rPr)
    t = OxmlElement('w:t'); t.text = text; new_run.append(t)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)


def add_page_num(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = paragraph.add_run('TRY HACK MY SHOP  ·  TRANG ')
    set_run_font(r, 7, True, '859080', 'Aptos')
    fld = OxmlElement('w:fldSimple')
    fld.set(qn('w:instr'), 'PAGE')
    paragraph._p.append(fld)


def add_callout(doc, label, text, fill=PALE, accent='8AA43D'):
    t = doc.add_table(rows=1, cols=1)
    t.autofit = False
    cell = t.cell(0,0)
    set_cell_shading(cell, fill)
    set_cell_margins(cell, top=130, start=170, bottom=130, end=170)
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(label + '  '); set_run_font(r, 8.5, True, accent)
    r = p.add_run(text); set_run_font(r, 8.5, False, MUTED)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)
    return t


def setup_doc():
    doc = Document()
    sec = doc.sections[0]
    sec.page_width = Inches(8.27)
    sec.page_height = Inches(11.69)
    sec.top_margin = Inches(.62)
    sec.bottom_margin = Inches(.62)
    sec.left_margin = Inches(.72)
    sec.right_margin = Inches(.72)
    sec.header_distance = Inches(.28)
    sec.footer_distance = Inches(.3)

    styles = doc.styles
    normal = styles['Normal']
    normal.font.name = 'Aptos'
    normal._element.rPr.rFonts.set(qn('w:eastAsia'), 'Aptos')
    normal.font.size = Pt(9)
    normal.font.color.rgb = RGBColor.from_string(INK)
    normal.paragraph_format.space_after = Pt(5)
    for style_name in ['List Bullet', 'List Bullet 2']:
        s = styles[style_name]
        s.font.name = 'Aptos'
        s._element.rPr.rFonts.set(qn('w:eastAsia'), 'Aptos')
        s.font.size = Pt(8.5)

    header = sec.header.paragraphs[0]
    header.paragraph_format.space_after = Pt(0)
    r = header.add_run('THM / TRY HACK MY SHOP')
    set_run_font(r, 7.5, True, '71833F', 'Aptos')
    r = header.add_run('     WEBSITE PROJECT · SALES FLOW & TRANSACTION SECURITY')
    set_run_font(r, 7, False, '98A091', 'Aptos')
    footer = sec.footer.paragraphs[0]
    add_page_num(footer)
    return doc


def build():
    doc = setup_doc()

    # PAGE 1 - Overview
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(27)
    p.paragraph_format.space_after = Pt(11)
    r = p.add_run('PROJECT DOCUMENTATION  /  2026')
    set_run_font(r, 8, True, '829B3A', 'Aptos')
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(5)
    r = p.add_run('TRY HACK\nMY SHOP.')
    set_run_font(r, 39, True, INK, 'Aptos')
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(18)
    r = p.add_run('THIẾT KẾ WEBSITE BÁN HÀNG MÔ PHỎNG\nQUY TRÌNH BÁN HÀNG & GIẢI PHÁP AN TOÀN GIAO DỊCH')
    set_run_font(r, 11, True, '58634F', 'Aptos')
    add_callout(doc, 'MỤC TIÊU', 'Tái tạo trải nghiệm cửa hàng thiết bị kiểm thử bảo mật theo hướng học tập: giới thiệu sản phẩm, giỏ hàng, checkout và mô tả kiểm soát giao dịch.', fill=PALE)

    add_heading(doc, '1. Đối chiếu yêu cầu bài tập', 1, 'SCOPE & ACCEPTANCE')
    req_rows = [
        ('01 · Giới thiệu sản phẩm', 'Có 3 sản phẩm thật làm dữ liệu tham chiếu, mô tả đã Việt hóa, giá USD và link nguồn.'),
        ('02 · Thiết kế giao diện', 'Giao diện responsive, nhận diện riêng, điều hướng, tìm kiếm/lọc, chi tiết sản phẩm và hero 3D.'),
        ('03 · Giỏ hàng', 'Thêm sản phẩm, chỉnh số lượng, xóa sản phẩm, tính tạm tính và lưu giỏ demo.'),
        ('04 · Quy trình bán hàng', 'Có sơ đồ flow và mô tả từng bước trong báo cáo Word/PDF này.'),
        ('05 · Trang thanh toán', 'Có họ tên, SĐT, địa chỉ; COD, chuyển khoản và ví điện tử ở chế độ mô phỏng.'),
        ('06 · An toàn giao dịch', 'Có giải pháp bảo vệ thông tin, xác minh đơn hàng và giảm rủi ro thanh toán.'),
        ('07 · File kết quả', 'Bàn giao source React, tài nguyên hình ảnh, README, DOCX và PDF.'),
    ]
    add_table(doc, ['HẠNG MỤC', 'KẾT QUẢ TRIỂN KHAI'], req_rows, widths=[1.65, 5.15], font_size=7.7)

    add_heading(doc, '2. Danh mục sản phẩm tham chiếu', 2, 'PRODUCT DATA')
    product_rows = [
        ('WiFi Pineapple Mark VII', 'Wi-Fi audit', '250 USD', 'Khảo sát và đánh giá bảo mật mạng Wi-Fi trong lab.'),
        ('USB Rubber Ducky', 'USB HID', 'Từ 100 USD', 'Mô phỏng bàn phím USB và kiểm thử kiểm soát endpoint.'),
        ('Bash Bunny Mark II', 'Multi-vector USB', '200 USD', 'Nền tảng USB đa giao diện cho lab Red Team có ủy quyền.'),
    ]
    add_table(doc, ['SẢN PHẨM', 'NHÓM', 'GIÁ THAM CHIẾU', 'MỤC ĐÍCH HỌC TẬP'], product_rows, widths=[1.65, 1.05, 1.0, 3.1], font_size=7.4)

    # PAGE 2 - Flowchart
    add_heading(doc, '3. Quy trình bán hàng tổng quan', 1, 'SALES PROCESS FLOW', page_break=True)
    add_p(doc, 'Sơ đồ thể hiện hành trình từ lúc khách truy cập cửa hàng đến khi đơn hàng được giao và đóng. Tất cả nhánh thanh toán đều quay về bước tạo mã đơn và xác minh trước khi xử lý.', size=8.8, color=MUTED, after=8)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(5)
    p.add_run().add_picture(str(FLOW), width=Inches(6.55))
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run('Hình 1. Flow mô phỏng bán hàng và điểm kiểm soát xác minh đơn hàng.')
    set_run_font(r, 7.5, False, MUTED, italic=True)
    add_callout(doc, 'NGUYÊN TẮC', 'Không chuyển trạng thái “hoàn tất” chỉ dựa vào giao diện phía khách hàng. Hệ thống thật phải xác minh giá, tồn kho, danh tính đơn và trạng thái thanh toán ở backend.', fill='F0F4E6')

    # PAGE 3 - Steps and payment path
    add_heading(doc, '4. Mô tả chi tiết quy trình', 1, 'OPERATIONAL WORKFLOW', page_break=True)
    steps = [
        ('01 · Khám phá', 'Khách truy cập trang chủ, tìm kiếm hoặc lọc danh mục; xem mô tả, giá tham chiếu và link nguồn sản phẩm.'),
        ('02 · Chọn sản phẩm', 'Khách mở chi tiết, chọn “Thêm vào giỏ”. Front-end cập nhật số lượng và tạm tính; người dùng có thể tăng, giảm hoặc xóa.'),
        ('03 · Checkout', 'Khách nhập họ tên, số điện thoại, địa chỉ nhận hàng và ghi chú. Form kiểm tra trường bắt buộc, độ dài và định dạng số điện thoại.'),
        ('04 · Chọn thanh toán', 'Khách chọn COD, chuyển khoản hoặc ví điện tử. Demo chỉ ghi nhận lựa chọn; không kết nối tổ chức tài chính hoặc phát sinh tiền thật.'),
        ('05 · Tạo đơn', 'Hệ thống tạo mã đơn duy nhất, lưu snapshot giỏ hàng và chuyển đơn sang trạng thái chờ xử lý. Backend thực tế phải tự tính lại giá và tồn kho.'),
        ('06 · Xác minh', 'Nhân viên/hệ thống kiểm tra thông tin liên hệ, địa chỉ, số lượng, giá và trạng thái giao dịch. Đơn thiếu dữ liệu được tạm giữ để xác nhận.'),
        ('07 · Đóng gói & giao', 'Sau khi hợp lệ, kho đóng gói, tạo mã vận đơn, bàn giao đơn vị vận chuyển và gửi cập nhật trạng thái cho khách.'),
        ('08 · Hoàn tất', 'COD được đối soát tiền thu hộ; đơn trả trước chỉ hoàn tất khi backend xác minh thanh toán. Lưu log trạng thái để tra soát.'),
    ]
    add_table(doc, ['BƯỚC', 'MÔ TẢ NGHIỆP VỤ'], steps, widths=[1.35, 5.45], font_size=7.65)
    add_heading(doc, 'Luồng riêng theo phương thức thanh toán', 2)
    pay_rows = [
        ('COD', 'Tạo đơn → xác nhận SĐT/địa chỉ → đóng gói → giao hàng → thu hộ → đối soát COD.'),
        ('Chuyển khoản', 'Tạo mã tham chiếu → khách chuyển qua kênh ngân hàng thật → backend đối chiếu giao dịch/webhook → xác nhận thanh toán → đóng gói.'),
        ('Ví điện tử', 'Chuyển hướng tới cổng ví chính thức → khách xác nhận ở ứng dụng ví → backend xác minh chữ ký callback → cập nhật paid → đóng gói.'),
    ]
    add_table(doc, ['PHƯƠNG THỨC', 'LUỒNG XỬ LÝ ĐỀ XUẤT'], pay_rows, widths=[1.2, 5.6], font_size=7.6)
    add_callout(doc, 'TRẠNG THÁI ĐƠN', 'PENDING → VERIFIED → FULFILLMENT → SHIPPED → COMPLETED. Nhánh bất thường: ON_HOLD / PAYMENT_FAILED / CANCELLED. Mỗi chuyển trạng thái cần được backend kiểm tra quyền và điều kiện.', fill=ORANGE, accent='A86F4F')

    # PAGE 4 - Checkout + security controls
    add_heading(doc, '5. Thiết kế trang thanh toán', 1, 'CHECKOUT DESIGN', page_break=True)
    add_p(doc, 'Trang checkout chia thành hai vùng: biểu mẫu thông tin nhận hàng ở bên trái và tóm tắt đơn hàng ở bên phải. Trên màn hình nhỏ, hai vùng xếp chồng để dễ thao tác.', size=8.7, color=MUTED, after=8)
    checkout_rows = [
        ('Họ và tên', 'Bắt buộc; giới hạn độ dài; không chấp nhận chuỗi rỗng.'),
        ('Số điện thoại', 'Bắt buộc; kiểm tra định dạng số Việt Nam ở client và phải kiểm tra lại ở backend.'),
        ('Địa chỉ', 'Bắt buộc; dùng để giao hàng; không yêu cầu thông tin không cần thiết.'),
        ('Ghi chú', 'Không bắt buộc; giới hạn độ dài và xử lý output an toàn để tránh XSS.'),
        ('Phương thức', 'Radio lựa chọn COD / chuyển khoản / ví điện tử; mỗi lựa chọn hiển thị hướng dẫn riêng.'),
    ]
    add_table(doc, ['TRƯỜNG', 'QUY TẮC KIỂM TRA'], checkout_rows, widths=[1.35, 5.45], font_size=7.7)
    add_heading(doc, '6. Giải pháp bảo đảm an toàn giao dịch', 1, 'TRANSACTION SECURITY')
    sec_rows = [
        ('Bảo mật thông tin khách hàng', 'Bắt buộc HTTPS/TLS; chỉ thu thập dữ liệu phục vụ giao hàng; mã hóa dữ liệu nhạy cảm khi lưu; phân quyền theo vai trò; che số điện thoại/địa chỉ trong log; thiết lập thời hạn lưu và quy trình xóa dữ liệu.'),
        ('Xác thực đơn hàng', 'Tạo order ID ngẫu nhiên/khó đoán; backend tính lại giá và tồn kho; xác nhận số điện thoại (OTP hoặc gọi xác nhận); gửi tóm tắt đơn cho khách; lưu lịch sử thay đổi trạng thái.'),
        ('Hạn chế rủi ro thanh toán', 'Không tự lưu PAN/CVV/PIN/mật khẩu ví; tích hợp cổng thanh toán được cấp phép; dùng token/hosted checkout; xác minh chữ ký webhook; idempotency key chống ghi nhận giao dịch lặp; đối soát trước khi xuất kho.'),
        ('Bảo vệ ứng dụng', 'Validate dữ liệu ở server; encode output; chống XSS/CSRF/SQL injection; rate limit endpoint checkout; CSP, HSTS, cookie Secure/HttpOnly/SameSite; quản lý secret bằng biến môi trường.'),
        ('Giám sát & khôi phục', 'Audit log có timestamp và actor; cảnh báo đơn bất thường; sao lưu định kỳ; kiểm thử restore; giới hạn quyền truy cập dữ liệu; có quy trình xử lý sự cố và thông báo vi phạm.'),
    ]
    add_table(doc, ['MỤC TIÊU', 'BIỆN PHÁP KỸ THUẬT / NGHIỆP VỤ'], sec_rows, widths=[1.55, 5.25], font_size=7.35)
    add_callout(doc, 'NGUYÊN TẮC CỐT LÕI', 'Giá, tồn kho và trạng thái thanh toán là dữ liệu có thẩm quyền ở máy chủ. Không tin giá trị do trình duyệt gửi lên và không đánh dấu đơn đã thanh toán chỉ vì người dùng quay lại trang thành công.', fill=PALE)

    # PAGE 5 - Implementation state and sources
    add_heading(doc, '7. Phạm vi triển khai và giới hạn demo', 1, 'IMPLEMENTATION NOTES', page_break=True)
    impl_rows = [
        ('Giao diện / React + Tailwind', 'Đã triển khai', 'Responsive; tìm kiếm/lọc; chi tiết sản phẩm; section bảo mật.'),
        ('Three.js', 'Đã triển khai', 'Hero có mô hình mạng 3D, canvas nền trong suốt.'),
        ('Giỏ hàng', 'Đã triển khai mô phỏng', 'Client state + localStorage cho mã sản phẩm/số lượng; không lưu PII.'),
        ('Checkout', 'Đã triển khai mô phỏng', 'Form họ tên/SĐT/địa chỉ; COD, bank, wallet; tạo mã đơn demo.'),
        ('Backend / Database', 'Chưa triển khai', 'Cần API, DB, quản trị đơn, tồn kho, xác thực người dùng và phân quyền.'),
        ('Cổng thanh toán / vận chuyển', 'Chưa kết nối', 'Không phát sinh tiền thật; không tạo vận đơn; không gọi API ngân hàng/ví.'),
        ('Giá / tồn kho realtime', 'Chưa triển khai', 'Dữ liệu giá tĩnh trong products.js; cần API nguồn dữ liệu chính thức.'),
        ('Ảnh PNG nền trong suốt', 'Có fallback + script', 'Ảnh minh họa PNG alpha đi kèm; script hỗ trợ tải ảnh gốc Hak5 và tách nền khi có Internet.'),
    ]
    add_table(doc, ['THÀNH PHẦN', 'TRẠNG THÁI', 'GHI CHÚ'], impl_rows, widths=[1.65, 1.45, 3.7], font_size=7.2)
    add_heading(doc, '8. Checklist kiểm thử nghiệm thu', 2)
    checks = [
        'Trang chủ hiển thị tối thiểu 3 sản phẩm và nội dung tiếng Việt.',
        'Tìm kiếm/lọc trả về đúng kết quả; xem chi tiết mở đúng sản phẩm.',
        'Thêm sản phẩm, tăng/giảm số lượng, xóa và tính tổng giỏ hàng đúng.',
        'Checkout bắt buộc họ tên, số điện thoại, địa chỉ; từ chối SĐT sai định dạng.',
        'Có thể chọn COD, chuyển khoản, ví điện tử; thông báo rõ đây là thanh toán mô phỏng.',
        'Đặt hàng sinh mã đơn; giỏ hàng được xóa; màn hình xác nhận không tuyên bố đã thu tiền thật.',
        'Không lưu dữ liệu khách hàng vào localStorage; không thu thập thông tin thẻ hoặc mật khẩu ví.',
    ]
    for item in checks:
        add_bullet(doc, '☐  ' + item, size=8.1)

    add_heading(doc, '9. Nguồn dữ liệu và tham chiếu', 2)
    sources = [
        ('WiFi Pineapple Mark VII - Hak5 Shop', 'https://shop.hak5.org/products/wifi-pineapple'),
        ('USB Rubber Ducky - Hak5 Shop', 'https://shop.hak5.org/products/usb-rubber-ducky'),
        ('Bash Bunny - Hak5 Shop', 'https://shop.hak5.org/products/bash-bunny'),
        ('USB Rubber Ducky vs. Bash Bunny - Hak5', 'https://shop.hak5.org/pages/usb-rubber-ducky-vs-bash-bunny'),
        ('Hak5 About', 'https://shop.hak5.org/pages/about'),
    ]
    for label, url in sources:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run('• '); set_run_font(r, 7.5, False, MUTED)
        add_hyperlink(p, label, url)
    add_p(doc, 'Ghi chú nguồn: mô tả và giá sản phẩm được tham khảo từ trang công khai của Hak5; giá có thể thay đổi theo cấu hình, thị trường và thời điểm. Tên thương hiệu/sản phẩm thuộc chủ sở hữu tương ứng. Try Hack My Shop là dự án mô phỏng học tập, không liên kết hoặc đại diện Hak5.', size=7.3, color=MUTED, before=5, after=0)

    # Set core properties
    doc.core_properties.title = 'Try Hack My Shop - Quy trình bán hàng và an toàn giao dịch'
    doc.core_properties.subject = 'Báo cáo dự án website thương mại điện tử mô phỏng'
    doc.core_properties.author = 'Try Hack My Shop - Student Project'
    doc.core_properties.keywords = 'React, Tailwind CSS, Three.js, sales flow, transaction security'
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT)
    print(OUT)

if __name__ == '__main__':
    build()
