// Chánh điện vẽ bằng canvas: hào quang, tượng Phật, lư hương, nến, khói nhang.
window.Canh = (() => {
  const cv = document.getElementById('canh');
  const g = cv.getContext('2d');
  const giamDong = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, tl = 1;
  let nhang = [];        // [{tuoi: 0..1}] tuổi = phần đã cháy
  let khoi = [];
  let song = [];         // sóng chuông
  let chuBay = [];       // chữ "+1" bay lên
  let canh = [];         // cánh quỳnh rơi
  let sang = 0;          // độ sáng hào quang tăng khi có lễ
  let chay = false, lanCuoi = 0;
  let hatKhoi = null;

  function doCo() {
    const r = cv.getBoundingClientRect();
    tl = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = Math.round(W * tl); cv.height = Math.round(H * tl);
    g.setTransform(tl, 0, 0, tl, 0, 0);
    // hạt khói vẽ sẵn một lần
    hatKhoi = document.createElement('canvas');
    hatKhoi.width = hatKhoi.height = 64;
    const k = hatKhoi.getContext('2d');
    const gr = k.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(225,228,240,0.55)');
    gr.addColorStop(1, 'rgba(225,228,240,0)');
    k.fillStyle = gr; k.fillRect(0, 0, 64, 64);
  }

  // ---- Các phần cố định của cảnh ----
  function nen(t) {
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#0d1222'); gr.addColorStop(0.75, '#141a2e'); gr.addColorStop(1, '#0a0d18');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // cột son hai bên
    g.fillStyle = '#4a1712';
    g.fillRect(W * 0.04, 0, W * 0.06, H * 0.8);
    g.fillRect(W * 0.90, 0, W * 0.06, H * 0.8);
    g.fillStyle = '#6b231b';
    g.fillRect(W * 0.04, 0, W * 0.015, H * 0.8);
    g.fillRect(W * 0.90, 0, W * 0.015, H * 0.8);
    // hoành phi
    const hx = W * 0.25, hy = H * 0.035, hw = W * 0.5, hh = H * 0.07;
    g.fillStyle = '#3a120e'; g.fillRect(hx, hy, hw, hh);
    g.strokeStyle = '#a87a32'; g.lineWidth = 1.5; g.strokeRect(hx + 3, hy + 3, hw - 6, hh - 6);
    g.fillStyle = '#e2b25c';
    g.font = `700 ${Math.round(hh * 0.52)}px 'Noto Serif TC', serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('瓊 庵 寺', W / 2, hy + hh / 2 + 1);
    // câu đối dọc trên cột
    g.font = `700 ${Math.round(W * 0.034)}px 'Noto Serif TC', serif`;
    g.fillStyle = '#d6a54f';
    const doc = (s, x) => [...s].forEach((c, i) => g.fillText(c, x, H * 0.16 + i * W * 0.05));
    doc('南無阿彌陀佛', W * 0.07);
    doc('南無阿彌陀佛', W * 0.93);
  }

  function haoQuang(t) {
    const cx = W / 2, cy = H * 0.33, R = W * 0.3;
    const a = 0.22 + sang * 0.35;
    const gr = g.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.5);
    gr.addColorStop(0, `rgba(240,200,120,${a})`);
    gr.addColorStop(0.5, `rgba(226,178,92,${a * 0.35})`);
    gr.addColorStop(1, 'rgba(226,178,92,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R * 1.5, 0, Math.PI * 2); g.fill();
    // tia hào quang xoay chậm
    g.save(); g.translate(cx, cy); g.rotate(giamDong ? 0 : t * 0.00004);
    g.strokeStyle = `rgba(240,205,130,${0.10 + sang * 0.12})`; g.lineWidth = 1;
    for (let i = 0; i < 48; i++) {
      g.rotate(Math.PI * 2 / 48);
      g.beginPath(); g.moveTo(R * 0.38, 0); g.lineTo(R * (i % 2 ? 0.95 : 1.15), 0); g.stroke();
    }
    g.restore();
    // vòng tròn sau đầu
    g.strokeStyle = 'rgba(240,205,130,0.55)'; g.lineWidth = 2;
    g.beginPath(); g.arc(cx, H * 0.215, W * 0.115, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(240,205,130,0.25)'; g.lineWidth = 1;
    g.beginPath(); g.arc(cx, H * 0.215, W * 0.13, 0, Math.PI * 2); g.stroke();
  }

  // Tượng Phật ngồi kiết già, vẽ trong khung 200 x 230 rồi co theo cảnh.
  function tuong() {
    const s = (H * 0.56) / 230, ox = W / 2 - 100 * s, oy = H * 0.16 - 22 * s;
    g.save(); g.translate(ox, oy); g.scale(s, s);
    const vang = g.createLinearGradient(40, 0, 160, 230);
    vang.addColorStop(0, '#f3cf86'); vang.addColorStop(0.45, '#d9a64e'); vang.addColorStop(1, '#8f6526');
    g.fillStyle = vang;
    // đài sen
    g.beginPath(); g.ellipse(100, 214, 92, 14, 0, 0, Math.PI * 2); g.fill();
    for (let i = -3; i <= 3; i++) {
      const x = 100 + i * 25;
      g.beginPath(); g.moveTo(x - 16, 206); g.quadraticCurveTo(x, 172, x + 16, 206); g.closePath(); g.fill();
    }
    // chân xếp bằng
    g.beginPath(); g.ellipse(100, 186, 80, 22, 0, 0, Math.PI * 2); g.fill();
    // thân và áo
    g.beginPath();
    g.moveTo(100, 78);
    g.bezierCurveTo(126, 78, 146, 86, 153, 101);
    g.bezierCurveTo(161, 120, 160, 152, 154, 172);
    g.lineTo(46, 172);
    g.bezierCurveTo(40, 152, 39, 120, 47, 101);
    g.bezierCurveTo(54, 86, 74, 78, 100, 78);
    g.closePath(); g.fill();
    // cổ
    g.fillRect(90, 66, 20, 16);
    // tai dài
    g.beginPath(); g.ellipse(75, 52, 5.5, 16, -0.08, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(125, 52, 5.5, 16, 0.08, 0, Math.PI * 2); g.fill();
    // đầu và nhục kế
    g.beginPath(); g.ellipse(100, 47, 24, 28, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(100, 20, 12, 10, 0, 0, Math.PI * 2); g.fill();
    // nếp áo và tay kết ấn thiền định
    g.strokeStyle = 'rgba(90,58,18,0.55)'; g.lineWidth = 1.6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(118, 82); g.quadraticCurveTo(96, 120, 70, 168); g.stroke();
    g.beginPath(); g.moveTo(132, 96); g.quadraticCurveTo(140, 130, 146, 168); g.stroke();
    g.beginPath(); g.moveTo(66, 92); g.quadraticCurveTo(58, 130, 56, 168); g.stroke();
    g.beginPath(); g.moveTo(30, 190); g.quadraticCurveTo(100, 210, 170, 190); g.stroke();
    g.fillStyle = '#e8bd6c';
    g.beginPath(); g.ellipse(100, 168, 25, 8.5, 0, 0, Math.PI * 2); g.fill();
    g.stroke();
    // mắt nhắm, vầng trán
    g.strokeStyle = 'rgba(90,58,18,0.7)'; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(86, 50); g.quadraticCurveTo(91, 53, 96, 50); g.stroke();
    g.beginPath(); g.moveTo(104, 50); g.quadraticCurveTo(109, 53, 114, 50); g.stroke();
    g.fillStyle = 'rgba(150,40,30,0.8)';
    g.beginPath(); g.arc(100, 38, 1.8, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  function banTho() {
    const y = H * 0.8;
    const gr = g.createLinearGradient(0, y, 0, H);
    gr.addColorStop(0, '#5a1d15'); gr.addColorStop(1, '#2a0d09');
    g.fillStyle = gr; g.fillRect(0, y, W, H - y);
    g.fillStyle = '#a87a32'; g.fillRect(0, y, W, 3);
    g.fillStyle = 'rgba(168,122,50,0.45)'; g.fillRect(W * 0.08, y + H * 0.06, W * 0.84, 1.5);
  }

  function lienHuong() {
    const cx = W / 2, y = H * 0.8, bw = W * 0.24, bh = H * 0.06;
    // thân lư
    const gr = g.createLinearGradient(cx - bw / 2, 0, cx + bw / 2, 0);
    gr.addColorStop(0, '#7a5520'); gr.addColorStop(0.5, '#e2b25c'); gr.addColorStop(1, '#7a5520');
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(cx - bw / 2, y - bh);
    g.lineTo(cx + bw / 2, y - bh);
    g.quadraticCurveTo(cx + bw * 0.45, y - 2, cx + bw * 0.3, y);
    g.lineTo(cx - bw * 0.3, y);
    g.quadraticCurveTo(cx - bw * 0.45, y - 2, cx - bw / 2, y - bh);
    g.fill();
    g.fillStyle = '#c9974a';
    g.beginPath(); g.ellipse(cx, y - bh, bw / 2, bh * 0.18, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#3b2a12';
    g.beginPath(); g.ellipse(cx, y - bh, bw / 2 - 4, bh * 0.12, 0, 0, Math.PI * 2); g.fill();
  }

  function viTriNhang(i, n) {
    const cx = W / 2, bw = W * 0.2, y0 = H * 0.8 - H * 0.06;
    const cot = Math.min(n, 12), hang = Math.floor(i / 12), k = i % 12;
    const soTrongHang = Math.min(12, n - hang * 12);
    const x = cx + (soTrongHang === 1 ? 0 : (k / (soTrongHang - 1) - 0.5) * bw * (0.4 + 0.6 * Math.min(1, soTrongHang / cot)));
    return { x: x + hang * 3, y: y0 - hang * 2, nghieng: (k - (soTrongHang - 1) / 2) * 0.025 };
  }

  function veNhang(t) {
    const n = Math.min(nhang.length, 36), dai = H * 0.13;
    for (let i = 0; i < n; i++) {
      const p = viTriNhang(i, n), con = dai * (1 - nhang[i].tuoi * 0.75);
      const dx = Math.sin(p.nghieng) * con, x2 = p.x + dx, y2 = p.y - con;
      g.strokeStyle = '#b5332a'; g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + dx * 0.25, p.y - con * 0.25); g.stroke();
      g.strokeStyle = '#7a5a3a'; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(p.x + dx * 0.25, p.y - con * 0.25); g.lineTo(x2, y2); g.stroke();
      const lap = 0.7 + 0.3 * Math.sin(t * 0.006 + i * 1.7);
      g.fillStyle = `rgba(255,${120 + 60 * lap | 0},60,${0.9})`;
      g.beginPath(); g.arc(x2, y2, 2.2, 0, Math.PI * 2); g.fill();
      g.fillStyle = `rgba(255,140,60,${0.25 * lap})`;
      g.beginPath(); g.arc(x2, y2, 6, 0, Math.PI * 2); g.fill();
      if (!giamDong && Math.random() < 0.09 && khoi.length < 260) {
        khoi.push({ x: x2, y: y2, vx: (Math.random() - 0.5) * 0.15, vy: -0.35 - Math.random() * 0.25, song: Math.random() * 6, song2: 0.6 + Math.random(), tuoi: 0, tho: 220 + Math.random() * 160, co: 5 });
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
      k.x += k.vx * dt * 0.06 + Math.sin(k.song + k.tuoi * 0.02 * k.song2) * 0.18 * dt * 0.06 * (1 + p * 3);
      k.y += k.vy * dt * 0.06;
      const co = k.co + p * 26, a = (1 - p) * 0.22;
      g.globalAlpha = a;
      g.drawImage(hatKhoi, k.x - co, k.y - co, co * 2, co * 2);
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }

  function nen2(t) {
    // hai ngọn nến
    [W * 0.2, W * 0.8].forEach((x, i) => {
      const y = H * 0.8, h = H * 0.08;
      g.fillStyle = '#efe6d6'; g.fillRect(x - 6, y - h, 12, h);
      g.fillStyle = '#c9974a'; g.fillRect(x - 12, y - 4, 24, 4);
      const lay = giamDong ? 0 : Math.sin(t * 0.011 + i * 2) * 1.2 + Math.sin(t * 0.027 + i) * 0.6;
      const fy = y - h - 9;
      const hq = g.createRadialGradient(x, fy, 0, x, fy, 34);
      hq.addColorStop(0, 'rgba(255,200,110,0.45)'); hq.addColorStop(1, 'rgba(255,200,110,0)');
      g.fillStyle = hq; g.beginPath(); g.arc(x, fy, 34, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffd98a';
      g.beginPath(); g.moveTo(x + lay, fy - 11);
      g.quadraticCurveTo(x + 6, fy + 2, x, fy + 7);
      g.quadraticCurveTo(x - 6, fy + 2, x + lay, fy - 11); g.fill();
      g.fillStyle = '#fff6dd';
      g.beginPath(); g.ellipse(x, fy + 2, 2, 4, 0, 0, Math.PI * 2); g.fill();
    });
  }

  function hoaQuynh() {
    // hai bình hoa quỳnh trắng hai bên lư hương
    [W * 0.33, W * 0.67].forEach((x, i) => {
      const y = H * 0.8;
      g.fillStyle = '#2f3d63';
      g.beginPath(); g.moveTo(x - 9, y); g.quadraticCurveTo(x - 15, y - 18, x - 5, y - 30); g.lineTo(x + 5, y - 30); g.quadraticCurveTo(x + 15, y - 18, x + 9, y); g.fill();
      g.strokeStyle = '#4c6b3f'; g.lineWidth = 1.5;
      const dau = [[-14, -62], [2, -72], [15, -58]];
      dau.forEach(([dx, dy]) => {
        g.beginPath(); g.moveTo(x, y - 30); g.quadraticCurveTo(x + dx * 0.3, y - 45, x + dx, y + dy); g.stroke();
        g.fillStyle = '#f6f2ea';
        for (let c = 0; c < 6; c++) {
          const a = c / 6 * Math.PI * 2 + i;
          g.beginPath(); g.ellipse(x + dx + Math.cos(a) * 4, y + dy + Math.sin(a) * 4, 5, 2.3, a, 0, Math.PI * 2); g.fill();
        }
        g.fillStyle = '#f3d77a'; g.beginPath(); g.arc(x + dx, y + dy, 1.8, 0, Math.PI * 2); g.fill();
      });
    });
  }

  function hieuUng(dt) {
    // sóng chuông
    for (let i = song.length - 1; i >= 0; i--) {
      const s = song[i]; s.r += dt * 0.12; s.a -= dt * 0.00045;
      if (s.a <= 0) { song.splice(i, 1); continue; }
      g.strokeStyle = `rgba(240,205,130,${s.a})`; g.lineWidth = 2;
      g.beginPath(); g.arc(W / 2, H * 0.33, s.r, 0, Math.PI * 2); g.stroke();
    }
    // chữ bay
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = chuBay.length - 1; i >= 0; i--) {
      const c = chuBay[i]; c.tuoi += dt;
      if (c.tuoi > 1100) { chuBay.splice(i, 1); continue; }
      const p = c.tuoi / 1100;
      g.globalAlpha = 1 - p;
      g.fillStyle = '#f3cf86'; g.font = `600 ${Math.round(W * 0.04)}px 'Be Vietnam Pro', sans-serif`;
      g.fillText(c.chu, c.x, c.y - p * 50);
    }
    g.globalAlpha = 1;
    // cánh quỳnh rơi
    for (let i = canh.length - 1; i >= 0; i--) {
      const c = canh[i]; c.y += dt * c.v; c.x += Math.sin(c.y * 0.02 + c.p) * 0.4; c.q += dt * 0.002;
      if (c.y > H * 0.82) { canh.splice(i, 1); continue; }
      g.save(); g.translate(c.x, c.y); g.rotate(c.q);
      g.fillStyle = 'rgba(246,242,234,0.85)';
      g.beginPath(); g.ellipse(0, 0, 5, 2.4, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    sang = Math.max(0, sang - dt * 0.00012);
  }

  function khung(t) {
    if (!chay) return;
    const dt = Math.min(66, t - (lanCuoi || t));
    if (t - lanCuoi < 32 && lanCuoi) { requestAnimationFrame(khung); return; } // ~30 khung/giây
    lanCuoi = t;
    nen(t); haoQuang(t); tuong(); banTho(); hoaQuynh(); nen2(t); veKhoi(dt); lienHuong(); veNhang(t); hieuUng(dt);
    requestAnimationFrame(khung);
  }

  function batDau() { if (chay) return; chay = true; lanCuoi = 0; requestAnimationFrame(khung); }
  function dung() { chay = false; }

  doCo();
  new ResizeObserver(() => doCo()).observe(cv);
  document.addEventListener('visibilitychange', () => document.hidden ? dung() : (cv.offsetParent && batDau()));
  if (document.fonts) document.fonts.ready.then(() => { lanCuoi = 0; });

  return {
    batDau, dung,
    datNhang(ds) { nhang = ds.slice(0, 36); },
    chuong() { song.push({ r: W * 0.1, a: 0.7 }, { r: W * 0.02, a: 0.5 }); sang = Math.min(1, sang + 0.6); for (let i = 0; i < 10; i++) canh.push({ x: Math.random() * W, y: -10 - Math.random() * 60, v: 0.04 + Math.random() * 0.04, p: Math.random() * 6, q: Math.random() * 3 }); },
    mo() { chuBay.push({ chu: '+1 công đức', x: W * (0.62 + Math.random() * 0.2), y: H * 0.72 }); sang = Math.min(1, sang + 0.05); },
    huong() { sang = Math.min(1, sang + 0.3); chuBay.push({ chu: '3 nén hương', x: W / 2, y: H * 0.6 }); },
  };
})();
