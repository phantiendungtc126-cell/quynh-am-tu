# Quỳnh Am Tự – hướng dẫn mở cửa chùa

Chùa online của nhóm bạn đạo trong Zalo. Mở bằng điện thoại, không cần cài app, không cần tài khoản.

Trong chùa có:
- **Chánh điện**: thắp hương (nhang cháy 30 phút, cả nhóm cùng thấy), gõ mõ, thỉnh chuông, xin xăm (12 quẻ).
- **Niệm Phật**: chuỗi 108 hạt, chạm một lần là một câu. Có bốn câu niệm để chọn.
- **Tụng kinh**: Bát Nhã Tâm Kinh phiên âm Hán Việt, mõ gõ theo nhịp, chữ đang đọc sáng lên.
- **Hoa đăng**: viết lời nguyện, cả nhóm đọc được. Có thể ẩn tên.
- **Công đức**: sổ công đức hôm nay và từ trước tới nay của từng người, nhật ký chùa.

Dữ liệu chung nằm trong một Google Sheet của anh. Ai không có **mã vào chùa** thì không đọc, không ghi được.

Chưa làm Bước 1 thì trang vẫn chạy, nhưng ở "chế độ thử": mỗi máy chỉ thấy công đức của chính mình.

---

## Bước 1. Tạo sổ công đức trên Google Sheet (khoảng 5 phút)

1. Vào **https://sheets.google.com**, tạo bảng tính trống, đặt tên "Quỳnh Am Tự - Sổ công đức".
2. Menu **Tiện ích mở rộng → Apps Script**.
3. Xóa đoạn code có sẵn, dán toàn bộ nội dung file `apps-script/Code.gs`.
4. Sửa dòng `const MA_VAO_CHUA = 'doi-chuoi-nay';` thành mã riêng, ví dụ `'quynham-sen-trang'`. Đây là mã gửi cho bạn bè.
5. Bấm 💾 lưu. Ở ô chọn hàm, chọn **capQuyen** → **Chạy** → cấp quyền
   (chọn tài khoản → **Nâng cao** → **Đi tới … (không an toàn)** → **Cho phép**).
   Bảng tính sẽ có thêm ba trang: `NhatKy`, `TongHop`, `HoaDang`.
6. **Triển khai → Tùy chọn triển khai mới** → ⚙ **Ứng dụng web**:
   - Thực thi với tư cách: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
   Bấm **Triển khai**, chép **URL ứng dụng web** (dạng `https://script.google.com/macros/s/.../exec`).
7. Mở file `config.js`, dán URL đó vào giữa hai dấu nháy ở dòng `API_URL: ''`.

> Sửa code Apps Script sau này: **Triển khai → Quản lý các lần triển khai → ✏ → Phiên bản mới → Triển khai**. URL giữ nguyên.

## Bước 2. Đưa chùa lên mạng bằng GitHub Pages

1. Trên GitHub tạo kho mới tên `quynh-am-tu`, chọn **Public**.
2. Tải lên các file: `index.html, style.css, config.js, data.js, audio.js, scene.js, api.js, app.js, manifest.webmanifest` và thư mục `icons`.
   (Thư mục `apps-script` và file hướng dẫn này để trên GitHub cũng được, không ảnh hưởng.)
3. **Settings → Pages** → Branch **main**, **/(root)** → **Save**.
4. Một hai phút sau chùa có địa chỉ `https://<tên-tài-khoản>.github.io/quynh-am-tu/`.

## Bước 3. Mời bạn bè trong nhóm Zalo

Gửi vào nhóm đường link có kèm mã, bạn bè bấm vào là vào thẳng, chỉ cần gõ tên:

```
https://<tên-tài-khoản>.github.io/quynh-am-tu/#ma=quynham-sen-trang
```

Muốn để chùa trên màn hình chính như app: iPhone mở bằng Safari → Chia sẻ → **Thêm vào MH chính**; Android mở bằng Chrome → ⋮ → **Thêm vào màn hình chính**.
(Link mở bên trong Zalo vẫn dùng được, nhưng mỗi lần mở trình duyệt Zalo có thể quên tên, phải gõ lại.)

## Quản lý chùa

- **Xóa một lời nguyện không phù hợp**: mở Google Sheet, trang `HoaDang`, xóa dòng đó.
- **Đổi mã vào chùa** (khi lỡ lộ ra ngoài): sửa `MA_VAO_CHUA` trong Apps Script, triển khai phiên bản mới, gửi link mới vào nhóm.
- **Đổi giờ tu chung**: sửa dòng `GIO_TU_CHUNG` trong `config.js`, tải lại file lên GitHub.
- Số liệu "hôm nay" tính theo giờ Việt Nam, qua 0 giờ thì về 0.
- Mõ và câu niệm được gom lại, vài giây mới gửi một lần, nên sổ công đức của người khác cập nhật chậm khoảng 20 giây.
