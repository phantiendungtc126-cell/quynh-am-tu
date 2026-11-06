(() => {
  const $ = id => document.getElementById(id);
  const LS = {
    lay(k, md) { try { const v = localStorage.getItem(k); return v === null ? md : JSON.parse(v); } catch (e) { return md; } },
    dat(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const NHAN = { huong: 'Hương', mo: 'Mõ', chuong: 'Chuông', niem: 'Niệm', kinh: 'Kinh', hoadang: 'Hoa đăng', xam: 'Xăm' };
  const DEN = '<svg viewBox="0 0 34 34" class="den" aria-hidden="true"><path d="M5 22 Q17 30 29 22 L26 26 Q17 31 8 26Z" fill="#a87a32"/><path d="M8 22 Q10 10 17 6 Q24 10 26 22 Q17 26 8 22Z" fill="#f6f2ea" opacity=".95"/><path d="M17 6 Q14 14 13 23 M17 6 Q20 14 21 23" stroke="#e2b25c" fill="none" stroke-width="1"/><circle cx="17" cy="19" r="2.6" fill="#ffd98a"/></svg>';

  // ---------- Danh tính ----------
  let ten = LS.lay('qat.ten', '');
  let ma = LS.lay('qat.ma', '');
  if (location.hash.startsWith('#ma=')) {
    ma = decodeURIComponent(location.hash.slice(4)); LS.dat('qat.ma', ma);
    history.replaceState(null, '', location.pathname + location.search);
  }

  // ---------- Trạng thái ----------
  let S = { nguoi: {}, nhatKy: [], hoaDang: [], nhang: [], homNay: Api.ngayVN(Date.now()) };
  let cho = LS.lay('qat.cho', []);   // việc chưa gửi lên chùa
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
      baoTin('Chưa gửi được lên chùa, sẽ thử lại: ' + e.message);
      if (/mã vào chùa/i.test(e.message)) moHopVao(); else hen = setTimeout(gui, 20000);
    }
  }

  async function taiLai() {
    if (dangGui.length || !ten) return;
    try { S = await Api.state(ma); veLai(); }
    catch (e) {
      baoTin('Không tải được dữ liệu chùa: ' + e.message);
      if (/mã vào chùa/i.test(e.message)) moHopVao();
    }
  }
  setInterval(() => { if (!document.hidden) taiLai(); }, 20000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) gui(); else taiLai(); });
  window.addEventListener('pagehide', gui);

  // Số của mình = số trên chùa + số chưa gửi
  function cuaToi(ph) {
    const goc = (S.nguoi[ten] && S.nguoi[ten][ph]) || {};
    const o = Object.assign({ huong: 0, mo: 0, chuong: 0, niem: 0, kinh: 0, hoadang: 0, xam: 0 }, goc);
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
    $('chao').textContent = 'Nam Mô A Di Đà Phật' + (ten ? ', ' + ten : '') + (Api.thu ? ' · chế độ thử' : '');
    const toi = cuaToi('homnay');
    $('demMo').textContent = so(toi.mo) + ' tiếng';

    // Nhang đang cháy (30 phút)
    const bay = Date.now();
    const ds = S.nhang.map(n => ({ ten: n.ten, t: n.t, so: n.so }));
    dangGui.concat(cho).filter(i => i.loai === 'huong').forEach(i => ds.push({ ten, t: i.t || bay, so: i.so }));
    const que = [];
    const ai = new Set();
    ds.forEach(n => { ai.add(n.ten); for (let i = 0; i < n.so; i++) que.push({ tuoi: Math.min(1, (bay - n.t) / 1800000) }); });
    Canh.datNhang(que);
    if (que.length) {
      const ten3 = [...ai].map(n => n === ten ? 'bạn' : n);
      const chuoiTen = ten3.length > 3 ? ten3.slice(0, 3).join(', ') + ' và ' + (ten3.length - 3) + ' người nữa' : ten3.join(', ').replace(/, ([^,]*)$/, ' và $1');
      $('dangChay').textContent = 'Đang cháy ' + que.length + ' nén hương của ' + chuoiTen;
    } else $('dangChay').textContent = 'Lư hương đang chờ nén đầu tiên';

    // Niệm Phật
    $('soNiem').textContent = so(toi.niem);
    $('hatThu').textContent = 'hạt ' + (toi.niem % 108) + ' / 108 · ' + Math.floor(toi.niem / 108) + ' chuỗi';
    $('niemHomNay').textContent = so(toi.niem);
    const homNay = bangNguoi('homnay');
    $('niemNhom').textContent = so(Object.values(homNay).reduce((a, v) => a + (v.niem || 0), 0));
    veChuoi(toi.niem);

    veCongDuc();
    veHoaDang();
  }

  function veCongDuc() {
    const ds = bangNguoi(pham);
    const hang = Object.entries(ds)
      .map(([n, v]) => ({ n, v, tong: Object.values(v).reduce((a, b) => a + b, 0) }))
      .filter(r => r.tong > 0 || r.n === ten)
      .sort((a, b) => b.tong - a.tong);
    const cong = k => hang.reduce((a, r) => a + (r.v[k] || 0), 0);
    const tn = $('tongNhom'); tn.replaceChildren();
    [['Câu niệm Phật', cong('niem')], ['Tiếng mõ', cong('mo')], ['Nén hương', cong('huong')]].forEach(([nh, s]) => {
      const d = document.createElement('div');
      d.innerHTML = '<p class="nhan"></p><p class="so"></p>';
      d.children[0].textContent = nh; d.children[1].textContent = so(s);
      tn.append(d);
    });
    const tb = $('bangCongDuc').tBodies[0]; tb.replaceChildren();
    const cot = ['huong', 'mo', 'chuong', 'niem', 'kinh', 'hoadang'];
    const max = {}; cot.forEach(k => max[k] = Math.max(...hang.map(r => r.v[k] || 0)));
    if (!hang.length) {
      const tr = tb.insertRow(); const td = tr.insertCell(); td.colSpan = 7; td.className = 'trong';
      td.textContent = 'Chưa ai ghi công đức. Thắp nén hương đầu tiên ở Chánh điện.';
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
      case 'huong': return 'thắp ' + k.so + ' nén hương';
      case 'mo': return 'gõ ' + so(k.so) + ' tiếng mõ';
      case 'chuong': return 'thỉnh ' + k.so + ' hồi chuông';
      case 'niem': return 'niệm ' + so(k.so) + ' câu ' + (k.nd || 'Nam Mô A Di Đà Phật');
      case 'kinh': return 'tụng xong ' + (k.nd || 'một thời kinh');
      case 'hoadang': return 'thả một ngọn hoa đăng';
      case 'xam': return 'xin được ' + (k.nd || 'một quẻ xăm');
      default: return k.loai;
    }
  }

  function veHoaDang() {
    const ol = $('dsHoaDang'); ol.replaceChildren();
    const ds = cho.concat(dangGui).filter(i => i.loai === 'hoadang').map(i => ({ t: i.t, ten: i.an ? '' : ten, loi: i.nd })).concat(S.hoaDang);
    if (!ds.length) {
      const li = document.createElement('p'); li.className = 'trong';
      li.textContent = 'Mặt hồ còn yên. Viết lời nguyện đầu tiên rồi thả hoa đăng.';
      ol.append(li); return;
    }
    ds.forEach(h => {
      const li = document.createElement('li');
      li.innerHTML = DEN + '<div><p class="loi"></p><p class="ai"></p></div>';
      li.querySelector('.loi').textContent = h.loi;
      li.querySelector('.ai').textContent = (h.ten || 'Một bạn đạo') + ' · ' + luc(h.t);
      ol.append(li);
    });
  }

  // ---------- Chuỗi hạt ----------
  const cvC = $('chuoiHat'), gC = cvC.getContext('2d');
  function veChuoi(n) {
    const r = cvC.getBoundingClientRect(), tl = Math.min(devicePixelRatio || 1, 2);
    if (!r.width) return;
    if (cvC.width !== Math.round(r.width * tl)) { cvC.width = Math.round(r.width * tl); cvC.height = Math.round(r.height * tl); }
    const w = r.width, cx = w / 2, R = w * 0.42, SO = 36;
    gC.setTransform(tl, 0, 0, tl, 0, 0); gC.clearRect(0, 0, w, w);
    const vi = n % 108;
    // cung tiến độ
    gC.strokeStyle = 'rgba(226,178,92,0.18)'; gC.lineWidth = w * 0.06;
    gC.beginPath(); gC.arc(cx, cx, R, 0, Math.PI * 2); gC.stroke();
    gC.strokeStyle = 'rgba(226,178,92,0.55)';
    gC.beginPath(); gC.arc(cx, cx, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * vi / 108); gC.stroke();
    // hạt chuỗi xoay theo số niệm
    const lech = (n % SO) * (Math.PI * 2 / SO);
    for (let i = 0; i < SO; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / SO - lech;
      const x = cx + Math.cos(a) * R, y = cx + Math.sin(a) * R;
      const dinh = Math.abs(((a + Math.PI / 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)) < 0.01;
      const gr = gC.createRadialGradient(x - 3, y - 3, 1, x, y, w * 0.032);
      gr.addColorStop(0, dinh ? '#ffe3a3' : '#c58a4a'); gr.addColorStop(1, dinh ? '#b5822f' : '#5a3418');
      gC.fillStyle = gr;
      gC.beginPath(); gC.arc(x, y, w * (dinh ? 0.036 : 0.028), 0, Math.PI * 2); gC.fill();
    }
    // hạt mẫu (đầu chuỗi)
    gC.fillStyle = '#9b2f26';
    gC.beginPath(); gC.arc(cx, cx - R - w * 0.065, w * 0.022, 0, Math.PI * 2); gC.fill();
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
    if (n % 108 === 0) { Am.chuong(); baoTin('Tròn một chuỗi 108 hạt. Nam Mô A Di Đà Phật.'); }
    const b = $('nutNiem'); b.classList.remove('nhay'); void b.offsetWidth; b.classList.add('nhay');
    if (navigator.vibrate) navigator.vibrate(8);
  });
  $('cauNiem').value = LS.lay('qat.cau', 'Nam Mô A Di Đà Phật');
  $('cauNiem').addEventListener('change', e => LS.dat('qat.cau', e.target.value));

  // ---------- Chánh điện ----------
  function nghi(el, ms) { el.disabled = true; setTimeout(() => el.disabled = false, ms); }
  $('nutHuong').addEventListener('click', e => {
    themCho('huong', 3); Canh.huong(); nghi(e.currentTarget, 2500);
    baoTin('Đã thắp 3 nén hương. Hương cháy trong 30 phút.');
  });
  nutNhanh($('nutMo'), () => { themCho('mo', 1); Am.mo(); Canh.mo(); });
  $('nutChuong').addEventListener('click', e => { themCho('chuong', 1); Am.chuong(); Canh.chuong(); nghi(e.currentTarget, 3000); });
  $('gioTuChung').textContent = (window.CHUA && CHUA.GIO_TU_CHUNG) || 'Nhóm chưa hẹn giờ';

  // ---------- Xin xăm ----------
  $('nutXam').addEventListener('click', () => {
    const hop = $('hopXam'), ong = $('ongXam');
    $('noiDungXam').innerHTML = '<p class="que-ban" style="text-align:center">Thành tâm nghĩ điều muốn hỏi…</p>';
    ong.className = 'ong-xam';
    hop.showModal();
    void ong.offsetWidth; ong.classList.add('lac'); Am.lacXam();
    setTimeout(() => {
      const q = QUE_XAM[Math.floor(Math.random() * QUE_XAM.length)];
      ong.classList.add('ra');
      const nd = $('noiDungXam');
      nd.innerHTML = '<p class="que-so"></p><p class="que-bac"></p><p class="que-tho"></p><p class="que-ban"></p>';
      nd.children[0].textContent = 'Quẻ ' + q.so;
      nd.children[1].textContent = q.bac;
      nd.children[2].innerHTML = q.tho.map(l => l.replace(/[&<>]/g, '')).join('<br>');
      nd.children[3].textContent = q.ban;
      themCho('xam', 1, 'quẻ ' + q.so);
    }, 1350);
  });

  // ---------- Tụng kinh ----------
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
    ghi.textContent = 'Chạm vào một chữ để bắt đầu tụng từ chữ đó.';
    kinhEl.append(ghi);
  })();
  let viTri = 0, nhip = null, khoaMan = null;
  const nhipEl = $('nhipMo');
  nhipEl.addEventListener('input', () => { $('nhipSo').textContent = nhipEl.value; if (nhip) { dungTung(); batTung(); } });
  kinhEl.addEventListener('click', e => {
    const sp = e.target.closest('span.chu'); if (!sp) return;
    viTri = +sp.dataset.i; danhDau();
  });
  function danhDau() {
    chu.forEach((s, i) => { s.classList.toggle('da', i < viTri); s.classList.toggle('dang', i === viTri && !!nhip); });
  }
  function batTung() {
    if (viTri >= chu.length) viTri = 0;
    $('nutTung').textContent = 'Dừng';
    try { navigator.wakeLock && navigator.wakeLock.request('screen').then(k => khoaMan = k).catch(() => {}); } catch (e) {}
    const buoc = () => {
      if (viTri >= chu.length) {
        dungTung(); viTri = 0; danhDau();
        themCho('kinh', 1, 'một biến Bát Nhã Tâm Kinh'); Am.chuong();
        baoTin('Đã tụng xong một biến Tâm Kinh. Công đức đã ghi vào sổ.');
        return;
      }
      Am.mo(); danhDau();
      const sp = chu[viTri], r = sp.getBoundingClientRect();
      if (r.top < 90 || r.bottom > innerHeight - 110) sp.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      viTri++;
    };
    buoc();
    nhip = setInterval(buoc, 60000 / +nhipEl.value);
  }
  function dungTung() {
    clearInterval(nhip); nhip = null; $('nutTung').textContent = 'Tụng';
    if (khoaMan) { khoaMan.release().catch(() => {}); khoaMan = null; }
    danhDau();
  }
  $('nutTung').addEventListener('click', () => { nhip ? dungTung() : batTung(); });

  // ---------- Hoa đăng ----------
  const loi = $('loiNguyen');
  loi.addEventListener('input', () => { $('demChu').textContent = loi.value.length + '/200'; });
  $('formHoaDang').addEventListener('submit', e => {
    e.preventDefault();
    const s = loi.value.trim();
    if (!s) { baoTin('Viết vài chữ lời nguyện trước khi thả.'); loi.focus(); return; }
    themCho('hoadang', 1, s, $('anTen').checked);
    henGui(true);
    loi.value = ''; $('demChu').textContent = '0/200';
    const d = document.createElement('div'); d.className = 'den-troi'; d.innerHTML = DEN.replace('class="den"', 'width="56" height="56"');
    document.body.append(d); setTimeout(() => d.remove(), 4600);
    Am.chuong();
    baoTin('Hoa đăng đã thả. Cả nhóm sẽ thấy lời nguyện của bạn.');
  });

  // ---------- Các gian ----------
  function di(tab) {
    if (nhip && tab !== 'kinh') dungTung();
    document.querySelectorAll('.trang').forEach(s => s.hidden = s.dataset.tab !== tab);
    document.querySelectorAll('.duoi button').forEach(b => b.dataset.di === tab ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
    if (tab === 'chanhdien') Canh.batDau(); else Canh.dung();
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

  // ---------- Hộp vào chùa ----------
  function moHopVao() {
    const hop = $('hopVao');
    $('tenBan').value = ten;
    $('maChua').value = ma;
    $('khoiMa').hidden = Api.thu;
    $('batTieng').checked = Am.bat;
    $('loiVao').textContent = Api.thu ? 'Chưa nối Google Sheet: đang chạy thử, dữ liệu chỉ lưu trên máy này.' : '';
    if (!hop.open) hop.showModal();
  }
  $('nutCaiDat').addEventListener('click', moHopVao);
  $('batTieng').addEventListener('change', e => { if (e.target.checked !== Am.bat) Am.doi(); });
  $('formVao').addEventListener('submit', async e => {
    e.preventDefault();
    const t = $('tenBan').value.trim().replace(/\s+/g, ' ');
    const m = $('maChua').value.trim();
    if (!t) { $('loiVao').textContent = 'Nhập tên để cả nhóm nhận ra bạn.'; return; }
    if (!Api.thu && !m) { $('loiVao').textContent = 'Nhập mã vào chùa. Mã có trong nhóm Zalo.'; return; }
    $('nutVao').disabled = true; $('loiVao').textContent = 'Đang mở cổng chùa…';
    try {
      await Api.kiemTra(m);
      ten = t; ma = m; LS.dat('qat.ten', ten); LS.dat('qat.ma', ma);
      $('hopVao').close();
      await taiLai(); gui();
    } catch (err) {
      $('loiVao').textContent = /mã/i.test(err.message) ? 'Mã vào chùa chưa đúng. Hỏi lại trong nhóm Zalo.' : 'Chưa vào được: ' + err.message;
    } finally { $('nutVao').disabled = false; }
  });
  $('hopVao').addEventListener('cancel', e => { if (!ten) e.preventDefault(); });

  // ---------- Khởi động ----------
  di(LS.lay('qat.gian', 'chanhdien'));
  veLai();
  if (!ten || (!Api.thu && !ma)) moHopVao();
  else { taiLai(); if (cho.length) henGui(true); }
})();
