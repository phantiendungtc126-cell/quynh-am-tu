// Âm thanh tổng hợp bằng Web Audio: mõ gỗ, đại hồng chung, ống xăm, hạt chuỗi.
window.Am = (() => {
  let ctx = null, tong = null, bat = true;
  try { bat = localStorage.getItem('qat.am') !== 'tat'; } catch (e) {}

  function san() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const nen = ctx.createDynamicsCompressor();
      nen.threshold.value = -12; nen.ratio.value = 4;
      tong = ctx.createGain(); tong.gain.value = 0.9;
      tong.connect(nen); nen.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function sin(f, t0, dai, to, dich) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f, t0);
    if (dich) o.frequency.exponentialRampToValueAtTime(f * dich, t0 + dai);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(to, t0 + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dai);
    o.connect(g); g.connect(tong);
    o.start(t0); o.stop(t0 + dai + 0.05);
  }

  function on(t0, dai, tanSo, q, to) {
    const n = Math.max(1, Math.floor(ctx.sampleRate * dai));
    const b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource(); s.buffer = b;
    const loc = ctx.createBiquadFilter(); loc.type = 'bandpass'; loc.frequency.value = tanSo; loc.Q.value = q;
    const g = ctx.createGain(); g.gain.value = to;
    s.connect(loc); loc.connect(g); g.connect(tong);
    s.start(t0);
  }

  return {
    get bat() { return bat; },
    doi() {
      bat = !bat;
      try { localStorage.setItem('qat.am', bat ? 'bat' : 'tat'); } catch (e) {}
      return bat;
    },
    mo() {
      if (!bat || !san()) return;
      const t = ctx.currentTime;
      sin(560, t, 0.16, 0.7, 0.92);
      sin(1180, t, 0.07, 0.25, 0.95);
      on(t, 0.012, 2600, 1.2, 0.5);
    },
    chuong() {
      if (!bat || !san()) return;
      const t = ctx.currentTime, f = 128;
      const tang = [[1, 0.5, 9], [2.0, 0.22, 6], [2.76, 0.28, 5], [4.07, 0.12, 3.5], [5.4, 0.08, 2.4], [6.8, 0.05, 1.8]];
      tang.forEach(([r, to, dai]) => {
        sin(f * r, t, dai, to);
        sin(f * r * 1.003, t, dai * 0.9, to * 0.5); // nhịp đập nhẹ của chuông đồng
      });
      on(t, 0.05, 900, 0.8, 0.35);
    },
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
