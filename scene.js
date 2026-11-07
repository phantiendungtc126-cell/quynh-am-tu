// Chánh điện Quỳnh Am Tự: khám thờ vàng, tượng Phật hào quang, cột vàng, sàn gỗ bóng, thảm đỏ,
// đỉnh đồng tỏa khói, Phật tử (các bạn trong nhóm) ngồi hai bên thảm có ghi tên.
// Lớp tĩnh vẽ sẵn một lần; lớp động: hào quang, nhang khói, nến, đèn, chuông, mõ, cánh sen, người lạy.
window.Canh = (() => {
  const cv = document.getElementById('canh');
  const g = cv.getContext('2d');
  const giamDong = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, tl = 1, LE = 0, K = {};
  let lop = {};
  let nhang = [], khoi = [], bui = [], canh = [], song = [], chuBay = [];
  let nguoi = [], ghe = [], diLe = null;
  let sang = 0, chay = false, lanCuoi = 0, t0 = performance.now();
  let lech = { x: 0, y: 0 }, dich = { x: 0, y: 0 };
  let chuongLac = 0, chuongV = 0, moNay = 0, hatKhoi = null;
  let vungChuong = null, vungMo = null;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;

  function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.ceil(w * tl); c.height = Math.ceil(h * tl); const x = c.getContext('2d'); x.setTransform(tl, 0, 0, tl, 0, 0); return [c, x]; }

  // ---------- bố cục theo kích thước khung ----------
  function boCuc() {
    const yS = H * 0.53;                                 // chân tường, bắt đầu sàn
    const yK = H * 0.17;                                 // đỉnh khám thờ (phía trên chừa chỗ bảng vàng)
    const kw = Math.min(W * 0.6, (yS - yK) * 1.05);      // bề ngang khám
    const vp = { x: W / 2, y: H * 0.36 };                // điểm tụ phối cảnh
    const yD = yS + (H - yS) * 0.2;                      // chân đỉnh đồng
    K = { yS, yK, kw, vp, yD,
      kx0: W / 2 - kw / 2, kx1: W / 2 + kw / 2,
      thamDinh: W * 0.075, thamDay: W * 0.3 };
  }
  // nửa bề ngang thảm tại độ cao y
  const nuaTham = y => lerp(K.thamDinh, K.thamDay, (y - K.yS) / (H - K.yS));
  // tỉ lệ người theo độ sâu
  const tiLe = y => lerp(0.42, 1.05, (y - K.yS) / (H - K.yS));

  // ---------- hoa văn vàng chạm trổ ----------
  function hoaVan(x, x0, y0, w, h, dam) {
    x.save(); x.beginPath(); x.rect(x0, y0, w, h); x.clip();
    const bg = x.createLinearGradient(x0, y0, x0, y0 + h);
    bg.addColorStop(0, dam ? '#5a3a10' : '#8a5c1c'); bg.addColorStop(1, dam ? '#2e1d07' : '#4d3010');
    x.fillStyle = bg; x.fillRect(x0, y0, w, h);
    const r = Math.max(4, Math.min(w, h) * 0.18);
    x.lineWidth = Math.max(1, r * 0.16);
    for (let yy = y0; yy < y0 + h + r; yy += r * 1.6) {
      for (let xx = x0 + ((yy - y0) / (r * 1.6) % 2) * r * 0.8; xx < x0 + w + r; xx += r * 1.6) {
        const gg = x.createLinearGradient(xx - r, yy - r, xx + r, yy + r);
        gg.addColorStop(0, '#ffe7a6'); gg.addColorStop(0.5, '#d9a64a'); gg.addColorStop(1, '#6b4512');
        x.strokeStyle = gg;
        x.beginPath();
        for (let a = 0; a < Math.PI * 3.2; a += 0.3) { const rr = r * 0.12 * a / Math.PI * 1.1; const px = xx + Math.cos(a) * rr, py = yy + Math.sin(a) * rr; a ? x.lineTo(px, py) : x.moveTo(px, py); }
        x.stroke();
      }
    }
    x.strokeStyle = '#f3cf7f'; x.lineWidth = 1.4; x.strokeRect(x0 + 1, y0 + 1, w - 2, h - 2);
    x.strokeStyle = 'rgba(0,0,0,0.5)'; x.lineWidth = 1; x.strokeRect(x0 + 3, y0 + 3, w - 6, h - 6);
    x.restore();
  }

  function goVang(x, x0, x1) {
    const gr = x.createLinearGradient(x0, 0, x1, 0);
    gr.addColorStop(0, '#5b3a0e'); gr.addColorStop(0.3, '#f6d27a'); gr.addColorStop(0.5, '#fff0b8'); gr.addColorStop(0.7, '#c99236'); gr.addColorStop(1, '#4a2f0b');
    return gr;
  }

  // ---------- tượng Phật (khung 200 x 230) ----------
  function hinhTuong() {
    const p = new Path2D();
    p.addPath(new Path2D('M22 190 C18 172 40 164 62 164 L138 164 C160 164 182 172 178 190 C176 204 150 208 100 206 C50 208 24 204 22 190 Z'));
    p.addPath(new Path2D('M100 78 C126 78 146 86 153 101 C161 120 160 152 154 172 L46 172 C40 152 39 120 47 101 C54 86 74 78 100 78 Z'));
    p.rect(90, 66, 20, 16);
    const elip = (cx, cy, rx, ry, q) => { const e = new Path2D(); e.ellipse(cx, cy, rx, ry, q, 0, Math.PI * 2); p.addPath(e); };
    elip(75, 52, 5.5, 16, -0.08); elip(125, 52, 5.5, 16, 0.08); elip(100, 47, 24, 28, 0); elip(100, 21, 12.5, 10.5, 0);
    return p;
  }

  function veTuong(x) {
    // đài sen
    const canhSen = (cx, cy, rw, rh, xoay) => {
      x.save(); x.translate(cx, cy); x.rotate(xoay);
      const gc = x.createLinearGradient(0, -rh, 0, 0);
      gc.addColorStop(0, '#fff0b8'); gc.addColorStop(0.5, '#d9a24a'); gc.addColorStop(1, '#6e4517');
      x.fillStyle = gc;
      x.beginPath(); x.moveTo(-rw, 0); x.bezierCurveTo(-rw, -rh * 0.6, -rw * 0.2, -rh * 0.9, 0, -rh); x.bezierCurveTo(rw * 0.2, -rh * 0.9, rw, -rh * 0.6, rw, 0); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(80,45,10,0.6)'; x.lineWidth = 0.8; x.stroke();
      x.restore();
    };
    const de = x.createLinearGradient(0, 205, 0, 232);
    de.addColorStop(0, '#c9923c'); de.addColorStop(1, '#3d2408');
    x.fillStyle = de; x.beginPath(); x.ellipse(100, 220, 98, 14, 0, 0, Math.PI * 2); x.fill();
    for (let i = -4; i <= 4; i++) canhSen(100 + i * 22, 224, 13, 26, i * 0.07);
    for (let i = -3; i <= 3; i++) canhSen(100 + i * 24, 211, 14, 30, i * 0.06);
    const hinh = hinhTuong();
    x.save(); x.translate(-1.4, -1); x.fillStyle = 'rgba(255,245,215,0.9)'; x.fill(hinh); x.restore();
    x.save(); x.shadowColor = 'rgba(0,0,0,0.55)'; x.shadowBlur = 16; x.shadowOffsetX = 5; x.shadowOffsetY = 4;
    const vang = x.createLinearGradient(30, 0, 170, 230);
    vang.addColorStop(0, '#fbe09a'); vang.addColorStop(0.45, '#dfab52'); vang.addColorStop(1, '#86591f');
    x.fillStyle = vang; x.fill(hinh); x.restore();
    x.save(); x.clip(hinh);
    const ds = x.createRadialGradient(80, 40, 5, 92, 72, 140);
    ds.addColorStop(0, 'rgba(255,248,220,0.7)'); ds.addColorStop(0.4, 'rgba(255,230,170,0.15)'); ds.addColorStop(1, 'rgba(255,230,170,0)');
    x.fillStyle = ds; x.fillRect(0, 0, 200, 230);
    const bong = x.createLinearGradient(122, 0, 182, 0);
    bong.addColorStop(0, 'rgba(50,25,5,0)'); bong.addColorStop(1, 'rgba(50,25,5,0.4)');
    x.fillStyle = bong; x.fillRect(0, 0, 200, 230);
    const bongDuoi = x.createLinearGradient(0, 150, 0, 210);
    bongDuoi.addColorStop(0, 'rgba(50,25,5,0)'); bongDuoi.addColorStop(1, 'rgba(50,25,5,0.32)');
    x.fillStyle = bongDuoi; x.fillRect(0, 150, 200, 80);
    x.fillStyle = 'rgba(120,75,20,0.45)';
    for (let yy = 12; yy < 40; yy += 4.2) for (let xx = 74; xx < 128; xx += 4.2) {
      const dx = (xx - 100) / 25, dy = (yy - 34) / 22;
      if ((dx * dx + dy * dy < 1 && yy < 33) || ((xx - 100) ** 2 / 156 + (yy - 21) ** 2 / 110 < 1)) { x.beginPath(); x.arc(xx + (yy % 8 ? 2 : 0), yy, 1.3, 0, Math.PI * 2); x.fill(); }
    }
    const nep = (p, r) => {
      x.lineCap = 'round';
      x.strokeStyle = 'rgba(80,45,10,0.55)'; x.lineWidth = r; x.beginPath(); x.moveTo(p[0], p[1]); x.quadraticCurveTo(p[2], p[3], p[4], p[5]); x.stroke();
      x.strokeStyle = 'rgba(255,235,190,0.35)'; x.lineWidth = r * 0.6; x.beginPath(); x.moveTo(p[0] - 1.5, p[1]); x.quadraticCurveTo(p[2] - 1.5, p[3], p[4] - 1.5, p[5]); x.stroke();
    };
    nep([118, 82, 96, 120, 70, 168], 1.8); nep([126, 90, 112, 125, 92, 168], 1.2); nep([132, 96, 140, 130, 146, 168], 1.6);
    nep([66, 92, 58, 130, 56, 168], 1.6); nep([30, 190, 100, 212, 170, 190], 1.6); nep([45, 178, 100, 196, 155, 178], 1.1);
    const tay = x.createLinearGradient(75, 160, 125, 176);
    tay.addColorStop(0, '#f8d892'); tay.addColorStop(1, '#b07c33');
    x.fillStyle = tay; x.beginPath(); x.ellipse(100, 168, 25, 8.5, 0, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(80,45,10,0.5)'; x.lineWidth = 1; x.stroke();
    const mat = x.createRadialGradient(97, 50, 2, 100, 52, 26);
    mat.addColorStop(0, 'rgba(255,242,210,0.4)'); mat.addColorStop(1, 'rgba(255,242,210,0)');
    x.fillStyle = mat; x.beginPath(); x.ellipse(100, 50, 24, 27, 0, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(80,45,10,0.45)'; x.lineWidth = 1.3;
    x.beginPath(); x.moveTo(60, 196); x.quadraticCurveTo(100, 186, 140, 196); x.stroke();
    x.strokeStyle = 'rgba(85,50,12,0.6)'; x.lineWidth = 1.1; x.lineCap = 'round';
    x.beginPath(); x.moveTo(83, 43); x.quadraticCurveTo(90, 39, 97, 43); x.stroke();
    x.beginPath(); x.moveTo(103, 43); x.quadraticCurveTo(110, 39, 117, 43); x.stroke();
    x.lineWidth = 1.4;
    x.beginPath(); x.moveTo(86, 50); x.quadraticCurveTo(91, 53, 96, 50); x.stroke();
    x.beginPath(); x.moveTo(104, 50); x.quadraticCurveTo(109, 53, 114, 50); x.stroke();
    x.lineWidth = 0.9; x.strokeStyle = 'rgba(85,50,12,0.4)';
    x.beginPath(); x.moveTo(99.5, 52); x.quadraticCurveTo(98.5, 57, 100.5, 58.5); x.stroke();
    x.strokeStyle = 'rgba(85,50,12,0.6)';
    x.beginPath(); x.moveTo(95, 65); x.quadraticCurveTo(100, 67.5, 105, 65); x.stroke();
    x.fillStyle = 'rgba(150,40,30,0.85)'; x.beginPath(); x.arc(100, 37, 1.8, 0, Math.PI * 2); x.fill();
    x.restore();
  }

  // ---------- lớp sau: trần, tường, khám thờ, tượng, bàn thờ, cột giữa ----------
  function veLopSau() {
    const w = W + LE * 2, h = H + LE * 2, [c, x] = mk(w, h);
    x.translate(LE, LE);
    const { yS, yK, kw, kx0, kx1 } = K;
    // tường
    const tg = x.createLinearGradient(0, 0, 0, yS);
    tg.addColorStop(0, '#1e0b06'); tg.addColorStop(0.5, '#3b170d'); tg.addColorStop(1, '#2a0f08');
    x.fillStyle = tg; x.fillRect(-LE, -LE, w, yS + LE);
    // tường hai bên sáng vàng nhạt như vách vôi
    [[-LE, kx0 - kw * 0.17], [kx1 + kw * 0.17, W + LE]].forEach(([a, b]) => {
      const vg = x.createLinearGradient(0, H * 0.18, 0, yS);
      vg.addColorStop(0, '#6b4a2c'); vg.addColorStop(1, '#a98257');
      x.fillStyle = vg; x.fillRect(a, yK + H * 0.04, b - a, yS - yK - H * 0.04);
      hoaVan(x, a, yK - H * 0.04, b - a, H * 0.08, true);
    });
    // trần gỗ có xà phối cảnh
    const tran = yK - H * 0.075;
    const tr = x.createLinearGradient(0, -LE, 0, tran);
    tr.addColorStop(0, '#120604'); tr.addColorStop(1, '#2f1209');
    x.fillStyle = tr; x.fillRect(-LE, -LE, w, tran + LE);
    x.strokeStyle = 'rgba(200,140,60,0.25)'; x.lineWidth = 1;
    for (let i = -6; i <= 6; i++) { x.beginPath(); x.moveTo(W / 2 + i * W * 0.03, tran); x.lineTo(W / 2 + i * W * 0.2, -LE); x.stroke(); }
    hoaVan(x, -LE, tran - H * 0.015, w, H * 0.025, false);
    // hoành phi "CHÁNH ĐIỆN"
    const hw = kw * 0.62, hh = H * 0.045, hx = W / 2 - hw / 2, hy = tran + H * 0.012;
    hoaVan(x, hx - 6, hy - 4, hw + 12, hh + 8, false);
    const hg = x.createLinearGradient(0, hy, 0, hy + hh);
    hg.addColorStop(0, '#7a1d14'); hg.addColorStop(1, '#3d0c08');
    x.fillStyle = hg;
    x.beginPath(); x.ellipse(W / 2, hy + hh / 2, hw * 0.42, hh * 0.42, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#ffd98a'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `700 ${Math.round(hh * 0.42)}px 'Cormorant Garamond', Georgia, serif`;
    x.fillText('CHÁNH ĐIỆN', W / 2, hy + hh / 2 + 1);

    // khám thờ: khung vàng chạm, lòng đỏ son, vòm cuốn
    const kTop = yK + H * 0.03;
    hoaVan(x, kx0 - kw * 0.08, kTop - H * 0.02, kw * 1.16, yS - kTop + H * 0.02, false);
    const lg = x.createRadialGradient(W / 2, kTop + (yS - kTop) * 0.4, 5, W / 2, kTop + (yS - kTop) * 0.4, kw * 0.7);
    lg.addColorStop(0, '#9a2a18'); lg.addColorStop(1, '#3a0b07');
    x.fillStyle = lg;
    x.beginPath();
    x.moveTo(kx0, yS); x.lineTo(kx0, kTop + kw * 0.25);
    x.quadraticCurveTo(kx0, kTop, W / 2, kTop); x.quadraticCurveTo(kx1, kTop, kx1, kTop + kw * 0.25);
    x.lineTo(kx1, yS); x.closePath(); x.fill();
    x.strokeStyle = '#ffe2a0'; x.lineWidth = 2; x.stroke();
    // tranh vẽ mờ hai bên trong khám
    x.fillStyle = 'rgba(255,200,120,0.08)';
    x.fillRect(kx0 + kw * 0.04, kTop + kw * 0.2, kw * 0.18, (yS - kTop) * 0.6);
    x.fillRect(kx1 - kw * 0.22, kTop + kw * 0.2, kw * 0.18, (yS - kTop) * 0.6);

    // tượng Phật
    const bh = (yS - kTop) * 0.78, s = bh / 232;
    const ox = W / 2 - 100 * s, oy = yS - (yS - kTop) * 0.1 - 232 * s;
    K.dauPhat = { x: W / 2, y: oy + 47 * s, r: 42 * s };
    K.thanPhat = { x: W / 2, y: oy + 130 * s, r: 120 * s };
    x.save(); x.translate(ox, oy); x.scale(s, s); veTuong(x); x.restore();

    // bàn thờ vàng trước tượng
    const by0 = yS - (yS - kTop) * 0.12, bw = kw * 1.08;
    hoaVan(x, W / 2 - bw / 2, by0, bw, yS - by0, false);
    x.fillStyle = goVang(x, W / 2 - bw / 2, W / 2 + bw / 2); x.fillRect(W / 2 - bw / 2 - 3, by0 - 4, bw + 6, 5);
    // lọ hoa sen hồng hai bên tượng
    const loHoa = (cx, cy, sc) => {
      const lg2 = x.createLinearGradient(cx - 8 * sc, 0, cx + 8 * sc, 0);
      lg2.addColorStop(0, '#1d2f5a'); lg2.addColorStop(0.45, '#d9e2f2'); lg2.addColorStop(1, '#1a2848');
      x.fillStyle = lg2;
      x.beginPath(); x.moveTo(cx - 6 * sc, cy); x.quadraticCurveTo(cx - 11 * sc, cy - 12 * sc, cx - 4 * sc, cy - 22 * sc); x.lineTo(cx + 4 * sc, cy - 22 * sc); x.quadraticCurveTo(cx + 11 * sc, cy - 12 * sc, cx + 6 * sc, cy); x.fill();
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI / 2 + (i - 4) * 0.32, d = (16 + (i % 3) * 6) * sc;
        const px = cx + Math.cos(a) * d, py = cy - 22 * sc + Math.sin(a) * d;
        x.strokeStyle = '#3d6b35'; x.lineWidth = 1; x.beginPath(); x.moveTo(cx, cy - 22 * sc); x.lineTo(px, py); x.stroke();
        const hg2 = x.createRadialGradient(px - 1, py - 1, 0, px, py, 5 * sc);
        hg2.addColorStop(0, i % 2 ? '#fff4f7' : '#ffd1dc'); hg2.addColorStop(1, i % 2 ? '#e8a8bb' : '#d4567a');
        x.fillStyle = hg2; x.beginPath(); x.arc(px, py, 4.6 * sc, 0, Math.PI * 2); x.fill();
      }
    };
    const sc = kw / 220;
    loHoa(W / 2 - kw * 0.36, by0, sc); loHoa(W / 2 + kw * 0.36, by0, sc);

    // cột giữa vàng với băng chữ NAM MÔ A DI ĐÀ PHẬT
    const cotGiua = (cx) => {
      const cw = Math.max(14, W * 0.055), ct = yK - H * 0.02;
      x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(cx - cw / 2 + 4, ct, cw, yS - ct);
      x.fillStyle = goVang(x, cx - cw / 2, cx + cw / 2); x.fillRect(cx - cw / 2, ct, cw, yS - ct);
      const bw2 = cw * 0.72;
      const bg = x.createLinearGradient(cx - bw2 / 2, 0, cx + bw2 / 2, 0);
      bg.addColorStop(0, '#5a150d'); bg.addColorStop(0.5, '#8e2618'); bg.addColorStop(1, '#4a0f09');
      x.fillStyle = bg; x.fillRect(cx - bw2 / 2, ct + H * 0.02, bw2, yS - ct - H * 0.05);
      const chu = ['NAM', 'MÔ', 'A', 'DI', 'ĐÀ', 'PHẬT'];
      const k = (yS - ct - H * 0.07) / chu.length;
      x.fillStyle = '#ffe08f'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = `700 ${Math.round(Math.min(bw2 * 0.42, k * 0.55))}px 'Be Vietnam Pro', sans-serif`;
      chu.forEach((s2, i) => x.fillText(s2, cx, ct + H * 0.035 + k * (i + 0.5)));
    };
    cotGiua(kx0 - kw * 0.1); cotGiua(kx1 + kw * 0.1);

    // bàn thờ phụ hai bên với hoa và đèn
    [[kx0 - kw * 0.17 - W * 0.16, kx0 - kw * 0.17 - W * 0.01], [kx1 + kw * 0.17 + W * 0.01, kx1 + kw * 0.17 + W * 0.16]].forEach(([a, b], i) => {
      const y0 = yS - H * 0.045;
      hoaVan(x, a, y0, b - a, H * 0.045, false);
      loHoa((a + b) / 2, y0, sc * 0.9);
      // đèn tường
      const lx = i ? b - W * 0.02 : a + W * 0.02, ly = yK + (yS - yK) * 0.35;
      x.fillStyle = '#3a250c'; x.fillRect(lx - 1, ly - 10, 2, 10);
      const dl = x.createRadialGradient(lx, ly + 6, 0, lx, ly + 6, 26);
      dl.addColorStop(0, 'rgba(255,214,140,0.9)'); dl.addColorStop(0.2, 'rgba(255,190,100,0.45)'); dl.addColorStop(1, 'rgba(255,190,100,0)');
      x.fillStyle = dl; x.beginPath(); x.arc(lx, ly + 6, 26, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#ffe9b8'; x.fillRect(lx - 4, ly, 8, 11);
    });
    return c;
  }

  // ---------- sàn gỗ, thảm đỏ, đỉnh đồng ----------
  function veSan() {
    const w = W + LE * 2, h = H + LE * 2, [c, x] = mk(w, h);
    x.translate(LE, LE);
    const { yS, vp, yD } = K;
    const sg = x.createLinearGradient(0, yS, 0, H + LE);
    sg.addColorStop(0, '#3a1a0c'); sg.addColorStop(0.4, '#5a2a12'); sg.addColorStop(1, '#2a1208');
    x.fillStyle = sg; x.fillRect(-LE, yS, w, H - yS + LE * 2);
    // ván sàn tụ về điểm phối cảnh
    for (let i = -24; i <= 24; i++) {
      const xb = W / 2 + i * W * 0.07;
      const t = (yS - vp.y) / (H - vp.y);
      x.strokeStyle = i % 2 ? 'rgba(0,0,0,0.35)' : 'rgba(255,190,120,0.07)'; x.lineWidth = 1;
      x.beginPath(); x.moveTo(lerp(vp.x, xb, t), yS); x.lineTo(xb, H + LE); x.stroke();
    }
    for (let k = 1; k < 14; k++) {
      const y = yS + (H - yS) * Math.pow(k / 14, 1.7);
      x.strokeStyle = 'rgba(0,0,0,0.18)'; x.beginPath(); x.moveTo(-LE, y); x.lineTo(W + LE, y); x.stroke();
    }
    // ánh vàng phản chiếu từ khám thờ trên sàn bóng
    const pc = x.createRadialGradient(W / 2, yS, 2, W / 2, yS + (H - yS) * 0.3, W * 0.7);
    pc.addColorStop(0, 'rgba(255,200,110,0.45)'); pc.addColorStop(0.4, 'rgba(255,170,80,0.12)'); pc.addColorStop(1, 'rgba(255,170,80,0)');
    x.fillStyle = pc; x.fillRect(-LE, yS, w, H - yS + LE);
    [W * 0.12, W * 0.88].forEach(px => {
      const ph = x.createLinearGradient(0, yS, 0, yS + (H - yS) * 0.5);
      ph.addColorStop(0, 'rgba(255,214,140,0.22)'); ph.addColorStop(1, 'rgba(255,214,140,0)');
      x.fillStyle = ph; x.fillRect(px - W * 0.03, yS, W * 0.06, (H - yS) * 0.5);
    });
    // chân tường
    x.fillStyle = '#1a0805'; x.fillRect(-LE, yS - 2, w, 4);
    // thảm đỏ
    const y0 = yS + 2, y1 = H + LE;
    const th = (y, k) => W / 2 + k * nuaTham(y);
    const tg = x.createLinearGradient(0, y0, 0, y1);
    tg.addColorStop(0, '#7a0f18'); tg.addColorStop(0.5, '#b0182a'); tg.addColorStop(1, '#8a1020');
    x.fillStyle = tg;
    x.beginPath(); x.moveTo(th(y0, -1), y0); x.lineTo(th(y0, 1), y0); x.lineTo(th(y1, 1), y1); x.lineTo(th(y1, -1), y1); x.fill();
    // viền vàng hai bên thảm
    [[-1, -0.86], [0.86, 1]].forEach(([a, b]) => {
      x.fillStyle = 'rgba(230,190,110,0.85)';
      x.beginPath(); x.moveTo(th(y0, a), y0); x.lineTo(th(y0, b), y0); x.lineTo(th(y1, b), y1); x.lineTo(th(y1, a), y1); x.fill();
      x.fillStyle = 'rgba(120,20,25,0.6)';
      const m = (a + b) / 2;
      x.beginPath(); x.moveTo(th(y0, m - 0.02), y0); x.lineTo(th(y0, m + 0.02), y0); x.lineTo(th(y1, m + 0.02), y1); x.lineTo(th(y1, m - 0.02), y1); x.fill();
    });
    // ánh sáng trên thảm
    const ta = x.createLinearGradient(0, y0, 0, y0 + (H - yS) * 0.6);
    ta.addColorStop(0, 'rgba(255,200,120,0.25)'); ta.addColorStop(1, 'rgba(255,200,120,0)');
    x.fillStyle = ta;
    x.beginPath(); x.moveTo(th(y0, -0.8), y0); x.lineTo(th(y0, 0.8), y0); x.lineTo(th(H, 0.6), H); x.lineTo(th(H, -0.6), H); x.fill();

    // đỉnh đồng lớn
    const sc = tiLe(yD) * H / 900;
    const dx = W / 2;
    x.fillStyle = 'rgba(0,0,0,0.45)'; x.beginPath(); x.ellipse(dx, yD + 4 * sc, 62 * sc, 12 * sc, 0, 0, Math.PI * 2); x.fill();
    const dong = (x0, x1) => { const gr = x.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, '#2e2210'); gr.addColorStop(0.3, '#9a7a3e'); gr.addColorStop(0.45, '#e2c37a'); gr.addColorStop(0.7, '#6a5228'); gr.addColorStop(1, '#22180a'); return gr; };
    // chân
    x.fillStyle = dong(dx - 50 * sc, dx + 50 * sc);
    [-1, 0, 1].forEach(k => { x.beginPath(); x.moveTo(dx + k * 34 * sc - 6 * sc, yD - 40 * sc); x.quadraticCurveTo(dx + k * 44 * sc, yD - 15 * sc, dx + k * 40 * sc, yD); x.lineTo(dx + k * 40 * sc + 8 * sc, yD); x.quadraticCurveTo(dx + k * 40 * sc + 4 * sc, yD - 20 * sc, dx + k * 34 * sc + 6 * sc, yD - 40 * sc); x.fill(); });
    // bụng đỉnh
    x.fillStyle = dong(dx - 56 * sc, dx + 56 * sc);
    x.beginPath(); x.moveTo(dx - 56 * sc, yD - 96 * sc); x.quadraticCurveTo(dx - 62 * sc, yD - 44 * sc, dx - 30 * sc, yD - 36 * sc); x.lineTo(dx + 30 * sc, yD - 36 * sc); x.quadraticCurveTo(dx + 62 * sc, yD - 44 * sc, dx + 56 * sc, yD - 96 * sc); x.fill();
    x.strokeStyle = 'rgba(255,230,160,0.35)'; x.lineWidth = 1;
    for (let k = 0; k < 3; k++) { x.beginPath(); x.ellipse(dx, yD - (60 + k * 10) * sc, 54 * sc, 6 * sc, 0, 0, Math.PI); x.stroke(); }
    // quai rồng
    x.strokeStyle = dong(dx - 80 * sc, dx + 80 * sc); x.lineWidth = 6 * sc;
    x.beginPath(); x.arc(dx - 62 * sc, yD - 92 * sc, 14 * sc, Math.PI * 0.3, Math.PI * 1.6); x.stroke();
    x.beginPath(); x.arc(dx + 62 * sc, yD - 92 * sc, 14 * sc, -Math.PI * 0.6, Math.PI * 0.7); x.stroke();
    // miệng đỉnh
    x.fillStyle = dong(dx - 60 * sc, dx + 60 * sc); x.beginPath(); x.ellipse(dx, yD - 96 * sc, 60 * sc, 10 * sc, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#2a2015'; x.beginPath(); x.ellipse(dx, yD - 96 * sc, 52 * sc, 7 * sc, 0, 0, Math.PI * 2); x.fill();
    // nắp tháp nhỏ
    x.fillStyle = dong(dx - 24 * sc, dx + 24 * sc);
    x.beginPath(); x.moveTo(dx - 22 * sc, yD - 100 * sc); x.quadraticCurveTo(dx - 20 * sc, yD - 128 * sc, dx, yD - 140 * sc); x.quadraticCurveTo(dx + 20 * sc, yD - 128 * sc, dx + 22 * sc, yD - 100 * sc); x.fill();
    x.beginPath(); x.arc(dx, yD - 144 * sc, 6 * sc, 0, Math.PI * 2); x.fill();
    K.dinh = { x: dx, y: yD - 96 * sc, sc };
    return c;
  }

  // ---------- cột trước ----------
  function veCotTruoc() {
    const w = W + LE * 2, h = H + LE * 2, [c, x] = mk(w, h);
    x.translate(LE, LE);
    [W * 0.035, W * 0.965].forEach(cx => {
      const r = W * 0.06, chan = H * 0.8;
      const gr = x.createLinearGradient(cx - r, 0, cx + r, 0);
      gr.addColorStop(0, '#1d0604'); gr.addColorStop(0.3, '#6e1a10'); gr.addColorStop(0.5, '#a52c1c'); gr.addColorStop(0.75, '#4e1209'); gr.addColorStop(1, '#140403');
      x.fillStyle = gr; x.fillRect(cx - r, -LE, r * 2, chan + LE);
      // dây hoa văn vàng quấn cột
      x.strokeStyle = 'rgba(240,200,110,0.7)'; x.lineWidth = 1.6;
      for (let y = 0; y < chan; y += 26) { x.beginPath(); x.moveTo(cx - r * 0.7, y); x.bezierCurveTo(cx - r * 0.2, y + 8, cx + r * 0.2, y + 4, cx + r * 0.7, y + 13); x.stroke(); }
      hoaVan(x, cx - r * 1.05, H * 0.12, r * 2.1, H * 0.04, false);
      hoaVan(x, cx - r * 1.05, chan - H * 0.07, r * 2.1, H * 0.04, false);
      const da = x.createLinearGradient(cx - r * 1.5, 0, cx + r * 1.5, 0);
      da.addColorStop(0, '#2a2420'); da.addColorStop(0.4, '#8c847a'); da.addColorStop(1, '#1d1916');
      x.fillStyle = da; x.fillRect(cx - r * 1.3, chan - H * 0.03, r * 2.6, H * 0.04);
      x.beginPath(); x.ellipse(cx, chan + H * 0.01, r * 1.4, r * 0.35, 0, 0, Math.PI * 2); x.fill();
    });
    return c;
  }

  function veVien() {
    const [c, x] = mk(W, H);
    const v = x.createRadialGradient(W / 2, H * 0.42, H * 0.3, W / 2, H * 0.5, H * 0.85);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
    x.fillStyle = v; x.fillRect(0, 0, W, H);
    return c;
  }

  // ---------- ghế ngồi của Phật tử ----------
  function xepGhe() {
    ghe = [];
    // ba hàng, chừa phần chân cảnh cho hàng nút lễ đè lên
    const hang = 3, y0 = K.yS + (H - K.yS) * 0.36, y1 = H * 0.84;
    for (let r = hang - 1; r >= 0; r--) {              // hàng trước được xếp trước
      const y = lerp(y0, y1, r / (hang - 1)), sc = tiLe(y);
      const mep = nuaTham(y) + W * 0.05 * sc + W * 0.01;
      const rong = W / 2 - mep - W * 0.08;
      const buoc = Math.max(W * 0.13 * sc, 40 * sc + 16);
      const soMoiBen = Math.max(1, Math.min(3, Math.floor(rong / buoc) + 1));
      for (let k = 0; k < soMoiBen; k++) {
        const dx = mep + k * buoc;
        ghe.push({ x: W / 2 - dx, y, sc, ben: -1 });
        ghe.push({ x: W / 2 + dx, y, sc, ben: 1 });
      }
    }
  }

  function doCo() {
    const r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return;
    tl = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; LE = Math.round(W * 0.035);
    cv.width = Math.round(W * tl); cv.height = Math.round(H * tl);
    boCuc();
    hatKhoi = document.createElement('canvas'); hatKhoi.width = hatKhoi.height = 64;
    const k = hatKhoi.getContext('2d'), gr = k.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(235,236,245,0.6)'); gr.addColorStop(1, 'rgba(235,236,245,0)');
    k.fillStyle = gr; k.fillRect(0, 0, 64, 64);
    lop = { sau: veLopSau(), san: veSan(), cot: veCotTruoc(), vien: veVien() };
    xepGhe(); ganGhe();
    bui = Array.from({ length: 36 }, () => ({ x: rnd(0, W), y: rnd(0, H * 0.7), v: rnd(0.002, 0.007), p: rnd(0, 6), r: rnd(0.6, 1.5) }));
    canh = Array.from({ length: giamDong ? 0 : 14 }, () => canhMoi(true));
  }

  function canhMoi(rai) {
    return { x: rnd(0, W), y: rai ? rnd(-H, H) : rnd(-60, -10), v: rnd(0.015, 0.04), p: rnd(0, 6), q: rnd(0, 6), lat: rnd(0.001, 0.004), co: rnd(4, 8) };
  }

  // ---------- người ----------
  function ganGhe() {
    nguoi.forEach((n, i) => { n.ghe = ghe[i] || null; if (n.ghe && n.x == null) { n.x = n.ghe.x; n.y = n.ghe.y; } });
  }

  function veNguoi(n, t, chiTen) {
    if (n.x == null) return;
    const sc = tiLe(n.y), h = H * 0.085 * sc, w = h * 0.78;
    const x = n.x, y = n.y;
    if (chiTen) { veTen(n, x, y, sc); return; }
    const b = n.lay || 0;                               // 0 ngồi thẳng, 1 cúi rạp
    // bóng
    g.fillStyle = 'rgba(0,0,0,0.38)';
    g.beginPath(); g.ellipse(x, y + 1, w * 0.62, h * 0.09, 0, 0, Math.PI * 2); g.fill();
    if (n.toi || n.gan) {
      g.globalCompositeOperation = 'lighter';
      const hq = g.createRadialGradient(x, y - h * 0.5, 0, x, y - h * 0.5, h * 0.9);
      hq.addColorStop(0, n.toi ? 'rgba(255,210,120,0.28)' : 'rgba(255,230,180,0.16)'); hq.addColorStop(1, 'rgba(255,210,120,0)');
      g.fillStyle = hq; g.beginPath(); g.arc(x, y - h * 0.5, h * 0.9, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = 'source-over';
    }
    const vai = y - h * (0.62 - 0.22 * b);
    // áo tràng lam
    const ag = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    ag.addColorStop(0, '#36405a'); ag.addColorStop(0.4, '#8a97b6'); ag.addColorStop(1, '#2c3449');
    g.fillStyle = ag;
    g.beginPath();
    g.moveTo(x - w * 0.5, y);
    g.quadraticCurveTo(x - w * 0.56, vai + h * 0.16, x - w * 0.3, vai);
    g.quadraticCurveTo(x, vai - h * 0.06, x + w * 0.3, vai);
    g.quadraticCurveTo(x + w * 0.56, vai + h * 0.16, x + w * 0.5, y);
    g.closePath(); g.fill();
    g.strokeStyle = 'rgba(20,25,40,0.5)'; g.lineWidth = Math.max(0.6, sc);
    g.beginPath(); g.moveTo(x, vai + h * 0.04); g.lineTo(x, y - h * 0.05); g.stroke();
    // đầu nhìn từ sau, tóc đen búi gọn
    const r = h * 0.15, dy = vai - r * (0.85 - 1.3 * b);
    if (b < 0.85) {
      g.fillStyle = '#d9b48c'; g.beginPath(); g.ellipse(x, dy + r * 0.5, r * 0.55, r * 0.35, 0, 0, Math.PI * 2); g.fill();
      const tg = g.createRadialGradient(x - r * 0.3, dy - r * 0.4, 0, x, dy, r);
      tg.addColorStop(0, '#4a4040'); tg.addColorStop(1, '#141010');
      g.fillStyle = tg; g.beginPath(); g.arc(x, dy, r, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(x, dy - r * 0.95, r * 0.42, 0, Math.PI * 2); g.fill();
    }
  }

  function veTen(n, x, y, sc) {
    if (n.ten && n.ghe && !(diLe && diLe.n === n)) {
      const fs = Math.max(8.5, 10 * Math.min(1, sc + 0.1));
      g.font = `600 ${fs}px 'Be Vietnam Pro', sans-serif`;
      // tên ngắn: lấy hai chữ cuối, tối đa 9 ký tự
      const p = n.ten.trim().split(/\s+/), ngan = p.slice(-2).join(' ');
      const ten = ngan.length > 9 ? p[p.length - 1].slice(0, 9) : ngan;
      const tw = g.measureText(ten).width + 10;
      const ly = y + fs * 0.95;
      g.fillStyle = n.toi ? 'rgba(120,80,15,0.92)' : 'rgba(10,12,22,0.72)';
      const rr = fs * 0.75;
      g.beginPath(); g.roundRect ? g.roundRect(x - tw / 2, ly - rr, tw, rr * 2, rr) : g.rect(x - tw / 2, ly - rr, tw, rr * 2); g.fill();
      if (n.toi) { g.strokeStyle = '#f3cf7f'; g.lineWidth = 1; g.stroke(); }
      g.fillStyle = n.toi ? '#ffe7ad' : '#eef0f6'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(ten, x, ly + 0.5);
    }
  }

  function capNhatNguoi(dt, t) {
    nguoi.forEach(n => {
      if (n.layDen) {
        const p = (t - n.layDen) / 2600;
        if (p >= 1) { n.lay = 0; n.layDen = 0; }
        else n.lay = Math.max(0, Math.sin(p * Math.PI * 3)) ** 0.7;
      }
    });
    // người đang đi dâng hương
    if (diLe) {
      const n = diLe.n, p = (t - diLe.bd);
      const truoc = { x: K.dinh.x + (n.ghe.ben || 1) * W * 0.02, y: K.yD + (H - K.yD) * 0.08 };
      const loi = { x: W / 2 + (n.ghe.ben || 1) * W * 0.02, y: n.ghe.y };
      const di = (a, b2, q) => { const e = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2; n.x = lerp(a.x, b2.x, e); n.y = lerp(a.y, b2.y, e); };
      if (p < 900) di(n.ghe, loi, p / 900);
      else if (p < 2600) di(loi, truoc, (p - 900) / 1700);
      else if (p < 6000) { n.x = truoc.x; n.y = truoc.y; n.lay = Math.max(0, Math.sin((p - 2600) / 3400 * Math.PI * 3)) ** 0.7; }
      else if (p < 7700) { n.lay = 0; di(truoc, loi, (p - 6000) / 1700); }
      else if (p < 8600) di(loi, n.ghe, (p - 7700) / 900);
      else { n.x = n.ghe.x; n.y = n.ghe.y; diLe = null; }
    }
  }

  // ---------- phần động ----------
  function haoQuang(t, o) {
    if (!K.dauPhat) return;
    const d = K.dauPhat, th = K.thanPhat;
    g.globalCompositeOperation = 'lighter';
    const nhip = 0.85 + 0.15 * Math.sin(t * 0.0013);
    let gr = g.createRadialGradient(th.x + o[0], th.y + o[1], 2, th.x + o[0], th.y + o[1], th.r * 1.25);
    gr.addColorStop(0, `rgba(255,214,130,${(0.1 + sang * 0.22) * nhip})`); gr.addColorStop(1, 'rgba(255,200,110,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(th.x + o[0], th.y + o[1], th.r * 1.25, 0, Math.PI * 2); g.fill();
    // vầng sáng sau đầu: sáng ở vành, giữa mờ để không lóa mặt tượng
    gr = g.createRadialGradient(d.x + o[0], d.y + o[1], d.r * 0.55, d.x + o[0], d.y + o[1], d.r * 1.55);
    gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(0.35, `rgba(255,236,180,${0.32 * nhip})`); gr.addColorStop(1, 'rgba(255,220,140,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(d.x + o[0], d.y + o[1], d.r * 1.6, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = `rgba(255,232,170,${0.75 * nhip})`; g.lineWidth = 2;
    g.beginPath(); g.arc(d.x + o[0], d.y + o[1], d.r, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = `rgba(255,232,170,${0.35 * nhip})`; g.lineWidth = 1;
    g.beginPath(); g.arc(d.x + o[0], d.y + o[1], d.r * 1.12, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.ellipse(th.x + o[0], th.y + o[1] - th.r * 0.05, th.r * 0.62, th.r * 0.8, 0, 0, Math.PI * 2); g.stroke();
  }

  function tiaSang(t) {
    if (giamDong) return;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const x0 = W * (0.3 + i * 0.13) + Math.sin(t * 0.0002 + i) * W * 0.02;
      const a = 0.03 + 0.02 * Math.sin(t * 0.0007 + i * 2);
      const gr = g.createLinearGradient(x0, 0, x0 + W * 0.1, H * 0.75);
      gr.addColorStop(0, `rgba(255,230,180,${a})`); gr.addColorStop(1, 'rgba(255,230,180,0)');
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + W * 0.04, 0); g.lineTo(x0 + W * 0.2, H * 0.75); g.lineTo(x0 + W * 0.09, H * 0.75); g.fill();
    }
    g.restore();
  }

  function veNhang(t, o) {
    if (!K.dinh) return;
    const d = K.dinh, n = Math.min(nhang.length, 30), dai = 70 * d.sc;
    for (let i = 0; i < n; i++) {
      const k = i % 10, hang = Math.floor(i / 10), so = Math.min(10, n - hang * 10);
      const px = d.x + o[0] + (so === 1 ? 0 : (k / (so - 1) - 0.5) * 70 * d.sc * Math.min(1, 0.35 + so / 10)) + hang * 3;
      const py = d.y + o[1] - hang * 2, ng = (k - (so - 1) / 2) * 0.035;
      const con = dai * (1 - nhang[i].tuoi * 0.75), dx = Math.sin(ng) * con, x2 = px + dx, y2 = py - con;
      g.strokeStyle = '#b5332a'; g.lineWidth = 2.2 * Math.max(0.6, d.sc);
      g.beginPath(); g.moveTo(px, py); g.lineTo(px + dx * 0.3, py - con * 0.3); g.stroke();
      g.strokeStyle = '#80603e'; g.lineWidth = 1.6 * Math.max(0.6, d.sc);
      g.beginPath(); g.moveTo(px + dx * 0.3, py - con * 0.3); g.lineTo(x2, y2); g.stroke();
      const lap = 0.7 + 0.3 * Math.sin(t * 0.006 + i * 1.7);
      g.fillStyle = `rgba(255,${120 + 60 * lap | 0},60,0.95)`; g.beginPath(); g.arc(x2, y2, 2.1, 0, Math.PI * 2); g.fill();
      g.fillStyle = `rgba(255,140,60,${0.3 * lap})`; g.beginPath(); g.arc(x2, y2, 7, 0, Math.PI * 2); g.fill();
      if (!giamDong && Math.random() < 0.1 && khoi.length < 280) khoi.push({ x: x2, y: y2, vx: rnd(-0.08, 0.08), vy: rnd(-0.6, -0.35), song: rnd(0, 6), song2: rnd(0.6, 1.6), tuoi: 0, tho: rnd(4000, 6500), co: 4 });
    }
    // khói trầm luôn tỏa nhẹ từ đỉnh
    if (!giamDong && Math.random() < 0.25 + Math.min(0.5, n * 0.02) && khoi.length < 280) khoi.push({ x: d.x + o[0] + rnd(-20, 20) * d.sc, y: d.y + o[1] - 40 * d.sc, vx: rnd(-0.05, 0.05), vy: rnd(-0.5, -0.3), song: rnd(0, 6), song2: rnd(0.6, 1.6), tuoi: 0, tho: rnd(5000, 8000), co: 8 * d.sc + 4 });
  }

  function veKhoi(dt) {
    g.globalCompositeOperation = 'lighter';
    for (let i = khoi.length - 1; i >= 0; i--) {
      const k = khoi[i]; k.tuoi += dt;
      if (k.tuoi > k.tho) { khoi.splice(i, 1); continue; }
      const p = k.tuoi / k.tho;
      k.x += (k.vx + Math.sin(k.song + k.tuoi * 0.0012 * k.song2) * 0.2 * (1 + p * 3)) * dt * 0.06;
      k.y += k.vy * dt * 0.06;
      const co = k.co + p * 34;
      g.globalAlpha = (1 - p) * 0.16;
      g.drawImage(hatKhoi, k.x - co, k.y - co, co * 2, co * 2);
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }

  function veNen(t, o) {
    // hai cây nến đồng trên bàn thờ trước tượng
    const by = K.yS - (K.yS - K.yK - H * 0.03) * 0.12;
    [W / 2 - K.kw * 0.2, W / 2 + K.kw * 0.2].forEach((bx, i) => {
      const x = bx + o[0], y = by + o[1], h = H * 0.045;
      g.fillStyle = goVang(g, x - 6, x + 6); g.fillRect(x - 2, y - 6, 4, 6);
      g.beginPath(); g.ellipse(x, y - 6, 6, 1.8, 0, 0, Math.PI * 2); g.fill();
      const ng = g.createLinearGradient(x - 4, 0, x + 4, 0);
      ng.addColorStop(0, '#c9372a'); ng.addColorStop(0.45, '#ff7a5a'); ng.addColorStop(1, '#8a1c14');
      g.fillStyle = ng; g.fillRect(x - 3.5, y - 6 - h, 7, h);
      const lay = giamDong ? 0 : Math.sin(t * 0.011 + i * 2) * 1.1 + Math.sin(t * 0.029 + i) * 0.6;
      const fy = y - 6 - h - 7;
      g.globalCompositeOperation = 'lighter';
      const hq = g.createRadialGradient(x, fy, 0, x, fy, W * 0.09);
      hq.addColorStop(0, `rgba(255,190,100,${0.35 + 0.07 * Math.sin(t * 0.017 + i)})`); hq.addColorStop(1, 'rgba(255,190,100,0)');
      g.fillStyle = hq; g.beginPath(); g.arc(x, fy, W * 0.09, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = 'source-over';
      const fg = g.createLinearGradient(0, fy - 9, 0, fy + 5);
      fg.addColorStop(0, '#ff9a3a'); fg.addColorStop(0.5, '#ffd98a'); fg.addColorStop(1, '#fff6dd');
      g.fillStyle = fg;
      g.beginPath(); g.moveTo(x + lay, fy - 9); g.quadraticCurveTo(x + 4.5, fy + 1, x, fy + 5); g.quadraticCurveTo(x - 4.5, fy + 1, x + lay, fy - 9); g.fill();
    });
  }

  function veDenLong(t, o) {
    [[W * 0.86, 0], [W * 0.14, 1]].forEach(([ax0, i]) => {
      if (i === 1) return; // bên trái treo chuông
      const ax = ax0 + o[0], ay = H * 0.07 + o[1];
      const goc = giamDong ? 0 : Math.sin(t * 0.0011 + i) * 0.06;
      g.save(); g.translate(ax, ay); g.rotate(goc);
      const L = H * 0.09, rw = W * 0.055, rh = W * 0.07, cy = L + rh;
      g.strokeStyle = '#2a1a10'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, L); g.stroke();
      g.globalCompositeOperation = 'lighter';
      const hq = g.createRadialGradient(0, cy, 0, 0, cy, rw * 3);
      hq.addColorStop(0, 'rgba(255,90,50,0.3)'); hq.addColorStop(1, 'rgba(255,90,50,0)');
      g.fillStyle = hq; g.beginPath(); g.arc(0, cy, rw * 3, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = 'source-over';
      const lg = g.createRadialGradient(-rw * 0.3, cy - rh * 0.3, rw * 0.1, 0, cy, rw * 1.2);
      lg.addColorStop(0, '#ffd08a'); lg.addColorStop(0.35, '#e8432e'); lg.addColorStop(1, '#6e120c');
      g.fillStyle = lg; g.beginPath(); g.ellipse(0, cy, rw, rh, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(80,10,5,0.5)'; g.lineWidth = 1;
      for (let k = -2; k <= 2; k++) { g.beginPath(); g.ellipse(0, cy, Math.abs(k) * rw * 0.3 + 0.5, rh, 0, 0, Math.PI * 2); g.stroke(); }
      g.fillStyle = '#d9a95a'; g.fillRect(-rw * 0.45, L + 2, rw * 0.9, 4); g.fillRect(-rw * 0.45, cy + rh - 3, rw * 0.9, 4);
      g.strokeStyle = '#d9502f';
      for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(k * 2, cy + rh + 1); g.lineTo(k * 2 + Math.sin(t * 0.002 + k) * 1.5, cy + rh + 13); g.stroke(); }
      g.restore();
    });
  }

  function veChuong(dt, o) {
    chuongV += -chuongLac * 0.00006 * dt - chuongV * 0.0025 * dt;
    chuongLac += chuongV * dt;
    const ax = W * 0.15 + o[0], ay = H * 0.07 + o[1];
    g.save(); g.translate(ax, ay); g.rotate(chuongLac);
    const L = H * 0.08, bw = W * 0.06, bh = W * 0.08;
    g.strokeStyle = '#2a1a10'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, L); g.stroke();
    const cg = g.createLinearGradient(-bw, 0, bw, 0);
    cg.addColorStop(0, '#3e2a10'); cg.addColorStop(0.3, '#d6a24c'); cg.addColorStop(0.5, '#f8dc98'); cg.addColorStop(1, '#3a250c');
    g.fillStyle = cg;
    g.beginPath(); g.moveTo(-bw * 0.55, L + 6); g.quadraticCurveTo(-bw * 0.65, L + bh * 0.6, -bw, L + bh);
    g.lineTo(bw, L + bh); g.quadraticCurveTo(bw * 0.65, L + bh * 0.6, bw * 0.55, L + 6); g.quadraticCurveTo(0, L - 2, -bw * 0.55, L + 6); g.fill();
    g.fillStyle = '#5a3d14'; g.beginPath(); g.ellipse(0, L + bh, bw, bw * 0.2, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(80,50,15,0.6)'; g.lineWidth = 1;
    [0.4, 0.7].forEach(k => { g.beginPath(); g.moveTo(-bw * (0.6 + k * 0.35), L + bh * k); g.lineTo(bw * (0.6 + k * 0.35), L + bh * k); g.stroke(); });
    g.restore();
    return { x: ax, y: ay + L + bh * 0.5, r: bw * 1.4 };
  }

  function veMo(dt, o) {
    // mõ đỏ trên đôn bên phải thảm, ngang đỉnh đồng
    moNay = Math.max(0, moNay - dt * 0.006);
    const y0 = K.yD + o[1], sc = tiLe(K.yD);
    const x = W / 2 + nuaTham(K.yD) + W * 0.12 * sc + o[0];
    const dw = W * 0.05 * sc, dh = H * 0.05 * sc;
    // đôn gỗ
    const dg = g.createLinearGradient(x - dw, 0, x + dw, 0);
    dg.addColorStop(0, '#2a0b07'); dg.addColorStop(0.45, '#7a2414'); dg.addColorStop(1, '#22080a');
    g.fillStyle = dg; g.fillRect(x - dw * 0.7, y0 - dh, dw * 1.4, dh);
    g.fillStyle = '#d9a95a'; g.beginPath(); g.ellipse(x, y0 - dh, dw * 0.85, dw * 0.22, 0, 0, Math.PI * 2); g.fill();
    // gối vàng
    g.fillStyle = '#e8b84a'; g.beginPath(); g.ellipse(x, y0 - dh - 2, dw * 0.8, dw * 0.25, 0, 0, Math.PI * 2); g.fill();
    const rw = dw * 0.85, rh = rw * 0.75, y = y0 - dh - 4 - Math.sin(moNay * Math.PI) * 4;
    const mg = g.createRadialGradient(x - rw * 0.4, y - rh * 1.1, 2, x, y - rh * 0.6, rw * 1.3);
    mg.addColorStop(0, '#f08a5a'); mg.addColorStop(0.4, '#a8341f'); mg.addColorStop(1, '#3a0d08');
    g.fillStyle = mg; g.beginPath(); g.ellipse(x, y - rh * 0.6, rw, rh, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#2a0805'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(x - rw * 0.7, y - rh * 0.4); g.quadraticCurveTo(x, y - rh * 0.05, x + rw * 0.7, y - rh * 0.4); g.stroke();
    g.save(); g.translate(x + rw * 1.2, y - rh * 1.5); g.rotate(-0.5 - moNay * 0.6);
    g.fillStyle = '#c9a26a'; g.fillRect(-1.3, 0, 2.6, rw * 1.1);
    g.fillStyle = '#e7d3b0'; g.beginPath(); g.arc(0, rw * 1.1, 3.5, 0, Math.PI * 2); g.fill();
    g.restore();
    return { x, y: y - rh * 0.6, r: rw * 1.6 };
  }

  function veBui(dt, t) {
    g.save(); g.globalCompositeOperation = 'lighter';
    bui.forEach(b => {
      b.y -= b.v * dt; b.x += Math.sin(t * 0.0006 + b.p) * 0.08;
      if (b.y < 0) { b.y = H * 0.7; b.x = rnd(0, W); }
      g.fillStyle = `rgba(255,225,170,${0.25 + 0.25 * Math.sin(t * 0.002 + b.p)})`;
      g.beginPath(); g.arc(b.x, b.y, b.r, 0, Math.PI * 2); g.fill();
    });
    g.restore();
  }

  function veCanhSen(dt, t) {
    for (let i = canh.length - 1; i >= 0; i--) {
      const c = canh[i];
      c.y += dt * c.v; c.x += Math.sin(c.y * 0.01 + c.p) * 0.35; c.q += dt * c.lat;
      if (c.y > H + 10) { if (canh.length > 14) { canh.splice(i, 1); continue; } Object.assign(c, canhMoi(false)); }
      g.save(); g.translate(c.x, c.y); g.rotate(c.q * 0.6); g.scale(Math.cos(c.q), 1);
      const pg = g.createLinearGradient(0, -c.co, 0, c.co);
      pg.addColorStop(0, '#fff0f4'); pg.addColorStop(1, '#f08aa8');
      g.fillStyle = pg; g.globalAlpha = 0.9;
      g.beginPath(); g.moveTo(0, -c.co); g.quadraticCurveTo(c.co * 0.75, 0, 0, c.co); g.quadraticCurveTo(-c.co * 0.75, 0, 0, -c.co); g.fill();
      g.restore();
    }
    g.globalAlpha = 1;
  }

  function hieuUng(dt) {
    for (let i = song.length - 1; i >= 0; i--) {
      const s = song[i]; s.r += dt * 0.12; s.a -= dt * 0.00045;
      if (s.a <= 0) { song.splice(i, 1); continue; }
      g.strokeStyle = `rgba(255,215,140,${s.a})`; g.lineWidth = 2;
      g.beginPath(); g.arc(s.x, s.y, s.r, 0, Math.PI * 2); g.stroke();
    }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = chuBay.length - 1; i >= 0; i--) {
      const c = chuBay[i]; c.tuoi += dt;
      if (c.tuoi > 1300) { chuBay.splice(i, 1); continue; }
      const p = c.tuoi / 1300;
      g.globalAlpha = 1 - p; g.fillStyle = '#ffe2a0';
      g.font = `600 ${Math.round(Math.min(W, H * 0.6) * 0.042)}px 'Be Vietnam Pro', sans-serif`;
      g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = 5;
      g.fillText(c.chu, c.x, c.y - p * 50); g.shadowBlur = 0;
    }
    g.globalAlpha = 1;
    sang = Math.max(0, sang - dt * 0.00012);
  }

  function khung(t) {
    if (!chay) return;
    if (lanCuoi && t - lanCuoi < 32) { requestAnimationFrame(khung); return; }
    const dt = Math.min(66, lanCuoi ? t - lanCuoi : 16);
    lanCuoi = t;
    if (!W || !lop.sau) { doCo(); requestAnimationFrame(khung); return; }
    const troi = giamDong ? 0 : Math.sin((t - t0) * 0.00025) * 0.25;
    lech.x += ((dich.x + troi) - lech.x) * Math.min(1, dt * 0.004);
    lech.y += (dich.y - lech.y) * Math.min(1, dt * 0.004);
    const o = d => [-LE + lech.x * LE * d, -LE + lech.y * LE * 0.5 * d];
    const ve = (ten, d) => { const p = o(d); g.drawImage(lop[ten], p[0], p[1], W + LE * 2, H + LE * 2); return [p[0] + LE, p[1] + LE]; };
    g.setTransform(tl, 0, 0, tl, 0, 0);
    const oSau = ve('sau', 0.3);
    haoQuang(t, oSau);
    veNen(t, oSau);
    tiaSang(t);
    const oSan = ve('san', 0.7);
    veKhoi(dt);
    veNhang(t, oSan);
    vungMo = veMo(dt, oSan);
    const oCot = ve('cot', 0.8);
    capNhatNguoi(dt, t);
    const oNg = [lech.x * LE * 0.85, lech.y * LE * 0.5 * 0.85];
    g.save(); g.translate(oNg[0], oNg[1]);
    const xep = nguoi.slice().sort((a, b) => (a.y || 0) - (b.y || 0));
    xep.forEach(n => veNguoi(n, t, false));
    xep.forEach(n => veNguoi(n, t, true));
    g.restore();
    vungChuong = veChuong(dt, oCot);
    veDenLong(t, oCot);
    veBui(dt, t);
    veCanhSen(dt, t);
    hieuUng(dt);
    g.drawImage(lop.vien, 0, 0, W, H);
    requestAnimationFrame(khung);
  }

  function batDau() { if (chay) return; chay = true; lanCuoi = 0; requestAnimationFrame(khung); }
  function dung() { chay = false; }

  const api = {
    batDau, dung, onCham: null,
    datNhang(ds) { nhang = ds.slice(0, 30); },
    // ds: [{ten, toi, gan}] theo thứ tự ưu tiên ngồi hàng trước
    datNguoi(ds) {
      const cu = new Map(nguoi.map(n => [n.ten, n]));
      nguoi = ds.slice(0, ghe.length || 24).map(d => Object.assign(cu.get(d.ten) || { ten: d.ten, lay: 0 }, d));
      nguoi.forEach((n, i) => {
        const g2 = ghe[i] || null;
        if (n.ghe !== g2) { n.ghe = g2; if (g2 && !(diLe && diLe.n === n)) { n.x = g2.x; n.y = g2.y; } }
      });
    },
    lay(ten) { const n = nguoi.find(v => v.ten === ten); if (n && !(diLe && diLe.n === n)) n.layDen = performance.now(); },
    diDangHuong(ten) {
      const n = nguoi.find(v => v.ten === ten);
      if (!n || !n.ghe || diLe || giamDong) { if (n) api.lay(ten); return; }
      diLe = { n, bd: performance.now() };
    },
    chuong() {
      chuongV += 0.0045; sang = Math.min(1, sang + 0.6);
      if (vungChuong) song.push({ x: vungChuong.x, y: vungChuong.y, r: 10, a: 0.7 });
      if (K.dauPhat) song.push({ x: K.dauPhat.x, y: K.dauPhat.y, r: K.dauPhat.r, a: 0.5 });
      for (let i = 0; i < 16; i++) canh.push(canhMoi(false));
      nguoi.forEach((n, i) => setTimeout(() => api.lay(n.ten), i * 60));
    },
    mo() { moNay = 1; if (vungMo) chuBay.push({ chu: '+1 công đức', x: vungMo.x, y: vungMo.y - H * 0.04 }); sang = Math.min(1, sang + 0.05); },
    huong() { sang = Math.min(1, sang + 0.3); if (K.dinh) chuBay.push({ chu: '3 nén hương', x: K.dinh.x, y: K.dinh.y - H * 0.08 }); },
  };

  cv.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect();
    dich.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    dich.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  cv.addEventListener('pointerleave', () => { dich.x = 0; dich.y = 0; });
  window.addEventListener('deviceorientation', e => {
    if (e.gamma == null) return;
    dich.x = Math.max(-1, Math.min(1, e.gamma / 25));
    dich.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
  });
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const trung = v => v && Math.hypot(x - v.x, y - v.y) < v.r;
    if (trung(vungChuong)) api.onCham && api.onCham('chuong');
    else if (trung(vungMo)) api.onCham && api.onCham('mo');
  });

  new ResizeObserver(() => doCo()).observe(cv);
  document.addEventListener('visibilitychange', () => document.hidden ? dung() : (cv.offsetParent && batDau()));
  if (document.fonts) document.fonts.ready.then(() => doCo());
  return api;
})();
