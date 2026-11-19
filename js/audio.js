/* ===========================================================
   Egg Token Demo — เสียง
   สร้างจาก WebAudio ล้วน ไม่มีไฟล์เสียงภายนอก
   =========================================================== */

const SFX = (function () {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, delay, slideTo) {
    const c = ensure();
    if (!c || muted) return;
    const t0 = c.currentTime + (delay || 0);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noise(dur, vol) {
    const c = ensure();
    if (!c || muted) return;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    const gain = c.createGain();
    gain.gain.value = vol || 0.08;
    src.buffer = buf;
    src.connect(gain).connect(c.destination);
    src.start();
  }

  return {
    unlock() { ensure(); },
    setMuted(v) { muted = v; },
    isMuted() { return muted; },
    click() { tone(520, 0.05, 'square', 0.07); },
    coin() { tone(880, 0.07, 'square', 0.11); tone(1320, 0.12, 'square', 0.1, 0.07); },
    start() { tone(330, 0.09, 'triangle', 0.1); tone(440, 0.1, 'triangle', 0.09, 0.08); },
    ready() { tone(740, 0.08, 'sine', 0.12); tone(988, 0.16, 'sine', 0.11, 0.08); },
    pick() { tone(600, 0.05, 'triangle', 0.09); },
    place() { tone(300, 0.07, 'triangle', 0.1); noise(0.05, 0.04); },
    serve() { tone(660, 0.06, 'square', 0.09); tone(880, 0.1, 'square', 0.09, 0.06); },
    angry() { tone(200, 0.22, 'sawtooth', 0.09, 0, 90); },
    chat() { tone(520, 0.06, 'sine', 0.08); tone(640, 0.08, 'sine', 0.08, 0.06); },
    bike() { tone(150, 0.5, 'sawtooth', 0.07, 0, 110); tone(900, 0.1, 'square', 0.08, 0.1); tone(1100, 0.14, 'square', 0.08, 0.22); },
    token() { tone(760, 0.06, 'square', 0.09); tone(1010, 0.07, 'square', 0.09, 0.06); tone(1340, 0.14, 'square', 0.09, 0.13); },
    close() { tone(420, 0.12, 'square', 0.1); tone(300, 0.2, 'square', 0.1, 0.12); },
    deny() { tone(180, 0.14, 'square', 0.08); }
  };
})();
