// Âm thanh Công Viên Cầu Vồng: nhún "boing", pháo giấy "tèn ten", bong bóng "póc", hộp quà lắc lắc,
// và bộ phát nhạc nền: bài hát đọc từng chữ theo nhịp trống + nốt đàn xylophone, nhạc vui không lời.
window.Am = (() => {
  let ctx = null, tong = null, vang = null, bat = true;
  try { bat = localStorage.getItem('qat.am') !== 'tat'; } catch (e) {}

  function taoVang() {
    const dai = 1.2, n = Math.floor(ctx.sampleRate * dai);
    const b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let k = 0; k < 2; k++) { const d = b.getChannelData(k); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4); }
    const c = ctx.createConvolver(); c.buffer = b;
    const g = ctx.createGain(); g.gain.value = 0.18;
    c.connect(g); g.connect(tong);
    return c;
  }

  function san() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const nen = ctx.createDynamicsCompressor();
      nen.threshold.value = -14; nen.ratio.value = 4;
      tong = ctx.createGain(); tong.gain.value = 0.9;
      tong.connect(nen); nen.connect(ctx.destination);
      vang = taoVang();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noi(nut, ra, cuaVang) {
    nut.connect(ra || tong);
    if (cuaVang) { const s = ctx.createGain(); s.gain.value = cuaVang; nut.connect(s); s.connect(vang); }
  }

  function dao(f, t0, dai, to, kieu, dich, ra, cuaVang) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = kieu || 'sine'; o.frequency.setValueAtTime(f, t0);
    if (dich) o.frequency.exponentialRampToValueAtTime(f * dich, t0 + dai);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(to, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dai);
    o.connect(g); noi(g, ra, cuaVang);
    o.start(t0); o.stop(t0 + dai + 0.05);
  }

  function on(t0, dai, tanSo, q, to, ra) {
    const n = Math.max(1, Math.floor(ctx.sampleRate * dai));
    const b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource(); s.buffer = b;
    const loc = ctx.createBiquadFilter(); loc.type = 'bandpass'; loc.frequency.value = tanSo; loc.Q.value = q;
    const g = ctx.createGain(); g.gain.value = to;
    s.connect(loc); loc.connect(g); noi(g, ra);
    s.start(t0);
  }

  // nốt đàn xylophone: âm cơ bản + bội âm 4 lần, tắt nhanh
  const NOT = { C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784, A5: 880, C6: 1046.5 };
  function xylo(f, t, to, ra) {
    dao(f, t, 0.5, 0.35 * to, 'sine', 0, ra, 0.3);
    dao(f * 3.98, t, 0.12, 0.08 * to, 'sine', 0, ra);
  }
  function trong(t, to, ra) { dao(140, t, 0.18, 0.7 * to, 'sine', 0.35, ra); }
  function chap(t, to, ra) { on(t, 0.04, 7000, 1.2, 0.18 * to, ra); }
  function bass(f, t, to, ra) { dao(f / 2, t, 0.45, 0.35 * to, 'triangle', 0, ra); }

  function boingAt(t, to, ra) { dao(220, t, 0.28, 0.5 * to, 'sine', 2.6, ra); dao(330, t + 0.02, 0.2, 0.15 * to, 'triangle', 2.2, ra); }
  function tadaAt(t, to, ra) {
    [NOT.C5, NOT.E5, NOT.G5, NOT.C6].forEach((f, i) => xylo(f, t + i * 0.08, to * 1.2, ra));
    on(t, 0.15, 3000, 0.7, 0.4 * to, ra);
    dao(NOT.C5, t + 0.32, 0.9, 0.18 * to, 'triangle', 0, ra, 0.3);
    dao(NOT.E5, t + 0.32, 0.9, 0.14 * to, 'triangle', 0, ra, 0.3);
    dao(NOT.G5, t + 0.32, 0.9, 0.12 * to, 'triangle', 0, ra, 0.3);
  }

  // ---------------- Bộ phát nhạc nền ----------------
  const Tung = (() => {
    let mau = null, chuMap = null, dangTai = null, bus = null;
    let chay = false, hen = null, tiep = 0, buoc = 0, ds = [], nhipSo = 0;
    let amLuong = 0.55, nhip = 104, bai = 'thoikinh', ghiCong = false;
    const nghe = new Set();
    try {
      amLuong = +(localStorage.getItem('qat.amluong') || 0.55);
      bai = localStorage.getItem('qat.bai') || 'thoikinh';
      nhip = +(localStorage.getItem('qat.nhip2') || 104);
    } catch (e) {}

    const khoa = tu => tu.toLowerCase().replace(/[^\p{L}]/gu, '');
    // giai điệu ngũ cung vui tai, lặp theo vị trí chữ trong câu
    const GIAI = ['E5', 'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'G5', 'E5'];
    const GIAI2 = ['C5', 'D5', 'E5', 'C5', 'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5'];
    const HOP_AM = ['C4', 'A4', 'F4', 'G4'];
    // nhạc vui không lời: 16 nốt lặp, - là nghỉ
    const KHONG_LOI = ['C5', 'E5', 'G5', 'E5', 'A5', 'G5', 'E5', '-', 'F5', 'A5', 'G5', 'E5', 'D5', 'E5', 'C5', '-',
      'E5', 'G5', 'A5', 'C6', 'A5', 'G5', 'E5', '-', 'D5', 'F5', 'E5', 'D5', 'C5', 'D5', 'C5', '-'];

    async function tai() {
      if (mau) return true;
      if (!dangTai) dangTai = (async () => {
        const [j, b] = await Promise.all([
          fetch('am/kinh.json?v=4').then(r => r.json()),
          fetch('am/kinh.mp3?v=4').then(r => r.arrayBuffer()),
        ]);
        chuMap = j.chu;
        mau = await new Promise((ok, loi) => ctx.decodeAudioData(b, ok, loi));
        return true;
      })().catch(e => { dangTai = null; throw e; });
      return dangTai;
    }

    const tokens = s => s.split(/\s+/).filter(Boolean);

    function dungDs(loai, tuChu) {
      const out = [];
      const baiHat = () => {
        let i = 0;
        const doan = [KINH.ten].concat(KINH.doan);
        out.push({ tada: true, nghi: 2 });
        doan.forEach((d, di) => {
          const t = tokens(d);
          t.forEach((tu, j) => {
            if (i >= (tuChu || 0)) out.push({ chu: khoa(tu), kinhI: i, not: (di % 2 ? GIAI2 : GIAI)[j % 12], nghi: /[.!:]$/.test(tu) ? 1 : 0 });
            i++;
          });
          if (i > (tuChu || 0)) out.push({ nghi: 1, not: '-' });
        });
        out.push({ tada: true, nghi: 3, xongKinh: true });
      };
      const demSo = () => {
        tokens(DEM_SO).forEach((tu, j) => out.push({ chu: khoa(tu), not: ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B4', 'C5', 'D5', 'E5'][j] || 'C5', niem: true }));
        out.push({ tada: true, nghi: 2 });
      };
      const khongLoi = (vong) => {
        for (let v = 0; v < vong; v++) KHONG_LOI.forEach(n => out.push({ not: n, khongLoi: true }));
      };
      const tamBiet = () => {
        tokens(TAM_BIET).forEach((tu, j) => out.push({ chu: khoa(tu), not: ['G5', 'E5', 'C5', 'E5', 'G5', 'A5', 'G5', 'E5'][j % 8], nghi: /[,!]$/.test(tu) ? 1 : 0 }));
        out.push({ tada: true, nghi: 4 });
      };
      if (loai === 'kinh') baiHat();
      else if (loai === 'niem') khongLoi(4);
      else { baiHat(); demSo(); khongLoi(2); tamBiet(); }
      return out;
    }

    function phatChu(k, t) {
      const v = chuMap && chuMap[k];
      if (!v) return;
      const s = ctx.createBufferSource(); s.buffer = mau;
      s.playbackRate.value = 1.04; // cao hơn chút cho vui tai
      const g = ctx.createGain(); g.gain.value = 1.0;
      s.connect(g); noi(g, bus, 0.25);
      s.start(t, v[0], v[1] + 0.02);
    }

    function lich() {
      if (!chay) return;
      const truoc = document.hidden ? 2.5 : 0.35;
      const chu = 60 / nhip;
      while (tiep < ctx.currentTime + truoc) {
        if (buoc >= ds.length) {
          if (bai === 'kinh' && ghiCong) { dung(); return; }
          ds = dungDs(bai, 0); buoc = 0;
        }
        const b = ds[buoc++];
        const t = tiep;
        // trống: phách mạnh mỗi 4 nhịp, chập chả nhịp lẻ
        if (nhipSo % 4 === 0) { trong(t, 0.7, bus); bass(NOT[HOP_AM[(nhipSo / 4 | 0) % 4]], t, 0.8, bus); }
        else if (nhipSo % 2 === 0) chap(t, 0.8, bus);
        if (b.tada) tadaAt(t, 0.5, bus);
        if (b.not && b.not !== '-') xylo(NOT[b.not], t, b.chu ? 0.55 : 0.9, bus);
        if (b.chu) phatChu(b.chu, t);
        const tre = Math.max(0, (t - ctx.currentTime) * 1000);
        if (b.kinhI !== undefined || b.xongKinh || b.niem || b.khongLoi) setTimeout(() => nghe.forEach(f => { try { f(b); } catch (e) {} }), tre);
        const so = (b.chu || b.not ? 1 : 0) + (b.nghi || 0) + (!b.chu && !b.not && !b.nghi ? 1 : 0);
        tiep += chu * so; nhipSo += so;
      }
    }

    async function batDau(opt = {}) {
      if (!san()) return false;
      if (opt.bai) { bai = opt.bai; try { localStorage.setItem('qat.bai', bai); } catch (e) {} }
      ghiCong = !!opt.ghiCong;
      if (!bus) { bus = ctx.createGain(); bus.connect(tong); }
      bus.gain.setValueAtTime(amLuong, ctx.currentTime);
      await tai();
      dung(true);
      ds = dungDs(bai, opt.tuChu || 0); buoc = 0; nhipSo = 0;
      tiep = ctx.currentTime + 0.3;
      chay = true;
      hen = setInterval(lich, 60); lich();
      nghe.forEach(f => { try { f({ batDau: true }); } catch (e) {} });
      return true;
    }
    function dung(imLang) {
      const dangChay = chay;
      chay = false; clearInterval(hen); hen = null;
      if (bus && ctx && dangChay) {
        const cu = bus; cu.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
        bus = ctx.createGain(); bus.gain.value = amLuong; bus.connect(tong);
        setTimeout(() => cu.disconnect(), 1500);
      }
      if (!imLang) nghe.forEach(f => { try { f({ dung: true }); } catch (e) {} });
    }

    return {
      cauNiem: '',
      batDau, dung,
      get chay() { return chay; },
      get bai() { return bai; },
      get amLuong() { return amLuong; },
      datAmLuong(v) { amLuong = v; try { localStorage.setItem('qat.amluong', v); } catch (e) {} if (bus && ctx) bus.gain.setTargetAtTime(v, ctx.currentTime, 0.05); },
      get nhip() { return nhip; },
      datNhip(v) { nhip = v; try { localStorage.setItem('qat.nhip2', v); } catch (e) {} },
      nghe(f) { nghe.add(f); return () => nghe.delete(f); },
    };
  })();

  return {
    Tung,
    get bat() { return bat; },
    doi() { bat = !bat; try { localStorage.setItem('qat.am', bat ? 'bat' : 'tat'); } catch (e) {} return bat; },
    mo() { if (bat && san()) boingAt(ctx.currentTime, 1); },
    chuong() { if (bat && san()) tadaAt(ctx.currentTime, 1); },
    hat() {
      // bong bóng vỡ "póc", cao độ ngẫu nhiên
      if (!bat || !san()) return;
      const t = ctx.currentTime;
      dao(900 + Math.random() * 500, t, 0.07, 0.35, 'sine', 0.4);
      on(t, 0.015, 3500, 1.5, 0.2);
    },
    lacXam() {
      if (!bat || !san()) return;
      const t = ctx.currentTime;
      for (let i = 0; i < 10; i++) on(t + i * 0.1, 0.04, 1200 + Math.random() * 800, 2, 0.4);
      [NOT.G5, NOT.C6].forEach((f, i) => xylo(f, t + 1.15 + i * 0.1, 1.2));
    },
  };
})();
