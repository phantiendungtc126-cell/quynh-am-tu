// Công Viên Cầu Vồng: trời xanh, mặt trời cười, cầu vồng, mây trôi, đồi xanh, vòng đu quay,
// ngựa gỗ xoay, cầu trượt, đài phun nước, cổng cầu vồng và các bạn chibi chạy nhảy có tên.
// Giữ nguyên giao diện gọi hàm của bản cũ để app.js dùng lại.
window.Canh = (() => {
  const cv = document.getElementById('canh');
  const g = cv.getContext('2d');
  const giamDong = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, tl = 1, LE = 0, K = {};
  let lop = {};
  let may = [], buom = [], bongXa = [], bongBay = [], phao = [], tiaNuoc = [], chuBay = [], lapLanh = [];
  let nguoi = [], soBong = 0;
  let chay = false, lanCuoi = 0, t0 = performance.now();
  let lech = { x: 0, y: 0 }, dich = { x: 0, y: 0 };
  let vungMatTroi = null, vungNgua = null, nhunNgua = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;
  const MAU = ['#ff5d73', '#ff9f43', '#ffd23f', '#5bd36b', '#3db7ff', '#7b6cff', '#ff7ec8'];
  const CAU_VONG = ['#ff5d5d', '#ff9f43', '#ffd93d', '#6bd96b', '#43b8ff', '#5b6cff', '#a66bff'];

  function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.ceil(w * tl); c.height = Math.ceil(h * tl); const x = c.getContext('2d'); x.setTransform(tl, 0, 0, tl, 0, 0); return [c, x]; }
  function bam(n) { let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

  // khối tròn bóng như đồ chơi nhựa: màu gốc + ánh sáng trên trái + viền tối dưới phải
  function cauBong(x, cx, cy, r, mau, ry) {
    const gr = x.createRadialGradient(cx - r * 0.35, cy - (ry || r) * 0.4, r * 0.08, cx, cy, r * 1.05);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.18, mau); gr.addColorStop(1, toi(mau, 0.55));
    x.fillStyle = gr; x.beginPath(); x.ellipse(cx, cy, r, ry || r, 0, 0, Math.PI * 2); x.fill();
  }
  function toi(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) * k | 0, g2 = (n >> 8 & 255) * k | 0, b = (n & 255) * k | 0;
    return `rgb(${r},${g2},${b})`;
  }

  function boCuc() {
    const yC = H * 0.46;                         // chân trời: đồi gặp bãi cỏ
    const yQ = H * 0.66;                         // tâm quảng trường
    K = { yC, yQ, vp: { x: W / 2, y: H * 0.38 },
      dpn: { x: W / 2, y: H * 0.6 },             // đài phun nước
      ngua: { x: W * 0.2, y: H * 0.585 },        // ngựa gỗ
      truot: { x: W * 0.84, y: H * 0.57 },       // cầu trượt
      du: { x: W * 0.17, y: H * 0.27, r: Math.min(W * 0.16, H * 0.12) }, // vòng đu quay
      sun: { x: W * 0.87, y: H * 0.33, r: Math.min(W, H) * 0.065 },   // dưới bảng "Bé chăm chơi"
    };
  }
  const tiLe = y => lerp(0.55, 1.15, (y - K.yC) / (H - K.yC));

  // ---------- lớp trời + đồi ----------
  function veTroi() {
    const w = W + LE * 2, h = H + LE * 2, [c, x] = mk(w, h);
    x.translate(LE, LE);
    const tg = x.createLinearGradient(0, -LE, 0, K.yC);
    tg.addColorStop(0, '#59bdff'); tg.addColorStop(0.6, '#a6e0ff'); tg.addColorStop(1, '#e3f6ff');
    x.fillStyle = tg; x.fillRect(-LE, -LE, w, K.yC + LE + 2);
    // cầu vồng lớn
    const cx = W * 0.55, cy = K.yC + H * 0.03, R = Math.min(W * 0.62, H * 0.42), day = R * 0.055;
    x.save(); x.globalAlpha = 0.85;
    CAU_VONG.forEach((m, i) => {
      x.strokeStyle = m; x.lineWidth = day + 1;
      x.beginPath(); x.arc(cx, cy, R - i * day, Math.PI, 0); x.stroke();
    });
    x.globalAlpha = 0.35; x.strokeStyle = '#fff'; x.lineWidth = day * 0.4;
    x.beginPath(); x.arc(cx, cy, R + day * 0.2, Math.PI * 1.05, Math.PI * 1.6); x.stroke();
    x.restore();
    // đồi xa và đồi gần
    const doi = (y0, bien, mau1, mau2, so) => {
      const gr = x.createLinearGradient(0, y0 - bien, 0, K.yC + 4);
      gr.addColorStop(0, mau1); gr.addColorStop(1, mau2);
      x.fillStyle = gr; x.beginPath(); x.moveTo(-LE, K.yC + 4);
      for (let i = 0; i <= so; i++) {
        const px = -LE + (W + LE * 2) * i / so, py = y0 - bien * (0.6 + 0.4 * Math.sin(i * 2.1 + so));
        const qx = -LE + (W + LE * 2) * (i + 0.5) / so;
        x.quadraticCurveTo(px, py, qx, y0 - bien * 0.3);
      }
      x.lineTo(W + LE, K.yC + 4); x.fill();
    };
    doi(K.yC - H * 0.02, H * 0.09, '#a8e6a0', '#7fd27a', 5);
    doi(K.yC + 2, H * 0.06, '#78d36e', '#4fbf52', 4);
    // cây kẹo mút trên đồi
    for (let i = 0; i < 9; i++) {
      const px = W * (0.05 + i * 0.115) + (i % 2) * 6, py = K.yC - H * (0.015 + (i % 3) * 0.012), s = H * 0.022 * (1 + (i % 3) * 0.2);
      x.fillStyle = '#8a5a3a'; x.fillRect(px - s * 0.1, py - s * 0.4, s * 0.2, s * 0.9);
      cauBong(x, px, py - s * 0.9, s * 0.75, i % 3 ? '#4cc75a' : '#7ad35a');
    }
    return c;
  }

  // ---------- lớp đất: cỏ, lối đi, quảng trường, cổng, bồn hoa ----------
  function veDat() {
    const w = W + LE * 2, h = H + LE * 2, [c, x] = mk(w, h);
    x.translate(LE, LE);
    const { yC, yQ } = K;
    const cg = x.createLinearGradient(0, yC, 0, H + LE);
    cg.addColorStop(0, '#8ee26f'); cg.addColorStop(1, '#4fbf4a');
    x.fillStyle = cg; x.fillRect(-LE, yC, w, H - yC + LE * 2);
    // sọc cỏ cắt
    for (let i = 0; i < 9; i++) {
      const y = yC + (H - yC) * Math.pow(i / 9, 1.4);
      x.fillStyle = i % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(0,80,0,0.05)';
      x.fillRect(-LE, y, w, (H - yC) / 9 * (1 + i * 0.25));
    }
    // quảng trường hình bầu dục lát gạch màu
    const qx = W / 2, qr = W * 0.46, qry = (H - yQ) * 0.42;
    x.fillStyle = 'rgba(0,60,0,0.18)'; x.beginPath(); x.ellipse(qx, yQ + 6, qr, qry, 0, 0, Math.PI * 2); x.fill();
    const qg = x.createRadialGradient(qx, yQ - qry * 0.3, 10, qx, yQ, qr);
    qg.addColorStop(0, '#fff6e4'); qg.addColorStop(1, '#f6d9b2');
    x.fillStyle = qg; x.beginPath(); x.ellipse(qx, yQ, qr, qry, 0, 0, Math.PI * 2); x.fill();
    x.save(); x.beginPath(); x.ellipse(qx, yQ, qr, qry, 0, 0, Math.PI * 2); x.clip();
    for (let k = 1; k < 6; k++) {
      x.strokeStyle = MAU[k % MAU.length] + '55'; x.lineWidth = 3;
      x.beginPath(); x.ellipse(qx, yQ, qr * k / 6, qry * k / 6, 0, 0, Math.PI * 2); x.stroke();
    }
    for (let a = 0; a < 16; a++) {
      x.strokeStyle = 'rgba(200,150,100,0.25)'; x.lineWidth = 1;
      x.beginPath(); x.moveTo(qx, yQ); x.lineTo(qx + Math.cos(a / 16 * Math.PI * 2) * qr, yQ + Math.sin(a / 16 * Math.PI * 2) * qry); x.stroke();
    }
    x.restore();
    x.strokeStyle = '#ffffff'; x.lineWidth = 4; x.beginPath(); x.ellipse(qx, yQ, qr, qry, 0, 0, Math.PI * 2); x.stroke();
    // lối đi gạch màu từ dưới lên quảng trường
    const y0 = yQ + qry * 0.6, y1 = H + LE;
    for (let i = 0; i < 12; i++) {
      const a = y0 + (y1 - y0) * i / 12, b = y0 + (y1 - y0) * (i + 1) / 12;
      const wa = W * (0.12 + 0.1 * i / 12), wb = W * (0.12 + 0.1 * (i + 1) / 12);
      const cong = Math.sin(i * 0.5) * W * 0.02, congB = Math.sin((i + 1) * 0.5) * W * 0.02;
      x.fillStyle = i % 2 ? '#ffd6a5' : '#ffe8c9';
      x.beginPath(); x.moveTo(qx - wa + cong, a); x.lineTo(qx + wa + cong, a); x.lineTo(qx + wb + congB, b); x.lineTo(qx - wb + congB, b); x.fill();
      x.fillStyle = MAU[i % MAU.length];
      x.beginPath(); x.arc(qx - wa + cong - 6, a + 3, 3.5, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.arc(qx + wa + cong + 6, a + 3, 3.5, 0, Math.PI * 2); x.fill();
    }
    // bồn hoa và bụi cây tròn
    const bui = (bx, by, s) => { cauBong(x, bx - s * 0.6, by, s * 0.7, '#4cc75a'); cauBong(x, bx + s * 0.6, by, s * 0.7, '#3fb54d'); cauBong(x, bx, by - s * 0.4, s * 0.8, '#5ad65f'); for (let k = 0; k < 5; k++) { x.fillStyle = MAU[(k * 2) % MAU.length]; x.beginPath(); x.arc(bx + rnd(-s, s), by + rnd(-s * 0.8, s * 0.2), s * 0.13, 0, Math.PI * 2); x.fill(); } };
    bui(W * 0.06, yC + H * 0.05, H * 0.03); bui(W * 0.94, yC + H * 0.06, H * 0.03);
    bui(W * 0.08, H * 0.9, H * 0.045); bui(W * 0.92, H * 0.88, H * 0.045);
    // hoa rải trên cỏ
    for (let i = 0; i < 60; i++) {
      const px = rnd(-LE, W + LE), py = rnd(yC + 6, H + LE);
      const dx = (px - qx) / qr, dy = (py - yQ) / qry;
      if (dx * dx + dy * dy < 1.05) continue;
      const s = 1.6 * tiLe(py);
      x.fillStyle = '#fff'; for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; x.beginPath(); x.arc(px + Math.cos(a) * s * 1.6, py + Math.sin(a) * s * 1.6, s, 0, Math.PI * 2); x.fill(); }
      x.fillStyle = MAU[i % MAU.length]; x.beginPath(); x.arc(px, py, s * 0.9, 0, Math.PI * 2); x.fill();
    }
    // cổng cầu vồng phía sau quảng trường
    const gx = W / 2, gy = yQ - qry * 0.95, gR = W * 0.26, gd = gR * 0.075;
    x.fillStyle = 'rgba(0,60,0,0.15)'; x.beginPath(); x.ellipse(gx, gy + 4, gR * 1.05, gR * 0.12, 0, 0, Math.PI * 2); x.fill();
    CAU_VONG.forEach((m, i) => {
      x.strokeStyle = m; x.lineWidth = gd + 1; x.lineCap = 'butt';
      x.beginPath(); x.arc(gx, gy, gR - i * gd, Math.PI, 0); x.stroke();
    });
    // trụ cổng
    [gx - gR + gd * 3, gx + gR - gd * 3].forEach(px => {
      const tr = x.createLinearGradient(px - gd * 2, 0, px + gd * 2, 0);
      tr.addColorStop(0, '#d9a04a'); tr.addColorStop(0.4, '#ffe08a'); tr.addColorStop(1, '#b37a2c');
      x.fillStyle = tr; x.beginPath(); x.roundRect ? x.roundRect(px - gd * 2, gy - gd, gd * 4, gd * 2.4, gd * 0.6) : x.rect(px - gd * 2, gy - gd, gd * 4, gd * 2.4); x.fill();
    });
    // biển tên
    const bw = gR * 1.45, bh = gR * 0.28, bx = gx - bw / 2, by = gy - gR - bh * 0.55;
    x.fillStyle = 'rgba(0,0,0,0.15)'; x.beginPath(); x.roundRect ? x.roundRect(bx + 3, by + 5, bw, bh, bh / 2) : x.rect(bx + 3, by + 5, bw, bh); x.fill();
    const bg = x.createLinearGradient(0, by, 0, by + bh);
    bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#ffe3f1');
    x.fillStyle = bg; x.beginPath(); x.roundRect ? x.roundRect(bx, by, bw, bh, bh / 2) : x.rect(bx, by, bw, bh); x.fill();
    x.strokeStyle = '#ff7ec8'; x.lineWidth = 3; x.stroke();
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `800 ${Math.round(bh * 0.42)}px 'Baloo 2', 'Nunito', sans-serif`;
    const chu = 'CÔNG VIÊN CẦU VỒNG';
    let tx = gx - x.measureText(chu).width / 2;
    [...chu].forEach((ch, i) => {
      const cw = x.measureText(ch).width;
      x.fillStyle = ch === ' ' ? 'transparent' : CAU_VONG[i % CAU_VONG.length];
      x.fillText(ch, tx + cw / 2, by + bh / 2 + 1); tx += cw;
    });
    K.cong = { x: gx, y: gy, r: gR };
    // cầu trượt: tháp + máng vàng uốn
    const t = K.truot, s = tiLe(t.y) * H / 700;
    x.fillStyle = 'rgba(0,60,0,0.18)'; x.beginPath(); x.ellipse(t.x, t.y + 4 * s, 60 * s, 10 * s, 0, 0, Math.PI * 2); x.fill();
    const cot = (px) => { x.fillStyle = '#3db7ff'; x.fillRect(px - 3 * s, t.y - 80 * s, 6 * s, 80 * s); };
    cot(t.x - 18 * s); cot(t.x + 18 * s);
    x.fillStyle = '#ff5d73'; x.beginPath(); x.moveTo(t.x - 26 * s, t.y - 80 * s); x.lineTo(t.x, t.y - 110 * s); x.lineTo(t.x + 26 * s, t.y - 80 * s); x.fill();
    x.fillStyle = '#ffd23f'; x.fillRect(t.x - 22 * s, t.y - 82 * s, 44 * s, 6 * s);
    for (let k = 0; k < 6; k++) { x.fillStyle = '#fff'; x.fillRect(t.x - 16 * s, t.y - 70 * s + k * 11 * s, 32 * s, 3 * s); }
    const mg = x.createLinearGradient(t.x - 70 * s, 0, t.x, 0);
    mg.addColorStop(0, '#ffb000'); mg.addColorStop(1, '#ffe066');
    x.strokeStyle = mg; x.lineWidth = 14 * s; x.lineCap = 'round';
    x.beginPath(); x.moveTo(t.x - 16 * s, t.y - 76 * s); x.bezierCurveTo(t.x - 60 * s, t.y - 70 * s, t.x - 30 * s, t.y - 20 * s, t.x - 78 * s, t.y - 4 * s); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,0.55)'; x.lineWidth = 3 * s;
    x.beginPath(); x.moveTo(t.x - 18 * s, t.y - 80 * s); x.bezierCurveTo(t.x - 62 * s, t.y - 74 * s, t.x - 32 * s, t.y - 24 * s, t.x - 80 * s, t.y - 8 * s); x.stroke();
    return c;
  }

  function veVien() {
    const [c, x] = mk(W, H);
    const v = x.createRadialGradient(W / 2, H * 0.5, H * 0.45, W / 2, H * 0.5, H * 0.9);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(30,60,120,0.18)');
    x.fillStyle = v; x.fillRect(0, 0, W, H);
    return c;
  }

  function doCo() {
    const r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return;
    tl = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; LE = Math.round(W * 0.03);
    cv.width = Math.round(W * tl); cv.height = Math.round(H * tl);
    boCuc();
    lop = { troi: veTroi(), dat: veDat(), vien: veVien() };
    may = Array.from({ length: 5 }, (_, i) => ({ x: rnd(-W * 0.2, W), y: H * (0.06 + i * 0.055), s: rnd(0.7, 1.3), v: rnd(0.004, 0.012) }));
    buom = Array.from({ length: giamDong ? 0 : 4 }, () => ({ x: rnd(0, W), y: rnd(K.yC, H * 0.8), p: rnd(0, 6), m: MAU[(Math.random() * MAU.length) | 0] }));
    bongXa = [];
    nguoi.forEach(n => { if (n.x == null || n.x > W) diemMoi(n, true); });
  }

  // ---------- trời động: mặt trời, mây, đu quay ----------
  function veMatTroi(t, o) {
    const s = K.sun, x0 = s.x + o[0], y0 = s.y + o[1];
    g.save(); g.translate(x0, y0); g.rotate(giamDong ? 0 : t * 0.0003);
    for (let i = 0; i < 12; i++) {
      g.rotate(Math.PI / 6);
      g.fillStyle = i % 2 ? '#ffcf3d' : '#ffe27a';
      g.beginPath(); g.moveTo(s.r * 1.1, -s.r * 0.18); g.lineTo(s.r * 1.6, 0); g.lineTo(s.r * 1.1, s.r * 0.18); g.fill();
    }
    g.restore();
    cauBong(g, x0, y0, s.r, '#ffd23f');
    // mặt cười
    g.fillStyle = '#5a3a1a';
    g.beginPath(); g.ellipse(x0 - s.r * 0.32, y0 - s.r * 0.1, s.r * 0.09, s.r * 0.13, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(x0 + s.r * 0.32, y0 - s.r * 0.1, s.r * 0.09, s.r * 0.13, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x0 - s.r * 0.29, y0 - s.r * 0.15, s.r * 0.035, 0, Math.PI * 2); g.arc(x0 + s.r * 0.35, y0 - s.r * 0.15, s.r * 0.035, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,110,110,0.55)';
    g.beginPath(); g.ellipse(x0 - s.r * 0.55, y0 + s.r * 0.15, s.r * 0.14, s.r * 0.09, 0, 0, Math.PI * 2); g.ellipse(x0 + s.r * 0.55, y0 + s.r * 0.15, s.r * 0.14, s.r * 0.09, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#5a3a1a'; g.lineWidth = Math.max(1.5, s.r * 0.07); g.lineCap = 'round';
    g.beginPath(); g.arc(x0, y0 + s.r * 0.08, s.r * 0.28, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    return { x: x0, y: y0, r: s.r * 1.4 };
  }

  function veMay(dt, o) {
    may.forEach(m => {
      m.x += m.v * dt; if (m.x > W + 80) m.x = -120;
      const x0 = m.x + o[0], y0 = m.y + o[1], r = H * 0.028 * m.s;
      g.fillStyle = 'rgba(120,170,220,0.35)';
      g.beginPath(); g.ellipse(x0 + r * 0.2, y0 + r * 0.55, r * 2.2, r * 0.45, 0, 0, Math.PI * 2); g.fill();
      [[-1.3, 0.1, 0.8], [-0.5, -0.35, 1.05], [0.5, -0.25, 0.95], [1.3, 0.12, 0.75], [0, 0.15, 1]].forEach(([dx, dy, k]) => {
        const gr = g.createRadialGradient(x0 + dx * r - r * 0.3 * k, y0 + dy * r - r * 0.4 * k, r * 0.1, x0 + dx * r, y0 + dy * r, r * k);
        gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.7, '#f4fbff'); gr.addColorStop(1, '#cfe6f7');
        g.fillStyle = gr; g.beginPath(); g.arc(x0 + dx * r, y0 + dy * r, r * k, 0, Math.PI * 2); g.fill();
      });
    });
  }

  function veDuQuay(t, o) {
    const d = K.du, x0 = d.x + o[0], y0 = d.y + o[1], R = d.r, goc = giamDong ? 0 : t * 0.00025;
    // chân đỡ
    g.strokeStyle = '#7b6cff'; g.lineWidth = Math.max(3, R * 0.06); g.lineCap = 'round';
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 - R * 0.55, K.yC + o[1] * 0.4); g.moveTo(x0, y0); g.lineTo(x0 + R * 0.55, K.yC + o[1] * 0.4); g.stroke();
    // vành
    g.strokeStyle = '#ff7ec8'; g.lineWidth = Math.max(2, R * 0.04);
    g.beginPath(); g.arc(x0, y0, R, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1.2;
    g.beginPath(); g.arc(x0, y0, R * 0.92, 0, Math.PI * 2); g.stroke();
    const so = 8;
    for (let i = 0; i < so; i++) {
      const a = goc + i / so * Math.PI * 2, px = x0 + Math.cos(a) * R, py = y0 + Math.sin(a) * R;
      g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(px, py); g.stroke();
      // cabin treo luôn thẳng đứng
      const cw = R * 0.22, ch = R * 0.2;
      g.strokeStyle = '#555'; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py); g.lineTo(px, py + ch * 0.3); g.stroke();
      const m = MAU[i % MAU.length];
      const cg = g.createLinearGradient(px - cw / 2, 0, px + cw / 2, 0);
      cg.addColorStop(0, toi(m, 0.75)); cg.addColorStop(0.4, m); cg.addColorStop(1, toi(m, 0.6));
      g.fillStyle = cg;
      g.beginPath(); g.roundRect ? g.roundRect(px - cw / 2, py + ch * 0.3, cw, ch, ch * 0.35) : g.rect(px - cw / 2, py + ch * 0.3, cw, ch); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(px - cw * 0.32, py + ch * 0.45, cw * 0.64, ch * 0.3);
    }
    cauBong(g, x0, y0, R * 0.1, '#ffd23f');
  }

  // ---------- ngựa gỗ xoay ----------
  function veNgua(t, o) {
    const p = K.ngua, s = tiLe(p.y) * H / 700, x0 = p.x + o[0], y0 = p.y + o[1];
    nhunNgua = Math.max(0, nhunNgua - 0.02);
    const goc = giamDong ? 0 : t * 0.0009 * (1 + nhunNgua * 3);
    g.fillStyle = 'rgba(0,60,0,0.2)'; g.beginPath(); g.ellipse(x0, y0 + 4 * s, 62 * s, 12 * s, 0, 0, Math.PI * 2); g.fill();
    // sàn xoay
    cauBong(g, x0, y0, 58 * s, '#ffd23f', 11 * s);
    g.fillStyle = '#ff9f43'; g.beginPath(); g.ellipse(x0, y0 + 3 * s, 58 * s, 11 * s, 0, 0, Math.PI); g.fill();
    // cột giữa
    const cg = g.createLinearGradient(x0 - 5 * s, 0, x0 + 5 * s, 0);
    cg.addColorStop(0, '#c0392b'); cg.addColorStop(0.5, '#ff8a80'); cg.addColorStop(1, '#a93226');
    g.fillStyle = cg; g.fillRect(x0 - 5 * s, y0 - 86 * s, 10 * s, 86 * s);
    // ngựa: vẽ theo thứ tự sau ra trước
    const ds = [];
    for (let i = 0; i < 6; i++) { const a = goc + i / 6 * Math.PI * 2; ds.push({ a, i, z: Math.sin(a) }); }
    ds.sort((m, n) => m.z - n.z).forEach(({ a, i, z }) => {
      const px = x0 + Math.cos(a) * 44 * s, py = y0 - 8 * s + z * 7 * s, sc = 0.8 + z * 0.15;
      const nay = Math.sin(t * 0.004 + i * 1.3) * 6 * s;
      g.strokeStyle = '#e6c27a'; g.lineWidth = 2 * s; g.beginPath(); g.moveTo(px, y0 - 84 * s + z * 4 * s); g.lineTo(px, py); g.stroke();
      const m = MAU[i % MAU.length], hy = py - 26 * s + nay, hw = 18 * s * sc, dir = Math.cos(a + Math.PI / 2) > 0 ? 1 : -1;
      cauBong(g, px, hy, hw, m, hw * 0.55);
      cauBong(g, px + dir * hw * 0.9, hy - hw * 0.55, hw * 0.42, m, hw * 0.36);
      g.fillStyle = toi(m, 0.6);
      g.fillRect(px - hw * 0.6, hy + hw * 0.3, 2.5 * s, 10 * s); g.fillRect(px + hw * 0.45, hy + hw * 0.3, 2.5 * s, 10 * s);
      g.fillStyle = '#5a3a1a'; g.beginPath(); g.arc(px + dir * hw * 1.05, hy - hw * 0.62, 1.6 * s, 0, Math.PI * 2); g.fill();
    });
    // mái lều sọc xoay
    const mr = 68 * s, my = y0 - 86 * s, mh = 40 * s;
    for (let i = 0; i < 12; i++) {
      const a1 = goc * 0.5 + i / 12 * Math.PI * 2, a2 = goc * 0.5 + (i + 1) / 12 * Math.PI * 2;
      if (Math.sin((a1 + a2) / 2) < -0.2) continue;
      g.fillStyle = i % 2 ? '#ffffff' : '#ff5d73';
      g.beginPath(); g.moveTo(x0, my - mh);
      g.lineTo(x0 + Math.cos(a1) * mr, my + Math.sin(a1) * mr * 0.22);
      g.lineTo(x0 + Math.cos(a2) * mr, my + Math.sin(a2) * mr * 0.22); g.fill();
    }
    g.fillStyle = 'rgba(0,0,0,0.08)'; g.beginPath(); g.moveTo(x0, my - mh); g.lineTo(x0 + mr, my); g.lineTo(x0 + mr * 0.3, my + mr * 0.2); g.fill();
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; if (Math.sin(a) < -0.1) continue; g.fillStyle = MAU[i % MAU.length]; g.beginPath(); g.arc(x0 + Math.cos(a) * mr, my + Math.sin(a) * mr * 0.22 + 3 * s, 4 * s, 0, Math.PI); g.fill(); }
    cauBong(g, x0, my - mh - 4 * s, 6 * s, '#ffd23f');
    return { x: x0, y: y0 - 40 * s, r: 70 * s };
  }

  // ---------- đài phun nước ----------
  function veDaiPhun(dt, t, o) {
    const p = K.dpn, s = tiLe(p.y) * H / 700, x0 = p.x + o[0], y0 = p.y + o[1];
    g.fillStyle = 'rgba(0,60,0,0.2)'; g.beginPath(); g.ellipse(x0, y0 + 5 * s, 62 * s, 13 * s, 0, 0, Math.PI * 2); g.fill();
    cauBong(g, x0, y0, 58 * s, '#9ad8ff', 14 * s);
    g.fillStyle = '#5ec3ff'; g.beginPath(); g.ellipse(x0, y0 - 3 * s, 50 * s, 10 * s, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(x0 - 12 * s, y0 - 5 * s, 20 * s, 3 * s, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff'; g.fillRect(x0 - 4 * s, y0 - 34 * s, 8 * s, 32 * s);
    cauBong(g, x0, y0 - 34 * s, 22 * s, '#ff9fd0', 6 * s);
    // tia nước
    if (!giamDong && tiaNuoc.length < 90) for (let k = 0; k < 2; k++) tiaNuoc.push({ x: x0, y: y0 - 38 * s, vx: rnd(-0.9, 0.9) * s, vy: rnd(-3.2, -2.4) * s, tuoi: 0, s });
    for (let i = tiaNuoc.length - 1; i >= 0; i--) {
      const d = tiaNuoc[i]; d.tuoi += dt; d.x += d.vx * dt * 0.06; d.y += d.vy * dt * 0.06; d.vy += 0.09 * d.s * dt * 0.06;
      if (d.y > y0 - 4 * s || d.tuoi > 3000) { tiaNuoc.splice(i, 1); continue; }
      g.fillStyle = 'rgba(220,245,255,0.85)'; g.beginPath(); g.arc(d.x, d.y, 1.8 * d.s + 0.6, 0, Math.PI * 2); g.fill();
    }
    K.dinh = { x: x0, y: y0 - 40 * s, sc: s };
  }

  // ---------- các bạn chibi ----------
  const TOC = ['#2b1d16', '#5a3420', '#8a5a2b', '#1d1d2b', '#c98a3a'];
  const DA = ['#ffd9b8', '#f7c9a0', '#f2c19a'];
  function diemMoi(n, ngay) {
    // chọn chỗ đứng ngẫu nhiên trên quảng trường hoặc bãi cỏ
    const a = rnd(0, Math.PI * 2), rr = Math.sqrt(Math.random());
    const tx = W / 2 + Math.cos(a) * W * 0.42 * rr, ty = K.yQ + Math.sin(a) * (H - K.yQ) * 0.36 * rr + H * 0.02;
    n.dx = Math.max(W * 0.06, Math.min(W * 0.94, tx)); n.dy = Math.max(K.yC + H * 0.13, Math.min(H * 0.86, ty));
    if (ngay) { n.x = n.dx; n.y = n.dy; }
    n.cho = rnd(800, 3500);
  }
  function capNhatNguoi(dt, t) {
    nguoi.forEach(n => {
      if (n.x == null) diemMoi(n, true);
      if (n.nhay > 0) n.nhay = Math.max(0, n.nhay - dt);
      if (n.viec) {
        const v = n.viec, p = t - v.bd;
        if (p < 1600) { n.dx = v.x; n.dy = v.y; }
        else if (p < 3400) { if (!v.tha) { v.tha = true; n.nhay = 700; thaBong(n.x, n.y - H * 0.08, 3); } }
        else { n.viec = null; diemMoi(n); }
      }
      const kx = n.dx - n.x, ky = n.dy - n.y, kc = Math.hypot(kx, ky);
      const toc = (n.viec ? 0.11 : 0.045) * dt * tiLe(n.y);
      if (kc > 2) { n.x += kx / kc * Math.min(toc, kc); n.y += ky / kc * Math.min(toc, kc) * 0.8; n.di = true; n.huong = kx < 0 ? -1 : 1; }
      else { n.di = false; if (!n.viec) { n.cho -= dt; if (n.cho <= 0 && !giamDong) diemMoi(n); } }
    });
  }

  function veNguoi(n, t, chiTen) {
    if (n.x == null) return;
    const sc = tiLe(n.y), h = H * 0.1 * sc, x = n.x;
    const nayDi = n.di ? Math.abs(Math.sin(t * 0.012 + n.pha)) * h * 0.06 : Math.abs(Math.sin(t * 0.003 + n.pha)) * h * 0.015;
    const nhay = n.nhay > 0 ? Math.sin((1 - n.nhay / 700) * Math.PI) * h * 0.45 : 0;
    const y = n.y - nayDi - nhay;
    if (chiTen) { veTen(n, x, y - h * 1.02, sc); return; }
    const k = bam(n.ten), ao = MAU[k % MAU.length], quan = MAU[(k >> 3) % MAU.length], toc = TOC[(k >> 5) % TOC.length], da = DA[(k >> 7) % DA.length], kieu = (k >> 9) % 4;
    // bóng dưới chân (không nhảy theo)
    g.fillStyle = 'rgba(0,60,0,0.22)'; g.beginPath(); g.ellipse(x, n.y + 1, h * 0.26 * (1 - nhay / h * 0.5), h * 0.07, 0, 0, Math.PI * 2); g.fill();
    // chân bước
    const buoc = n.di ? Math.sin(t * 0.012 + n.pha) * h * 0.06 : 0;
    g.fillStyle = toi(quan, 0.7);
    g.beginPath(); g.roundRect ? g.roundRect(x - h * 0.13 + buoc, y - h * 0.2, h * 0.1, h * 0.2, h * 0.05) : g.rect(x - h * 0.13, y - h * 0.2, h * 0.1, h * 0.2); g.fill();
    g.beginPath(); g.roundRect ? g.roundRect(x + h * 0.03 - buoc, y - h * 0.2, h * 0.1, h * 0.2, h * 0.05) : g.rect(x + h * 0.03, y - h * 0.2, h * 0.1, h * 0.2); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x - h * 0.08 + buoc, y - h * 0.01, h * 0.08, h * 0.04, 0, 0, Math.PI * 2); g.ellipse(x + h * 0.08 - buoc, y - h * 0.01, h * 0.08, h * 0.04, 0, 0, Math.PI * 2); g.fill();
    // thân áo
    const ag = g.createLinearGradient(x - h * 0.2, 0, x + h * 0.2, 0);
    ag.addColorStop(0, toi(ao, 0.8)); ag.addColorStop(0.35, ao); ag.addColorStop(1, toi(ao, 0.65));
    g.fillStyle = ag;
    g.beginPath(); g.moveTo(x - h * 0.2, y - h * 0.16); g.quadraticCurveTo(x - h * 0.2, y - h * 0.46, x, y - h * 0.47); g.quadraticCurveTo(x + h * 0.2, y - h * 0.46, x + h * 0.2, y - h * 0.16); g.closePath(); g.fill();
    // tay vẫy khi nhảy
    const vay = nhay > 0 ? -0.9 : (n.di ? Math.sin(t * 0.012 + n.pha) * 0.4 : 0.2);
    [-1, 1].forEach(b => {
      g.save(); g.translate(x + b * h * 0.18, y - h * 0.4); g.rotate(b * (0.5 + (nhay > 0 ? 1.6 : 0)) + vay * b * 0.3);
      g.fillStyle = ao; g.beginPath(); g.roundRect ? g.roundRect(-h * 0.045, 0, h * 0.09, h * 0.2, h * 0.045) : g.rect(-h * 0.045, 0, h * 0.09, h * 0.2); g.fill();
      g.fillStyle = da; g.beginPath(); g.arc(0, h * 0.21, h * 0.05, 0, Math.PI * 2); g.fill();
      g.restore();
    });
    // đầu to
    const hr = h * 0.3, hy = y - h * 0.47 - hr * 0.85;
    const dg = g.createRadialGradient(x - hr * 0.35, hy - hr * 0.3, hr * 0.1, x, hy, hr);
    dg.addColorStop(0, '#fff3e6'); dg.addColorStop(0.3, da); dg.addColorStop(1, toi(da.replace('#', '#'), 0.85));
    // tóc sau
    g.fillStyle = toc;
    if (kieu === 1) { g.beginPath(); g.arc(x - hr * 0.95, hy + hr * 0.1, hr * 0.3, 0, Math.PI * 2); g.arc(x + hr * 0.95, hy + hr * 0.1, hr * 0.3, 0, Math.PI * 2); g.fill(); }
    if (kieu === 2) { g.beginPath(); g.arc(x, hy - hr * 1.05, hr * 0.32, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = dg; g.beginPath(); g.arc(x, hy, hr, 0, Math.PI * 2); g.fill();
    // tóc trước
    g.fillStyle = toc;
    g.beginPath(); g.arc(x, hy - hr * 0.05, hr * 1.02, Math.PI * 1.02, Math.PI * 1.98); g.quadraticCurveTo(x + hr * 0.4, hy - hr * 0.35, x, hy - hr * 0.42); g.quadraticCurveTo(x - hr * 0.5, hy - hr * 0.3, x - hr * 1.0, hy - hr * 0.1); g.fill();
    if (kieu === 3) { // mũ lưỡi trai
      g.fillStyle = quan; g.beginPath(); g.arc(x, hy - hr * 0.2, hr * 1.02, Math.PI, 0); g.fill();
      g.fillRect(x - hr * 0.1 + n.huong * hr * 0.2, hy - hr * 0.28, hr * 1.1 * n.huong, hr * 0.16);
      g.fillStyle = '#fff'; g.beginPath(); g.arc(x, hy - hr * 1.1, hr * 0.12, 0, Math.PI * 2); g.fill();
    }
    // mắt to long lanh, má hồng, miệng cười
    const mx = n.huong * hr * 0.08;
    g.fillStyle = '#2a1a14';
    g.beginPath(); g.ellipse(x - hr * 0.36 + mx, hy + hr * 0.12, hr * 0.12, hr * 0.16, 0, 0, Math.PI * 2); g.ellipse(x + hr * 0.36 + mx, hy + hr * 0.12, hr * 0.12, hr * 0.16, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff';
    g.beginPath(); g.arc(x - hr * 0.32 + mx, hy + hr * 0.06, hr * 0.05, 0, Math.PI * 2); g.arc(x + hr * 0.4 + mx, hy + hr * 0.06, hr * 0.05, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,120,140,0.5)';
    g.beginPath(); g.ellipse(x - hr * 0.6, hy + hr * 0.38, hr * 0.15, hr * 0.09, 0, 0, Math.PI * 2); g.ellipse(x + hr * 0.6, hy + hr * 0.38, hr * 0.15, hr * 0.09, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#8a3a2a'; g.lineWidth = Math.max(1, hr * 0.07); g.lineCap = 'round';
    g.beginPath(); g.arc(x + mx, hy + hr * 0.36, hr * (nhay > 0 ? 0.18 : 0.13), 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
    if (n.toi) { // vương miện sao cho mình
      g.fillStyle = '#ffd23f'; g.strokeStyle = '#e69a00'; g.lineWidth = 1;
      sao(g, x, hy - hr * 1.25, hr * 0.32); g.fill(); g.stroke();
    }
    // bóng bay mình đang cầm
    if (n.cam) {
      const bx = x + h * 0.32, by = hy - h * 0.55 + Math.sin(t * 0.003 + n.pha) * 3;
      g.strokeStyle = 'rgba(80,80,80,0.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + h * 0.2, y - h * 0.22); g.quadraticCurveTo(bx + 4, (by + y) / 2, bx, by + h * 0.13); g.stroke();
      cauBong(g, bx, by, h * 0.13, n.cam, h * 0.16);
    }
  }

  function sao(x, cx, cy, r) {
    x.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    x.closePath();
  }

  function veTen(n, x, y, sc) {
    if (!n.ten) return;
    const fs = Math.max(9, 11 * Math.min(1, sc));
    g.font = `800 ${fs}px 'Baloo 2', 'Nunito', sans-serif`;
    const p = n.ten.trim().split(/\s+/), ngan = p.slice(-2).join(' ');
    const ten = ngan.length > 10 ? p[p.length - 1].slice(0, 10) : ngan;
    const tw = g.measureText(ten).width + 12, rr = fs * 0.78;
    const k = bam(n.ten), m = n.toi ? '#ff9f43' : MAU[k % MAU.length];
    g.fillStyle = 'rgba(0,0,0,0.15)'; g.beginPath(); g.roundRect ? g.roundRect(x - tw / 2 + 1, y - rr + 2, tw, rr * 2, rr) : g.rect(x - tw / 2, y - rr, tw, rr * 2); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect ? g.roundRect(x - tw / 2, y - rr, tw, rr * 2, rr) : g.rect(x - tw / 2, y - rr, tw, rr * 2); g.fill();
    g.strokeStyle = m; g.lineWidth = 2; g.stroke();
    g.fillStyle = toi(m, 0.7); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(ten, x, y + 1);
  }

  // ---------- hiệu ứng ----------
  function thaBong(x, y, so) {
    for (let i = 0; i < so; i++) bongBay.push({ x: x + rnd(-14, 14), y: y + rnd(-6, 6), vy: rnd(-0.75, -0.5), p: rnd(0, 6), m: MAU[(Math.random() * MAU.length) | 0], r: rnd(9, 13) * Math.min(W, H * 0.7) / 380 });
  }
  function banPhao(x, y, so) {
    for (let i = 0; i < so; i++) phao.push({ x, y, vx: rnd(-3, 3), vy: rnd(-5.5, -2), q: rnd(0, 6), vq: rnd(-0.2, 0.2), m: MAU[(Math.random() * MAU.length) | 0], tuoi: 0, w: rnd(4, 8), h: rnd(2.5, 5) });
  }

  function veHieuUng(dt, t) {
    // bóng bay bay lên trời
    for (let i = bongBay.length - 1; i >= 0; i--) {
      const b = bongBay[i]; b.y += b.vy * dt * 0.06; b.x += Math.sin(t * 0.002 + b.p) * 0.3;
      if (b.y < -40) { bongBay.splice(i, 1); continue; }
      g.strokeStyle = 'rgba(90,90,90,0.5)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(b.x, b.y + b.r * 1.2); g.quadraticCurveTo(b.x + Math.sin(t * 0.004 + b.p) * 6, b.y + b.r * 2.2, b.x, b.y + b.r * 3.4); g.stroke();
      cauBong(g, b.x, b.y, b.r, b.m, b.r * 1.2);
      g.fillStyle = toi(b.m, 0.7); g.beginPath(); g.moveTo(b.x - 2.5, b.y + b.r * 1.25); g.lineTo(b.x + 2.5, b.y + b.r * 1.25); g.lineTo(b.x, b.y + b.r * 1.1); g.fill();
    }
    // pháo giấy
    for (let i = phao.length - 1; i >= 0; i--) {
      const p = phao[i]; p.tuoi += dt; p.x += p.vx * dt * 0.06; p.y += p.vy * dt * 0.06; p.vy += 0.08 * dt * 0.06; p.vx *= 0.995; p.q += p.vq;
      if (p.y > H + 10 || p.tuoi > 5000) { phao.splice(i, 1); continue; }
      g.save(); g.translate(p.x, p.y); g.rotate(p.q); g.scale(1, Math.cos(p.q * 2));
      g.fillStyle = p.m; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore();
    }
    // bong bóng xà phòng
    if (!giamDong && Math.random() < 0.02 && bongXa.length < 14) bongXa.push({ x: rnd(W * 0.1, W * 0.9), y: H * rnd(0.75, 0.95), r: rnd(5, 12), vy: rnd(-0.35, -0.2), p: rnd(0, 6) });
    for (let i = bongXa.length - 1; i >= 0; i--) {
      const b = bongXa[i]; b.y += b.vy * dt * 0.06; b.x += Math.sin(t * 0.0015 + b.p) * 0.25;
      if (b.y < K.yC - H * 0.1) { bongXa.splice(i, 1); continue; }
      const gr = g.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1, b.x, b.y, b.r);
      gr.addColorStop(0, 'rgba(255,255,255,0.05)'); gr.addColorStop(0.75, 'rgba(180,220,255,0.15)'); gr.addColorStop(0.92, 'rgba(255,170,230,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0.1)');
      g.fillStyle = gr; g.beginPath(); g.arc(b.x, b.y, b.r, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(b.x - b.r * 0.4, b.y - b.r * 0.4, b.r * 0.22, b.r * 0.12, -0.7, 0, Math.PI * 2); g.fill();
    }
    // bướm
    buom.forEach(b => {
      b.p += dt * 0.004; b.x += Math.cos(b.p * 0.3) * 0.5; b.y += Math.sin(b.p * 0.45) * 0.3;
      if (b.x < 0) b.x = W; if (b.x > W) b.x = 0;
      b.y = Math.max(K.yC - H * 0.05, Math.min(H * 0.85, b.y));
      const v = Math.abs(Math.sin(b.p * 4)), s = 6;
      g.fillStyle = b.m;
      g.beginPath(); g.ellipse(b.x - s * 0.6 * v, b.y, s * v + 1, s * 0.8, -0.3, 0, Math.PI * 2); g.ellipse(b.x + s * 0.6 * v, b.y, s * v + 1, s * 0.8, 0.3, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#333'; g.fillRect(b.x - 0.8, b.y - s * 0.6, 1.6, s * 1.2);
    });
    // chữ bay
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = chuBay.length - 1; i >= 0; i--) {
      const c = chuBay[i]; c.tuoi += dt;
      if (c.tuoi > 1300) { chuBay.splice(i, 1); continue; }
      const p = c.tuoi / 1300;
      g.globalAlpha = 1 - p;
      g.font = `800 ${Math.round(Math.min(W, H * 0.6) * 0.05)}px 'Baloo 2', 'Nunito', sans-serif`;
      g.lineWidth = 4; g.strokeStyle = '#fff'; g.strokeText(c.chu, c.x, c.y - p * 50);
      g.fillStyle = c.m || '#ff5d73'; g.fillText(c.chu, c.x, c.y - p * 50);
    }
    g.globalAlpha = 1;
    // lấp lánh
    for (let i = lapLanh.length - 1; i >= 0; i--) {
      const s = lapLanh[i]; s.tuoi += dt;
      if (s.tuoi > 900) { lapLanh.splice(i, 1); continue; }
      const k = Math.sin(s.tuoi / 900 * Math.PI);
      g.fillStyle = `rgba(255,230,90,${k})`; sao(g, s.x, s.y, 6 * k + 1); g.fill();
    }
  }

  function veBongCho(t, o) {
    // chùm bóng bay đang bay quanh đài phun (thay cho nhang đang cháy)
    if (!K.dinh || !soBong) return;
    const n = Math.min(soBong, 18), d = K.dinh;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + t * 0.0004, rr = 26 * d.sc + (i % 3) * 8 * d.sc;
      const bx = d.x + Math.cos(a) * rr, by = d.y - 60 * d.sc - (i % 4) * 9 * d.sc + Math.sin(t * 0.002 + i) * 4;
      g.strokeStyle = 'rgba(90,90,90,0.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(bx, by + 10 * d.sc); g.lineTo(d.x, d.y + 4); g.stroke();
      cauBong(g, bx, by, 8 * d.sc + 2, MAU[i % MAU.length], 10 * d.sc + 2);
    }
  }

  function khung(t) {
    if (!chay) return;
    if (lanCuoi && t - lanCuoi < 32) { requestAnimationFrame(khung); return; }
    const dt = Math.min(66, lanCuoi ? t - lanCuoi : 16);
    lanCuoi = t;
    if (!W || !lop.troi) { doCo(); requestAnimationFrame(khung); return; }
    const troi = giamDong ? 0 : Math.sin((t - t0) * 0.00025) * 0.25;
    lech.x += ((dich.x + troi) - lech.x) * Math.min(1, dt * 0.004);
    lech.y += (dich.y - lech.y) * Math.min(1, dt * 0.004);
    const o = d => [lech.x * LE * d, lech.y * LE * 0.5 * d];
    const ve = (ten, d) => { const p = o(d); g.drawImage(lop[ten], p[0] - LE, p[1] - LE, W + LE * 2, H + LE * 2); return p; };
    g.setTransform(tl, 0, 0, tl, 0, 0);
    const oT = ve('troi', 0.15);
    vungMatTroi = veMatTroi(t, o(0.08));
    veMay(dt, o(0.12));
    veDuQuay(t, o(0.25));
    const oD = ve('dat', 0.6);
    veDaiPhun(dt, t, oD);
    vungNgua = veNgua(t, oD);
    veBongCho(t, oD);
    capNhatNguoi(dt, t);
    const oN = o(0.75);
    g.save(); g.translate(oN[0], oN[1]);
    const xep = nguoi.slice().sort((a, b) => a.y - b.y);
    xep.forEach(n => veNguoi(n, t, false));
    xep.forEach(n => veNguoi(n, t, true));
    g.restore();
    veHieuUng(dt, t);
    g.drawImage(lop.vien, 0, 0, W, H);
    void oT;
    requestAnimationFrame(khung);
  }

  function batDau() { if (chay) return; chay = true; lanCuoi = 0; requestAnimationFrame(khung); }
  function dung() { chay = false; }

  const api = {
    batDau, dung, onCham: null,
    datNhang(ds) { soBong = ds.length; },
    datNguoi(ds) {
      const cu = new Map(nguoi.map(n => [n.ten, n]));
      nguoi = ds.slice(0, 24).map(d => Object.assign(cu.get(d.ten) || { ten: d.ten, pha: Math.random() * 6, huong: 1, nhay: 0 }, d));
      nguoi.forEach(n => { if (n.toi && !n.cam) n.cam = MAU[bam(n.ten) % MAU.length]; });
    },
    lay(ten) { const n = nguoi.find(v => v.ten === ten); if (n) { n.nhay = 700; lapLanh.push({ x: n.x, y: n.y - H * 0.12, tuoi: 0 }); } },
    diDangHuong(ten) {
      const n = nguoi.find(v => v.ten === ten);
      if (!n || !K.dinh) return;
      if (giamDong) { thaBong(n.x, n.y - H * 0.08, 3); return; }
      n.viec = { bd: performance.now(), x: K.dinh.x + rnd(-40, 40), y: K.dpn.y + H * 0.05 };
    },
    chuong() {
      banPhao(W * 0.25, H * 0.55, 40); banPhao(W * 0.75, H * 0.55, 40); banPhao(W / 2, H * 0.35, 30);
      nguoi.forEach((n, i) => setTimeout(() => { n.nhay = 700; }, i * 70));
    },
    mo() { nhunNgua = 1; const n = nguoi.find(v => v.toi); if (n) { n.nhay = 700; chuBay.push({ chu: '+1', x: n.x, y: n.y - H * 0.16, m: '#7b6cff' }); } },
    huong() { if (K.dinh) chuBay.push({ chu: '+3 bóng bay', x: K.dinh.x, y: K.dinh.y - H * 0.1, m: '#ff5d73' }); },
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
    if (trung(vungMatTroi)) api.onCham && api.onCham('chuong');
    else if (trung(vungNgua)) api.onCham && api.onCham('mo');
    else { lapLanh.push({ x, y, tuoi: 0 }); for (let i = 0; i < 4; i++) lapLanh.push({ x: x + rnd(-18, 18), y: y + rnd(-18, 18), tuoi: rnd(-300, 0) }); }
  });

  new ResizeObserver(() => doCo()).observe(cv);
  document.addEventListener('visibilitychange', () => document.hidden ? dung() : (cv.offsetParent && batDau()));
  if (document.fonts) document.fonts.ready.then(() => doCo());
  return api;
})();
