# Try Hack My Shop

Website đồ án thương mại điện tử cho danh mục thiết bị, phần mềm và học liệu Hak5. Giá nguồn và tình trạng hàng lấy từ danh mục ngày 27/11/2026. Giá hiển thị bằng VNĐ theo tỷ giá cố định 26.030 VNĐ/USD, tham chiếu giá bán ra Vietcombank ngày 27/11/2026. Đặt hàng, thanh toán và vận chuyển chạy ở chế độ mô phỏng.

## Chạy trên Windows hoặc macOS/Linux

Cài Node.js 24 LTS, mở terminal ở thư mục có `package.json`, rồi chạy:

```sh
npm ci
npm run dev
```

Mở địa chỉ Vite in trong terminal. Lệnh `npm run build` xuất thư mục `dist`. Nếu triển khai repo trên Vercel, chọn dự án Vite với Node.js 24 và root chứa `package.json`. Tệp `vercel.json` có sẵn để phục vụ đường dẫn trang chi tiết, thanh toán và xác nhận đơn.

## Trình bày bài

1. Trên trang chủ, mở Black Friday hoặc tìm tên sản phẩm. Mở Shark Jack Display, chọn **Incognito Black / Single** và thêm một món vào giỏ.
2. Mở giỏ và thay đổi số lượng để kiểm tra giá Black Friday đã tự áp dụng. Vào trang thanh toán để nhập thêm mã tùy chọn.
3. Điền dữ liệu mẫu, chọn tỉnh/thành rồi nhấn **Tiếp tục thanh toán**. Chọn Visa, Mastercard, PayPal, chuyển khoản QR hoặc COD rồi nhấn **Đặt hàng**.
4. Đơn trả trước mở trang Chờ thanh toán và tự chuyển sang Theo dõi đơn hàng sau khi mô phỏng thành công. Quay về trang chủ rồi mở thẻ trạng thái đơn hoặc mục **Đơn hàng** để xem lại đơn gần nhất trong cùng tab, kể cả sau khi tải lại trang.

| Mã | Quy tắc |
| --- | --- |
| STUDENT10 | Giảm 10% tiền hàng giá thường |
| FREESHIP | Miễn phí giao nội địa |

Giá Black Friday tự giảm 15% cho các biến thể còn hàng của sáu thiết bị trong bộ lọc Black Friday. Nhập BF15 sẽ báo giá đã tự áp dụng. Mỗi đơn dùng một mã bổ sung. Chọn voucher ngay tại danh mục hoặc nhập mã ở checkout. Đơn có hàng vật lý từ 5.200.000 VNĐ theo giá gốc được miễn phí giao nội địa. Dưới ngưỡng, giao nội địa là 39.000 VNĐ tại Hà Nội/TP.HCM và 59.000 VNĐ tại khu vực khác. Chi phí nhập hàng ước tính 10% tiền hàng vật lý sau ưu đãi và phí COD là 35.000 VNĐ. Thời gian dự kiến là 12–18 ngày làm việc cho Hà Nội/TP.HCM, 14–22 ngày làm việc cho khu vực khác. Mốc dự kiến bỏ qua cuối tuần và chưa tính ngày lễ.

Video trang chủ tự phát tắt tiếng và lặp trên localhost và bản build. Di chuột vào khung video hoặc dùng phím Tab để hiện nút tạm dừng. Khi trình duyệt chặn tự phát hoặc video chưa tải được, dùng nút **Phát video** để thử lại.

## Tài liệu nộp bài

- `docs/Try-Hack-My-Shop-Bao-Cao.pdf` trình bày giao diện, quy trình bán hàng và giải pháp an toàn giao dịch.
- Trang `/quy-trinh` là sơ đồ phân nhánh tương tác, nối các bước bằng mũi tên. Tệp `docs/Try-Hack-My-Shop-Flow.png` dùng làm hình minh họa trong báo cáo.
- `docs/Nguon-san-pham-Hak5.csv` đối chiếu từng trang sản phẩm và nguồn ảnh.
- `src/data/catalog.json` là danh mục đã biên tập. Mục thiếu ảnh riêng có trạng thái rõ ràng. Một số phiên bản thiết bị nổi bật có ảnh riêng. Hai mục dùng ảnh minh họa cùng dòng sản phẩm khi Hak5 không cung cấp ảnh riêng cho biến thể đó.

Luồng đặt đơn trong bản này chạy ở trình duyệt. Họ tên, SĐT và địa chỉ chỉ dùng trong biểu mẫu và bước kiểm tra lại. Khi xác nhận, ứng dụng giữ thông tin giao dịch mô phỏng trong bộ nhớ trang và xóa giỏ. Bản thương mại thực tế cần máy chủ, lưu trữ đơn hàng, đối soát thanh toán, kho và giao vận.

### Theo dõi thanh toán mô phỏng

Sau khi đặt đơn trả trước, trang `/order/payment` tự mô phỏng tạo yêu cầu, đối chiếu thông tin và nhận phản hồi. Khi thành công, trang tự mở chi tiết đơn và tiếp tục cập nhật tiến độ giao. Có thể chọn **Thử tình huống thất bại** rồi **Thử lại**. Đơn COD mở thẳng chi tiết đơn. Mã đơn, tổng tiền và trạng thái mô phỏng được giữ trong phiên của tab.
