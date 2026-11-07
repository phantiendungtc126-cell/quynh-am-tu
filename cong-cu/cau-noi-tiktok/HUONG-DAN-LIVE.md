# Live TikTok với Công Viên Cầu Vồng

Người xem live bình luận, thả tim, tặng quà thì công viên phản ứng ngay trên màn hình live:

| Người xem làm | Trong công viên |
|---|---|
| Bình luận lần đầu | Có một nhân vật chibi mang tên TikTok của họ |
| `kem` | Nhân vật cầm que kem |
| `nước`, `uống` | Nhân vật cầm ly nước |
| `nhảy`, `nhún` | Nhân vật nhảy lên |
| `bóng bay`, `bóng` | Nhân vật chạy tới đài phun nước thả 3 quả bóng bay |
| `gắp thú`, `gắp` | Thử gắp thú, trúng thì ôm thú bông |
| `pháo` | Pháo giấy, cả công viên nhảy |
| `quà` | Mở hộp quà bất ngờ |
| Bình luận khác | Hiện thành bong bóng thoại trên đầu nhân vật |
| Thả tim | Bóng bay bay lên |
| Tặng quà | Pháo hoa + bảng "Cảm ơn …!" (quà càng lớn pháo hoa càng nhiều) |
| Theo dõi, chia sẻ | Nhân vật nhảy, thẻ tin cảm ơn |

Góc trên có bảng **Top bạn xem** và số tim, số quà của buổi live.

## Xem thử khi chưa được live

Mở: https://phantiendungtc126-cell.github.io/quynh-am-tu/?live&demo

Trang tự tạo bình luận, tim, quà giả để anh xem công viên phản ứng thế nào.

## Khi đã được TikTok mở quyền live

Cần máy tính Windows, có **TikTok LIVE Studio** (hoặc OBS) và **Node.js** (tải bản LTS ở https://nodejs.org).

1. **Đưa công viên lên màn hình live.** Trong TikTok LIVE Studio thêm nguồn **Liên kết/Trình duyệt (Link/Browser source)**, dán:
   `https://phantiendungtc126-cell.github.io/quynh-am-tu/?live`
   Đặt kích thước **1080 × 1920** (khung dọc). Trong OBS: Nguồn → Browser, cùng địa chỉ và kích thước, tích "Control audio via OBS" nếu muốn chỉnh tiếng nhạc.
2. **Bật cầu nối.** Mở thư mục `cong-cu\cau-noi-tiktok`, bấm đúp `chay-cau-noi.bat`, gõ tên kênh TikTok của anh (không cần @) rồi Enter. Lần đầu nó tự cài thư viện.
   Cửa sổ đen hiện "ĐÃ NỐI live @…" là xong; bình luận sẽ chạy trong cửa sổ đó. Để cửa sổ mở suốt buổi live.
3. **Bắt đầu live** như bình thường. Góc trên công viên hiện "LIVE @tên kênh · … bạn chơi".

Nếu bật cầu nối trước khi bắt đầu live, nó báo "kênh chưa phát live" và cứ 20 giây tự thử lại.

Muốn thử cầu nối mà không cần live: chạy `chay-cau-noi.bat`, gõ `thu`.

## Lưu ý

- Cầu nối dùng thư viện **tiktok-live-connector**, là dự án không chính thức, không phải của TikTok. Nó có thể ngừng chạy khi TikTok đổi hệ thống; khi đó cần cập nhật thư viện (`npm install tiktok-live-connector@latest` trong thư mục này).
- Thư viện nhờ máy chủ của Euler Stream ký kết nối. Nếu báo lỗi giới hạn (rate limit), tạo khóa miễn phí ở https://www.eulerstream.com rồi chạy: `node cau-noi.js <tên_kênh> --khoa <khóa>`.
- Live không ghi gì vào Sổ ngôi sao của nhóm. Người xem live chỉ ở trong công viên trong lúc live, im lặng 10 phút thì rời đi.
- Trang live và cầu nối phải chạy trên **cùng một máy tính** (trang nối tới `ws://localhost:8787`).
