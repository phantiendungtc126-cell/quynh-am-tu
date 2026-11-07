// Chế độ live TikTok: mở trang với ?live (thêm &demo để xem thử khi chưa live).
// Người xem tương tác thành nhân vật chibi mang tên TikTok; bình luận, tim, quà biến thành hành động trong công viên.
// Sự kiện tới từ "cầu nối" chạy trên máy (cong-cu/cau-noi-tiktok) qua WebSocket ws://localhost:8787.
(() => {
  const q = new URLSearchParams(location.search);
  if (!q.has('live')) return;
  const DEMO = q.has('demo');
  const WS = 'ws://' + (q.get('ws') || 'localhost:8787');

  // chạy trước app.js: không hỏi tên/mã (hộp vào cổng bị ẩn), không ghi vào Sổ ngôi sao
  try {
    localStorage.setItem('qat.gian', JSON.stringify('chanhdien'));
  } catch (e) {}
  document.documentElement.classList.add('che-do-live');

  const khach = new Map();          // tên hiển thị → { ten, diem, cuoi }
  const TOI_DA = 22;
  let goc = null, ketNoi = false, kenh = '', tongTim = 0, tongQua = 0;

  const boDau = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const THU = [['🧸', 'gấu bông'], ['🐰', 'thỏ bông'], ['🐶', 'cún bông'], ['🐼', 'gấu trúc'], ['🦊', 'cáo nhỏ'], ['🐸', 'ếch xanh'], ['🐥', 'gà con'], ['🦄', 'kỳ lân']];
  const KEM = ['kem dâu', 'kem sô-cô-la', 'kem vani', 'kem trà xanh', 'kem cầu vồng'];
  const NUOC = ['nước cam', 'sữa dâu', 'nước dừa', 'nước dưa hấu', 'chanh dây'];
  const chon = a => a[(Math.random() * a.length) | 0];

  function dsKhach() {
    return [...khach.values()].sort((a, b) => b.cuoi - a.cuoi).slice(0, TOI_DA).map(k => ({ ten: k.ten, toi: false, gan: Date.now() - k.cuoi < 60000 }));
  }
  function capNhatCanh() { if (goc) goc(dsKhach()); }

  function vao(ten) {
    ten = String(ten || 'Bạn xem').trim().slice(0, 24) || 'Bạn xem';
    let k = khach.get(ten);
    if (!k) {
      if (khach.size >= TOI_DA) {
        const cu = [...khach.values()].sort((a, b) => a.cuoi - b.cuoi)[0];
        if (cu) khach.delete(cu.ten);
      }
      k = { ten, diem: 0, cuoi: Date.now() }; khach.set(ten, k);
      capNhatCanh();
    }
    k.cuoi = Date.now();
    return k;
  }

  // ---------- thẻ tin và bảng ----------
  const mauTen = n => { let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) % 360; return `hsl(${h} 55% 45%)`; };
  const tat = n => { const p = n.trim().split(/\s+/); return ((p.length > 1 ? p[p.length - 2][0] : '') + p[p.length - 1][0]).toUpperCase(); };
  function tin(ten, viec) {
    const ol = document.getElementById('dongTin'); if (!ol) return;
    const li = document.createElement('li');
    const v = document.createElement('span'); v.className = 'vong-ten'; v.textContent = tat(ten); v.style.background = mauTen(ten);
    const d = document.createElement('div'), b = document.createElement('b'), sm = document.createElement('small');
    b.textContent = ten; sm.textContent = viec; d.append(b, sm); li.append(v, d);
    ol.prepend(li);
    while (ol.children.length > 3) ol.lastChild.remove();
    setTimeout(() => li.remove(), 8200);
  }
  let henBang = null;
  function veBang() {
    clearTimeout(henBang);
    henBang = setTimeout(() => {
      const ol = document.getElementById('bangVang'); if (!ol) return;
      const tieu = document.querySelector('.bang-vang-tieu'); if (tieu) tieu.textContent = 'Top bạn xem';
      ol.replaceChildren();
      const top = [...khach.values()].filter(k => k.diem > 0).sort((a, b) => b.diem - a.diem).slice(0, 3);
      if (!top.length) { const li = document.createElement('li'); li.className = 'trong-bv'; li.textContent = 'Bình luận để vào bảng!'; ol.append(li); }
      top.forEach((k, i) => {
        const li = document.createElement('li');
        const s = document.createElement('span'); s.className = 'hang-so'; s.textContent = i + 1;
        const v = document.createElement('span'); v.className = 'vong-ten'; v.textContent = tat(k.ten); v.style.background = mauTen(k.ten);
        const t = document.createElement('span'); t.className = 'ten-bv'; t.textContent = k.ten;
        const p = document.createElement('span'); p.className = 'diem'; p.textContent = k.diem.toLocaleString('vi-VN');
        li.append(s, v, t, p); ol.append(li);
      });
      const a = document.getElementById('dangTrongChua');
      if (a) a.textContent = ketNoi ? (kenh ? 'LIVE @' + kenh : 'Đang live') + ' · ' + khach.size + ' bạn chơi' : (DEMO ? 'Live thử (giả lập)' : 'Chưa nối cầu nối TikTok');
      const c = document.getElementById('dangChay');
      if (c) c.textContent = '❤ ' + tongTim.toLocaleString('vi-VN') + ' tim · 🎁 ' + tongQua + ' quà';
    }, 120);
  }

  // bảng cảm ơn lớn khi có quà
  function camOn(ten, qua, so) {
    const el = document.createElement('div'); el.className = 'cam-on-live';
    const a = document.createElement('b'); a.textContent = 'Cảm ơn ' + ten + '!';
    const b = document.createElement('span'); b.textContent = 'đã tặng ' + (so > 1 ? so + ' × ' : '') + (qua || 'quà');
    el.append(a, b);
    document.querySelector('.san-khau')?.append(el);
    setTimeout(() => el.remove(), 4200);
  }

  // ---------- xử lý sự kiện ----------
  let lanPhao = 0;
  function xuLy(e) {
    if (!e || !e.type) return;
    const ten = e.nick || e.user || 'Bạn xem';
    if (e.type === 'trangthai') { ketNoi = !!e.ok; kenh = e.kenh || kenh; veBang(); return; }
    if (e.type === 'join') { vao(ten); tin(ten, 'vào công viên'); veBang(); return; }
    const k = vao(ten);
    if (e.type === 'like') {
      const so = Math.max(1, +e.count || 1); tongTim += so; k.diem += so;
      Canh.thaTu(ten, Math.min(3, Math.ceil(so / 5)));
      veBang(); return;
    }
    if (e.type === 'gift') {
      const so = Math.max(1, +e.count || 1), xu = (+e.coins || 1) * so; tongQua += so; k.diem += xu * 10;
      Canh.camMon(ten, '🎁'); Canh.lay(ten);
      Canh.phaoHoa(xu >= 100 ? 4 : xu >= 10 ? 2 : 1); Canh.chuong(); Am.chuong();
      camOn(ten, e.gift, so); tin(ten, 'tặng ' + (so > 1 ? so + ' × ' : '') + (e.gift || 'quà'));
      veBang(); return;
    }
    if (e.type === 'follow') { k.diem += 20; Canh.lay(ten); Am.mo(); tin(ten, 'vừa theo dõi kênh 💖'); veBang(); return; }
    if (e.type === 'share') { k.diem += 20; Canh.lay(ten); Canh.thaTu(ten, 3); tin(ten, 'vừa chia sẻ live'); veBang(); return; }
    if (e.type !== 'chat') return;
    const chu = String(e.text || '').trim(); if (!chu) return;
    const b = boDau(chu); k.diem += 2;
    if (/\bkem\b/.test(b)) { const m = chon(KEM); Canh.camMon(ten, '🍦'); Canh.lay(ten); Am.hat(); tin(ten, 'ăn một que ' + m); }
    else if (/\b(nuoc|uong|tra sua|sua)\b/.test(b)) { const m = chon(NUOC); Canh.camMon(ten, '🥤'); Canh.lay(ten); Am.hat(); tin(ten, 'uống một ly ' + m); }
    else if (/\bgap\b/.test(b)) {
      if (Math.random() < 0.55) { const [h, t] = chon(THU); Canh.camMon(ten, h); Canh.lay(ten); Am.chuong(); tin(ten, 'gắp được ' + h + ' ' + t); }
      else { Am.mo(); tin(ten, 'gắp hụt, thử lại nào!'); Canh.noi(ten, 'Hụt rồi!'); }
    }
    else if (/\b(bong|bay)\b/.test(b)) { Canh.diDangHuong(ten); tin(ten, 'thả 3 quả bóng bay'); }
    else if (/\b(phao|phao giay|ban phao)\b/.test(b)) {
      if (Date.now() - lanPhao > 2500) { lanPhao = Date.now(); Canh.chuong(); Am.chuong(); }
      tin(ten, 'bắn pháo giấy');
    }
    else if (/\b(qua|hop qua)\b/.test(b)) { const x = chon(window.QUA || [{ hinh: '🎁', so: 'quà' }]); Canh.camMon(ten, x.hinh); Canh.lay(ten); Am.lacXam(); tin(ten, 'mở hộp quà được ' + x.so.toLowerCase()); }
    else if (/\b(nhay|nhun|dance|quay)\b/.test(b)) { Canh.lay(ten); Am.mo(); Canh.noi(ten, chu); }
    else { Canh.noi(ten, chu); if (/\b(hi|chao|hello|xin chao)\b/.test(b)) Canh.lay(ten); }
    veBang();
  }

  // ---------- kết nối cầu nối ----------
  function noiCauNoi() {
    let ws;
    try { ws = new WebSocket(WS); } catch (e) { setTimeout(noiCauNoi, 4000); return; }
    ws.onopen = () => { ketNoi = true; veBang(); };
    ws.onmessage = m => { try { const d = JSON.parse(m.data); (Array.isArray(d) ? d : [d]).forEach(xuLy); } catch (e) {} };
    ws.onclose = () => { ketNoi = false; veBang(); setTimeout(noiCauNoi, 3000); };
    ws.onerror = () => { try { ws.close(); } catch (e) {} };
  }

  // ---------- giả lập khi chưa live ----------
  function giaLap() {
    const TEN = ['Mèo Mun', 'Bé Na', 'Thỏ Ngọc', 'Bin Bin', 'Su Kem', 'Gấu Mập', 'Tôm Tít', 'Cốm Xanh', 'Bơ Bơ', 'Kẹo Dẻo', 'Mít Ướt', 'Sóc Nâu'];
    const CHAT = ['kem', 'nước', 'nhảy đi', 'gắp thú', 'bóng bay', 'pháo', 'quà', 'xin chào cả nhà', 'công viên đẹp quá', 'hi', 'mình thích cầu vồng', 'kem dâu nha', 'cho mình ly nước cam'];
    const QUA = [['Hoa hồng', 1], ['Kẹo mút', 5], ['Gấu bông', 10], ['Vương miện', 99], ['Pháo hoa', 199]];
    ketNoi = true; kenh = 'congviencauvong'; veBang();
    setInterval(() => {
      const ten = chon(TEN), r = Math.random();
      if (r < 0.55) xuLy({ type: 'chat', nick: ten, text: chon(CHAT) });
      else if (r < 0.8) xuLy({ type: 'like', nick: ten, count: 1 + (Math.random() * 8 | 0) });
      else if (r < 0.88) { const [g, c] = chon(QUA); xuLy({ type: 'gift', nick: ten, gift: g, coins: c, count: 1 }); }
      else if (r < 0.94) xuLy({ type: 'follow', nick: ten });
      else xuLy({ type: 'share', nick: ten });
    }, 1400);
  }

  // khởi động sau khi app.js chạy xong
  setTimeout(() => {
    goc = Canh.datNguoi.bind(Canh);
    Canh.datNguoi = () => goc(dsKhach());   // app.js gọi thì vẫn chỉ hiện người xem live
    window.LIVE = { bat: true, xuLy, ve: veBang };
    capNhatCanh(); veBang();
    const dong = document.getElementById('hopVao'); if (dong && dong.open) dong.close();
    // bản OBS/LIVE Studio cho phát tiếng không cần chạm; trình duyệt thường sẽ chờ lần chạm đầu
    try { if (Am.Tung && !Am.Tung.chay) Am.Tung.batDau({ bai: 'thoikinh' }); } catch (e) {}
    if (DEMO) giaLap(); else noiCauNoi();
    // người xem im lặng quá 10 phút thì rời công viên
    setInterval(() => { const han = Date.now() - 600000; let doi = false; khach.forEach((k, t) => { if (k.cuoi < han) { khach.delete(t); doi = true; } }); if (doi) { capNhatCanh(); veBang(); } }, 30000);
  }, 0);
})();
