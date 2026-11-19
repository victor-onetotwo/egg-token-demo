/* ===========================================================
   Egg Token Demo — หน้าจอและปุ่ม
   ข้อความ เวลา เงิน และแถบต่าง ๆ อยู่ใน DOM เพื่อให้อ่านออกบนมือถือ
   =========================================================== */

const UI = (function () {
  let el = {};
  let sel = { shop: 'coffee', theme: 'modern', loc: 'office' };
  let toastT = 0;
  let lastHint = null;
  let orderDraft = { a: 0, b: 0 };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

  function openSheet(html, cls) {
    el.sheet.className = 'sheet ' + (cls || '');
    el.sheet.innerHTML = html;
    el.overlay.classList.remove('hidden');
    if (G.screen === 'play') G.paused = true;
  }
  function closeSheet() {
    el.overlay.classList.add('hidden');
    el.sheet.innerHTML = '';
    if (G.screen === 'play') G.paused = false;
  }

  /* ---------- หน้าตั้งร้าน ---------- */
  function showSetup() {
    G.screen = 'setup';
    const shopCards = Object.values(SHOPS).map(s => `
      <button class="card" data-group="shop" data-key="${s.key}">
        <span class="card-icon">${s.icon}</span>
        <span class="card-title">${s.name}</span>
        <span class="card-sub">${s.product} ${s.price}฿ · ${s.ing[0].name} + ${s.ing[1].name}</span>
      </button>`).join('');
    const locCards = Object.values(LOCATIONS).map(l => `
      <button class="card" data-group="loc" data-key="${l.key}">
        <span class="card-title">${l.name}</span>
        <span class="card-sub">${l.note}</span>
      </button>`).join('');
    const themeCards = Object.values(THEMES).map(t => `
      <button class="card theme-${t.key}" data-group="theme" data-key="${t.key}">
        <span class="swatch"><i style="background:${t.pal.floor}"></i><i style="background:${t.pal.counter}"></i><i style="background:${t.pal.accent}"></i></span>
        <span class="card-title">${t.name}</span>
        <span class="card-sub">${t.desc}</span>
      </button>`).join('');

    openSheet(`
      <div class="sheet-head">
        <div class="kicker"><span class="pix">EGG TOKEN · DEMO</span></div>
        <h1>ตั้งร้านก่อนเปิดวันแรก</h1>
        <p class="lead">เลือก 3 อย่าง แล้วเริ่มด้วยเงิน ${RULES.startCash.toLocaleString()}฿ กับวัตถุดิบที่มีจำกัด เดโมนี้ยาว 7 วัน วันละ ${RULES.dayLength} วินาที</p>
      </div>
      <div class="group"><h2>1 · ประเภทร้าน</h2><div class="cards">${shopCards}</div></div>
      <div class="group"><h2>2 · ทำเล</h2><div class="cards">${locCards}</div></div>
      <div class="group"><h2>3 · ธีม</h2><div class="cards">${themeCards}</div></div>
      <div class="sheet-foot"><button class="btn primary" id="btn-start">เปิดร้าน</button></div>
    `, 'setup');

    el.sheet.querySelectorAll('.card').forEach(b => {
      if (sel[b.dataset.group] === b.dataset.key) b.classList.add('on');
      b.addEventListener('click', () => {
        sel[b.dataset.group] = b.dataset.key;
        el.sheet.querySelectorAll(`.card[data-group="${b.dataset.group}"]`).forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        SFX.unlock(); SFX.click();
        if (b.dataset.group === 'theme') applyTheme(THEMES[b.dataset.key]);
      });
    });
    $('btn-start').addEventListener('click', () => {
      SFX.unlock();
      closeSheet();
      newGame(sel.shop, sel.theme, sel.loc);
    });
    applyTheme(THEMES[sel.theme]);
  }

  /* ---------- ก่อนเปิดร้านแต่ละวัน ---------- */
  function showDayIntro(d) {
    const s = G.shop;
    const staffLine = G.flags.hired
      ? `พนักงาน ${G.flags.hired2 ? 2 : 1} คน${G.flags.trained ? ' (เทรนแล้ว ทำได้ทุกสถานี)' : ' (รับออเดอร์ที่แคชเชียร์)'} · ค่าแรงวันนี้ ${dailyWage()}฿`
      : 'ยังไม่มีพนักงาน ทำเองทุกจุด';
    const stockLine = `${s.ing[0].name} ${G.stock.a} · ${s.ing[1].name} ${G.stock.b}`;
    const deliv = G.delivery.due ? '<li>วันนี้มีของมาส่งระหว่างวัน ต้องเดินไปรับที่ประตูหลังและจ่ายเงิน</li>' : '';
    const rider = d.riders && G.flags.delivery ? '<li>เปิดรับเดลิเวอรีแล้ว ไรเดอร์จะเข้าคิวเหมือนลูกค้าปกติ</li>' : '';
    const chat = d.chat && chatUnlocked() ? '<li>แตะลูกค้าที่กำลังรอ เพื่อเข้าไปคุยและเติมความอดทน</li>' : '';
    openSheet(`
      <div class="sheet-head">
        <div class="kicker"><span class="pix">DAY ${d.n} / 7</span> · ${G.loc.name}</div>
        <h1>${d.title}</h1>
        <p class="lead">${d.intro}</p>
      </div>
      <ul class="facts">
        <li>เงินสด <b>${G.cash.toLocaleString()}฿</b> · สต็อก ${stockLine}</li>
        <li>${staffLine}</li>
        ${deliv}${rider}${chat}
        <li>E.Token วันนี้ ${RULES.tokensPerDay} ครั้ง</li>
      </ul>
      <div class="sheet-foot"><button class="btn primary" id="btn-open">เปิดร้าน · ${RULES.dayLength} วินาที</button></div>
    `, 'intro');
    $('btn-open').addEventListener('click', () => { closeSheet(); openStore(); });
  }

  /* ---------- HUD ---------- */
  function syncHud() {
    if (!G.shop) return;
    const d = DAYS[G.day - 1];
    el.day.textContent = 'วัน ' + G.day + '/7';
    el.cash.textContent = Math.round(G.cash).toLocaleString() + '฿';
    el.sales.textContent = G.todaySales.toLocaleString() + '฿';
    el.stock.textContent = G.stock.a + ' / ' + G.stock.b;
    el.stock.classList.toggle('low', G.stock.a <= 2 || G.stock.b <= 2);
    el.clock.textContent = G.timeLeft.toFixed(1) + 's';
    el.bar.style.width = Math.max(0, (G.timeLeft / G.dayLen) * 100) + '%';
    el.token.textContent = 'E.Token ×' + G.tokens;
    el.token.disabled = G.tokens <= 0 || !G.running;
    el.rating.parentElement.classList.toggle('hidden', !(d && d.rating));
    el.rating.textContent = ratingLabel();
    el.left.textContent = G.leftToday + '';
    el.served.textContent = G.servedToday + '';
    el.doorBtn.classList.toggle('alert', G.delivery.arrived && !G.delivery.taken);
    el.doorBtn.classList.toggle('hidden', !G.delivery.due);
  }

  const HINT_DEFAULT = 'แตะสถานีหรือตัวลูกค้าเพื่อสั่งงาน · ตัวละครต้องเดินไปถึงก่อน งานจึงเริ่ม';
  function hint(text) {
    if (text === lastHint) return;
    lastHint = text;
    el.hint.textContent = text || HINT_DEFAULT;
    el.hint.classList.toggle('on', !!text);
  }

  function toast(text) {
    el.toast.textContent = text;
    el.toast.classList.remove('hidden');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.toast.classList.add('hidden'), 2600);
  }

  /* ---------- สรุปตอนปิดร้าน ---------- */
  function showSummary(r) {
    const s = G.shop;
    const profit = r.sales - r.wage - r.supply;
    openSheet(`
      <div class="sheet-head">
        <div class="kicker"><span class="pix">DAY ${r.day}</span> · ปิดร้านแล้ว</div>
        <h1>สรุปวันนี้</h1>
      </div>
      <div class="rows">
        <div class="row"><span>ยอดขาย</span><b class="pos">+${r.sales.toLocaleString()}฿</b></div>
        <div class="row"><span>ค่าวัตถุดิบที่รับวันนี้</span><b class="neg">-${r.supply.toLocaleString()}฿</b></div>
        <div class="row"><span>ค่าแรง</span><b class="neg">-${r.wage.toLocaleString()}฿</b></div>
        <div class="row total"><span>เหลือจากวันนี้</span><b class="${profit >= 0 ? 'pos' : 'neg'}">${profit >= 0 ? '+' : ''}${profit.toLocaleString()}฿</b></div>
        <div class="row"><span>เงินสดคงเหลือ</span><b>${Math.round(r.cash).toLocaleString()}฿</b></div>
      </div>
      <div class="rows">
        <div class="row"><span>เสิร์ฟได้</span><b>${r.served} คน</b></div>
        <div class="row"><span>ลูกค้าเดินออก</span><b class="${r.left ? 'neg' : ''}">${r.left} คน</b></div>
        ${DAYS[r.day - 1].rating ? `<div class="row"><span>เรตติ้ง</span><b>${ratingLabel()}</b></div>` : ''}
        <div class="row"><span>สต็อกคงเหลือ</span><b>${s.ing[0].name} ${r.stock.a} · ${s.ing[1].name} ${r.stock.b}</b></div>
      </div>
      <p class="note">${r.left ? 'ยอดขายที่บันทึกไปแล้วไม่ถูกหัก แต่คนที่เดินออกไปกระทบเรตติ้ง' : 'วันนี้ไม่มีใครเดินออก'}</p>
      ${r.lateNote ? `<p class="note warn">${r.lateNote}</p>` : ''}
      <div class="sheet-foot"><button class="btn primary" id="btn-order">${r.day >= DAYS.length ? 'ดูผลรวม 7 วัน' : 'สั่งของสำหรับพรุ่งนี้'}</button></div>
    `, 'summary');
    $('btn-order').addEventListener('click', () => {
      if (r.day >= DAYS.length) { closeSheet(); showDecision('final'); }
      else showOrderPanel();
    });
  }

  /* ---------- สั่งวัตถุดิบ ---------- */
  function showOrderPanel() {
    const s = G.shop;
    const sug = G.tokenHint;
    orderDraft = sug ? { a: sug.a, b: sug.b } : { a: Math.max(0, 8 - G.stock.a), b: Math.max(0, 8 - G.stock.b) };
    openSheet(`
      <div class="sheet-head">
        <div class="kicker"><span class="pix">NIGHT ${G.day}</span> · ก่อนเปิดวันที่ ${G.day + 1}</div>
        <h1>สั่งวัตถุดิบ</h1>
        <p class="lead">ของจะมาส่งระหว่างวันพรุ่งนี้ ต้องเดินไปรับที่ประตูหลังและจ่ายเงินตอนนั้น</p>
      </div>
      <div class="stepper" data-k="a">
        <div class="stepper-info"><b>${s.ing[0].name}</b><span>เหลือ ${G.stock.a} · ชุดละ ${s.ing[0].cost}฿</span></div>
        <div class="stepper-ctl"><button class="btn sm" data-d="-1">−</button><span id="qa">0</span><button class="btn sm" data-d="1">+</button></div>
      </div>
      <div class="stepper" data-k="b">
        <div class="stepper-info"><b>${s.ing[1].name}</b><span>เหลือ ${G.stock.b} · ชุดละ ${s.ing[1].cost}฿</span></div>
        <div class="stepper-ctl"><button class="btn sm" data-d="-1">−</button><span id="qb">0</span><button class="btn sm" data-d="1">+</button></div>
      </div>
      ${sug ? '<p class="note">E.Token จดจำนวนที่ควรสั่งไว้ให้แล้ว</p>' : ''}
      <div class="rows">
        <div class="row total"><span>ค่าของทั้งหมด</span><b id="ocost">0฿</b></div>
        <div class="row"><span>เงินสดหลังจ่าย</span><b id="oafter">0฿</b></div>
      </div>
      <div class="sheet-foot"><button class="btn primary" id="btn-next">ยืนยัน</button></div>
    `, 'order');

    function sync() {
      $('qa').textContent = orderDraft.a;
      $('qb').textContent = orderDraft.b;
      const c = nightOrderCost(orderDraft.a, orderDraft.b);
      $('ocost').textContent = c.toLocaleString() + '฿';
      const after = Math.round(G.cash - c);
      const a = $('oafter');
      a.textContent = after.toLocaleString() + '฿';
      a.className = after < 0 ? 'neg' : '';
    }
    el.sheet.querySelectorAll('.stepper').forEach(st => {
      st.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
        const k = st.dataset.k;
        orderDraft[k] = Math.max(0, Math.min(30, orderDraft[k] + Number(b.dataset.d)));
        SFX.click(); sync();
      }));
    });
    sync();
    $('btn-next').addEventListener('click', () => {
      placeNightOrder(orderDraft.a, orderDraft.b);
      G.tokenHint = null;
      const d = DAYS[G.day - 1];
      const key = resolveDecision(d.decision);
      if (key) showDecision(key); else nextDay();
    });
  }

  /* ---------- การตัดสินใจ ---------- */
  function resolveDecision(key) {
    if (!key) return null;
    if ((key === 'train' || key === 'hire2') && !G.flags.hired) return 'hire';
    if (key === 'hire2' && !G.flags.trained) return 'train';
    if (key === 'invest' && (G.flags.machine2 || G.flags.cook2)) return null;
    if (key === 'train' && G.flags.trained) return 'hire2';
    if (key === 'hire' && G.flags.hired) return 'train';
    if (key === 'hire2' && G.flags.hired2) return 'delivery';
    if (key === 'delivery' && G.flags.delivery) return 'invest';
    return key;
  }

  function decisionCopy(key) {
    const up = G.shop.upgrade;
    const map = {
      hire: {
        title: 'ประกาศรับพนักงานคนแรก?',
        body: `ค่าแรง ${RULES.wageBase}฿ ต่อวัน เริ่มพรุ่งนี้ จะประจำแคชเชียร์ให้ ผู้เล่นจะได้ไปทำของและส่งมอบเต็มที่`,
        yes: `รับ · ${RULES.wageBase}฿/วัน`, no: 'ยังไม่รับ', cost: 0
      },
      train: {
        title: 'เทรนพนักงานเพิ่มไหม?',
        body: `จ่ายค่าเทรน ${RULES.trainCost}฿ ครั้งเดียว ค่าแรงขึ้นเป็น ${RULES.wageTrained}฿ ต่อวัน แลกกับการทำสถานี 2–4 ได้ทั้งหมด`,
        yes: `เทรน · ${RULES.trainCost}฿`, no: 'ยังไม่เทรน', cost: RULES.trainCost
      },
      hire2: {
        title: 'รับพนักงานคนที่สองไหม?',
        body: `ค่าแรงอีก ${G.flags.trained ? RULES.wageTrained : RULES.wageBase}฿ ต่อวัน ทีมจะเดินร้านได้เอง เจ้าของจะมีเวลาไปคุยกับลูกค้า`,
        yes: 'รับเพิ่ม', no: 'ยังไม่รับ', cost: 0
      },
      delivery: {
        title: 'เปิดรับออเดอร์จากไรเดอร์ไหม?',
        body: `ค่าสมัคร ${RULES.deliveryFee}฿ ออเดอร์เพิ่มขึ้นแน่ ๆ แต่คิวหน้าร้านจะแน่นขึ้นด้วย`,
        yes: `เปิดรับ · ${RULES.deliveryFee}฿`, no: 'ยังไม่เปิด', cost: RULES.deliveryFee
      },
      invest: {
        title: 'ลงทุนเพิ่มกำลังผลิตไหม?',
        body: `${up.label} ราคา ${up.cost.toLocaleString()}฿${up.wage ? ` และค่าแรงอีก ${up.wage}฿ ต่อวัน` : ''} · ทำของได้เร็วขึ้นตั้งแต่พรุ่งนี้`,
        yes: `ลงทุน · ${up.cost.toLocaleString()}฿`, no: 'เก็บเงินสดไว้ก่อน', cost: up.cost
      },
      final: {
        title: 'จบ 7 วันแล้ว จะเดินต่อทางไหน?',
        body: 'เลือกแล้วดูสรุปว่าเงินสดกับเรตติ้งบอกคนละเรื่องยังไง',
        yes: 'ลงทุนขยายต่อ', no: 'เก็บเงินสดไว้', cost: 0
      }
    };
    return map[key];
  }

  function showDecision(key) {
    const c = decisionCopy(key);
    const afford = G.cash >= (c.cost || 0);
    openSheet(`
      <div class="sheet-head">
        <div class="kicker">การตัดสินใจตอนปิดร้าน</div>
        <h1>${c.title}</h1>
        <p class="lead">${c.body}</p>
      </div>
      <div class="rows"><div class="row"><span>เงินสดตอนนี้</span><b>${Math.round(G.cash).toLocaleString()}฿</b></div></div>
      ${!afford ? '<p class="note warn">เงินสดไม่พอสำหรับตัวเลือกนี้</p>' : ''}
      <div class="sheet-foot two">
        <button class="btn" id="btn-no">${c.no}</button>
        <button class="btn primary" id="btn-yes" ${afford ? '' : 'disabled'}>${c.yes}</button>
      </div>
    `, 'decision');
    $('btn-yes').addEventListener('click', () => { applyDecision(key, 'yes'); SFX.coin(); after(key); });
    $('btn-no').addEventListener('click', () => { applyDecision(key, 'no'); SFX.click(); after(key); });
    function after(k) {
      closeSheet();
      if (k === 'final') window.showEnding(); else nextDay();
    }
  }

  /* ---------- จบเดโม ---------- */
  function renderEnding() {
    const h = G.history || [];
    const sales = h.reduce((n, r) => n + r.sales, 0);
    const served = h.reduce((n, r) => n + r.served, 0);
    const left = h.reduce((n, r) => n + r.left, 0);
    const invested = G.finalChoice === 'yes';
    const rows = h.map(r => `<div class="row"><span>วัน ${r.day}</span><b>${r.sales.toLocaleString()}฿ · เสิร์ฟ ${r.served} · ออก ${r.left}</b></div>`).join('');
    openSheet(`
      <div class="sheet-head">
        <div class="kicker"><span class="pix">7 DAYS DONE</span></div>
        <h1>${G.shop.name}ของคุณ</h1>
        <p class="lead">${invested ? 'คุณเลือกลงทุนเพิ่มกำลัง เงินสดลดลงแต่รับคิวได้มากขึ้นในวันถัดไป' : 'คุณเลือกเก็บเงินสดไว้ ปลอดภัยกว่า แต่คิวล้นยังเป็นปัญหาเดิม'}</p>
      </div>
      <div class="rows">
        <div class="row total"><span>ยอดขายรวม</span><b class="pos">${sales.toLocaleString()}฿</b></div>
        <div class="row"><span>เงินสดคงเหลือ</span><b>${Math.round(G.cash).toLocaleString()}฿</b></div>
        <div class="row"><span>เสิร์ฟได้ / เดินออก</span><b>${served} / <span class="${left ? 'neg' : ''}">${left}</span></b></div>
        <div class="row"><span>เรตติ้ง</span><b>${ratingLabel()}</b></div>
      </div>
      <div class="rows small">${rows}</div>
      <p class="note">เงินสดบอกว่าร้านอยู่ได้ไหม เรตติ้งบอกว่าคนอยากกลับมาไหม สองอันนี้ไม่ใช่เรื่องเดียวกัน</p>
      <p class="note">ตรงไหนที่คุณอยากให้มีคนช่วย เครื่องช่วย หรือ E.Token ช่วย คือจุดที่ Egg Token เข้าไปทำงานได้จริง</p>
      <div class="sheet-foot two">
        <button class="btn" id="btn-ci">ดูหน้า CI</button>
        <button class="btn primary" id="btn-again">เล่นอีกครั้ง</button>
      </div>
    `, 'ending');
    $('btn-again').addEventListener('click', () => { closeSheet(); showSetup(); });
    $('btn-ci').addEventListener('click', () => { window.location.href = 'ci.html'; });
  }

  /* ---------- E.Token ---------- */
  function openTokens() {
    if (!G.running || G.tokens <= 0) return;
    const cards = TOKEN_ACTIONS.map(a => `
      <button class="card wide" data-token="${a.key}">
        <span class="card-title">${a.name}</span>
        <span class="card-sub">${a.desc}</span>
      </button>`).join('');
    openSheet(`
      <div class="sheet-head">
        <div class="kicker"><span class="pix">E.TOKEN</span> · เหลือ ${G.tokens} ครั้งวันนี้</div>
        <h1>ให้ช่วยตรงไหน</h1>
        <p class="lead">เวลาในเกมหยุดไว้ระหว่างเลือก</p>
      </div>
      <div class="cards col">${cards}</div>
      <div class="sheet-foot"><button class="btn" id="btn-cancel">ปิด</button></div>
    `, 'tokens');
    el.sheet.querySelectorAll('[data-token]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.token;
      closeSheet();
      useToken(k);
    }));
    $('btn-cancel').addEventListener('click', closeSheet);
  }

  /* ---------- ปุ่มสถานี ---------- */
  function buildStationBar() {
    const s = G.shop || SHOPS.coffee;
    el.bar2.innerHTML = `
      <button class="sbtn" data-st="cashier"><i>1</i>แคชเชียร์</button>
      <button class="sbtn" data-st="machine"><i>2</i>${s.s2}</button>
      <button class="sbtn" data-st="tray"><i>3</i>${s.s3}</button>
      <button class="sbtn" data-st="handoff"><i>4</i>จุดส่งมอบ</button>
      <button class="sbtn hidden" id="door-btn" data-st="door"><i>▣</i>รับของ</button>`;
    el.bar2.querySelectorAll('.sbtn').forEach(b => b.addEventListener('click', () => commandStation(b.dataset.st)));
    el.doorBtn = $('door-btn');
  }

  /* ---------- เริ่มต้น ---------- */
  function init() {
    el = {
      overlay: $('overlay'), sheet: $('sheet'),
      day: $('hud-day'), cash: $('hud-cash'), sales: $('hud-sales'),
      stock: $('hud-stock'), clock: $('hud-clock'), bar: $('hud-bar'),
      token: $('hud-token'), rating: $('hud-rating'),
      served: $('hud-served'), left: $('hud-left'),
      hint: $('hint'), toast: $('toast'), bar2: $('stations')
    };
    canvas = $('game');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    buildStationBar();

    canvas.addEventListener('pointerdown', e => {
      const r = canvas.getBoundingClientRect();
      const lx = (e.clientX - r.left) * (VIEW / r.width);
      const ly = (e.clientY - r.top) * (VIEW / r.height);
      SFX.unlock();
      handleTap(lx, ly);
    });
    el.token.addEventListener('click', openTokens);
    $('hud-mute').addEventListener('click', e => {
      SFX.setMuted(!SFX.isMuted());
      e.currentTarget.textContent = SFX.isMuted() ? '🔇' : '🔊';
    });
    window.addEventListener('keydown', e => {
      const map = { '1': 'cashier', '2': 'machine', '3': 'tray', '4': 'handoff', '5': 'door' };
      if (map[e.key]) commandStation(map[e.key]);
      if (e.key === 'e' || e.key === 'E') openTokens();
    });
    showSetup();
  }

  return {
    init, showSetup, showDayIntro, syncHud, hint, toast,
    showSummary, showEnding: renderEnding, openTokens, rebuildStations: buildStationBar
  };
})();

window.addEventListener('DOMContentLoaded', UI.init);
