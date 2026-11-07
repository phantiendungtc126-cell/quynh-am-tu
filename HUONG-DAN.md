# Công Viên Cầu Vồng – hướng dẫn

Khu vui chơi online của nhóm trong Zalo. Mở bằng điện thoại, không cần cài app, không cần tài khoản.

- Địa chỉ: https://phantiendungtc126-cell.github.io/quynh-am-tu/
- Kho mã: https://github.com/phantiendungtc126-cell/quynh-am-tu
- Sổ ngôi sao (Google Sheet): "Công Viên Cầu Vồng - Sổ ngôi sao" trong Drive của anh Dũng
- Apps Script: dự án "Công Viên Cầu Vồng" gắn với bảng tính trên (Tiện ích mở rộng → Apps Script)

Trong công viên có:
- **Công viên**: thả bóng bay, nhún nhảy, bắn pháo giấy, mở hộp quà bất ngờ. Mỗi bạn trong sổ là một nhân vật chibi có tên, chạy nhảy quanh quảng trường.
- **Bong bóng**: chạm vòng bong bóng để bắn, đủ 100 quả có pháo hoa.
- **Hát**: karaoke "Bài Hát Cầu Vồng" theo giai điệu Ngôi sao nhỏ, chữ nào sáng thì bé hát chữ đó.
- **Cửa hàng**: quầy kem, quầy nước (ăn uống hoặc mời một bạn) và máy gắp thú. Bạn được mời sẽ cầm que kem, ly nước trong công viên.
- **Điều ước**: viết điều ước, thả theo bóng bay, cả nhóm cùng đọc. Có thể ẩn tên.
- **Ngôi sao**: điểm hôm nay và từ trước tới nay của từng bạn, nhật ký công viên.

Ai không có **mã vào cổng** thì không đọc, không ghi được sổ ngôi sao.

---

## Mời các bạn vào chơi

Gửi vào nhóm Zalo đường link có kèm mã. Bấm vào là vào thẳng, chỉ cần gõ tên:

```
https://phantiendungtc126-cell.github.io/quynh-am-tu/#ma=<mã vào cổng>
```

Để công viên trên màn hình chính như app: iPhone mở bằng Safari → Chia sẻ → **Thêm vào MH chính**; Android mở bằng Chrome → ⋮ → **Thêm vào màn hình chính**.

## Quản lý công viên

- **Xóa một điều ước không phù hợp**: mở Sổ ngôi sao, trang `HoaDang`, xóa dòng đó.
- **Bắt đầu lại từ đầu**: xóa từ dòng 2 trở xuống ở ba trang `NhatKy`, `TongHop`, `HoaDang` (giữ dòng tiêu đề).
- **Đổi mã vào cổng**: mở Apps Script, sửa dòng `const MA_VAO_CONG = '...'`, rồi **Triển khai → Quản lý các lần triển khai → ✏ → Phiên bản mới → Triển khai**. URL giữ nguyên. Gửi link có mã mới vào nhóm.
- **Đổi giờ chơi chung**: sửa dòng `GIO_TU_CHUNG` trong `config.js`, tải lại file lên GitHub.
- **Thử mà không ghi vào sổ thật**: mở trang với `?thu` ở cuối địa chỉ.
- Điểm "hôm nay" tính theo giờ Việt Nam, qua 0 giờ thì về 0.
- Nhún nhảy và bắn bong bóng được gom lại vài giây mới gửi một lần, nên máy các bạn khác thấy chậm khoảng 20 giây.

## Nhạc

Nhạc nền là các giai điệu thiếu nhi đã hết bản quyền (Twinkle Twinkle Little Star, Frère Jacques, Mary Had a Little Lamb, London Bridge, Old MacDonald, Row Row Row Your Boat, Ode to Joy). Trang tự chơi bằng tiếng hộp nhạc, không dùng file ghi âm nên không vướng bản quyền.

- Danh sách bài nằm trong `data.js` (`BAI_NHAC`): mỗi bài là chuỗi nốt `C5:1` (nốt:số phách) và hợp âm.
- Lời karaoke nằm trong `KINH` của `data.js`: 6 câu, mỗi câu 7 chữ, khớp 42 nốt của bài Ngôi sao nhỏ.
- Sửa xong thì tăng số `?v=` trong `index.html` rồi tải file lên GitHub.

## Bản chùa cũ

Trang này trước là chùa online "Quỳnh Am Tự". Bản chùa vẫn giữ trong git ở nhãn `chua-quynh-am-tu`.
