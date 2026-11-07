// Bài hát và hộp quà của Công Viên Cầu Vồng. Lời bài hát viết riêng cho công viên.
window.KINH = {
  ten: 'Bài Hát Cầu Vồng',
  // Hát theo giai điệu "Twinkle Twinkle Little Star" (dân ca, phạm vi công cộng): 6 câu, mỗi câu 7 chữ ứng với 7 nốt.
  doan: [
    'Cầu vồng bảy sắc trên trời xanh,',
    'Đỏ cam vàng lục lam chàm tím.',
    'Hôm nay bé đến công viên chơi,',
    'Đu quay ngựa gỗ quay tròn tròn.',
    'Bóng bay xanh đỏ bay lên cao,',
    'Bạn bè nắm tay cùng hát ca!',
  ],
};

// Nhạc thiếu nhi: giai điệu dân gian và cổ điển đã thuộc phạm vi công cộng, trang tự chơi bằng tiếng hộp nhạc.
// not: "nốt:số phách" (bỏ :số là 1 phách, R là nghỉ); hop: hợp âm theo từng nhóm hopNhip phách.
window.BAI_NHAC = [
  { ten: 'Ngôi sao nhỏ (Twinkle Twinkle Little Star)', nhip: 100, hopNhip: 2,
    not: 'C5 C5 G5 G5 A5 A5 G5:2 F5 F5 E5 E5 D5 D5 C5:2 G5 G5 F5 F5 E5 E5 D5:2 G5 G5 F5 F5 E5 E5 D5:2 C5 C5 G5 G5 A5 A5 G5:2 F5 F5 E5 E5 D5 D5 C5:2',
    hop: 'C C F C F C G C C G C G C G C G C C F C F C G C' },
  { ten: 'Kìa con bướm vàng (Frère Jacques)', nhip: 112, hopNhip: 2,
    not: 'C5 D5 E5 C5 C5 D5 E5 C5 E5 F5 G5:2 E5 F5 G5:2 G5:.5 A5:.5 G5:.5 F5:.5 E5 C5 G5:.5 A5:.5 G5:.5 F5:.5 E5 C5 C5 G4 C5:2 C5 G4 C5:2',
    hop: 'C C C C C C C C C C C C G C G C' },
  { ten: 'Chú cừu nhỏ (Mary Had a Little Lamb)', nhip: 112, hopNhip: 2,
    not: 'E5 D5 C5 D5 E5 E5 E5:2 D5 D5 D5:2 E5 G5 G5:2 E5 D5 C5 D5 E5 E5 E5 E5 D5 D5 E5 D5 C5:4',
    hop: 'C C C C G G C C C C C C G G C C' },
  { ten: 'Cầu London (London Bridge)', nhip: 108, hopNhip: 2,
    not: 'G5:1.5 A5:.5 G5 F5 E5 F5 G5:2 D5 E5 F5:2 E5 F5 G5:2 G5:1.5 A5:.5 G5 F5 E5 F5 G5:2 D5:2 G5:2 E5 C5:3',
    hop: 'C C C C G G C C C C C C G G C C' },
  { ten: 'Nông trại vui vẻ (Old MacDonald)', nhip: 116, hopNhip: 2,
    not: 'C5 C5 C5 G4 A4 A4 G4:2 E5 E5 D5 D5 C5:3 G4 C5 C5 C5 G4 A4 A4 G4:2 E5 E5 D5 D5 C5:4',
    hop: 'C C F C C G C C C C F C C G C C' },
  { ten: 'Chèo thuyền (Row Row Row Your Boat)', nhip: 104, hopNhip: 1.5,
    not: 'C5:1.5 C5:1.5 C5 D5:.5 E5:1.5 E5 D5:.5 E5 F5:.5 G5:3 C6:.5 C6:.5 C6:.5 G5:.5 G5:.5 G5:.5 E5:.5 E5:.5 E5:.5 C5:.5 C5:.5 C5:.5 G5 F5:.5 E5 D5:.5 C5:3',
    hop: 'C C C C C C C C C C C C G G C C' },
  { ten: 'Khúc ca vui (Ode to Joy)', nhip: 112, hopNhip: 2,
    not: 'E5 E5 F5 G5 G5 F5 E5 D5 C5 C5 D5 E5 E5:1.5 D5:.5 D5:2 E5 E5 F5 G5 G5 F5 E5 D5 C5 C5 D5 E5 D5:1.5 C5:.5 C5:2 D5 D5 E5 C5 D5 E5:.5 F5:.5 E5 C5 D5 E5:.5 F5:.5 E5 D5 C5 D5 G4:2 E5 E5 F5 G5 G5 F5 E5 D5 C5 C5 D5 E5 D5:1.5 C5:.5 C5:2',
    hop: 'C C C G C C G G C C C G C C G C G C G C G C C G C C C G C C G C' },
];

// 12 hộp quà bất ngờ: món quà, lời chúc và một việc nhỏ làm trong ngày.
window.QUA = [
  { so: 'Gấu bông', bac: 'Quà ôm ấp', hinh: '🧸', tho: ['Một chú gấu bông mềm mại', 'Ôm vào là thấy ấm ngay.'], ban: 'Hôm nay nhớ ôm bố mẹ một cái thật chặt.' },
  { so: 'Kem dâu', bac: 'Quà mát lạnh', hinh: '🍦', tho: ['Que kem dâu mát lạnh', 'Ăn chậm thôi kẻo buốt răng.'], ban: 'Uống đủ nước và rửa tay trước khi ăn nhé.' },
  { so: 'Bóng bay', bac: 'Quà bay cao', hinh: '🎈', tho: ['Quả bóng đỏ bay lên', 'Mang ước mơ của bé.'], ban: 'Kể cho bạn nghe một điều bé mơ ước.' },
  { so: 'Ngôi sao', bac: 'Quà lấp lánh', hinh: '⭐', tho: ['Ngôi sao vàng lấp lánh', 'Dành cho bé ngoan nhất.'], ban: 'Hôm nay tự cất đồ chơi gọn gàng nhé.' },
  { so: 'Bút màu', bac: 'Quà sáng tạo', hinh: '🖍️', tho: ['Hộp bút màu bảy sắc', 'Vẽ cầu vồng thật xinh.'], ban: 'Vẽ một bức tranh tặng người bé thương.' },
  { so: 'Quả bóng', bac: 'Quà vận động', hinh: '⚽', tho: ['Quả bóng tròn lăn lăn', 'Chạy theo cho khỏe chân.'], ban: 'Ra sân chạy nhảy mười phút cho khỏe.' },
  { so: 'Cuốn truyện', bac: 'Quà thông minh', hinh: '📘', tho: ['Cuốn truyện tranh thật hay', 'Mở ra là thấy vui.'], ban: 'Tối nay nhờ bố mẹ đọc cho nghe một truyện.' },
  { so: 'Bánh kem', bac: 'Quà ngọt ngào', hinh: '🎂', tho: ['Chiếc bánh kem nho nhỏ', 'Chia cho bạn cùng ăn.'], ban: 'Chia sẻ đồ ăn với bạn bè nhé.' },
  { so: 'Chú mèo', bac: 'Quà đáng yêu', hinh: '🐱', tho: ['Chú mèo kêu meo meo', 'Đòi bé chơi cùng đây.'], ban: 'Nhẹ nhàng với các con vật quanh mình.' },
  { so: 'Cây non', bac: 'Quà xanh mát', hinh: '🌱', tho: ['Một mầm cây bé xíu', 'Tưới nước là lớn nhanh.'], ban: 'Hôm nay tưới cây giúp mẹ nhé.' },
  { so: 'Tên lửa', bac: 'Quà phiêu lưu', hinh: '🚀', tho: ['Tên lửa bay vút lên', 'Thăm trăng sao trên trời.'], ban: 'Hỏi bố mẹ: vì sao trời có sao?' },
  { so: 'Cầu vồng', bac: 'Quà đặc biệt', hinh: '🌈', tho: ['Cầu vồng sau cơn mưa', 'Bé cười là nắng lên.'], ban: 'Nói lời cảm ơn với ba người hôm nay.' },
];
