// Nói chuyện với Apps Script (Google Sheet). Không có API_URL thì dùng bản thử lưu trên máy.
window.Api = (() => {
  // ?thu trên địa chỉ trang: chạy thử, không ghi vào sổ ngôi sao thật
  const URL_API = /[?&]thu\b/.test(location.search) ? '' : (window.CHUA && CHUA.API_URL || '').trim();
  const LOAI = ['huong', 'mo', 'chuong', 'niem', 'kinh', 'hoadang', 'xam'];

  function ngayVN(ms) {
    return new Date(ms).toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
  }
  function rong() { const o = {}; LOAI.forEach(k => o[k] = 0); return o; }

  // ---- Bản thử: cùng cách tính như Apps Script, dữ liệu nằm trong localStorage ----
  const Thu = {
    doc() { try { return JSON.parse(localStorage.getItem('qat.thu') || '{"tong":{},"ky":[],"hoa":[]}'); } catch (e) { return { tong: {}, ky: [], hoa: [] }; } },
    ghi(d) { try { localStorage.setItem('qat.thu', JSON.stringify(d)); } catch (e) {} },
    act(ten, items) {
      const d = this.doc(), now = Date.now(), ngay = ngayVN(now);
      items.forEach(it => {
        const khoa = ngay + '|' + ten;
        d.tong[khoa] = d.tong[khoa] || rong();
        d.tong[khoa][it.loai] += it.so;
        const cuoi = d.ky[d.ky.length - 1];
        if (['mo', 'niem', 'chuong'].includes(it.loai) && cuoi && cuoi.ten === ten && cuoi.loai === it.loai && (cuoi.nd || '') === (it.nd || '') && now - cuoi.t < 600000) {
          cuoi.so += it.so; cuoi.t = now;
        } else {
          d.ky.push({ t: now, ten, loai: it.loai, so: it.so, nd: it.nd || '' });
        }
        if (it.loai === 'hoadang') d.hoa.push({ t: now, ten: it.an ? '' : ten, loi: it.nd });
      });
      d.ky = d.ky.slice(-300); d.hoa = d.hoa.slice(-200);
      this.ghi(d);
      return this.state();
    },
    state() {
      const d = this.doc(), now = Date.now(), ngay = ngayVN(now), nguoi = {};
      Object.entries(d.tong).forEach(([khoa, so]) => {
        const [n, ten] = [khoa.slice(0, 10), khoa.slice(11)];
        nguoi[ten] = nguoi[ten] || { homnay: rong(), tatca: rong() };
        LOAI.forEach(k => { nguoi[ten].tatca[k] += so[k] || 0; if (n === ngay) nguoi[ten].homnay[k] += so[k] || 0; });
      });
      return {
        ok: true, homNay: ngay, nguoi,
        nhatKy: d.ky.slice(-40).reverse(),
        hoaDang: d.hoa.slice(-40).reverse(),
        nhang: d.ky.filter(k => k.loai === 'huong' && now - k.t < 30 * 60000),
        thu: true,
      };
    },
  };

  async function goi(payload) {
    const r = await fetch(URL_API, { method: 'POST', body: JSON.stringify(payload), redirect: 'follow' });
    if (!r.ok) throw new Error('Máy chủ trả lỗi ' + r.status);
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || 'Lỗi không rõ');
    return j;
  }

  return {
    thu: !URL_API,
    ngayVN,
    async state(ma) {
      if (!URL_API) return Thu.state();
      return goi({ action: 'state', ma });
    },
    async act(ma, ten, items) {
      if (!URL_API) return Thu.act(ten, items);
      return goi({ action: 'act', ma, ten, items });
    },
    async kiemTra(ma) {
      if (!URL_API) return { ok: true };
      return goi({ action: 'ping', ma });
    },
  };
})();
