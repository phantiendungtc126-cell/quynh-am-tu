// Âm thanh Công Viên Cầu Vồng: nhún "boing", pháo giấy "tèn ten", bong bóng "póc", hộp quà lắc lắc,
// và bộ phát nhạc thiếu nhi (giai điệu phạm vi công cộng) chơi bằng tiếng hộp nhạc.
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

  // ---------------- Bộ phát nhạc thiếu nhi ----------------
  // Giai điệu phạm vi công cộng trong data.js (BAI_NHAC), chơi bằng tiếng hộp nhạc + bass + hợp âm đệm.
  const Tung = (() => {
    let bus = null, chay = false, hen = null, tiep = 0, buoc = 0, ds = [], thuTu = 0;
    let amLuong = 0.55, nhip = 100, bai = 'thoikinh', ghiCong = false;
    const nghe = new Set();
    try {
      amLuong = +(localStorage.getItem('qat.amluong') || 0.55);
      bai = localStorage.getItem('qat.bai') || 'thoikinh';
      nhip = +(localStorage.getItem('qat.nhip3') || 100);
      thuTu = +(localStorage.getItem('qat.thutu') || 0);
    } catch (e) {}

    const TAN = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const tanSo = n => { const m = /^([A-G])(#?)(\d)$/.exec(n); if (!m) return 0; const so = TAN[m[1]] + (m[2] ? 1 : 0) + (+m[3] + 1) * 12; return 440 * Math.pow(2, (so - 69) / 12); };
    const HOP = { C: ['C3', 'E4', 'G4'], F: ['F3', 'A4', 'C5'], G: ['G3', 'B4', 'D5'], A: ['A3', 'C5', 'E5'], D: ['D3', 'F4', 'A4'], E: ['E3', 'G4', 'B4'] };

    // hộp nhạc: âm cơ bản + bội âm sáng, tắt dần mềm
    function hopNhac(f, t, dai, to) {
      const d = Math.max(0.6, dai * 1.4);
      dao(f, t, d, 0.26 * to, 'sine', 0, bus, 0.35);
      dao(f * 2, t, d * 0.5, 0.07 * to, 'sine', 0, bus, 0.25);
      dao(f * 3.01, t, 0.25, 0.035 * to, 'sine', 0, bus);
    }
    function demHop(ten, t, dai, nhe) {
      const h = HOP[ten]; if (!h) return;
      dao(tanSo(h[0]), t, Math.min(1.2, dai * 0.9), (nhe ? 0.12 : 0.2), 'triangle', 0, bus);
      h.slice(1).forEach((n, i) => dao(tanSo(n), t + 0.02 + i * 0.03, Math.min(1.5, dai), nhe ? 0.025 : 0.04, 'triangle', 0, bus, 0.3));
    }

    function phanTich(baiNhac) {
      const not = baiNhac.not.trim().split(/\s+/).map(x => { const [n, p] = x.split(':'); return { n, p: p ? +p : 1 }; });
      const hop = (baiNhac.hop || '').trim().split(/\s+/);
      return { not, hop, hn: baiNhac.hopNhip || 2, ten: baiNhac.ten, nhip: baiNhac.nhip || 104 };
    }

    // Danh sách sự kiện: mỗi phần tử là một nốt (hoặc nghỉ) kèm hợp âm khi tới đầu nhóm phách
    function dungDs(loai, tuChu) {
      const out = [];
      const them = (bn, opt = {}) => {
        const b = phanTich(bn);
        let phach = 0, hopI = 0, soDau = opt.kinhTu;
        out.push({ tenBai: b.ten, nghi: 0 });
        b.not.forEach((x, i) => {
          const e = { n: x.n, p: x.p, nhip: opt.nhip || b.nhip, nhe: !!opt.nhe };
          if (soDau !== undefined) e.kinhI = soDau + i;
          // hợp âm nào rơi vào khoảng của nốt này
          const ds2 = [];
          while (hopI * b.hn < phach + x.p - 1e-6) { ds2.push({ ten: b.hop[hopI], lech: hopI * b.hn - phach }); hopI++; }
          e.hop = ds2.filter(h => h.lech >= -1e-6); e.hn = b.hn;
          if (opt.tuNot === undefined || i >= opt.tuNot) out.push(e);
          phach += x.p;
        });
        out.push({ nghi: 2, nhip: opt.nhip || b.nhip, xongKinh: !!opt.karaoke });
      };
      if (loai === 'kinh') {
        // karaoke: Twinkle, mỗi nốt một chữ; chỉ số chữ trong trang Hát bắt đầu sau các chữ của tên bài
        const soChuTen = KINH.ten.split(/\s+/).length;
        const tuNot = Math.max(0, (tuChu || 0) - soChuTen);
        them(BAI_NHAC[0], { kinhTu: soChuTen, karaoke: true, nhip, tuNot });
      } else if (loai === 'niem') {
        // nhạc ru: chậm, nhẹ, không trống
        [0, 2, 1].forEach(i => them(BAI_NHAC[i], { nhip: 72, nhe: true }));
      } else {
        for (let k = 0; k < BAI_NHAC.length; k++) them(BAI_NHAC[(thuTu + k) % BAI_NHAC.length]);
      }
      return out;
    }

    function lich() {
      if (!chay) return;
      const truoc = document.hidden ? 2.5 : 0.35;
      while (tiep < ctx.currentTime + truoc) {
        if (buoc >= ds.length) {
          if (bai === 'kinh' && ghiCong) { dung(); return; }
          ds = dungDs(bai, 0); buoc = 0;
        }
        const e = ds[buoc++], t = tiep;
        const giay = 60 / (e.nhip || 104);
        if (e.tenBai) {
          if (bai === 'thoikinh') { const i = BAI_NHAC.findIndex(b => b.ten === e.tenBai); thuTu = (i + 1) % BAI_NHAC.length; try { localStorage.setItem('qat.thutu', thuTu); } catch (er) {} }
          setTimeout(() => nghe.forEach(f => { try { f({ tenBai: e.tenBai }); } catch (er) {} }), Math.max(0, (t - ctx.currentTime) * 1000));
          continue;
        }
        if (e.n) {
          if (e.n !== 'R') hopNhac(tanSo(e.n), t, e.p * giay, e.nhe ? 0.75 : 1);
          (e.hop || []).forEach(h => {
            demHop(h.ten, t + h.lech * giay, (e.hn || 2) * giay, e.nhe);
            if (!e.nhe) {
              // trống khẽ: phách đầu nhóm và chập chả giữa nhóm
              dao(110, t + h.lech * giay, 0.14, 0.22, 'sine', 0.4, bus);
              on(t + (h.lech + (e.hn || 2) / 2) * giay, 0.03, 8000, 1.2, 0.05, bus);
            }
          });
        }
        if (e.kinhI !== undefined || e.xongKinh) {
          setTimeout(() => nghe.forEach(f => { try { f(e); } catch (er) {} }), Math.max(0, (t - ctx.currentTime) * 1000));
        }
        tiep += (e.n ? e.p : (e.nghi || 0)) * giay;
      }
    }

    async function batDau(opt = {}) {
      if (!san()) return false;
      if (opt.bai) { bai = opt.bai; try { localStorage.setItem('qat.bai', bai); } catch (e) {} }
      ghiCong = !!opt.ghiCong;
      if (!bus) { bus = ctx.createGain(); bus.connect(tong); }
      bus.gain.setValueAtTime(amLuong, ctx.currentTime);
      dung(true);
      ds = dungDs(bai, opt.tuChu || 0); buoc = 0;
      tiep = ctx.currentTime + 0.25;
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
    // bài tiếp theo trong danh sách nhạc thiếu nhi
    function baiTiep() { if (bai !== 'thoikinh') bai = 'thoikinh'; return batDau({ bai: 'thoikinh' }); }

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
