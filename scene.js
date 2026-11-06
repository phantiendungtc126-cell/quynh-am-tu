// Chánh điện 2.5D: các lớp vẽ sẵn (tường, cửa trăng, tượng, cột, bàn thờ) lệch theo độ sâu
// khi nghiêng máy hoặc rê chuột; lớp động gồm nhang, khói, nến, đèn lồng, chuông, mõ, tia sáng, bụi.
window.Canh = (() => {
  const cv = document.getElementById('canh');
  const g = cv.getContext('2d');
  const giamDong = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, tl = 1, LE = 0;
  let lop = {};                 // canvas vẽ sẵn
  let nhang = [], khoi = [], bui = [], song = [], chuBay = [], canh = [];
  let sang = 0, chay = false, lanCuoi = 0, t0 = performance.now();
  let lech = { x: 0, y: 0 }, dich = { x: 0, y: 0 };
  let chuongLac = 0, chuongV = 0, moNay = 0;
  let hatKhoi = null;
  const NGHIENG = { tuong: 0.25, tuongPhat: 0.45, cot: 0.85, ban: 1 };

  // ---------------- tiện ích ----------------
  function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.ceil(w * tl); c.height = Math.ceil(h * tl); const x = c.getContext('2d'); x.setTransform(tl, 0, 0, tl, 0, 0); return [c, x]; }
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ---------------- lớp 0: tường gỗ + cửa trăng ----------------
  function veTuong() {
    const w = W + LE * 2, h = H + LE * 2, [c, x] = mk(w, h);
    x.translate(LE, LE);
    // tường gỗ sẫm
    const gr = x.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#2a0f0b'); gr.addColorStop(0.6, '#3a1611'); gr.addColorStop(1, '#1c0a07');
    x.fillStyle = gr; x.fillRect(-LE, -LE, w, h);
    // ván dọc và chấn song
    for (let i = -2; i < 24; i++) {
      const px = i * W / 20;
      x.fillStyle = i % 2 ? 'rgba(0,0,0,0.18)' : 'rgba(255,200,150,0.025)';
      x.fillRect(px, -LE, W / 20, h);
      x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(px, -LE, 1, h);
    }
    // dải hoa văn chữ Vạn mờ trên cao
    x.strokeStyle = 'rgba(200,150,70,0.12)'; x.lineWidth = 1;
    for (let i = 0; i < 16; i++) {
      const cx = W * (i + 0.5) / 16, cy = H * 0.07, r = W * 0.018;
      x.strokeRect(cx - r, cy - r, r * 2, r * 2);
      x.beginPath(); x.moveTo(cx - r, cy); x.lineTo(cx + r, cy); x.moveTo(cx, cy - r); x.lineTo(cx, cy + r); x.stroke();
    }
    // cửa trăng
    const cx = W / 2, cy = H * 0.37, R = W * 0.36;
    const troi = x.createRadialGradient(cx + R * 0.35, cy - R * 0.4, R * 0.05, cx, cy, R);
    troi.addColorStop(0, '#2b3e72'); troi.addColorStop(0.5, '#152445'); troi.addColorStop(1, '#0a1226');
    x.save(); x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.clip();
    x.fillStyle = troi; x.fillRect(cx - R, cy - R, R * 2, R * 2);
    for (let i = 0; i < 70; i++) {
      x.fillStyle = `rgba(255,255,255,${rnd(0.2, 0.8)})`;
      x.beginPath(); x.arc(cx + rnd(-R, R), cy + rnd(-R, R * 0.2), rnd(0.3, 1.1), 0, Math.PI * 2); x.fill();
    }
    // trăng
    const tx = cx + R * 0.52, ty = cy - R * 0.55;
    const hq = x.createRadialGradient(tx, ty, 0, tx, ty, R * 0.5);
    hq.addColorStop(0, 'rgba(255,248,225,0.55)'); hq.addColorStop(1, 'rgba(255,248,225,0)');
    x.fillStyle = hq; x.fillRect(tx - R, ty - R, R * 2, R * 2);
    x.fillStyle = '#fbf3dc'; x.beginPath(); x.arc(tx, ty, R * 0.09, 0, Math.PI * 2); x.fill();
    // núi xa và cành quỳnh
    x.fillStyle = '#0c1630';
    x.beginPath(); x.moveTo(cx - R, cy + R * 0.35);
    for (let i = 0; i <= 12; i++) x.lineTo(cx - R + i * R / 6, cy + R * (0.18 + 0.12 * Math.sin(i * 1.7) + (i % 3) * 0.03));
    x.lineTo(cx + R, cy + R); x.lineTo(cx - R, cy + R); x.fill();
    x.strokeStyle = '#1d2c22'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(cx - R, cy - R * 0.1); x.quadraticCurveTo(cx - R * 0.6, cy - R * 0.35, cx - R * 0.35, cy - R * 0.62); x.stroke();
    for (let i = 0; i < 5; i++) {
      const bx = cx - R * (0.9 - i * 0.13), by = cy - R * (0.17 + i * 0.1);
      x.fillStyle = 'rgba(246,242,234,0.85)';
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; x.beginPath(); x.ellipse(bx + Math.cos(a) * 3, by + Math.sin(a) * 3, 3.6, 1.6, a, 0, Math.PI * 2); x.fill(); }
    }
    x.restore();
    // khung gỗ cửa trăng có viền vàng
    x.lineWidth = W * 0.035; x.strokeStyle = '#4b1a12';
    x.beginPath(); x.arc(cx, cy, R + W * 0.017, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 2; x.strokeStyle = '#b8873d';
    x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.arc(cx, cy, R + W * 0.034, 0, Math.PI * 2); x.stroke();
    // sàn gạch phối cảnh
    const san = H * 0.74;
    x.fillStyle = '#1a0d0a'; x.fillRect(-LE, san, w, H - san + LE);
    x.strokeStyle = 'rgba(200,140,80,0.10)'; x.lineWidth = 1;
    for (let i = -10; i <= 10; i++) { x.beginPath(); x.moveTo(cx + i * W * 0.04, san); x.lineTo(cx + i * W * 0.22, H + LE); x.stroke(); }
    for (let k = 1; k < 6; k++) { const y = san + (H - san) * Math.pow(k / 6, 1.6); x.beginPath(); x.moveTo(-LE, y); x.lineTo(W + LE, y); x.stroke(); }
    return c;
  }

  // ---------------- lớp 1: tượng Phật + đài sen + hào quang ----------------
  function hinhTuong() {
    const p = new Path2D();
    // chân xếp bằng: hai đầu gối tròn, giữa hơi võng
    p.addPath(new Path2D('M22 190 C18 172 40 164 62 164 L138 164 C160 164 182 172 178 190 C176 204 150 208 100 206 C50 208 24 204 22 190 Z'));
    const than = new Path2D('M100 78 C126 78 146 86 153 101 C161 120 160 152 154 172 L46 172 C40 152 39 120 47 101 C54 86 74 78 100 78 Z');
    p.addPath(than);
    p.rect(90, 66, 20, 16);
    // mỗi elip là một đường riêng, nếu không canvas nối nét thẳng giữa chúng và để lại lỗ
    const elip = (cx, cy, rx, ry, q) => { const e = new Path2D(); e.ellipse(cx, cy, rx, ry, q, 0, Math.PI * 2); p.addPath(e); };
    elip(75, 52, 5.5, 16, -0.08);
    elip(125, 52, 5.5, 16, 0.08);
    elip(100, 47, 24, 28, 0);
    elip(100, 21, 12.5, 10.5, 0);
    return p;
  }

  function veTuongPhat() {
    const w = W + LE * 2, h = H + LE * 2, [c, x] = mk(w, h);
    x.translate(LE, LE);
    const s = (H * 0.56) / 230, ox = W / 2 - 100 * s, oy = H * 0.15 - 22 * s;
    x.save(); x.translate(ox, oy); x.scale(s, s);
    // vầng hào quang hình lửa (mandorla) sau thân
    const hl = x.createRadialGradient(100, 100, 20, 100, 110, 120);
    hl.addColorStop(0, 'rgba(255,214,140,0.30)'); hl.addColorStop(0.7, 'rgba(200,140,60,0.18)'); hl.addColorStop(1, 'rgba(200,140,60,0)');
    x.fillStyle = hl;
    x.beginPath(); x.moveTo(100, -20);
    x.bezierCurveTo(175, 10, 190, 120, 175, 205); x.lineTo(25, 205); x.bezierCurveTo(10, 120, 25, 10, 100, -20); x.fill();
    x.strokeStyle = 'rgba(232,186,100,0.75)'; x.lineWidth = 2; x.stroke();
    // ngọn lửa nhỏ quanh viền
    x.fillStyle = 'rgba(232,186,100,0.55)';
    for (let i = 0; i < 26; i++) {
      const tt = i / 25, a = Math.PI * (1.08 - tt * 1.16);
      const px = 100 + Math.cos(a) * 92, py = 100 - Math.sin(a) * 118;
      x.beginPath(); x.moveTo(px - 3, py); x.quadraticCurveTo(px + 1, py - 9, px + 3, py); x.fill();
    }
    // vòng tròn sau đầu
    const vt = x.createRadialGradient(100, 46, 10, 100, 46, 46);
    vt.addColorStop(0, 'rgba(255,230,170,0.55)'); vt.addColorStop(1, 'rgba(255,230,170,0)');
    x.fillStyle = vt; x.beginPath(); x.arc(100, 46, 46, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(240,200,120,0.9)'; x.lineWidth = 1.6; x.beginPath(); x.arc(100, 46, 38, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = 'rgba(240,200,120,0.4)'; x.lineWidth = 1; x.beginPath(); x.arc(100, 46, 43, 0, Math.PI * 2); x.stroke();

    // đài sen hai tầng, mỗi cánh có khối
    const canhSen = (cx, cy, rw, rh, xoay) => {
      x.save(); x.translate(cx, cy); x.rotate(xoay);
      const gc = x.createLinearGradient(0, -rh, 0, 0);
      gc.addColorStop(0, '#f6d58e'); gc.addColorStop(0.55, '#c98f3f'); gc.addColorStop(1, '#6e4517');
      x.fillStyle = gc;
      x.beginPath(); x.moveTo(-rw, 0); x.bezierCurveTo(-rw, -rh * 0.6, -rw * 0.2, -rh * 0.9, 0, -rh); x.bezierCurveTo(rw * 0.2, -rh * 0.9, rw, -rh * 0.6, rw, 0); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(80,45,10,0.6)'; x.lineWidth = 0.8; x.stroke();
      x.strokeStyle = 'rgba(255,240,200,0.45)'; x.beginPath(); x.moveTo(0, -rh * 0.9); x.lineTo(0, -rh * 0.15); x.stroke();
      x.restore();
    };
    const de = x.createLinearGradient(0, 205, 0, 232);
    de.addColorStop(0, '#a7722d'); de.addColorStop(1, '#3d2408');
    x.fillStyle = de; x.beginPath(); x.ellipse(100, 220, 96, 14, 0, 0, Math.PI * 2); x.fill();
    for (let i = -4; i <= 4; i++) canhSen(100 + i * 22, 222, 13, 26, i * 0.07);
    for (let i = -3; i <= 3; i++) canhSen(100 + i * 24, 210, 14, 30, i * 0.06);

    // thân tượng
    const hinh = hinhTuong();
    // viền sáng mép ngoài: tô bóng sáng lệch lên trái trước khi tô thân
    x.save(); x.translate(-1.4, -1); x.fillStyle = 'rgba(255,240,205,0.85)'; x.fill(hinh); x.restore();
    x.save();
    x.shadowColor = 'rgba(0,0,0,0.55)'; x.shadowBlur = 18; x.shadowOffsetX = 6; x.shadowOffsetY = 4;
    const vang = x.createLinearGradient(30, 0, 170, 230);
    vang.addColorStop(0, '#f7d690'); vang.addColorStop(0.45, '#d6a24c'); vang.addColorStop(1, '#7e5520');
    x.fillStyle = vang; x.fill(hinh);
    x.restore();
    x.save(); x.clip(hinh);
    // ánh sáng chính từ trên trái
    const ds = x.createRadialGradient(78, 40, 5, 90, 70, 140);
    ds.addColorStop(0, 'rgba(255,246,215,0.65)'); ds.addColorStop(0.4, 'rgba(255,230,170,0.15)'); ds.addColorStop(1, 'rgba(255,230,170,0)');
    x.fillStyle = ds; x.fillRect(0, 0, 200, 230);
    // bóng phía phải và dưới
    const bong = x.createLinearGradient(122, 0, 182, 0);
    bong.addColorStop(0, 'rgba(50,25,5,0)'); bong.addColorStop(1, 'rgba(50,25,5,0.45)');
    x.fillStyle = bong; x.fillRect(0, 0, 200, 230);
    const bongDuoi = x.createLinearGradient(0, 150, 0, 210);
    bongDuoi.addColorStop(0, 'rgba(50,25,5,0)'); bongDuoi.addColorStop(1, 'rgba(50,25,5,0.35)');
    x.fillStyle = bongDuoi; x.fillRect(0, 150, 200, 80);
    // tóc xoắn ốc trên đầu
    x.fillStyle = 'rgba(120,75,20,0.45)';
    for (let yy = 12; yy < 40; yy += 4.2) for (let xx = 74; xx < 128; xx += 4.2) {
      const dx = (xx - 100) / 25, dy = (yy - 34) / 22;
      if ((dx * dx + dy * dy < 1 && yy < 33) || ((xx - 100) ** 2 / 156 + (yy - 21) ** 2 / 110 < 1)) {
        x.beginPath(); x.arc(xx + (yy % 8 ? 2 : 0), yy, 1.3, 0, Math.PI * 2); x.fill();
      }
    }
    // nếp áo: đường tối kèm đường sáng
    const nep = (pts, rong) => {
      x.lineCap = 'round';
      x.strokeStyle = 'rgba(80,45,10,0.55)'; x.lineWidth = rong; x.beginPath(); x.moveTo(pts[0], pts[1]); x.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); x.stroke();
      x.strokeStyle = 'rgba(255,235,190,0.35)'; x.lineWidth = rong * 0.6; x.beginPath(); x.moveTo(pts[0] - 1.5, pts[1]); x.quadraticCurveTo(pts[2] - 1.5, pts[3], pts[4] - 1.5, pts[5]); x.stroke();
    };
    nep([118, 82, 96, 120, 70, 168], 1.8);
    nep([126, 90, 112, 125, 92, 168], 1.2);
    nep([132, 96, 140, 130, 146, 168], 1.6);
    nep([66, 92, 58, 130, 56, 168], 1.6);
    nep([30, 190, 100, 212, 170, 190], 1.6);
    nep([45, 178, 100, 196, 155, 178], 1.1);
    // tay kết ấn thiền định
    const tay = x.createLinearGradient(75, 160, 125, 176);
    tay.addColorStop(0, '#f6d38a'); tay.addColorStop(1, '#b07c33');
    x.fillStyle = tay; x.beginPath(); x.ellipse(100, 168, 25, 8.5, 0, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(80,45,10,0.5)'; x.lineWidth = 1; x.stroke();
    // khuôn mặt: sáng đều, nét mảnh
    const mat = x.createRadialGradient(97, 50, 2, 100, 52, 26);
    mat.addColorStop(0, 'rgba(255,240,205,0.35)'); mat.addColorStop(1, 'rgba(255,240,205,0)');
    x.fillStyle = mat; x.beginPath(); x.ellipse(100, 50, 24, 27, 0, 0, Math.PI * 2); x.fill();
    // nếp gấp chân và bàn chân
    x.strokeStyle = 'rgba(80,45,10,0.45)'; x.lineWidth = 1.3;
    x.beginPath(); x.moveTo(60, 196); x.quadraticCurveTo(100, 186, 140, 196); x.stroke();
    x.fillStyle = 'rgba(255,225,170,0.35)';
    x.beginPath(); x.ellipse(132, 184, 11, 4, -0.15, 0, Math.PI * 2); x.fill();
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
    x.restore();
    return c;
  }

  // ---------------- lớp 2: cột son, câu đối, hoành phi ----------------
  function veCot() {
    const w = W + LE * 2, h = H + LE * 2, [c, x] = mk(w, h);
    x.translate(LE, LE);
    const cot = (cx) => {
      const r = W * 0.055;
      const gr = x.createLinearGradient(cx - r, 0, cx + r, 0);
      gr.addColorStop(0, '#2c0a07'); gr.addColorStop(0.3, '#8c2a1e'); gr.addColorStop(0.45, '#c2493a'); gr.addColorStop(0.7, '#6a1e15'); gr.addColorStop(1, '#1f0705');
      x.fillStyle = gr; x.fillRect(cx - r, -LE, r * 2, H * 0.86 + LE);
      // chân tảng đá
      const da = x.createLinearGradient(cx - r * 1.4, 0, cx + r * 1.4, 0);
      da.addColorStop(0, '#2a2420'); da.addColorStop(0.4, '#6b625a'); da.addColorStop(1, '#1d1916');
      x.fillStyle = da; x.beginPath(); x.ellipse(cx, H * 0.86, r * 1.35, r * 0.4, 0, 0, Math.PI * 2); x.fill();
      // bảng câu đối sơn đen chữ vàng
      const bw = r * 1.2, bx = cx - bw / 2, by = H * 0.13, bh = H * 0.5;
      x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(bx + 3, by + 3, bw, bh);
      const bg = x.createLinearGradient(bx, 0, bx + bw, 0);
      bg.addColorStop(0, '#120806'); bg.addColorStop(0.5, '#2a1410'); bg.addColorStop(1, '#0c0504');
      x.fillStyle = bg; x.fillRect(bx, by, bw, bh);
      x.strokeStyle = '#b8873d'; x.lineWidth = 1.2; x.strokeRect(bx + 2, by + 2, bw - 4, bh - 4);
      return { bx, by, bw, bh };
    };
    const traiB = cot(W * 0.055), phaiB = cot(W * 0.945);
    const chu = (s, b) => {
      x.fillStyle = '#e5b862'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = `700 ${Math.round(b.bw * 0.62)}px 'Noto Serif TC', serif`;
      const k = b.bh / (s.length + 0.5);
      [...s].forEach((ch, i) => x.fillText(ch, b.bx + b.bw / 2, b.by + k * (i + 0.75)));
    };
    chu('南無阿彌陀佛', traiB); chu('南無阿彌陀佛', phaiB);
    // xà ngang và hoành phi
    const xa = x.createLinearGradient(0, 0, 0, H * 0.035);
    xa.addColorStop(0, '#5a1d14'); xa.addColorStop(1, '#2a0b07');
    x.fillStyle = xa; x.fillRect(-LE, -LE, W + LE * 2, H * 0.035 + LE);
    x.fillStyle = '#b8873d'; x.fillRect(-LE, H * 0.035, W + LE * 2, 2);
    const hx = W * 0.27, hy = H * 0.045, hw = W * 0.46, hh = H * 0.068;
    x.fillStyle = 'rgba(0,0,0,0.4)'; x.fillRect(hx + 4, hy + 5, hw, hh);
    const hg = x.createLinearGradient(0, hy, 0, hy + hh);
    hg.addColorStop(0, '#4d1912'); hg.addColorStop(1, '#2a0c08');
    x.fillStyle = hg; x.fillRect(hx, hy, hw, hh);
    x.strokeStyle = '#d3a456'; x.lineWidth = 2; x.strokeRect(hx + 3, hy + 3, hw - 6, hh - 6);
    x.strokeStyle = 'rgba(211,164,86,0.45)'; x.lineWidth = 1; x.strokeRect(hx + 6, hy + 6, hw - 12, hh - 12);
    x.fillStyle = '#efc46e'; x.font = `700 ${Math.round(hh * 0.5)}px 'Noto Serif TC', serif`;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 3; x.shadowOffsetY = 1;
    x.fillText('瓊 庵 寺', W / 2, hy + hh / 2 + 1);
    return c;
  }

  // ---------------- lớp 3: bàn thờ phối cảnh ----------------
  function veBan() {
    const w = W + LE * 2, h = H + LE * 2, [c, x] = mk(w, h);
    x.translate(LE, LE);
    const yt = H * 0.785, yf = H * 0.825, lx = W * 0.02, rx = W * 0.98, inset = W * 0.06;
    // bóng bàn trên sàn
    x.fillStyle = 'rgba(0,0,0,0.45)'; x.fillRect(lx - 6, yt - 4, rx - lx + 12, 10);
    // mặt bàn (hình thang)
    const mt = x.createLinearGradient(0, yt, 0, yf);
    mt.addColorStop(0, '#3a110c'); mt.addColorStop(1, '#6e2419');
    x.fillStyle = mt;
    x.beginPath(); x.moveTo(lx + inset, yt); x.lineTo(rx - inset, yt); x.lineTo(rx, yf); x.lineTo(lx, yf); x.closePath(); x.fill();
    // ánh phản chiếu trên mặt bàn sơn mài
    const pc = x.createLinearGradient(lx, 0, rx, 0);
    pc.addColorStop(0, 'rgba(255,200,120,0)'); pc.addColorStop(0.5, 'rgba(255,200,120,0.12)'); pc.addColorStop(1, 'rgba(255,200,120,0)');
    x.fillStyle = pc; x.fill();
    // mặt trước
    const mf = x.createLinearGradient(0, yf, 0, H + LE);
    mf.addColorStop(0, '#7a2a1e'); mf.addColorStop(0.15, '#5a1c14'); mf.addColorStop(1, '#1d0806');
    x.fillStyle = mf; x.fillRect(lx, yf, rx - lx, H + LE - yf);
    x.fillStyle = '#d2a253'; x.fillRect(lx, yf, rx - lx, 2.5);
    x.fillStyle = 'rgba(255,230,170,0.4)'; x.fillRect(lx, yf, rx - lx, 1);
    // ô chạm hoa văn
    const o = (ox, oy, ow, oh) => {
      x.strokeStyle = 'rgba(210,162,83,0.65)'; x.lineWidth = 1.2; x.strokeRect(ox, oy, ow, oh);
      x.strokeStyle = 'rgba(0,0,0,0.5)'; x.strokeRect(ox + 1.5, oy + 1.5, ow, oh);
      x.strokeStyle = 'rgba(210,162,83,0.5)'; x.lineWidth = 1;
      const cx = ox + ow / 2, cy = oy + oh / 2;
      for (let k = 0; k < 2; k++) { x.beginPath(); x.ellipse(cx + (k ? 1 : -1) * ow * 0.18, cy, ow * 0.16, oh * 0.26, 0, 0, Math.PI * 2); x.stroke(); }
      x.beginPath(); x.arc(cx, cy, oh * 0.12, 0, Math.PI * 2); x.stroke();
    };
    const oh = (H - yf) * 0.55, oy = yf + (H - yf) * 0.22;
    for (let i = 0; i < 4; i++) o(lx + W * 0.04 + i * (rx - lx - W * 0.08) / 4 + 4, oy, (rx - lx - W * 0.08) / 4 - 8, oh);
    // mâm ngũ quả bên trái, đĩa trái cây bên phải
    const mam = (cx) => {
      const y = yt + (yf - yt) * 0.5;
      x.fillStyle = '#b8873d'; x.beginPath(); x.ellipse(cx, y, W * 0.055, W * 0.012, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#7a5520'; x.fillRect(cx - W * 0.012, y, W * 0.024, W * 0.02);
      const qua = [['#e9a23b', -0.03, -0.018], ['#d9502f', 0.025, -0.016], ['#8bb04a', 0, -0.032], ['#f0c94c', -0.012, -0.05], ['#c9372a', 0.015, -0.046]];
      qua.forEach(([mau, dx, dy]) => {
        const qx = cx + dx * W, qy = y + dy * W, r = W * 0.017;
        const qg = x.createRadialGradient(qx - r * 0.4, qy - r * 0.4, r * 0.1, qx, qy, r);
        qg.addColorStop(0, '#fff3cf'); qg.addColorStop(0.25, mau); qg.addColorStop(1, 'rgba(0,0,0,0.6)');
        x.fillStyle = qg; x.beginPath(); x.arc(qx, qy, r, 0, Math.PI * 2); x.fill();
      });
    };
    mam(W * 0.14); mam(W * 0.86);
    // bình hoa quỳnh
    [W * 0.32, W * 0.68].forEach((bx, i) => {
      const y = yt + (yf - yt) * 0.4;
      const bg = x.createLinearGradient(bx - 10, 0, bx + 10, 0);
      bg.addColorStop(0, '#1b2846'); bg.addColorStop(0.4, '#5d77ad'); bg.addColorStop(1, '#141d33');
      x.fillStyle = bg;
      x.beginPath(); x.moveTo(bx - 9, y); x.quadraticCurveTo(bx - 16, y - 18, bx - 5, y - 32); x.lineTo(bx + 5, y - 32); x.quadraticCurveTo(bx + 16, y - 18, bx + 9, y); x.fill();
      x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 1; x.beginPath(); x.moveTo(bx - 4, y - 28); x.quadraticCurveTo(bx - 10, y - 16, bx - 6, y - 4); x.stroke();
      x.strokeStyle = '#3f5e34'; x.lineWidth = 1.6;
      [[-16, -66], [2, -78], [16, -60]].forEach(([dx, dy]) => {
        x.beginPath(); x.moveTo(bx, y - 32); x.quadraticCurveTo(bx + dx * 0.3, y - 48, bx + dx, y + dy); x.stroke();
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * Math.PI * 2 + i;
          const pg = x.createLinearGradient(bx + dx, y + dy, bx + dx + Math.cos(a) * 9, y + dy + Math.sin(a) * 9);
          pg.addColorStop(0, '#fffaf0'); pg.addColorStop(1, '#d9d2c2');
          x.fillStyle = pg;
          x.beginPath(); x.ellipse(bx + dx + Math.cos(a) * 4.5, y + dy + Math.sin(a) * 4.5, 5.5, 2.4, a, 0, Math.PI * 2); x.fill();
        }
        x.fillStyle = '#f3d77a'; x.beginPath(); x.arc(bx + dx, y + dy, 2, 0, Math.PI * 2); x.fill();
      });
    });
    // lư hương đồng
    const cx = W / 2, y = yt + (yf - yt) * 0.55, bw = W * 0.22, bh = H * 0.055;
    x.fillStyle = 'rgba(0,0,0,0.5)'; x.beginPath(); x.ellipse(cx + 4, y + 3, bw * 0.45, 5, 0, 0, Math.PI * 2); x.fill();
    const lg = x.createLinearGradient(cx - bw / 2, 0, cx + bw / 2, 0);
    lg.addColorStop(0, '#5c3d12'); lg.addColorStop(0.35, '#f0c56e'); lg.addColorStop(0.55, '#c9974a'); lg.addColorStop(1, '#4a300e');
    x.fillStyle = lg;
    x.beginPath(); x.moveTo(cx - bw / 2, y - bh);
    x.lineTo(cx + bw / 2, y - bh); x.quadraticCurveTo(cx + bw * 0.46, y - 2, cx + bw * 0.3, y); x.lineTo(cx - bw * 0.3, y);
    x.quadraticCurveTo(cx - bw * 0.46, y - 2, cx - bw / 2, y - bh); x.fill();
    // chân và quai lư
    x.fillRect(cx - bw * 0.33, y - 1, 5, 7); x.fillRect(cx + bw * 0.33 - 5, y - 1, 5, 7);
    x.strokeStyle = '#c9974a'; x.lineWidth = 3;
    x.beginPath(); x.arc(cx - bw / 2 - 4, y - bh * 0.6, 6, Math.PI * 0.5, Math.PI * 1.5); x.stroke();
    x.beginPath(); x.arc(cx + bw / 2 + 4, y - bh * 0.6, 6, -Math.PI * 0.5, Math.PI * 0.5); x.stroke();
    x.fillStyle = 'rgba(80,50,15,0.6)'; x.font = `700 ${Math.round(bh * 0.5)}px 'Noto Serif TC', serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('佛', cx, y - bh * 0.48);
    x.fillStyle = '#d9a95a'; x.beginPath(); x.ellipse(cx, y - bh, bw / 2, bh * 0.17, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#4a3a2a'; x.beginPath(); x.ellipse(cx, y - bh, bw / 2 - 4, bh * 0.11, 0, 0, Math.PI * 2); x.fill();
    return c;
  }

  function veVien() {
    const [c, x] = mk(W, H);
    const v = x.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.5, H * 0.8);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.65)');
    x.fillStyle = v; x.fillRect(0, 0, W, H);
    return c;
  }

  function doCo() {
    const r = cv.getBoundingClientRect();
    if (!r.width) return;
    tl = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; LE = Math.round(W * 0.04);
    cv.width = Math.round(W * tl); cv.height = Math.round(H * tl);
    hatKhoi = document.createElement('canvas'); hatKhoi.width = hatKhoi.height = 64;
    const k = hatKhoi.getContext('2d'), gr = k.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(225,228,240,0.55)'); gr.addColorStop(1, 'rgba(225,228,240,0)');
    k.fillStyle = gr; k.fillRect(0, 0, 64, 64);
    lop = { tuong: veTuong(), tuongPhat: veTuongPhat(), cot: veCot(), ban: veBan(), vien: veVien() };
    bui = Array.from({ length: 40 }, () => ({ x: rnd(0, W), y: rnd(0, H * 0.8), v: rnd(0.002, 0.008), p: rnd(0, 6), r: rnd(0.6, 1.6) }));
  }

  function dat(ten, d) {
    const ox = -LE + lech.x * LE * d, oy = -LE + lech.y * LE * 0.6 * d;
    g.drawImage(lop[ten], ox, oy, W + LE * 2, H + LE * 2);
    return [ox + LE, oy + LE];
  }

  // ---------------- phần động ----------------
  function haoQuangDong(t, o) {
    const cx = W / 2 + o[0], cy = H * 0.33 + o[1], R = W * 0.32;
    const a = 0.10 + sang * 0.35 + 0.04 * Math.sin(t * 0.0012);
    g.globalCompositeOperation = 'lighter';
    const gr = g.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.4);
    gr.addColorStop(0, `rgba(255,205,120,${a})`); gr.addColorStop(1, 'rgba(255,205,120,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R * 1.4, 0, Math.PI * 2); g.fill();
    g.save(); g.translate(cx, H * 0.215 + o[1]); g.rotate(giamDong ? 0 : t * 0.00005);
    g.strokeStyle = `rgba(255,215,140,${0.06 + sang * 0.12})`; g.lineWidth = 1.2;
    for (let i = 0; i < 36; i++) { g.rotate(Math.PI / 18); g.beginPath(); g.moveTo(W * 0.13, 0); g.lineTo(W * (i % 2 ? 0.26 : 0.32), 0); g.stroke(); }
    g.restore();
    g.globalCompositeOperation = 'source-over';
  }

  function tiaSang(t) {
    if (giamDong) return;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const x0 = W * (0.35 + i * 0.12) + Math.sin(t * 0.0002 + i) * W * 0.02;
      const a = 0.035 + 0.02 * Math.sin(t * 0.0007 + i * 2);
      const gr = g.createLinearGradient(x0, 0, x0 + W * 0.15, H * 0.8);
      gr.addColorStop(0, `rgba(200,215,255,${a})`); gr.addColorStop(1, 'rgba(200,215,255,0)');
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + W * 0.05, 0); g.lineTo(x0 + W * 0.25, H * 0.8); g.lineTo(x0 + W * 0.12, H * 0.8); g.fill();
    }
    g.restore();
  }

  function veBui(dt, t) {
    g.save(); g.globalCompositeOperation = 'lighter';
    bui.forEach(b => {
      b.y -= b.v * dt; b.x += Math.sin(t * 0.0006 + b.p) * 0.08;
      if (b.y < 0) { b.y = H * 0.8; b.x = rnd(0, W); }
      const a = 0.25 + 0.25 * Math.sin(t * 0.002 + b.p);
      g.fillStyle = `rgba(255,225,170,${a})`;
      g.beginPath(); g.arc(b.x + lech.x * LE * 0.7, b.y, b.r, 0, Math.PI * 2); g.fill();
    });
    g.restore();
  }

  function viTriNhang(i, n, o) {
    const cx = W / 2 + o[0], bw = W * 0.18, y0 = H * 0.785 + (H * 0.04) * 0.55 - H * 0.055 + o[1];
    const hang = Math.floor(i / 12), k = i % 12, soTrongHang = Math.min(12, n - hang * 12);
    const x = cx + (soTrongHang === 1 ? 0 : (k / (soTrongHang - 1) - 0.5) * bw * Math.min(1, 0.35 + soTrongHang / 12));
    return { x: x + hang * 3, y: y0 - hang * 2, nghieng: (k - (soTrongHang - 1) / 2) * 0.03 };
  }

  function veNhang(t, o) {
    const n = Math.min(nhang.length, 36), dai = H * 0.13;
    for (let i = 0; i < n; i++) {
      const p = viTriNhang(i, n, o), con = dai * (1 - nhang[i].tuoi * 0.75);
      const dx = Math.sin(p.nghieng) * con, x2 = p.x + dx, y2 = p.y - con;
      g.strokeStyle = '#b5332a'; g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + dx * 0.25, p.y - con * 0.25); g.stroke();
      g.strokeStyle = '#80603e'; g.lineWidth = 1.7;
      g.beginPath(); g.moveTo(p.x + dx * 0.25, p.y - con * 0.25); g.lineTo(x2, y2); g.stroke();
      const lap = 0.7 + 0.3 * Math.sin(t * 0.006 + i * 1.7);
      g.fillStyle = `rgba(255,${120 + 60 * lap | 0},60,0.95)`;
      g.beginPath(); g.arc(x2, y2, 2.2, 0, Math.PI * 2); g.fill();
      g.fillStyle = `rgba(255,140,60,${0.28 * lap})`;
      g.beginPath(); g.arc(x2, y2, 7, 0, Math.PI * 2); g.fill();
      if (!giamDong && Math.random() < 0.09 && khoi.length < 260) {
        khoi.push({ x: x2, y: y2, vx: rnd(-0.08, 0.08), vy: rnd(-0.6, -0.35), song: rnd(0, 6), song2: rnd(0.6, 1.6), tuoi: 0, tho: rnd(220, 380) * 16, co: 4 });
      }
    }
  }

  function veKhoi(dt) {
    g.globalCompositeOperation = 'lighter';
    for (let i = khoi.length - 1; i >= 0; i--) {
      const k = khoi[i];
      k.tuoi += dt;
      if (k.tuoi > k.tho) { khoi.splice(i, 1); continue; }
      const p = k.tuoi / k.tho;
      k.x += (k.vx + Math.sin(k.song + k.tuoi * 0.0012 * k.song2) * 0.2 * (1 + p * 3)) * dt * 0.06;
      k.y += k.vy * dt * 0.06;
      const co = k.co + p * 28;
      g.globalAlpha = (1 - p) * 0.2;
      g.drawImage(hatKhoi, k.x - co, k.y - co, co * 2, co * 2);
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }

  function veNen(t, o) {
    [W * 0.23, W * 0.77].forEach((bx, i) => {
      const x = bx + o[0] * (i ? 1.02 : 0.98), y = H * 0.79 + o[1], h = H * 0.085;
      // chân đèn đồng
      const cg = g.createLinearGradient(x - 10, 0, x + 10, 0);
      cg.addColorStop(0, '#5c3d12'); cg.addColorStop(0.4, '#e2b25c'); cg.addColorStop(1, '#4a300e');
      g.fillStyle = cg; g.fillRect(x - 3, y - 6, 6, 8);
      g.beginPath(); g.ellipse(x, y + 1, 12, 3.5, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(x, y - 7, 9, 2.6, 0, 0, Math.PI * 2); g.fill();
      // thân nến có khối
      const ng = g.createLinearGradient(x - 6, 0, x + 6, 0);
      ng.addColorStop(0, '#b8a68a'); ng.addColorStop(0.4, '#fff8ea'); ng.addColorStop(1, '#9c8a70');
      g.fillStyle = ng; g.fillRect(x - 6, y - 7 - h, 12, h);
      g.fillStyle = '#efe4cf'; g.beginPath(); g.ellipse(x, y - 7 - h, 6, 1.8, 0, 0, Math.PI * 2); g.fill();
      const lay = giamDong ? 0 : Math.sin(t * 0.011 + i * 2) * 1.3 + Math.sin(t * 0.029 + i) * 0.7;
      const fy = y - 7 - h - 9;
      g.globalCompositeOperation = 'lighter';
      const hq = g.createRadialGradient(x, fy, 0, x, fy, W * 0.14);
      hq.addColorStop(0, `rgba(255,190,100,${0.32 + 0.06 * Math.sin(t * 0.017 + i)})`); hq.addColorStop(1, 'rgba(255,190,100,0)');
      g.fillStyle = hq; g.beginPath(); g.arc(x, fy, W * 0.14, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = 'source-over';
      const fg = g.createLinearGradient(0, fy - 12, 0, fy + 7);
      fg.addColorStop(0, '#ff9a3a'); fg.addColorStop(0.5, '#ffd98a'); fg.addColorStop(1, '#fff6dd');
      g.fillStyle = fg;
      g.beginPath(); g.moveTo(x + lay, fy - 12); g.quadraticCurveTo(x + 6, fy + 1, x, fy + 7); g.quadraticCurveTo(x - 6, fy + 1, x + lay, fy - 12); g.fill();
      g.fillStyle = 'rgba(80,120,255,0.5)'; g.beginPath(); g.ellipse(x, fy + 4, 2, 2.5, 0, 0, Math.PI * 2); g.fill();
    });
  }

  function veDenLong(t, o) {
    // đèn lồng đỏ treo bên phải, đung đưa nhẹ
    const ax = W * 0.8 + o[0], ay = H * 0.035 + o[1];
    const goc = giamDong ? 0 : Math.sin(t * 0.0011) * 0.06;
    g.save(); g.translate(ax, ay); g.rotate(goc);
    const L = H * 0.13;
    g.strokeStyle = '#2a1a10'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, L); g.stroke();
    const rw = W * 0.06, rh = W * 0.075, cy = L + rh;
    g.globalCompositeOperation = 'lighter';
    const hq = g.createRadialGradient(0, cy, 0, 0, cy, rw * 3.2);
    hq.addColorStop(0, 'rgba(255,90,50,0.28)'); hq.addColorStop(1, 'rgba(255,90,50,0)');
    g.fillStyle = hq; g.beginPath(); g.arc(0, cy, rw * 3.2, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = 'source-over';
    const lg = g.createRadialGradient(-rw * 0.3, cy - rh * 0.3, rw * 0.1, 0, cy, rw * 1.2);
    lg.addColorStop(0, '#ffcf8a'); lg.addColorStop(0.35, '#e8432e'); lg.addColorStop(1, '#6e120c');
    g.fillStyle = lg; g.beginPath(); g.ellipse(0, cy, rw, rh, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(80,10,5,0.5)'; g.lineWidth = 1;
    for (let k = -2; k <= 2; k++) { g.beginPath(); g.ellipse(0, cy, Math.abs(k) * rw * 0.3 + 0.5, rh, 0, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = '#c9974a'; g.fillRect(-rw * 0.45, L + 2, rw * 0.9, 4); g.fillRect(-rw * 0.45, cy + rh - 3, rw * 0.9, 4);
    g.strokeStyle = '#d9502f'; g.lineWidth = 1;
    for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(k * 2, cy + rh + 1); g.lineTo(k * 2 + Math.sin(t * 0.002 + k) * 1.5, cy + rh + 14); g.stroke(); }
    g.restore();
  }

  function veChuong(dt, t, o) {
    // chuông đồng treo bên trái; đung đưa khi thỉnh
    chuongV += -chuongLac * 0.00006 * dt - chuongV * 0.0025 * dt;
    chuongLac += chuongV * dt;
    const ax = W * 0.2 + o[0], ay = H * 0.035 + o[1];
    g.save(); g.translate(ax, ay); g.rotate(chuongLac);
    const L = H * 0.12, bw = W * 0.065, bh = W * 0.085;
    g.strokeStyle = '#2a1a10'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, L); g.stroke();
    g.fillStyle = '#7a5520'; g.beginPath(); g.arc(0, L + 3, 4, 0, Math.PI * 2); g.fill();
    const cg = g.createLinearGradient(-bw, 0, bw, 0);
    cg.addColorStop(0, '#3e2a10'); cg.addColorStop(0.3, '#d6a24c'); cg.addColorStop(0.5, '#f3d590'); cg.addColorStop(1, '#3a250c');
    g.fillStyle = cg;
    g.beginPath(); g.moveTo(-bw * 0.55, L + 6);
    g.quadraticCurveTo(-bw * 0.65, L + bh * 0.6, -bw, L + bh);
    g.lineTo(bw, L + bh); g.quadraticCurveTo(bw * 0.65, L + bh * 0.6, bw * 0.55, L + 6);
    g.quadraticCurveTo(0, L - 2, -bw * 0.55, L + 6); g.fill();
    g.fillStyle = '#5a3d14'; g.beginPath(); g.ellipse(0, L + bh, bw, bw * 0.2, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(80,50,15,0.6)'; g.lineWidth = 1;
    [0.4, 0.7].forEach(k => { g.beginPath(); g.moveTo(-bw * (0.6 + k * 0.35), L + bh * k); g.lineTo(bw * (0.6 + k * 0.35), L + bh * k); g.stroke(); });
    g.restore();
    return { x: ax, y: ay + L + bh * 0.5, r: bw * 1.3 };
  }

  function veMo(dt, o) {
    // mõ gỗ đỏ đặt trên gối, bên phải lư hương
    moNay = Math.max(0, moNay - dt * 0.006);
    const x = W * 0.66 + o[0], y = H * 0.828 + o[1] - Math.sin(moNay * Math.PI) * 4;
    const rw = W * 0.043, rh = W * 0.033;
    g.fillStyle = '#7a1e18'; g.beginPath(); g.ellipse(x, H * 0.832 + o[1], rw * 1.15, rh * 0.35, 0, 0, Math.PI * 2); g.fill();
    const mg = g.createRadialGradient(x - rw * 0.4, y - rh * 0.5, 2, x, y - rh * 0.3, rw * 1.3);
    mg.addColorStop(0, '#f08a5a'); mg.addColorStop(0.4, '#a8341f'); mg.addColorStop(1, '#3a0d08');
    g.fillStyle = mg; g.beginPath(); g.ellipse(x, y - rh * 0.6, rw, rh, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#2a0805'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - rw * 0.7, y - rh * 0.4); g.quadraticCurveTo(x, y - rh * 0.05, x + rw * 0.7, y - rh * 0.4); g.stroke();
    g.strokeStyle = 'rgba(240,190,120,0.6)'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - rh * 0.6, rw * 0.9, rh * 0.85, 0, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
    // dùi mõ
    const goc = -0.5 - moNay * 0.6;
    g.save(); g.translate(x + rw * 1.3, y - rh * 1.4); g.rotate(goc);
    g.fillStyle = '#c9a26a'; g.fillRect(-1.5, 0, 3, rw * 1.1);
    g.fillStyle = '#e7d3b0'; g.beginPath(); g.arc(0, rw * 1.1, 4, 0, Math.PI * 2); g.fill();
    g.restore();
    return { x, y: y - rh * 0.6, r: rw * 1.4 };
  }

  function hieuUng(dt) {
    for (let i = song.length - 1; i >= 0; i--) {
      const s = song[i]; s.r += dt * 0.12; s.a -= dt * 0.00045;
      if (s.a <= 0) { song.splice(i, 1); continue; }
      g.strokeStyle = `rgba(240,205,130,${s.a})`; g.lineWidth = 2;
      g.beginPath(); g.arc(s.x, s.y, s.r, 0, Math.PI * 2); g.stroke();
    }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = chuBay.length - 1; i >= 0; i--) {
      const c = chuBay[i]; c.tuoi += dt;
      if (c.tuoi > 1200) { chuBay.splice(i, 1); continue; }
      const p = c.tuoi / 1200;
      g.globalAlpha = 1 - p;
      g.fillStyle = '#f3cf86'; g.font = `600 ${Math.round(W * 0.04)}px 'Be Vietnam Pro', sans-serif`;
      g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 4;
      g.fillText(c.chu, c.x, c.y - p * 50);
      g.shadowBlur = 0;
    }
    g.globalAlpha = 1;
    for (let i = canh.length - 1; i >= 0; i--) {
      const c = canh[i]; c.y += dt * c.v; c.x += Math.sin(c.y * 0.02 + c.p) * 0.4; c.q += dt * 0.002;
      if (c.y > H * 0.82) { canh.splice(i, 1); continue; }
      g.save(); g.translate(c.x, c.y); g.rotate(c.q);
      g.fillStyle = 'rgba(246,242,234,0.9)';
      g.beginPath(); g.ellipse(0, 0, 5, 2.4, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    sang = Math.max(0, sang - dt * 0.00012);
  }

  let vungChuong = null, vungMo = null;

  function khung(t) {
    if (!chay) return;
    if (lanCuoi && t - lanCuoi < 32) { requestAnimationFrame(khung); return; }
    const dt = Math.min(66, lanCuoi ? t - lanCuoi : 16);
    lanCuoi = t;
    if (!W || !lop.tuong) { doCo(); requestAnimationFrame(khung); return; }
    // camera trôi nhẹ + theo tay/nghiêng máy
    const troi = giamDong ? 0 : Math.sin((t - t0) * 0.00025) * 0.25;
    lech.x += ((dich.x + troi) - lech.x) * Math.min(1, dt * 0.004);
    lech.y += (dich.y - lech.y) * Math.min(1, dt * 0.004);
    g.setTransform(tl, 0, 0, tl, 0, 0);
    dat('tuong', NGHIENG.tuong);
    tiaSang(t);
    const oPhat = [lech.x * LE * NGHIENG.tuongPhat, lech.y * LE * 0.6 * NGHIENG.tuongPhat];
    haoQuangDong(t, oPhat);
    dat('tuongPhat', NGHIENG.tuongPhat);
    const oCot = [lech.x * LE * NGHIENG.cot, lech.y * LE * 0.6 * NGHIENG.cot];
    dat('cot', NGHIENG.cot);
    vungChuong = veChuong(dt, t, oCot);
    veDenLong(t, oCot);
    veKhoi(dt);
    const oBan = [lech.x * LE, lech.y * LE * 0.6];
    dat('ban', NGHIENG.ban);
    veNhang(t, oBan);
    veNen(t, oBan);
    vungMo = veMo(dt, oBan);
    veBui(dt, t);
    hieuUng(dt);
    g.drawImage(lop.vien, 0, 0, W, H);
    requestAnimationFrame(khung);
  }

  function batDau() { if (chay) return; chay = true; lanCuoi = 0; requestAnimationFrame(khung); }
  function dung() { chay = false; }

  const api = {
    batDau, dung, onCham: null,
    datNhang(ds) { nhang = ds.slice(0, 36); },
    chuong() {
      chuongV += 0.0045; sang = Math.min(1, sang + 0.6);
      if (vungChuong) song.push({ x: vungChuong.x, y: vungChuong.y, r: 10, a: 0.7 }, { x: W / 2, y: H * 0.33, r: W * 0.05, a: 0.5 });
      for (let i = 0; i < 12; i++) canh.push({ x: rnd(0, W), y: rnd(-60, -10), v: rnd(0.04, 0.08), p: rnd(0, 6), q: rnd(0, 3) });
    },
    mo() { moNay = 1; chuBay.push({ chu: '+1 công đức', x: W * (0.6 + Math.random() * 0.15), y: H * 0.7 }); sang = Math.min(1, sang + 0.05); },
    huong() { sang = Math.min(1, sang + 0.3); chuBay.push({ chu: '3 nén hương', x: W / 2, y: H * 0.6 }); },
  };

  // nghiêng máy (Android) và rê chuột / kéo ngón tay
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

  new ResizeObserver(() => { doCo(); }).observe(cv);
  document.addEventListener('visibilitychange', () => document.hidden ? dung() : (cv.offsetParent && batDau()));
  if (document.fonts) document.fonts.ready.then(() => doCo());
  return api;
})();
