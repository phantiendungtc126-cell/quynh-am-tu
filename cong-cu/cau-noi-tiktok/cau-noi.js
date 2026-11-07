// Cầu nối TikTok Live → Công Viên Cầu Vồng.
// Đọc bình luận, tim, quà, theo dõi, chia sẻ từ một phòng live TikTok rồi phát sang trang công viên
// (mở bằng ?live) qua WebSocket ws://localhost:8787.
//
// Chạy:  node cau-noi.js <tên_kênh_tiktok> [--cong 8787] [--khoa KHOA_EULER]
// Thử không cần live:  node cau-noi.js --thu
//
// Thư viện tiktok-live-connector là dự án không chính thức (không phải của TikTok); có thể ngừng chạy khi TikTok đổi hệ thống.

const { WebSocketServer } = require('ws');

const thamSo = process.argv.slice(2);
const lay = (ten, md) => { const i = thamSo.indexOf(ten); return i >= 0 ? thamSo[i + 1] : md; };
const THU = thamSo.includes('--thu');
const CONG = +lay('--cong', 8787);
const KHOA = lay('--khoa', process.env.EULER_API_KEY || '');
const KENH = (thamSo.find(a => !a.startsWith('--') && a !== String(CONG) && a !== KHOA) || '').replace(/^@/, '').replace(/^https?:\/\/(www\.)?tiktok\.com\/@/, '').replace(/\/live.*$/, '').trim();

if (!THU && !KENH) {
  console.log('Cách dùng: node cau-noi.js <tên_kênh_tiktok>     (ví dụ: node cau-noi.js congviencauvong)');
  console.log('Thử không cần live: node cau-noi.js --thu');
  process.exit(1);
}

// ---------- máy chủ WebSocket cho trang công viên ----------
const may = new WebSocketServer({ host: '127.0.0.1', port: CONG });
let trangThai = { type: 'trangthai', ok: false, kenh: KENH };
function phat(su) {
  const s = JSON.stringify(su);
  may.clients.forEach(c => { if (c.readyState === 1) c.send(s); });
}
may.on('connection', ws => {
  console.log('• Trang công viên đã nối vào cầu nối (' + may.clients.size + ' trang đang mở)');
  ws.send(JSON.stringify(trangThai));
});
may.on('listening', () => console.log('• Cầu nối đang chờ trang công viên ở ws://localhost:' + CONG));
may.on('error', e => { console.error('Không mở được cổng ' + CONG + ': ' + e.message + '\n  Có thể cầu nối khác đang chạy. Đóng cửa sổ đó rồi chạy lại.'); process.exit(1); });

const ten = u => (u && (u.nickname || u.uniqueId)) || 'Bạn xem';

// ---------- chế độ thử: tự tạo sự kiện ----------
if (THU) {
  const TEN = ['Mèo Mun', 'Bé Na', 'Thỏ Ngọc', 'Bin Bin', 'Su Kem', 'Gấu Mập'];
  const CHAT = ['kem', 'nước', 'nhảy', 'gắp thú', 'bóng bay', 'pháo', 'quà', 'xin chào'];
  trangThai = { type: 'trangthai', ok: true, kenh: 'thu-cau-noi' };
  phat(trangThai);
  console.log('• Đang chạy THỬ: cứ 1,5 giây gửi một sự kiện giả sang trang công viên.');
  setInterval(() => {
    const nick = TEN[Math.random() * TEN.length | 0], r = Math.random();
    if (r < 0.6) phat({ type: 'chat', nick, text: CHAT[Math.random() * CHAT.length | 0] });
    else if (r < 0.85) phat({ type: 'like', nick, count: 1 + (Math.random() * 6 | 0) });
    else phat({ type: 'gift', nick, gift: 'Hoa hồng', coins: 1, count: 1 });
  }, 1500);
  return;
}

// ---------- nối TikTok Live ----------
const { TikTokLiveConnection, WebcastEvent, ControlEvent } = require('tiktok-live-connector');
let noi = null, henLai = null;

function batDau() {
  clearTimeout(henLai);
  noi = new TikTokLiveConnection(KENH, Object.assign({ enableExtendedGiftInfo: true }, KHOA ? { signApiKey: KHOA } : {}));

  noi.on(WebcastEvent.CHAT, d => { phat({ type: 'chat', user: d.user?.uniqueId, nick: ten(d.user), text: d.comment }); console.log('  💬 ' + ten(d.user) + ': ' + d.comment); });
  noi.on(WebcastEvent.LIKE, d => phat({ type: 'like', user: d.user?.uniqueId, nick: ten(d.user), count: d.likeCount || 1 }));
  noi.on(WebcastEvent.GIFT, d => {
    const loai = d.giftDetails?.giftType;
    if (loai === 1 && !d.repeatEnd) return;            // quà gửi liên tiếp: chỉ tính khi chuỗi kết thúc
    const qua = d.giftDetails?.giftName || d.extendedGiftInfo?.name || 'quà';
    const xu = d.giftDetails?.diamondCount || d.extendedGiftInfo?.diamond_count || 1;
    phat({ type: 'gift', user: d.user?.uniqueId, nick: ten(d.user), gift: qua, coins: xu, count: d.repeatCount || 1 });
    console.log('  🎁 ' + ten(d.user) + ' tặng ' + (d.repeatCount || 1) + ' × ' + qua);
  });
  noi.on(WebcastEvent.FOLLOW, d => phat({ type: 'follow', user: d.user?.uniqueId, nick: ten(d.user) }));
  noi.on(WebcastEvent.SHARE, d => phat({ type: 'share', user: d.user?.uniqueId, nick: ten(d.user) }));
  noi.on(WebcastEvent.MEMBER, d => phat({ type: 'join', user: d.user?.uniqueId, nick: ten(d.user) }));
  noi.on(WebcastEvent.STREAM_END, () => { console.log('• Buổi live đã kết thúc.'); doiLai('live kết thúc'); });
  noi.on(ControlEvent.DISCONNECTED, () => doiLai('mất kết nối'));
  noi.on(ControlEvent.ERROR, e => console.error('  Lỗi: ' + (e?.message || e?.info || e)));

  console.log('• Đang nối vào live của @' + KENH + ' …');
  noi.connect().then(st => {
    trangThai = { type: 'trangthai', ok: true, kenh: KENH };
    phat(trangThai);
    console.log('• ĐÃ NỐI live @' + KENH + (st?.roomId ? ' (phòng ' + st.roomId + ')' : '') + '. Bình luận sẽ hiện bên dưới.');
  }).catch(e => {
    const ly = e?.constructor?.name === 'UserOfflineError' ? 'kênh chưa phát live' : (e?.message || String(e));
    doiLai(ly);
  });
}

function doiLai(lyDo) {
  trangThai = { type: 'trangthai', ok: false, kenh: KENH };
  phat(trangThai);
  console.log('• Chưa nối được (' + lyDo + '). Thử lại sau 20 giây…');
  try { noi && noi.disconnect(); } catch (e) {}
  clearTimeout(henLai); henLai = setTimeout(batDau, 20000);
}

batDau();
