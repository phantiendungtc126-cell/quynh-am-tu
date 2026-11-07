// Âm thanh Công Viên Cầu Vồng: nhún "boing", pháo giấy "tèn ten", bong bóng "póc", hộp quà lắc lắc,
// và bộ phát nhạc: phối pop/EDM thiếu nhi sôi động, hoặc hộp nhạc ru êm.
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

  // ---------------- Bộ phát nhạc ----------------
  // Sôi động: phối kiểu pop/EDM thiếu nhi (trống điện tử, bass nảy, pad synth nhún theo kick, lead pluck).
  // Ru êm: tiếng hộp nhạc. Giai điệu lấy từ data.js (BAI_NHAC: tự soạn hoặc phạm vi công cộng).
  const Tung = (() => {
    let bus = null, nhacBus = null, padBus = null, chay = false, hen = null;
    let hang = [], viTri = 0, mocGiay = 0, thuTu = 0;
    let amLuong = 0.55, nhip = 100, bai = 'thoikinh', ghiCong = false;
    const nghe = new Set();
    try {
      amLuong = +(localStorage.getItem('qat.amluong') || 0.55);
      bai = localStorage.getItem('qat.bai') || 'thoikinh';
      nhip = +(localStorage.getItem('qat.nhip3') || 100);
      thuTu = +(localStorage.getItem('qat.thutu2') || 0);
    } catch (e) {}

    const TAN = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const tanSo = n => { const m = /^([A-G])(#?)(\d)$/.exec(n); if (!m) return 0; const so = TAN[m[1]] + (m[2] ? 1 : 0) + (+m[3] + 1) * 12; return 440 * Math.pow(2, (so - 69) / 12); };
    const HOP = {
      C: ['C', 'E', 'G'], D: ['D', 'F#', 'A'], Dm: ['D', 'F', 'A'], E: ['E', 'G#', 'B'], Em: ['E', 'G', 'B'],
      F: ['F', 'A', 'C'], G: ['G', 'B', 'D'], A: ['A', 'C', 'E'], Am: ['A', 'C', 'E'],
    };
    const nc = (ten, qd) => tanSo(ten + qd);

    // ---- nhạc cụ ----
    function noiseBuf(dai) { const n = Math.max(1, Math.floor(ctx.sampleRate * dai)); const b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return b; }
    let NB = null;
    function on2(t, dai, loai, f, q, to) {
      if (!NB) NB = noiseBuf(0.5);
      const s = ctx.createBufferSource(); s.buffer = NB;
      const l = ctx.createBiquadFilter(); l.type = loai; l.frequency.value = f; l.Q.value = q;
      const g = ctx.createGain(); g.gain.setValueAtTime(to, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dai);
      s.connect(l); l.connect(g); g.connect(bus); s.start(t, Math.random() * 0.3, dai + 0.02);
    }
    function kick(t, to = 1) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.95 * to, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.35);
      // pad nhún theo kick (sidechain)
      if (padBus) { padBus.gain.cancelScheduledValues(t); padBus.gain.setValueAtTime(0.25, t); padBus.gain.linearRampToValueAtTime(1, t + 0.22); }
    }
    function clap(t) { [0, 0.011, 0.022].forEach(d => on2(t + d, 0.12, 'bandpass', 1500, 0.9, 0.32)); }
    function hat(t, mo) { on2(t, mo ? 0.18 : 0.035, 'highpass', 7500, 0.7, mo ? 0.09 : 0.11); }
    function bassNot(f, t, dai) {
      const o = ctx.createOscillator(), l = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = f;
      l.type = 'lowpass'; l.frequency.setValueAtTime(900, t); l.frequency.exponentialRampToValueAtTime(220, t + dai); l.Q.value = 6;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dai);
      o.connect(l); l.connect(g); g.connect(bus); o.start(t); o.stop(t + dai + 0.05);
    }
    function pad(ds, t, dai) {
      ds.forEach(f => [-8, 8].forEach(ct => {
        const o = ctx.createOscillator(), l = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = ct;
        l.type = 'lowpass'; l.frequency.value = 1700;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.028, t + 0.04); g.gain.setValueAtTime(0.028, t + dai - 0.08); g.gain.linearRampToValueAtTime(0.0001, t + dai);
        o.connect(l); l.connect(g); g.connect(padBus); o.start(t); o.stop(t + dai + 0.02);
      }));
    }
    function lead(f, t, dai, sang) {
      const d = Math.min(0.45, Math.max(0.16, dai * 0.9));
      [['square', 0, 0.075], ['sawtooth', 7, 0.06]].forEach(([k, ct, to]) => {
        const o = ctx.createOscillator(), l = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = k; o.frequency.value = f; o.detune.value = ct;
        l.type = 'lowpass'; l.frequency.setValueAtTime(sang ? 5200 : 3600, t); l.frequency.exponentialRampToValueAtTime(900, t + d); l.Q.value = 3;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(to, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(l); l.connect(g); g.connect(nhacBus); o.start(t); o.stop(t + d + 0.03);
      });
    }
    function chuongNho(f, t, to = 0.08) { dao(f * 2, t, 0.35, to, 'sine', 0, nhacBus, 0.3); }
    function hopNhac(f, t, dai, to) {
      const d = Math.max(0.6, dai * 1.4);
      dao(f, t, d, 0.26 * to, 'sine', 0, nhacBus, 0.35);
      dao(f * 2, t, d * 0.5, 0.07 * to, 'sine', 0, nhacBus, 0.25);
    }
    function crash(t) { on2(t, 1.1, 'highpass', 5000, 0.5, 0.12); }

    // ---- dựng dòng thời gian của một bài: sự kiện theo phách ----
    function phanTich(bn) {
      const not = bn.not.trim().split(/\s+/).map(x => { const [n, p] = x.split(':'); return { n, p: p ? +p : 1 }; });
      const hop = (bn.hop || 'C').trim().split(/\s+/);
      const dai = not.reduce((a, x) => a + x.p, 0);
      return { not, hop, hn: bn.hopNhip || 2, dai, ten: bn.ten, nhip: bn.nhip || 120 };
    }

    function baiSoiDong(bn) {
      const b = phanTich(bn), ev = [];
      const lap = b.dai < 48 ? 2 : 1, intro = 4;
      ev.push({ b: 0, k: 'ten', ten: b.ten });
      const tong = intro + b.dai * lap + 2;
      // trống + bass + pad cho toàn bài
      for (let ph = 0; ph < tong - 2; ph += 0.5) {
        const nguyen = Math.abs(ph - Math.round(ph)) < 1e-6;
        const trongBai = ph >= intro;
        if (nguyen) { if (ph % 1 === 0) ev.push({ b: ph, k: 'kick', to: trongBai ? 1 : 0.7 }); if (trongBai && (Math.round(ph) % 2 === 1)) ev.push({ b: ph, k: 'clap' }); }
        else ev.push({ b: ph, k: 'hat', mo: Math.round(ph - 0.5) % 4 === 3 });
        if (trongBai && lap === 2 && ph >= intro + b.dai) ev.push({ b: ph + 0.25, k: 'hat16' });
      }
      const hopTai = ph => { const vi = ((ph - intro) % b.dai + b.dai) % b.dai; return b.hop[Math.floor(vi / b.hn) % b.hop.length] || 'C'; };
      for (let ph = 0; ph < tong - 2; ph += b.hn) {
        const h = ph < intro ? b.hop[0] : hopTai(ph);
        ev.push({ b: ph, k: 'pad', h, dai: b.hn });
        for (let s = 0.5; s < b.hn; s += 1) ev.push({ b: ph + s, k: 'bass', h });
        if (ph >= intro + b.dai && lap === 2) for (let s = 0; s < b.hn; s += 0.25) ev.push({ b: ph + s, k: 'arp', h, i: Math.round(s * 4) });
      }
      // giai điệu
      for (let l = 0; l < lap; l++) {
        let ph = intro + l * b.dai;
        b.not.forEach(x => { if (x.n !== 'R') ev.push({ b: ph, k: 'lead', n: x.n, p: x.p, sang: l === 1 }); ph += x.p; });
      }
      ev.push({ b: intro, k: 'crash' }); ev.push({ b: tong - 2, k: 'crash' });
      ev.push({ b: tong - 2, k: 'kick', to: 1 });
      return { ev, dai: tong, nhip: Math.max(112, b.nhip) };
    }

    function baiKaraoke(tuChu) {
      const b = phanTich(BAI_NHAC.find(x => x.karaoke) || BAI_NHAC[0]), ev = [];
      const soChuTen = KINH.ten.split(/\s+/).length, intro = 4;
      // bắt đầu từ chữ được chạm: bỏ các nốt trước đó, hợp âm lệch theo số phách đã bỏ
      const bo = Math.max(0, (tuChu || 0) - soChuTen), boPhach = b.not.slice(0, bo).reduce((a, x) => a + x.p, 0);
      const conLai = b.dai - boPhach;
      ev.push({ b: 0, k: 'ten', ten: 'Hát cùng bé: ' + KINH.ten });
      for (let ph = 0; ph < intro + conLai; ph += 1) { ev.push({ b: ph, k: 'kick', to: 0.75 }); if (ph % 2 === 1) ev.push({ b: ph, k: 'clap' }); ev.push({ b: ph + 0.5, k: 'hat' }); }
      for (let ph = 0; ph < intro + conLai; ph += b.hn) { const h = ph < intro ? 'C' : (b.hop[Math.floor((ph - intro + boPhach) / b.hn)] || 'C'); ev.push({ b: ph, k: 'pad', h, dai: b.hn }); ev.push({ b: ph + 0.5, k: 'bass', h }); ev.push({ b: ph + 1.5, k: 'bass', h }); }
      let ph = intro;
      b.not.forEach((x, i) => { if (i < bo) return; ev.push({ b: ph, k: 'lead', n: x.n, p: x.p, kinhI: soChuTen + i }); ph += x.p; });
      ev.push({ b: ph, k: 'crash' }); ev.push({ b: ph + 2, k: 'xong' });
      return { ev, dai: ph + 2, nhip };
    }

    function baiRu(bn) {
      const b = phanTich(bn), ev = [{ b: 0, k: 'ten', ten: b.ten + ' (ru êm)' }];
      let ph = 0;
      b.not.forEach(x => { if (x.n !== 'R') ev.push({ b: ph, k: 'hop', n: x.n, p: x.p }); ph += x.p; });
      for (let q = 0; q < b.dai; q += b.hn) { const h = b.hop[Math.floor(q / b.hn)] || 'C'; ev.push({ b: q, k: 'ruHop', h, dai: b.hn }); }
      return { ev, dai: b.dai + 2, nhip: 72 };
    }

    // nối các bài thành hàng đợi theo giây tuyệt đối
    function themBai(baiDung, tuChu) {
      const giay = 60 / baiDung.nhip, bd = mocGiay;
      baiDung.ev.sort((a, c) => a.b - c.b).forEach(e => {
        if (tuChu !== undefined && e.kinhI !== undefined && e.kinhI < tuChu) return;
        hang.push(Object.assign({ t: bd + e.b * giay, giay }, e));
      });
      mocGiay = bd + baiDung.dai * giay;
    }
    function napTiep(tuChu) {
      if (bai === 'kinh') { themBai(baiKaraoke(tuChu)); return; }
      const ds = BAI_NHAC.filter(x => bai === 'niem' ? x.ru : !x.chiRu);
      if (bai === 'niem') { ds.forEach(x => themBai(baiRu(x))); return; }
      const x = ds[thuTu % ds.length]; thuTu = (thuTu + 1) % ds.length;
      try { localStorage.setItem('qat.thutu2', thuTu); } catch (e) {}
      themBai(baiSoiDong(x));
    }

    function phat(e) {
      const t = e.t, g = e.giay;
      switch (e.k) {
        case 'kick': kick(t, e.to); break;
        case 'clap': clap(t); break;
        case 'hat': hat(t, e.mo); break;
        case 'hat16': on2(t, 0.02, 'highpass', 9000, 0.7, 0.04); break;
        case 'crash': crash(t); break;
        case 'pad': pad((HOP[e.h] || HOP.C).map((n, i) => nc(n, i === 0 ? 4 : 4)), t, e.dai * g); break;
        case 'bass': bassNot(nc((HOP[e.h] || HOP.C)[0], 2), t, 0.45 * g); break;
        case 'arp': { const ds = HOP[e.h] || HOP.C; chuongNho(nc(ds[e.i % 3], 5), t, 0.035); break; }
        case 'lead': lead(tanSo(e.n), t, e.p * g, e.sang); if (e.sang) chuongNho(tanSo(e.n), t, 0.05); break;
        case 'hop': hopNhac(tanSo(e.n), t, e.p * g, 0.8); break;
        case 'ruHop': { const ds = HOP[e.h] || HOP.C; dao(nc(ds[0], 3), t, Math.min(1.4, e.dai * g), 0.1, 'triangle', 0, nhacBus); ds.slice(1).forEach((n, i) => dao(nc(n, 4), t + 0.03 * (i + 1), Math.min(1.6, e.dai * g), 0.025, 'triangle', 0, nhacBus, 0.3)); break; }
      }
    }

    function lich() {
      if (!chay) return;
      const truoc = document.hidden ? 2.5 : 0.3;
      if (viTri >= hang.length || hang[hang.length - 1].t < ctx.currentTime + truoc + 1) {
        if (bai === 'kinh' && ghiCong && viTri >= hang.length) { dung(); return; }
        if (!(bai === 'kinh' && ghiCong)) napTiep();
      }
      while (viTri < hang.length && hang[viTri].t < ctx.currentTime + truoc) {
        const e = hang[viTri++];
        if (e.t < ctx.currentTime - 0.05) continue;
        phat(e);
        if (e.k === 'ten' || e.kinhI !== undefined || e.k === 'xong') {
          const bao = e.k === 'ten' ? { tenBai: e.ten } : e.k === 'xong' ? { xongKinh: true } : { kinhI: e.kinhI };
          setTimeout(() => nghe.forEach(f => { try { f(bao); } catch (er) {} }), Math.max(0, (e.t - ctx.currentTime) * 1000));
        }
      }
      if (viTri > 2000) { hang = hang.slice(viTri); viTri = 0; }
    }

    async function batDau(opt = {}) {
      if (!san()) return false;
      if (opt.bai) { bai = opt.bai; try { localStorage.setItem('qat.bai', bai); } catch (e) {} }
      ghiCong = !!opt.ghiCong;
      dung(true);
      bus = ctx.createGain(); bus.gain.value = amLuong; bus.connect(tong);
      nhacBus = ctx.createGain(); nhacBus.gain.value = 1; nhacBus.connect(bus);
      padBus = ctx.createGain(); padBus.gain.value = 1; padBus.connect(bus);
      hang = []; viTri = 0; mocGiay = ctx.currentTime + 0.2;
      napTiep(opt.tuChu);
      chay = true;
      hen = setInterval(lich, 50); lich();
      nghe.forEach(f => { try { f({ batDau: true }); } catch (e) {} });
      return true;
    }
    function dung(imLang) {
      const dangChay = chay;
      chay = false; clearInterval(hen); hen = null;
      if (bus && ctx && dangChay) { const cu = bus; cu.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.06); setTimeout(() => cu.disconnect(), 1200); }
      if (!imLang) nghe.forEach(f => { try { f({ dung: true }); } catch (e) {} });
    }
    function baiTiep() { return batDau({ bai: 'thoikinh' }); }

    return {
      cauNiem: '',
      batDau, dung, baiTiep,
      get chay() { return chay; },
      get bai() { return bai; },
      get amLuong() { return amLuong; },
      datAmLuong(v) { amLuong = v; try { localStorage.setItem('qat.amluong', v); } catch (e) {} if (bus && ctx) bus.gain.setTargetAtTime(v, ctx.currentTime, 0.05); },
      get nhip() { return nhip; },
      datNhip(v) { nhip = v; try { localStorage.setItem('qat.nhip3', v); } catch (e) {} },
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
