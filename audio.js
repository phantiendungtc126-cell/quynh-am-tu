// Âm thanh của chùa: mõ, chuông, hạt chuỗi, ống xăm (tổng hợp bằng Web Audio)
// và bộ tụng kinh nền đọc từng chữ theo nhịp mõ từ file am/kinh.mp3.
window.Am = (() => {
  let ctx = null, tong = null, vang = null, bat = true;
  try { bat = localStorage.getItem('qat.am') !== 'tat'; } catch (e) {}

  // Tiếng vang chánh điện: phản hồi xung tự tạo, đuôi dài ~3 giây
  function taoVang() {
    const dai = 3.2, n = Math.floor(ctx.sampleRate * dai);
    const b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let k = 0; k < 2; k++) {
      const d = b.getChannelData(k);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2);
    }
    const c = ctx.createConvolver(); c.buffer = b;
    const g = ctx.createGain(); g.gain.value = 0.32;
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

  function sin(f, t0, dai, to, dich, ra, cuaVang) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f, t0);
    if (dich) o.frequency.exponentialRampToValueAtTime(f * dich, t0 + dai);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(to, t0 + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dai);
    o.connect(g); noi(g, ra, cuaVang);
    o.start(t0); o.stop(t0 + dai + 0.05);
  }

  function on(t0, dai, tanSo, q, to, ra, cuaVang) {
    const n = Math.max(1, Math.floor(ctx.sampleRate * dai));
    const b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource(); s.buffer = b;
    const loc = ctx.createBiquadFilter(); loc.type = 'bandpass'; loc.frequency.value = tanSo; loc.Q.value = q;
    const g = ctx.createGain(); g.gain.value = to;
    s.connect(loc); loc.connect(g); noi(g, ra, cuaVang);
    s.start(t0);
  }

  function moAt(t, to, ra) {
    sin(560, t, 0.16, 0.7 * to, 0.92, ra, 0.25);
    sin(1180, t, 0.07, 0.25 * to, 0.95, ra, 0.15);
    on(t, 0.012, 2600, 1.2, 0.5 * to, ra);
  }
  function chuongAt(t, to, ra) {
    const f = 128;
    [[1, 0.5, 9], [2.0, 0.22, 6], [2.76, 0.28, 5], [4.07, 0.12, 3.5], [5.4, 0.08, 2.4], [6.8, 0.05, 1.8]].forEach(([r, a, dai]) => {
      sin(f * r, t, dai, a * to, 0, ra, 0.3);
      sin(f * r * 1.003, t, dai * 0.9, a * 0.5 * to, 0, ra);
    });
    on(t, 0.05, 900, 0.8, 0.35 * to, ra, 0.3);
  }
  function khanhAt(t, to, ra) {
    // chuông gia trì (khánh nhỏ) đánh đầu và cuối thời kinh
    [[1, 0.4, 3.5], [2.71, 0.2, 2.2], [5.2, 0.08, 1.2]].forEach(([r, a, dai]) => sin(620 * r, t, dai, a * to, 0, ra, 0.35));
  }

  // ---------------- Bộ tụng kinh nền ----------------
  const Tung = (() => {
    let mau = null, chuMap = null, dangTai = null;
    let bus = null, nenNhac = null;
    let chay = false, hen = null, tiep = 0, buoc = 0, ds = [], vong = 0;
    let amLuong = 0.55, nhip = 96, bai = 'thoikinh', ghiCong = false;
    const nghe = new Set();
    try {
      amLuong = +(localStorage.getItem('qat.amluong') || 0.55);
      bai = localStorage.getItem('qat.bai') || 'thoikinh';
      nhip = +(localStorage.getItem('qat.nhip') || 96);
    } catch (e) {}

    const khoa = tu => tu.toLowerCase().replace(/[^\p{L}]/gu, '');

    async function tai() {
      if (mau) return true;
      if (!dangTai) dangTai = (async () => {
        const [j, b] = await Promise.all([
          fetch('am/kinh.json?v=2').then(r => r.json()),
          fetch('am/kinh.mp3?v=2').then(r => r.arrayBuffer()),
        ]);
        chuMap = j.chu;
        mau = await new Promise((ok, loi) => ctx.decodeAudioData(b, ok, loi));
        return true;
      })().catch(e => { dangTai = null; throw e; });
      return dangTai;
    }

    function tokens(s) { return s.split(/\s+/).filter(Boolean); }

    // Dựng danh sách nhịp: {chu, kinhI (vị trí trong Tâm Kinh), nghi: số nhịp nghỉ, chuong, khanh}
    function dungDs(loai, tuChu) {
      const out = [];
      const tamKinh = () => {
        let i = 0;
        const doan = [KINH.ten].concat(KINH.doan);
        out.push({ khanh: true, nghi: 2 });
        doan.forEach((d, di) => {
          tokens(d).forEach(tu => {
            if (i >= (tuChu || 0)) out.push({ chu: khoa(tu), kinhI: i, nghi: /[.:]$/.test(tu) ? 1 : 0 });
            i++;
          });
          if (i > (tuChu || 0)) out.push({ nghi: di === 0 ? 2 : 1 });
        });
        out.push({ chuong: true, nghi: 3, xongKinh: true });
      };
      const niem = (cau, lan) => {
        out.push({ khanh: true, nghi: 1 });
        for (let k = 0; k < lan; k++) {
          const t = tokens(cau);
          t.forEach((tu, j) => out.push({ chu: khoa(tu), nghi: j === t.length - 1 ? 2 : 0, niem: j === t.length - 1 }));
          if (k % 4 === 3) out.push({ chuong: true, nghi: 1 });
        }
      };
      const hoiHuong = () => {
        out.push({ khanh: true, nghi: 1 });
        tokens('Nguyện đem công đức này, hướng về khắp tất cả, đệ tử và chúng sanh, đều trọn thành Phật đạo.')
          .forEach(tu => out.push({ chu: khoa(tu), nghi: /[,.]$/.test(tu) ? 1 : 0 }));
        out.push({ chuong: true, nghi: 6 });
      };
      if (loai === 'kinh') { tamKinh(); }
      else if (loai === 'niem') { niem(Tung.cauNiem || 'Nam Mô A Di Đà Phật', 12); }
      else { tamKinh(); niem('Nam Mô A Di Đà Phật', 8); hoiHuong(); }
      return out;
    }

    function phatChu(k, t) {
      const v = chuMap && chuMap[k];
      if (!v) return;
      const s = ctx.createBufferSource(); s.buffer = mau;
      s.playbackRate.value = 0.93; // trầm hơn một chút cho giống giọng tụng
      const g = ctx.createGain(); g.gain.value = 1.0;
      s.connect(g); noi(g, bus, 0.55);
      s.start(t, v[0], v[1] + 0.02);
    }

    function batNen() {
      // lớp chuông xoay (singing bowl) rất nhỏ làm nền
      if (nenNhac) return;
      const g = ctx.createGain(); g.gain.value = 0.0001;
      g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 4);
      const oscs = [[110, 0], [110.6, 0], [164.8, 0.4], [220.3, 0.5], [329.7, 0.7]].map(([f, d]) => {
        const o = ctx.createOscillator(); o.frequency.value = f;
        const og = ctx.createGain(); og.gain.value = 0.5 / (1 + d * 4);
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07 + d * 0.05;
        const lg = ctx.createGain(); lg.gain.value = og.gain.value * 0.5;
        lfo.connect(lg); lg.connect(og.gain);
        o.connect(og); og.connect(g); o.start(); lfo.start();
        return [o, lfo];
      });
      noi(g, bus, 0.6);
      nenNhac = { g, oscs };
    }
    function tatNen() {
      if (!nenNhac) return;
      const { g, oscs } = nenNhac; nenNhac = null;
      g.gain.cancelScheduledValues(ctx.currentTime);
      g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);
      setTimeout(() => oscs.forEach(([o, l]) => { o.stop(); l.stop(); }), 2500);
    }

    function lich() {
      if (!chay) return;
      const truoc = document.hidden ? 2.5 : 0.35;
      const chu = 60 / nhip;
      while (tiep < ctx.currentTime + truoc) {
        if (buoc >= ds.length) {
          if (bai === 'kinh' && ghiCong) { dung(); return; }
          vong++; ds = dungDs(bai, 0); buoc = 0;
        }
        const b = ds[buoc++];
        const t = tiep;
        if (b.khanh) khanhAt(t, 0.6, bus);
        if (b.chuong) chuongAt(t, 0.45, bus);
        if (b.chu) { phatChu(b.chu, t); moAt(t, 0.35, bus); }
        const tre = Math.max(0, (t - ctx.currentTime) * 1000);
        if (b.kinhI !== undefined || b.xongKinh || b.niem) {
          setTimeout(() => nghe.forEach(f => { try { f(b); } catch (e) {} }), tre);
        }
        tiep += chu * ((b.chu ? 1 : 0) + (b.nghi || 0) + (!b.chu && !b.nghi ? 1 : 0));
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
      ds = dungDs(bai, opt.tuChu || 0); buoc = 0; vong = 0;
      tiep = ctx.currentTime + 0.3;
      chay = true; batNen();
      hen = setInterval(lich, 60); lich();
      nghe.forEach(f => { try { f({ batDau: true }); } catch (e) {} });
      return true;
    }
    function dung(imLang) {
      const dangChay = chay;
      chay = false; clearInterval(hen); hen = null;
      if (bus && ctx && dangChay) {
        // tắt nhanh các chữ đã lên lịch
        const cu = bus; cu.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
        bus = ctx.createGain(); bus.gain.value = amLuong; bus.connect(tong);
        setTimeout(() => cu.disconnect(), 1500);
      }
      tatNen();
      if (!imLang) nghe.forEach(f => { try { f({ dung: true }); } catch (e) {} });
    }

    return {
      cauNiem: 'Nam Mô A Di Đà Phật',
      batDau, dung,
      get chay() { return chay; },
      get bai() { return bai; },
      get amLuong() { return amLuong; },
      datAmLuong(v) {
        amLuong = v; try { localStorage.setItem('qat.amluong', v); } catch (e) {}
        if (bus && ctx) bus.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
      },
      get nhip() { return nhip; },
      datNhip(v) { nhip = v; try { localStorage.setItem('qat.nhip', v); } catch (e) {} },
      nghe(f) { nghe.add(f); return () => nghe.delete(f); },
    };
  })();

  return {
    Tung,
    get bat() { return bat; },
    doi() {
      bat = !bat;
      try { localStorage.setItem('qat.am', bat ? 'bat' : 'tat'); } catch (e) {}
      return bat;
    },
    mo() { if (bat && san()) moAt(ctx.currentTime, 1); },
    chuong() { if (bat && san()) chuongAt(ctx.currentTime, 1); },
    hat() {
      if (!bat || !san()) return;
      const t = ctx.currentTime;
      sin(1900, t, 0.035, 0.18);
      on(t, 0.01, 4200, 2, 0.15);
    },
    lacXam() {
      if (!bat || !san()) return;
      const t = ctx.currentTime;
      for (let i = 0; i < 14; i++) on(t + i * 0.085 + Math.random() * 0.03, 0.03, 2400 + Math.random() * 1500, 3, 0.55);
    },
  };
})();
