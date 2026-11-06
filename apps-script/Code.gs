/**
 * Quỳnh Am Tự: nơi giữ sổ công đức chung của nhóm, nằm trong một Google Sheet của bạn.
 *
 * BẮT BUỘC: đổi MA_VAO_CHUA bên dưới thành một chuỗi riêng (ví dụ 'quynham-2026').
 * Gửi chuỗi đó cho bạn bè trong nhóm Zalo. Ai không có mã thì không ghi, không đọc được.
 */
const MA_VAO_CHUA = 'doi-chuoi-nay';
const MUI_GIO = 'Asia/Ho_Chi_Minh';
const LOAI = ['huong', 'mo', 'chuong', 'niem', 'kinh', 'hoadang', 'xam'];
const GOP = { mo: 1, niem: 1, chuong: 1 }; // gộp vào dòng nhật ký cũ nếu cùng người, trong 10 phút
const TOI_DA = { huong: 30, mo: 2000, chuong: 30, niem: 5000, kinh: 5, hoadang: 3, xam: 5 };

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (MA_VAO_CHUA === 'doi-chuoi-nay') return tra({ ok: false, error: 'Chủ chùa chưa đổi MA_VAO_CHUA trong Apps Script' });
    if (String(d.ma || '') !== MA_VAO_CHUA) return tra({ ok: false, error: 'Sai mã vào chùa' });
    if (d.action === 'ping') return tra({ ok: true });
    if (d.action === 'state') return tra(trangThai());
    if (d.action === 'act') return tra(ghiCongDuc(d.ten, d.items));
    return tra({ ok: false, error: 'Lệnh không hợp lệ' });
  } catch (err) {
    return tra({ ok: false, error: String(err && err.message || err) });
  }
}

function doGet() {
  return tra({ ok: true, msg: 'Quỳnh Am Tự đang mở cửa. Trang chùa gửi dữ liệu bằng POST.' });
}

function tra(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function bang(ten, tieuDe) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || moSheet();
  let sh = ss.getSheetByName(ten);
  if (!sh) {
    sh = ss.insertSheet(ten);
    sh.appendRow(tieuDe);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Script tạo riêng (không gắn với Sheet) thì tự tạo một bảng tính và nhớ id.
function moSheet() {
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.create('Quỳnh Am Tự - Sổ công đức');
  p.setProperty('SHEET_ID', ss.getId());
  return ss;
}

const NHAT_KY = () => bang('NhatKy', ['ThoiGian', 'Ten', 'Loai', 'So', 'NoiDung']);
const TONG_HOP = () => bang('TongHop', ['Ngay', 'Ten'].concat(LOAI));
const HOA_DANG = () => bang('HoaDang', ['ThoiGian', 'Ten', 'LoiNguyen', 'AnTen']);

function ghiCongDuc(tenNguoi, items) {
  const ten = String(tenNguoi || '').trim().replace(/\s+/g, ' ').slice(0, 30);
  if (!ten) throw new Error('Thiếu tên người ghi');
  if (!Array.isArray(items) || !items.length) return trangThai();
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const now = new Date(), ngay = Utilities.formatDate(now, MUI_GIO, 'yyyy-MM-dd');
    const cong = {}; LOAI.forEach(k => cong[k] = 0);
    const nk = NHAT_KY(), hd = HOA_DANG();
    items.slice(0, 50).forEach(it => {
      const loai = String(it.loai);
      if (LOAI.indexOf(loai) < 0) return;
      const so = Math.max(1, Math.min(TOI_DA[loai], Math.floor(Number(it.so) || 1)));
      const nd = String(it.nd || '').slice(0, loai === 'hoadang' ? 200 : 60);
      if (loai === 'hoadang' && !nd.trim()) return;
      cong[loai] += so;
      // nhật ký: gộp mõ/niệm/chuông liên tiếp của cùng người
      const cuoi = nk.getLastRow();
      let gop = false;
      if (GOP[loai] && cuoi > 1) {
        const r = nk.getRange(cuoi, 1, 1, 5).getValues()[0];
        if (r[1] === ten && r[2] === loai && String(r[4]) === nd && now - new Date(r[0]) < 600000) {
          nk.getRange(cuoi, 1).setValue(now);
          nk.getRange(cuoi, 4).setValue(Number(r[3]) + so);
          gop = true;
        }
      }
      if (!gop) nk.appendRow([now, ten, loai, so, loai === 'hoadang' ? '' : nd]);
      if (loai === 'hoadang') hd.appendRow([now, it.an ? '' : ten, nd, !!it.an]);
    });
    // tổng hợp theo ngày
    const th = TONG_HOP(), n = th.getLastRow();
    let dong = -1;
    if (n > 1) {
      const ab = th.getRange(2, 1, n - 1, 2).getDisplayValues();
      for (let i = ab.length - 1; i >= 0; i--) if (ab[i][0] === ngay && ab[i][1] === ten) { dong = i + 2; break; }
    }
    if (dong < 0) {
      th.appendRow([ngay, ten].concat(LOAI.map(k => cong[k])));
      th.getRange(th.getLastRow(), 1).setNumberFormat('@').setValue(ngay);
    } else {
      const r = th.getRange(dong, 3, 1, LOAI.length), v = r.getValues()[0];
      r.setValues([LOAI.map((k, i) => (Number(v[i]) || 0) + cong[k])]);
    }
    SpreadsheetApp.flush();
    CacheService.getScriptCache().remove('trangthai');
  } finally {
    lock.releaseLock();
  }
  return trangThai();
}

function trangThai() {
  const cache = CacheService.getScriptCache();
  const c = cache.get('trangthai');
  if (c) return JSON.parse(c);
  const now = Date.now(), ngay = Utilities.formatDate(new Date(), MUI_GIO, 'yyyy-MM-dd');
  const rong = () => { const o = {}; LOAI.forEach(k => o[k] = 0); return o; };

  const nguoi = {};
  const th = TONG_HOP(), n = th.getLastRow();
  if (n > 1) {
    th.getRange(2, 1, n - 1, 2 + LOAI.length).getDisplayValues().forEach(r => {
      const ten = r[1]; if (!ten) return;
      nguoi[ten] = nguoi[ten] || { homnay: rong(), tatca: rong() };
      LOAI.forEach((k, i) => {
        const v = Number(String(r[2 + i]).replace(/[^\d]/g, '')) || 0;
        nguoi[ten].tatca[k] += v;
        if (r[0] === ngay) nguoi[ten].homnay[k] += v;
      });
    });
  }

  const nk = NHAT_KY(), m = nk.getLastRow(), lay = Math.min(400, m - 1);
  let dong = [];
  if (lay > 0) dong = nk.getRange(m - lay + 1, 1, lay, 5).getValues().map(r => ({ t: new Date(r[0]).getTime(), ten: String(r[1]), loai: String(r[2]), so: Number(r[3]) || 0, nd: String(r[4] || '') }));
  const nhang = dong.filter(k => k.loai === 'huong' && now - k.t < 30 * 60000);
  const nhatKy = dong.slice(-40).reverse();

  const hd = HOA_DANG(), h = hd.getLastRow(), layH = Math.min(40, h - 1);
  let hoaDang = [];
  if (layH > 0) hoaDang = hd.getRange(h - layH + 1, 1, layH, 3).getValues().map(r => ({ t: new Date(r[0]).getTime(), ten: String(r[1] || ''), loi: String(r[2]) })).reverse();

  const kq = { ok: true, homNay: ngay, nguoi, nhatKy, hoaDang, nhang };
  try { cache.put('trangthai', JSON.stringify(kq), 8); } catch (e) {}
  return kq;
}

/** Chạy hàm này 1 lần trong trình soạn thảo để cấp quyền và tạo các trang tính. */
function capQuyen() {
  NHAT_KY(); TONG_HOP(); HOA_DANG();
  const ss = SpreadsheetApp.getActiveSpreadsheet() || moSheet();
  Logger.log('Đã sẵn sàng. Sổ công đức: ' + ss.getUrl());
}
