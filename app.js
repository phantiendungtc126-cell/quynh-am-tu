(() => {
  const $ = id => document.getElementById(id);
  const LS = {
    lay(k, md) { try { const v = localStorage.getItem(k); return v === null ? md : JSON.parse(v); } catch (e) { return md; } },
    dat(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const NHAN = { huong: 'Bóng bay', mo: 'Nhún', chuong: 'Pháo giấy', niem: 'Bắn', kinh: 'Bài hát', hoadang: 'Điều ước', xam: 'Hộp quà', kem: 'Kem', nuoc: 'Nước', gap: 'Gắp thú' };
  const DEN = '<svg viewBox="0 0 34 34" class="den" aria-hidden="true"><path d="M17 22q-3 5 1 11" stroke="#888" stroke-width="1.2" fill="none"/><ellipse cx="17" cy="12" rx="9" ry="11" fill="#ff5d73"/><path d="M14.5 22.5h5l-2.5-2z" fill="#d93b55"/><ellipse cx="13.5" cy="8" rx="2.6" ry="3.6" fill="#fff" opacity=".7"/></svg>';

  // ---------- Danh tính ----------
  let ten = LS.lay('qat.ten', '');
  let ma = LS.lay('qat.ma', '');
  if (location.hash.startsWith('#ma=')) {
    ma = decodeURIComponent(location.hash.slice(4)); LS.dat('qat.ma', ma);
    history.replaceState(null, '', location.pathname + location.search);
  }

  // ---------- Trạng thái ----------
  let S = { nguoi: {}, nhatKy: [], hoaDang: [], nhang: [], homNay: Api.ngayVN(Date.now()) };
  let cho = LS.lay('qat.cho', []);   // việc chưa gửi lên sổ
  let dangGui = [];
  let pham = 'homnay';

  function themCho(loai, so, nd, an) {
    const cuoi = cho[cho.length - 1];
    if (['mo', 'niem', 'chuong', 'huong'].includes(loai) && cuoi && cuoi.loai === loai && (cuoi.nd || '') === (nd || '')) cuoi.so += so;
    else cho.push({ loai, so, nd: nd || '', an: !!an, t: Date.now() });
    LS.dat('qat.cho', cho);
    henGui();
    veLai();
  }

  let hen = null;
  function henGui(ngay) {
    clearTimeout(hen);
    hen = setTimeout(gui, ngay ? 0 : 6000);
  }
  async function gui() {
    if (dangGui.length || !cho.length || !ten) return;
    dangGui = cho; cho = []; LS.dat('qat.cho', cho);
    try {
      const ds = dangGui.map(({ loai, so, nd, an }) => ({ loai, so, nd, an }));
      S = await Api.act(ma, ten, ds);
      dangGui = [];
      veLai();
    } catch (e) {
      cho = dangGui.concat(cho); dangGui = []; LS.dat('qat.cho', cho);
      baoTin('Chưa gửi được điểm, sẽ thử lại: ' + e.message);
      if (/sai mã/i.test(e.message)) moHopVao(); else hen = setTimeout(gui, 20000);
    }
  }

  async function taiLai() {
    if (dangGui.length || !ten) return;
    try { S = await Api.state(ma); veLai(); }
    catch (e) {
      baoTin('Không tải được dữ liệu công viên: ' + e.message);
      if (/sai mã/i.test(e.message)) moHopVao();
    }
  }
  setInterval(() => { if (!document.hidden) taiLai(); }, 20000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) gui(); else taiLai(); });
  window.addEventListener('pagehide', gui);

  // Số của mình = số trên sổ + số chưa gửi
  function cuaToi(ph) {
    const goc = (S.nguoi[ten] && S.nguoi[ten][ph]) || {};
    const o = Object.assign({ huong: 0, mo: 0, chuong: 0, niem: 0, kinh: 0, hoadang: 0, xam: 0, kem: 0, nuoc: 0, gap: 0 }, goc);
    dangGui.concat(cho).forEach(it => { o[it.loai] = (o[it.loai] || 0) + it.so; });
    return o;
  }
  function bangNguoi(ph) {
    const ds = {};
    Object.entries(S.nguoi).forEach(([n, v]) => { ds[n] = Object.assign({}, v[ph]); });
    if (ten) ds[ten] = cuaToi(ph);
    return ds;
  }

  // ---------- Thông báo nhỏ ----------
  let henTin = null;
  function baoTin(s) {
    const el = $('trangThai'); el.textContent = s; el.classList.add('hien');
    clearTimeout(henTin); henTin = setTimeout(() => el.classList.remove('hien'), 3200);
  }

  function luc(t) {
    const p = Math.round((Date.now() - t) / 60000);
    if (p < 1) return 'vừa xong';
    if (p < 60) return p + ' phút trước';
    if (p < 24 * 60) return Math.round(p / 60) + ' giờ trước';
    const d = new Date(t);
    return d.getDate() + '/' + (d.getMonth() + 1);
  }
  const so = n => (n || 0).toLocaleString('vi-VN');

  // ---------- Vẽ lại giao diện ----------
  function veLai() {
    $('chao').textContent = (ten ? 'Chào ' + ten + ', chơi vui nhé!' : 'Chào bạn nhỏ!') + (Api.thu ? ' · chế độ thử' : '');
    const toi = cuaToi('homnay');
    $('demMo').textContent = so(toi.mo) + ' lần';

    // Nhang đang cháy (30 phút)
    const bay = Date.now();
    const ds = S.nhang.map(n => ({ ten: n.ten, t: n.t, so: n.so }));
    dangGui.concat(cho).filter(i => i.loai === 'huong').forEach(i => ds.push({ ten, t: i.t || bay, so: i.so }));
    const que = [];
    const ai = new Set();
    ds.forEach(n => { ai.add(n.ten); for (let i = 0; i < n.so; i++) que.push({ tuoi: Math.min(1, (bay - n.t) / 1800000) }); });
    Canh.datNhang(que);
    $('dangChay').textContent = que.length ? que.length + ' quả bóng bay đang bay' : 'Chưa có bóng bay nào';
    veSanKhau();

    // Bắn bong bóng
    $('soNiem').textContent = so(toi.niem);
    $('hatThu').textContent = (toi.niem % 100) + ' / 100 · ' + Math.floor(toi.niem / 100) + ' pháo hoa';
    $('niemHomNay').textContent = so(toi.niem);
    const homNay = bangNguoi('homnay');
    $('niemNhom').textContent = so(Object.values(homNay).reduce((a, v) => a + (v.niem || 0), 0));
    veChuoi(toi.niem);

    veCongDuc();
    veHoaDang();
    veQuay();
  }

  // ---------- Sân chơi: các bạn chibi, bảng Bé chăm chơi, thẻ tin ----------
  const tat = n => { const p = n.trim().split(/\s+/); return ((p.length > 1 ? p[p.length - 2][0] : '') + p[p.length - 1][0]).toUpperCase(); };
  const mauTen = n => { let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) % 360; return `hsl(${h} 45% 34%)`; };
  const diem = v => (v.huong || 0) * 3 + (v.mo || 0) + (v.chuong || 0) * 3 + (v.niem || 0) + (v.kinh || 0) * 50 + (v.hoadang || 0) * 10 + (v.kem || 0) * 5 + (v.nuoc || 0) * 5 + (v.gap || 0) * 10;
  const daThay = new Set();
  let lanDauTin = true;

  function vongTen(n) {
    const s = document.createElement('span'); s.className = 'vong-ten';
    s.textContent = tat(n); s.style.background = mauTen(n);
    return s;
  }

  function themTin(k) {
    const ol = $('dongTin');
    const li = document.createElement('li');
    const d = document.createElement('div');
    const b = document.createElement('b'); b.textContent = k.ten === ten ? k.ten + ' (bạn)' : k.ten;
    const sm = document.createElement('small'); sm.textContent = 'đã ' + moTa(k);
    d.append(b, sm); li.append(vongTen(k.ten), d);
    ol.prepend(li);
    while (ol.children.length > 3) ol.lastChild.remove();
    setTimeout(() => li.remove(), 8200);
  }

  function veSanKhau() {
    if (window.LIVE && LIVE.bat) { Canh.datNguoi([]); LIVE.ve(); return; }   // chế độ live tự vẽ bảng và người
    const tatCa = bangNguoi('tatca'), homNay = bangNguoi('homnay');
    const bay = Date.now();
    const gan = new Set(S.nhatKy.filter(k => bay - k.t < 15 * 60000).map(k => k.ten));
    if (ten) gan.add(ten);
    const ds = Object.keys(tatCa)
      .sort((a, b) => (b === ten) - (a === ten) || (gan.has(b) - gan.has(a)) || diem(tatCa[b]) - diem(tatCa[a]))
      .map(n => ({ ten: n, toi: n === ten, gan: gan.has(n) && n !== ten }));
    Canh.datNguoi(ds);
    const khac = [...gan].filter(n => n !== ten).length;
    $('dangTrongChua').textContent = khac ? khac + ' bạn đang chơi' : 'Công viên đang mở';
    // bảng vàng hôm nay
    const top = Object.entries(homNay).map(([n, v]) => [n, diem(v)]).filter(r => r[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const ol = $('bangVang'); ol.replaceChildren();
    if (!top.length) { const li = document.createElement('li'); li.className = 'trong-bv'; li.textContent = 'Chưa ai chơi hôm nay'; ol.append(li); }
    top.forEach(([n, d], i) => {
      const li = document.createElement('li');
      const s = document.createElement('span'); s.className = 'hang-so'; s.textContent = i + 1;
      const t = document.createElement('span'); t.className = 'ten-bv'; t.textContent = n;
      const p = document.createElement('span'); p.className = 'diem'; p.textContent = so(d);
      li.append(s, vongTen(n), t, p); ol.append(li);
    });
    // thẻ tin: việc mới của người khác từ lần tải trước
    const moi = [];
    S.nhatKy.forEach(k => {
      const khoa = k.ten + '|' + k.loai + '|' + k.t;
      if (daThay.has(khoa)) return;
      daThay.add(khoa);
      if (k.ten === ten && !lanDauTin) return;          // việc của mình đã hiện lúc bấm
      if (bay - k.t < (lanDauTin ? 30 : 5) * 60000) moi.push(k);
    });
    moi.slice(0, lanDauTin ? 2 : 3).reverse().forEach((k, i) => setTimeout(() => {
      themTin(k);
      if (k.loai === 'huong') Canh.diDangHuong(k.ten); else Canh.lay(k.ten);
      if (k.loai === 'kem' || k.loai === 'nuoc') { const ai = (k.nd || '').split('|')[1]; Canh.camMon(ai || k.ten, HINH_MON[k.loai]); if (ai) Canh.lay(ai); }
      if (k.loai === 'gap') Canh.camMon(k.ten, hinhThu(k.nd));
    }, i * 900));
    lanDauTin = false;
  }

  function veCongDuc() {
    const ds = bangNguoi(pham);
    const hang = Object.entries(ds)
      .map(([n, v]) => ({ n, v, tong: Object.values(v).reduce((a, b) => a + b, 0) }))
      .filter(r => r.tong > 0 || r.n === ten)
      .sort((a, b) => b.tong - a.tong);
    const cong = k => hang.reduce((a, r) => a + (r.v[k] || 0), 0);
    const tn = $('tongNhom'); tn.replaceChildren();
    [['Lần bắn', cong('niem')], ['Lần nhún', cong('mo')], ['Bóng bay', cong('huong')]].forEach(([nh, s]) => {
      const d = document.createElement('div');
      d.innerHTML = '<p class="nhan"></p><p class="so"></p>';
      d.children[0].textContent = nh; d.children[1].textContent = so(s);
      tn.append(d);
    });
    const tb = $('bangCongDuc').tBodies[0]; tb.replaceChildren();
    const cot = ['huong', 'mo', 'chuong', 'niem', 'kinh', 'hoadang', 'kem', 'nuoc', 'gap'];
    const max = {}; cot.forEach(k => max[k] = Math.max(...hang.map(r => r.v[k] || 0)));
    if (!hang.length) {
      const tr = tb.insertRow(); const td = tr.insertCell(); td.colSpan = 10; td.className = 'trong';
      td.textContent = 'Chưa ai có ngôi sao. Thả quả bóng bay đầu tiên ở Công viên nhé!';
    }
    hang.forEach(r => {
      const tr = tb.insertRow();
      const c0 = tr.insertCell(); c0.textContent = r.n === ten ? r.n + ' (bạn)' : r.n;
      cot.forEach(k => {
        const c = tr.insertCell(), v = r.v[k] || 0;
        c.textContent = v ? so(v) : '·';
        if (!v) c.className = 'khong'; else if (v === max[k] && hang.length > 1) c.className = 'toi';
      });
    });
    // Nhật ký
    const nk = $('nhatKy'); nk.replaceChildren();
    if (!S.nhatKy.length) {
      const li = document.createElement('li'); li.className = 'trong'; li.textContent = 'Nhật ký còn trống.'; nk.append(li);
    }
    S.nhatKy.forEach(k => {
      const li = document.createElement('li');
      const p = document.createElement('span');
      const b = document.createElement('b'); b.textContent = k.ten;
      p.append(b, ' ' + moTa(k));
      const l = document.createElement('span'); l.className = 'luc'; l.textContent = luc(k.t);
      li.append(p, l); nk.append(li);
    });
  }

  function moTa(k) {
    switch (k.loai) {
      case 'huong': return 'thả ' + k.so + ' quả bóng bay';
      case 'mo': return 'nhún nhảy ' + so(k.so) + ' lần';
      case 'chuong': return 'bắn ' + k.so + ' tràng pháo giấy';
      case 'niem': return 'bắn ' + so(k.so) + ' ' + (k.nd || 'bong bóng');
      case 'kinh': return 'hát xong ' + (k.nd || 'một bài');
      case 'hoadang': return 'gửi một điều ước';
      case 'xam': return 'mở được ' + (k.nd || 'một hộp quà');
      case 'kem': { const [m, ai] = (k.nd || 'kem|').split('|'); return ai ? 'mời ' + ai + ' một que ' + m : 'ăn một que ' + m; }
      case 'nuoc': { const [m, ai] = (k.nd || 'nước|').split('|'); return ai ? 'mời ' + ai + ' một ly ' + m : 'uống một ly ' + m; }
      case 'gap': return 'gắp được ' + hinhThu(k.nd) + ' ' + (k.nd || 'một chú thú bông');
      default: return k.loai;
    }
  }

  function veHoaDang() {
    const ol = $('dsHoaDang'); ol.replaceChildren();
    const ds = cho.concat(dangGui).filter(i => i.loai === 'hoadang').map(i => ({ t: i.t, ten: i.an ? '' : ten, loi: i.nd })).concat(S.hoaDang);
    if (!ds.length) {
      const li = document.createElement('p'); li.className = 'trong';
      li.textContent = 'Bầu trời còn trống. Viết điều ước đầu tiên rồi thả bóng bay nhé!';
      ol.append(li); return;
    }
    ds.forEach(h => {
      const li = document.createElement('li');
      li.innerHTML = DEN + '<div><p class="loi"></p><p class="ai"></p></div>';
      li.querySelector('.loi').textContent = h.loi;
      li.querySelector('.ai').textContent = (h.ten || 'Một bạn nhỏ') + ' · ' + luc(h.t);
      ol.append(li);
    });
  }

  // ---------- Chuỗi hạt ----------
  const cvC = $('chuoiHat'), gC = cvC.getContext('2d');
  function veChuoi(n) {
    const r = cvC.getBoundingClientRect(), tl = Math.min(devicePixelRatio || 1, 2);
    if (!r.width) return;
    if (cvC.width !== Math.round(r.width * tl)) { cvC.width = Math.round(r.width * tl); cvC.height = Math.round(r.height * tl); }
    const w = r.width, cx = w / 2, R = w * 0.42, SO = 24;
    const MAU = ['#ff5d73', '#ff9f43', '#ffd23f', '#5bd36b', '#3db7ff', '#7b6cff', '#ff7ec8'];
    gC.setTransform(tl, 0, 0, tl, 0, 0); gC.clearRect(0, 0, w, w);
    const vi = n % 100;
    // nền tròn kẹo và vòng tiến độ cầu vồng
    const nen = gC.createRadialGradient(cx - w * 0.1, cx - w * 0.12, w * 0.05, cx, cx, R * 0.85);
    nen.addColorStop(0, '#ffffff'); nen.addColorStop(1, '#e9f6ff');
    gC.fillStyle = nen; gC.beginPath(); gC.arc(cx, cx, R * 0.8, 0, Math.PI * 2); gC.fill();
    gC.lineCap = 'round'; gC.lineWidth = w * 0.05;
    gC.strokeStyle = 'rgba(120,170,220,0.2)'; gC.beginPath(); gC.arc(cx, cx, R, 0, Math.PI * 2); gC.stroke();
    if (vi) {
      const tg = gC.createConicGradient ? gC.createConicGradient(-Math.PI / 2, cx, cx) : null;
      if (tg) MAU.forEach((m, i) => tg.addColorStop(i / (MAU.length - 1), m));
      gC.strokeStyle = tg || '#ff7ec8';
      gC.beginPath(); gC.arc(cx, cx, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * vi / 100); gC.stroke();
    }
    // vòng bong bóng xoay theo số lần bắn
    const lech = (n % SO) * (Math.PI * 2 / SO);
    for (let i = 0; i < SO; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / SO - lech;
      const x = cx + Math.cos(a) * R, y = cx + Math.sin(a) * R;
      const dinh = i === 0;
      const r = w * (dinh ? 0.05 : 0.036), m = MAU[(i + n) % MAU.length];
      gC.fillStyle = 'rgba(40,80,140,0.18)';
      gC.beginPath(); gC.ellipse(x + r * 0.25, y + r * 0.5, r * 0.95, r * 0.6, 0, 0, Math.PI * 2); gC.fill();
      const gr = gC.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.08, x, y, r);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.25, m); gr.addColorStop(1, m + 'aa');
      gC.fillStyle = gr;
      gC.beginPath(); gC.arc(x, y, r, 0, Math.PI * 2); gC.fill();
      gC.fillStyle = 'rgba(255,255,255,0.8)';
      gC.beginPath(); gC.ellipse(x - r * 0.38, y - r * 0.42, r * 0.24, r * 0.15, -0.6, 0, Math.PI * 2); gC.fill();
    }
  }
  new ResizeObserver(() => veChuoi(cuaToi('homnay').niem)).observe(cvC);

  function nutNhanh(el, fn) {
    el.addEventListener('pointerdown', e => { if (e.button === 0) { e.preventDefault(); fn(); } });
    el.addEventListener('click', e => { if (e.detail === 0) fn(); });
  }

  nutNhanh($('nutNiem'), () => {
    const cau = $('cauNiem').value;
    themCho('niem', 1, cau);
    Am.hat();
    const n = cuaToi('homnay').niem;
    if (n % 100 === 0) { Am.chuong(); Canh.chuong(); baoTin('Giỏi quá! Đủ 100 quả rồi, pháo hoa nè!'); }
    const b = $('nutNiem'); b.classList.remove('nhay'); void b.offsetWidth; b.classList.add('nhay');
    if (navigator.vibrate) navigator.vibrate(8);
  });
  $('cauNiem').value = LS.lay('qat.cau2', 'bong bóng');
  $('cauNiem').addEventListener('change', e => {
    LS.dat('qat.cau2', e.target.value);
    Am.Tung.cauNiem = e.target.value;
    if (Am.Tung.chay && Am.Tung.bai === 'niem') Am.Tung.batDau({ bai: 'niem' });
  });
  Am.Tung.cauNiem = $('cauNiem').value;

  // ---------- Công viên ----------
  function nghi(el, ms) { el.disabled = true; setTimeout(() => el.disabled = false, ms); }
  $('nutHuong').addEventListener('click', e => {
    themCho('huong', 3); Canh.huong(); nghi(e.currentTarget, 2500);
    Canh.diDangHuong(ten); themTin({ ten, loai: 'huong', so: 3 });
    baoTin('Vút! 3 quả bóng bay đã bay lên trời.');
  });
  nutNhanh($('nutMo'), () => { themCho('mo', 1); Am.mo(); Canh.mo(); });
  $('nutChuong').addEventListener('click', e => { themCho('chuong', 1); Am.chuong(); Canh.chuong(); nghi(e.currentTarget, 3000); });
  $('gioTuChung').textContent = (window.CHUA && CHUA.GIO_TU_CHUNG) || 'Nhóm chưa hẹn giờ';
  // chạm thẳng vào mặt trời, ngựa gỗ trong cảnh
  Canh.onCham = vat => {
    if (vat === 'mo') { themCho('mo', 1); Am.mo(); Canh.mo(); }
    if (vat === 'chuong' && !$('nutChuong').disabled) { themCho('chuong', 1); Am.chuong(); Canh.chuong(); nghi($('nutChuong'), 3000); }
    if (vat === 'cuahang') di('cuahang');
    if (vat === 'gap') { di('cuahang'); setTimeout(() => $('mayGap').scrollIntoView({ block: 'center' }), 50); }
  };

  // ---------- Hộp quà bất ngờ ----------
  $('nutXam').addEventListener('click', () => {
    const hop = $('hopXam'), ong = $('ongXam');
    $('noiDungXam').innerHTML = '<p class="que-ban" style="text-align:center">Hộp quà đang rung rinh… trong đó là gì nhỉ?</p>';
    ong.className = 'hop-qua';
    hop.showModal();
    void ong.offsetWidth; ong.classList.add('lac'); Am.lacXam();
    setTimeout(() => {
      const q = QUA[Math.floor(Math.random() * QUA.length)];
      ong.classList.add('ra');
      const nd = $('noiDungXam');
      nd.innerHTML = '<p class="qua-hinh" aria-hidden="true"></p><p class="que-so"></p><p class="que-bac"></p><p class="que-tho"></p><p class="que-ban"></p>';
      nd.children[0].textContent = q.hinh;
      nd.children[1].textContent = q.so;
      nd.children[2].textContent = q.bac;
      nd.children[3].innerHTML = q.tho.map(l => l.replace(/[&<>]/g, '')).join('<br>');
      nd.children[4].textContent = 'Việc nhỏ hôm nay: ' + q.ban;
      themCho('xam', 1, q.so.toLowerCase());
      Canh.chuong();
    }, 1250);
  });

  // ---------- Hát cùng bé ----------
  const kinhEl = $('kinh');
  const chu = [];
  (function dungKinh() {
    const them = (s, lop) => {
      const p = document.createElement('p'); if (lop) p.className = lop;
      s.split(' ').forEach((tu, i) => {
        if (i) p.append(' ');
        const sp = document.createElement('span'); sp.className = 'chu'; sp.textContent = tu;
        sp.dataset.i = chu.length; chu.push(sp); p.append(sp);
      });
      kinhEl.append(p);
    };
    them(KINH.ten, 'ten-kinh');
    KINH.doan.forEach(d => them(d));
    const ghi = document.createElement('p'); ghi.className = 'ghi';
    ghi.textContent = 'Chạm vào một chữ để hát từ chữ đó.';
    kinhEl.append(ghi);
  })();
  // Tiếng hát do Am.Tung phát; chữ đang hát sáng lên theo từng tiếng trống.
  const T = Am.Tung;
  let viTri = 0, dangChu = -1, tungGhi = false, khoaMan = null;
  const nhipEl = $('nhipMo');
  nhipEl.value = T.nhip; $('nhipSo').textContent = T.nhip;
  nhipEl.addEventListener('input', () => { $('nhipSo').textContent = nhipEl.value; T.datNhip(+nhipEl.value); });
  kinhEl.addEventListener('click', e => {
    const sp = e.target.closest('span.chu'); if (!sp) return;
    viTri = +sp.dataset.i; dangChu = -1; danhDau(viTri);
    if (tungGhi) batTung();
  });
  function danhDau(den) {
    chu.forEach((s, i) => { s.classList.toggle('da', i < den); s.classList.toggle('dang', i === dangChu); });
  }
  async function batTung() {
    if (viTri >= chu.length) viTri = 0;
    tungGhi = true; $('nutTung').textContent = 'Dừng';
    try { navigator.wakeLock && navigator.wakeLock.request('screen').then(k => khoaMan = k).catch(() => {}); } catch (e) {}
    try { await T.batDau({ bai: 'kinh', tuChu: viTri, ghiCong: true }); capNhatMay(); }
    catch (e) { tungGhi = false; $('nutTung').textContent = 'Bắt đầu'; baoTin('Chưa tải được tiếng hát: ' + e.message); }
  }
  function dungTung() {
    tungGhi = false; T.dung(); $('nutTung').textContent = 'Bắt đầu';
    if (khoaMan) { khoaMan.release().catch(() => {}); khoaMan = null; }
    dangChu = -1; danhDau(viTri);
  }
  $('nutTung').addEventListener('click', () => { tungGhi && T.chay ? dungTung() : batTung(); });
  T.nghe(b => {
    if (b.kinhI !== undefined) {
      dangChu = b.kinhI; viTri = b.kinhI + 1; danhDau(b.kinhI);
      $('mayDong').textContent = 'Bài Hát Cầu Vồng · chữ ' + (b.kinhI + 1) + '/' + chu.length;
      const gian = $('t-kinh');
      if (!gian.hidden) {
        const sp = chu[b.kinhI], r = sp.getBoundingClientRect();
        if (r.top < 90 || r.bottom > innerHeight - 170) sp.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    }
    if (b.tenBai && !(tungGhi && T.bai === 'kinh')) $('mayDong').textContent = '♪ ' + b.tenBai;
    if (b.xongKinh) {
      viTri = 0; dangChu = -1; danhDau(0);
      if (tungGhi) {
        themCho('kinh', 1, 'Bài Hát Cầu Vồng');
        baoTin('Hát hay quá! Bé được thêm một ngôi sao.');
        tungGhi = false; $('nutTung').textContent = 'Bắt đầu';
        if (khoaMan) { khoaMan.release().catch(() => {}); khoaMan = null; }
      }
    }
    if (b.dung || b.batDau) capNhatMay();
  });

  // ---------- Thanh phát nhạc nhỏ ----------
  const chonBai = $('chonBai'), amLuongEl = $('amLuong');
  chonBai.value = T.bai === 'kinh' || T.bai === 'niem' ? T.bai : 'thoikinh';
  amLuongEl.value = T.amLuong;
  let tuPhat = LS.lay('qat.tuphat', true);
  function capNhatMay() {
    $('mayKinh').classList.toggle('dang-phat', T.chay);
    $('nutPhat').setAttribute('aria-label', T.chay ? 'Tạm dừng nhạc' : 'Phát nhạc');
    if (!T.chay) $('mayDong').textContent = 'Bấm ▶ để nghe nhạc';
  }
  async function phatNen() {
    tungGhi = false; $('nutTung').textContent = 'Bắt đầu';
    T.cauNiem = $('cauNiem').value;
    $('mayDong').textContent = 'Đang tải nhạc…';
    try { await T.batDau({ bai: chonBai.value }); }
    catch (e) { baoTin('Chưa tải được tiếng hát: ' + e.message); }
    capNhatMay();
  }
  $('nutPhat').addEventListener('click', () => { T.chay ? (T.dung(), dungTung()) : phatNen(); });
  $('nutTiep').addEventListener('click', async () => {
    tungGhi = false; $('nutTung').textContent = 'Bắt đầu';
    chonBai.value = 'thoikinh';
    try { await T.baiTiep(); } catch (e) { baoTin('Chưa phát được nhạc: ' + e.message); }
    capNhatMay();
  });
  chonBai.addEventListener('change', () => { if (T.chay) phatNen(); });
  amLuongEl.addEventListener('input', () => T.datAmLuong(+amLuongEl.value));
  // Trình duyệt chỉ cho phát tiếng sau lần chạm đầu tiên
  function chamDau(e) {
    document.removeEventListener('pointerdown', chamDau, true);
    document.removeEventListener('keydown', chamDau, true);
    const trongMay = e && e.target && e.target.closest && e.target.closest('#mayKinh');
    if (tuPhat && !T.chay && !trongMay) phatNen();
  }
  if (tuPhat) {
    document.addEventListener('pointerdown', chamDau, true);
    document.addEventListener('keydown', chamDau, true);
    $('mayDong').textContent = 'Chạm màn hình để nghe nhạc';
  } else capNhatMay();

  // ---------- Điều ước ----------
  const loi = $('loiNguyen');
  loi.addEventListener('input', () => { $('demChu').textContent = loi.value.length + '/200'; });
  $('formHoaDang').addEventListener('submit', e => {
    e.preventDefault();
    const s = loi.value.trim();
    if (!s) { baoTin('Viết điều ước trước khi thả bóng bay nhé.'); loi.focus(); return; }
    themCho('hoadang', 1, s, $('anTen').checked);
    henGui(true);
    loi.value = ''; $('demChu').textContent = '0/200';
    const d = document.createElement('div'); d.className = 'den-troi'; d.innerHTML = DEN.replace('class="den"', 'width="56" height="56"');
    document.body.append(d); setTimeout(() => d.remove(), 4600);
    Am.chuong();
    baoTin('Bóng bay đã bay! Các bạn sẽ thấy điều ước của bé.');
  });

  // ---------- Cửa hàng: kem, nước, gắp thú ----------
  const HINH_MON = { kem: '🍦', nuoc: '🥤' };
  const THU = [['🧸', 'gấu bông'], ['🐰', 'thỏ bông'], ['🐶', 'cún bông'], ['🐼', 'gấu trúc'], ['🦊', 'cáo nhỏ'], ['🐸', 'ếch xanh'], ['🐥', 'gà con'], ['🐙', 'bạch tuộc'], ['🦄', 'kỳ lân'], ['🐳', 'cá voi']];
  function hinhThu(ten) { const t = THU.find(x => x[1] === ten); return t ? t[0] : '🧸'; }

  function chonRadio(nhom) {
    nhom.addEventListener('click', e => {
      const b = e.target.closest('button[role=radio]'); if (!b) return;
      nhom.querySelectorAll('button[role=radio]').forEach(x => x.setAttribute('aria-checked', x === b));
    });
  }
  chonRadio($('chonKem')); chonRadio($('chonNuoc'));
  const monDangChon = id => ($(id).querySelector('[aria-checked=true]') || {}).dataset?.mon;

  function capNhatChoAi() {
    const ds = Object.keys(bangNguoi('tatca')).filter(n => n !== ten).sort((a, b) => a.localeCompare(b, 'vi'));
    ['choAiKem', 'choAiNuoc'].forEach(id => {
      const el = $(id), cu = el.value;
      el.replaceChildren();
      const o0 = document.createElement('option'); o0.value = ''; o0.textContent = 'Cho mình'; el.append(o0);
      ds.forEach(n => { const o = document.createElement('option'); o.value = n; o.textContent = 'Mời ' + n; el.append(o); });
      if ([...el.options].some(o => o.value === cu)) el.value = cu;
    });
  }

  function muaMon(loai, mon, ai, nut) {
    if (!mon) return;
    themCho(loai, 1, mon + (ai ? '|' + ai : ''));
    Canh.camMon(ai || ten, HINH_MON[loai]); Canh.lay(ai || ten);
    themTin({ ten, loai, so: 1, nd: mon + (ai ? '|' + ai : '') });
    Am.hat(); setTimeout(() => Am.hat(), 120);
    nghi(nut, 1500);
    baoTin(ai ? 'Đã mời ' + ai + ' ' + (loai === 'kem' ? 'một que ' : 'một ly ') + mon + '!' : 'Ngon quá! ' + mon[0].toUpperCase() + mon.slice(1) + ' của bé đây.');
    const bieu = nut.closest('.quay').querySelector('.quay-bieu');
    bieu.classList.remove('nay'); void bieu.offsetWidth; bieu.classList.add('nay');
  }
  $('nutKem').addEventListener('click', e => muaMon('kem', monDangChon('chonKem'), $('choAiKem').value, e.currentTarget));
  $('nutNuoc').addEventListener('click', e => muaMon('nuoc', monDangChon('chonNuoc'), $('choAiNuoc').value, e.currentTarget));

  function veQuay() {
    const homNay = bangNguoi('homnay');
    const cong = k => Object.values(homNay).reduce((a, v) => a + (v[k] || 0), 0);
    $('demKem').textContent = 'Hôm nay cả nhóm ăn ' + so(cong('kem')) + ' que';
    $('demNuoc').textContent = 'Hôm nay cả nhóm uống ' + so(cong('nuoc')) + ' ly';
    $('demGap').textContent = 'Hôm nay cả nhóm gắp được ' + so(cong('gap')) + ' con';
    const ol = $('nhatKyQuay'); ol.replaceChildren();
    const ds = dangGui.concat(cho).filter(i => ['kem', 'nuoc', 'gap'].includes(i.loai)).map(i => ({ ten, loai: i.loai, so: i.so, nd: i.nd, t: i.t }))
      .reverse().concat(S.nhatKy.filter(k => ['kem', 'nuoc', 'gap'].includes(k.loai))).slice(0, 12);
    if (!ds.length) { const li = document.createElement('li'); li.className = 'trong'; li.textContent = 'Quầy chưa bán gì. Lấy que kem đầu tiên nhé!'; ol.append(li); }
    ds.forEach(k => {
      const li = document.createElement('li'), p = document.createElement('span'), b = document.createElement('b');
      b.textContent = k.ten; p.append(b, ' ' + moTa(k));
      const l = document.createElement('span'); l.className = 'luc'; l.textContent = luc(k.t || Date.now());
      li.append(p, l); ol.append(li);
    });
    capNhatChoAi();
  }

  // máy gắp thú
  const Gap = (() => {
    const cv = $('cvGap'), g = cv.getContext('2d');
    let W = 0, H = 0, chay = false, thu = [], cang = { x: 0, y: 0, mo: 1, tt: 'chay', om: null }, t0 = 0, tg = 0;
    const rnd = (a, b) => a + Math.random() * (b - a);
    function doCo() {
      const r = cv.getBoundingClientRect(), tl = Math.min(devicePixelRatio || 1, 2);
      if (!r.width) return;
      W = r.width; H = r.height; cv.width = Math.round(W * tl); cv.height = Math.round(H * tl);
      g.setTransform(tl, 0, 0, tl, 0, 0);
      if (!thu.length) for (let i = 0; i < 9; i++) thu.push(thuMoi());
    }
    function thuMoi() {
      const [h, ten] = THU[(Math.random() * THU.length) | 0];
      return { h, ten, x: rnd(0.3, 0.92), y: rnd(0.72, 0.9), q: rnd(-0.4, 0.4), s: rnd(0.9, 1.1) };
    }
    function ve(t) {
      const day = H * 0.82;
      // nền kính
      const bg = g.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#d9f1ff'); bg.addColorStop(1, '#ffe3f1');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#ffffff55' : '#ffffff22'; g.fillRect(i * W / 6, 0, W / 12, H); }
      // cửa nhận thú
      g.fillStyle = '#7b6cff'; g.fillRect(0, day - 4, W * 0.22, H - day + 4);
      g.fillStyle = '#4b3fb0'; g.fillRect(W * 0.03, day + 4, W * 0.16, H - day - 10);
      g.fillStyle = '#fff'; g.font = `800 ${Math.round(H * 0.06)}px 'Baloo 2', sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('NHẬN', W * 0.11, day + (H - day) / 2);
      // đống thú
      g.fillStyle = '#ffd6e8'; g.beginPath(); g.ellipse(W * 0.62, day + 10, W * 0.42, H * 0.1, 0, 0, Math.PI * 2); g.fill();
      const co = Math.min(W, H) * 0.13;
      g.font = `${Math.round(co)}px serif`;
      thu.slice().sort((a, b) => a.y - b.y).forEach(x => {
        if (x === cang.om) return;
        g.save(); g.translate(x.x * W, x.y * H); g.rotate(x.q); g.scale(x.s, x.s); g.fillText(x.h, 0, 0); g.restore();
      });
      // thanh ray và càng
      g.fillStyle = '#9aa6c4'; g.fillRect(0, 6, W, 6);
      const cx = cang.x * W, cy = cang.y * H;
      g.strokeStyle = '#6b7aa6'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, 12); g.lineTo(cx, cy); g.stroke();
      g.fillStyle = '#ff5d73'; g.beginPath(); g.roundRect ? g.roundRect(cx - 14, cy - 8, 28, 14, 6) : g.rect(cx - 14, cy - 8, 28, 14); g.fill();
      g.strokeStyle = '#6b7aa6'; g.lineWidth = 3; g.lineCap = 'round';
      const mo = cang.mo * 10 + 3;
      g.beginPath(); g.moveTo(cx - 8, cy + 4); g.quadraticCurveTo(cx - 8 - mo, cy + 18, cx - 4, cy + 28); g.stroke();
      g.beginPath(); g.moveTo(cx + 8, cy + 4); g.quadraticCurveTo(cx + 8 + mo, cy + 18, cx + 4, cy + 28); g.stroke();
      if (cang.om) { g.font = `${Math.round(co)}px serif`; g.fillText(cang.om.h, cx, cy + 34); }
    }
    function buoc(t) {
      if (!chay) return;
      const dt = Math.min(50, t - (tg || t)); tg = t;
      if (!W) doCo();
      if (cang.tt === 'chay') { t0 += dt; cang.x = 0.3 + 0.3 * (1 + Math.sin(t0 * 0.0016)); cang.y = 0.12; cang.mo = 1; }
      else if (cang.tt === 'ha') { cang.y += dt * 0.0007; if (cang.y >= 0.62) { cang.tt = 'kep'; cang.dem = 0; } }
      else if (cang.tt === 'kep') {
        cang.mo = Math.max(0, cang.mo - dt * 0.004); cang.dem += dt;
        if (cang.dem > 400) {
          const gan = thu.filter(x => Math.abs(x.x - cang.x) < 0.09).sort((a, b) => Math.abs(a.x - cang.x) - Math.abs(b.x - cang.x))[0];
          cang.om = gan && Math.random() < (Math.abs(gan.x - cang.x) < 0.05 ? 0.8 : 0.45) ? gan : null;
          cang.tt = 'len';
        }
      } else if (cang.tt === 'len') {
        cang.y -= dt * 0.0007;
        if (cang.om && Math.random() < 0.0006 * dt) { cang.om = null; xong(false, true); }
        if (cang.y <= 0.12) { cang.y = 0.12; cang.tt = cang.om ? 've' : 'chay'; if (!cang.om && cang.tt === 'chay' && !cang.daBao) xong(false); }
      } else if (cang.tt === 've') {
        cang.x -= dt * 0.0006;
        if (cang.x <= 0.11) { cang.tt = 'tha'; cang.dem = 0; }
      } else if (cang.tt === 'tha') {
        cang.mo = Math.min(1, cang.mo + dt * 0.004); cang.dem += dt;
        if (cang.dem > 300) { const x = cang.om; thu = thu.filter(v => v !== x); thu.push(thuMoi()); cang.om = null; xong(true, false, x); cang.tt = 'chay'; }
      }
      ve(t);
      requestAnimationFrame(buoc);
    }
    function xong(trung, roi, x) {
      cang.daBao = true;
      const nut = $('nutGap'); nut.disabled = false;
      if (trung) {
        themCho('gap', 1, x.ten);
        Canh.camMon(ten, x.h); Canh.lay(ten);
        themTin({ ten, loai: 'gap', so: 1, nd: x.ten });
        Am.chuong();
        $('gapGoiY').textContent = 'Giỏi quá! Bé gắp được ' + x.h + ' ' + x.ten + '!';
        baoTin('Gắp được ' + x.ten + ' rồi!');
      } else {
        Am.mo();
        $('gapGoiY').textContent = roi ? 'Ối, rơi mất rồi! Thử lại nhé.' : 'Hụt rồi, thử lại nhé!';
      }
    }
    $('nutGap').addEventListener('click', e => {
      if (cang.tt !== 'chay') return;
      cang.tt = 'ha'; cang.daBao = false; e.currentTarget.disabled = true;
      $('gapGoiY').textContent = 'Càng đang xuống…'; Am.hat();
    });
    new ResizeObserver(() => { W = 0; doCo(); }).observe(cv);
    return {
      batDau() { if (chay) return; chay = true; tg = 0; requestAnimationFrame(buoc); },
      dung() { chay = false; },
    };
  })();

  // ---------- Các gian ----------
  function di(tab) {
    document.querySelectorAll('.trang').forEach(s => s.hidden = s.dataset.tab !== tab);
    document.querySelectorAll('.duoi button').forEach(b => b.dataset.di === tab ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
    if (tab === 'chanhdien') Canh.batDau(); else Canh.dung();
    if (tab === 'cuahang') { Gap.batDau(); taiLai(); } else Gap.dung();
    if (tab === 'niem') requestAnimationFrame(() => veChuoi(cuaToi('homnay').niem));
    if (tab === 'congduc' || tab === 'hoadang') taiLai();
    LS.dat('qat.gian', tab);
    scrollTo(0, 0);
  }
  document.querySelectorAll('.duoi button').forEach(b => {
    b.addEventListener('click', () => di(b.dataset.di));
  });
  document.querySelectorAll('.chuyen button').forEach(b => b.addEventListener('click', () => {
    pham = b.dataset.pham;
    document.querySelectorAll('.chuyen button').forEach(x => x.setAttribute('aria-selected', x === b));
    veCongDuc();
  }));

  // ---------- Hộp vào công viên ----------
  function moHopVao() {
    const hop = $('hopVao');
    $('tenBan').value = ten;
    $('maChua').value = ma;
    $('khoiMa').hidden = Api.thu;
    $('batTieng').checked = Am.bat;
    $('tuPhat').checked = tuPhat;
    $('loiVao').textContent = Api.thu ? 'Đang chạy thử: điểm chỉ lưu trên máy này.' : '';
    if (!hop.open) hop.showModal();
  }
  $('nutCaiDat').addEventListener('click', moHopVao);
  $('batTieng').addEventListener('change', e => { if (e.target.checked !== Am.bat) Am.doi(); });
  $('tuPhat').addEventListener('change', e => { tuPhat = e.target.checked; LS.dat('qat.tuphat', tuPhat); });
  $('formVao').addEventListener('submit', async e => {
    e.preventDefault();
    const t = $('tenBan').value.trim().replace(/\s+/g, ' ');
    const m = $('maChua').value.trim();
    if (!t) { $('loiVao').textContent = 'Nhập tên để các bạn nhận ra bé nhé.'; return; }
    if (!Api.thu && !m) { $('loiVao').textContent = 'Nhập mã vào cổng. Mã có trong nhóm Zalo.'; return; }
    $('nutVao').disabled = true; $('loiVao').textContent = 'Đang mở cổng công viên…';
    try {
      await Api.kiemTra(m);
      ten = t; ma = m; LS.dat('qat.ten', ten); LS.dat('qat.ma', ma);
      $('hopVao').close();
      await taiLai(); gui();
    } catch (err) {
      $('loiVao').textContent = /mã/i.test(err.message) ? 'Mã vào cổng chưa đúng. Hỏi lại trong nhóm Zalo.' : 'Chưa vào được: ' + err.message;
    } finally { $('nutVao').disabled = false; }
  });
  $('hopVao').addEventListener('cancel', e => { if (!ten) e.preventDefault(); });

  // ---------- Khởi động ----------
  di(LS.lay('qat.gian', 'chanhdien'));
  veLai();
  if (!ten || (!Api.thu && !ma)) moHopVao();
  else { taiLai(); if (cho.length) henGui(true); }
})();
