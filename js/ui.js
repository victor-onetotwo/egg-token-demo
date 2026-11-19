/* ===========================================================
   Egg Token Demo — หน้าจอและปุ่ม
   ข้อความ เวลา เงิน และแถบต่าง ๆ อยู่ใน DOM เพื่อให้อ่านออกบนมือถือ
   =========================================================== */

const UI = (function () {
  let el = {};
  let sel = { shop: 'coffee', theme: 'modern', loc: 'office', mode: 'demo' };
  let toastT = 0;
  let lastHint = null;
  let orderDraft = { a: 0, b: 0 };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

  function openSheet(html, cls) {
    el.sheet.className = 'sheet ' + (cls || '');
    el.sheet.innerHTML = html;
    // ทุกอย่างที่ไม่ใช่หัวเรื่องกับแถวปุ่ม ย้ายไปอยู่ในกล่องกลางที่ย่อ-ขยายได้
    const kids = Array.prototype.filter.call(el.sheet.children,
      n => !n.classList.contains('sheet-head') && !n.classList.contains('sheet-foot'));
    if (kids.length) {
      const body = document.createElement('div');
      body.className = 'sheet-body';
      el.sheet.insertBefore(body, kids[0]);
      kids.forEach(k => body.appendChild(k));
    }
    el.overlay.classList.remove('hidden');
    if (G.screen === 'play') G.paused = true;
  }
  function closeSheet() {
    el.overlay.classList.add('hidden');
    el.sheet.innerHTML = '';
    if (G.screen === 'play') G.paused = false;
    fitCanvas();
  }

  /* จอเล่นเป็นสี่เหลี่ยมจัตุรัส ขนาดเท่าที่พื้นที่เหลือให้ ไม่ต้องเลื่อนจอ */
  function fitCanvas() {
    if (!canvas) return;
    const stage = $('stage');
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    const size = Math.max(140, Math.floor(Math.min(r.width, r.height)));
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
  }

  /* ---------- หน้าตั้งร้าน ---------- */
  function showSetup() {
    G.screen = 'setup';
    const money = n => n.toLocaleString() + '฿';
    const shopCards = Object.values(SHOPS).map(s => `
      <button class="card" data-group="shop" data-key="${s.key}" data-cost="${s.setup}">
        <span class="card-icon">${s.icon}</span>
        <span class="card-title">${s.name}</span>
        <span class="card-cost">${money(s.setup)}</span>
        <span class="card-sub">${s.product} ${s.price}฿<br>${s.ing[0].name} + ${s.ing[1].name}</span>
      </button>`).join('');
    const locCards = Object.values(LOCATIONS).map(l => `
      <button class="card" data-group="loc" data-key="${l.key}" data-cost="${l.deposit}">
        <span class="card-title">${l.name}</span>
        <span class="card-cost">${money(l.deposit)}</span>
        <span class="card-sub">ค่าเช่า ${Math.round(l.rent * MODES[sel.mode].scale).toLocaleString()}฿/วัน<br>${l.note}</span>
      </button>`).join('');
    const themeCards = Object.values(THEMES).map(t => `
      <button class="card theme-${t.key}" data-group="theme" data-key="${t.key}" data-cost="${t.setup}">
        <span class="swatch"><i style="background:${t.pal.floor}"></i><i style="background:${t.pal.counter}"></i><i style="background:${t.pal.accent}"></i></span>
        <span class="card-title">${t.name}</span>
        <span class="card-cost">${money(t.setup)}</span>
        <span class="card-sub">${t.short}</span>
      </button>`).join('');

    openSheet(`
      <div class="sheet-head">
        <div class="kicker"><span class="pix">EGG TOKEN · DEMO</span></div>
        <h1>ตั้งร้านก่อนเปิดวันแรก</h1>
        <p class="lead">เงินทุนตั้งต้น ${money(RULES.startCash)} · ทั้งสามอย่างคือเงินลงทุนที่ต้องจ่ายก่อนเปิดร้าน
        เลือกเสร็จจะเหลือเป็นเงินสดไว้หมุนในร้าน เล่น 7 วัน</p>
      </div>
      <div class="group"><h2>โหมดการเล่น</h2>
        <div class="seg" id="mode-seg">${Object.values(MODES).map(m =>
          `<button data-mode="${m.key}"><b>${m.name} · ${m.time}</b><span>${m.desc}</span></button>`).join('')}</div>
      </div>
      <div class="group"><h2>1 · ประเภทร้าน · ค่าอุปกรณ์</h2><div class="cards">${shopCards}</div></div>
      <div class="group"><h2>2 · ทำเล · ค่าเซ้ง และค่าเช่ารายวัน</h2><div class="cards">${locCards}</div></div>
      <div class="group"><h2>3 · ธีม · ค่าตกแต่งร้าน</h2><div class="cards">${themeCards}</div></div>
      <div class="invest-bar">
        <div><span>ทุนตั้งต้น</span><b>${money(RULES.startCash)}</b></div>
        <div><span>ลงทุนที่เลือก</span><b class="neg" id="inv-total">0฿</b></div>
        <div class="hi"><span>เหลือเป็นเงินสด</span><b id="inv-left">0฿</b></div>
        <div><span>ค่าเช่าทุกวัน</span><b id="inv-rent">0฿</b></div>
      </div>
      <div class="sheet-foot"><button class="btn primary" id="btn-start">เปิดร้าน</button></div>
    `, 'setup');

    function syncInvest() {
      const total = SHOPS[sel.shop].setup + LOCATIONS[sel.loc].deposit + THEMES[sel.theme].setup;
      const left = RULES.startCash - total;
      $('inv-total').textContent = '-' + money(total);
      $('inv-left').textContent = money(left);
      $('inv-left').className = left < 0 ? 'neg' : '';
      $('inv-rent').textContent = money(Math.round(LOCATIONS[sel.loc].rent * MODES[sel.mode].scale)) + ' / วัน';
      $('btn-start').disabled = left < 0;
    }

    el.sheet.querySelectorAll('#mode-seg button').forEach(b => {
      b.classList.toggle('on', b.dataset.mode === sel.mode);
      b.addEventListener('click', () => {
        sel.mode = b.dataset.mode;
        SFX.unlock(); SFX.click();
        showSetup();
      });
    });
    el.sheet.querySelectorAll('.card').forEach(b => {
      if (sel[b.dataset.group] === b.dataset.key) b.classList.add('on');
      b.addEventListener('click', () => {
        sel[b.dataset.group] = b.dataset.key;
        el.sheet.querySelectorAll(`.card[data-group="${b.dataset.group}"]`).forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        SFX.unlock(); SFX.click();
        if (b.dataset.group === 'theme') applyTheme(THEMES[b.dataset.key]);
        syncInvest();
      });
    });
    $('btn-start').addEventListener('click', () => {
      SFX.unlock();
      closeSheet();
      newGame(sel.shop, sel.theme, sel.loc, sel.mode);
    });
    applyTheme(THEMES[sel.theme]);
    syncInvest();
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
        <li>เงินสด <b>${Math.round(G.cash).toLocaleString()}฿</b> · สต็อก ${stockLine}</li>
        <li>ค่าเช่า ${dailyRent().toLocaleString()}฿ และค่าแรง หักตอนปิดบัญชีสิ้นวัน</li>
        <li>${staffLine}</li>
        ${deliv}${rider}${chat}
        <li>E.Token วันนี้ ${G.mode.tokens} ครั้ง</li>
      </ul>
      <div class="sheet-foot"><button class="btn primary" id="btn-open">เปิดร้าน · ${G.mode.time}</button></div>
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
    if (G.closing) {
      el.clock.textContent = 'เคลียร์คิว ' + Math.max(0, G.graceLeft).toFixed(1) + 's';
      el.bar.style.width = Math.max(0, (G.graceLeft / G.mode.grace) * 100) + '%';
    } else {
      el.clock.textContent = G.timeLeft.toFixed(1) + 's';
      el.bar.style.width = Math.max(0, (G.timeLeft / G.dayLen) * 100) + '%';
    }
    el.timer.classList.toggle('closing', !!G.closing);
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
  /* ---------- ปิดบัญชีสิ้นวัน 3 หมวด ---------- */
  const baht = n => Math.round(n).toLocaleString() + '฿';

  // หมวดที่ 1 · รายได้ — ยอดขาย เทียบกับ เงินที่เข้ามาจริง
  function showSummary(r) {
    const cashIn = r.cashIn + r.platformIn;
    const gap = cashIn - r.sales;
    openSheet(`
      <div class="sheet-head">
        <div class="kicker"><span class="pix">DAY ${r.day}</span> · ปิดร้านแล้ว</div>
        <h1>1 · รายได้</h1>
        <p class="lead">ยอดขายที่บันทึกหน้าร้าน กับเงินที่เข้ามาจริง ไม่เท่ากันเสมอไป ตรงนี้คือจุดที่ต้องกระทบยอด</p>
      </div>
      <div class="rows">
        <div class="row"><span>ยอดขายที่บันทึก · ${r.orders} ออเดอร์</span><b class="pos">${baht(r.sales)}</b></div>
        <div class="row"><span>คืนเงินลูกค้าที่ไม่ได้รับของ</span><b class="${r.refund ? 'neg' : ''}">${r.refund ? '-' + baht(r.refund) : '0฿'}</b></div>
        ${r.platformToday ? `<div class="row"><span>ยอดเดลิเวอรี ยังไม่เข้าเงินสด</span><b class="neg">-${baht(r.platformToday)}</b></div>` : ''}
        ${r.platformIn ? `<div class="row"><span>เงินเดลิเวอรีเมื่อวาน โอนเข้าวันนี้</span><b class="pos">+${baht(r.platformIn)}</b></div>` : ''}
        <div class="row total"><span>เงินสดเข้าวันนี้</span><b>${baht(cashIn)}</b></div>
      </div>
      <p class="note ${gap < 0 ? 'warn' : ''}">
        ${gap === 0
          ? 'วันนี้ยอดขายกับเงินเข้าตรงกันพอดี'
          : 'ต่างจากยอดขาย ' + (gap > 0 ? '+' : '') + baht(gap) + ' — ' +
            [r.refund ? 'คืนเงินไป ' + baht(r.refund) : '',
             r.platformToday ? 'เดลิเวอรีค้างรับ ' + baht(r.platformToday) : '',
             r.platformIn ? 'ได้เงินเมื่อวานคืนมา ' + baht(r.platformIn) : ''].filter(Boolean).join(' · ')}
      </p>
      <div class="sheet-foot"><button class="btn primary" id="btn-cash">ถัดไป · ยอดเงินสด</button></div>
    `, 'income');
    $('btn-cash').addEventListener('click', () => showCashStep(r));
  }

  // หมวดที่ 2 · ยอดเงินสด — ยกมา + เข้าวันนี้ − ค่าใช้จ่าย โดยต้องกดสรุปจ่ายเอง
  function showCashStep(r) {
    const cashIn = r.cashIn + r.platformIn;
    const after = r.openingCash + cashIn - r.expense;
    const done = !!G.settled;
    openSheet(`
      <div class="sheet-head">
        <div class="kicker"><span class="pix">DAY ${r.day}</span> · ปิดบัญชี</div>
        <h1>2 · ยอดเงินสด</h1>
        <p class="lead">เงินสดยกมาจากเมื่อวาน บวกเงินเข้าวันนี้ แล้วหักค่าใช้จ่ายที่ต้องจ่ายจริงตอนปิดร้าน</p>
      </div>
      <div class="rows">
        <div class="row"><span>เงินสดยกมาเมื่อวาน</span><b>${baht(r.openingCash)}</b></div>
        <div class="row"><span>เงินสดเข้าวันนี้</span><b class="pos">+${baht(cashIn)}</b></div>
        <div class="row"><span>ค่าแรง${G.flags.hired ? ' · ' + (G.flags.hired2 ? 2 : 1) + ' คน' : ''}</span><b class="neg">-${baht(r.wage)}</b></div>
        <div class="row"><span>ค่าเช่า · ${G.loc.name}</span><b class="neg">-${baht(r.rent)}</b></div>
        <div class="row"><span>ค่าของที่รับวันนี้</span><b class="neg">-${baht(r.supply)}</b></div>
        <div class="row total"><span>${done ? 'เงินสดคงเหลือ' : 'เงินสดคงเหลือ (หลังจ่าย)'}</span><b class="${after < 0 ? 'neg' : ''}">${baht(after)}</b></div>
      </div>
      ${r.lateNote ? `<p class="note warn">${r.lateNote}</p>` : ''}
      <p class="note" id="pay-note">${done ? 'จ่ายเรียบร้อยแล้ว' : 'ต้องกดสรุปจ่ายก่อน เงินถึงจะออกจากลิ้นชักจริง'}</p>
      <div class="sheet-foot">
        <button class="btn primary" id="btn-pay" ${done ? 'disabled' : ''}>${done ? 'จ่ายแล้ว' : 'สรุปจ่าย · ' + baht(r.expense)}</button>
        <button class="btn" id="btn-report" ${done ? '' : 'disabled'}>ถัดไป · รายงานปิดบัญชี</button>
      </div>
    `, 'cash');
    $('btn-pay').addEventListener('click', () => {
      settlePayments();
      $('btn-pay').disabled = true;
      $('btn-pay').textContent = 'จ่ายแล้ว';
      $('btn-report').disabled = false;
      $('pay-note').textContent = 'จ่ายค่าแรง ค่าเช่า และค่าของเรียบร้อยแล้ว';
      toast('ตัดเงินสด ' + baht(r.expense) + ' เรียบร้อย');
    });
    $('btn-report').addEventListener('click', () => showClosingReport(r));
  }

  // หมวดที่ 3 · รายงานการปิดบัญชีประจำวัน
  function showClosingReport(r) {
    const s = G.shop;
    const cashIn = r.cashIn + r.platformIn;
    const profit = cashIn - r.expense;
    const gap = cashIn - r.sales;
    const last = r.day >= DAYS.length;
    openSheet(`
      <div class="sheet-head">
        <div class="kicker"><span class="pix">DAY ${r.day}</span> · ปิดบัญชีประจำวัน</div>
        <h1>3 · รายงานปิดบัญชี</h1>
      </div>
      <div class="rows">
        <div class="row"><span>ยอดขาย</span><b>${baht(r.sales)}</b></div>
        <div class="row"><span>เงินสดเข้าจริง</span><b>${baht(cashIn)}</b></div>
        <div class="row"><span>ส่วนต่าง</span><b class="${gap < 0 ? 'neg' : ''}">${gap > 0 ? '+' : ''}${baht(gap)}</b></div>
        <div class="row"><span>ค่าใช้จ่ายรวม</span><b class="neg">-${baht(r.expense)}</b></div>
        <div class="row total"><span>กำไร-ขาดทุนของวัน</span><b class="${profit >= 0 ? 'pos' : 'neg'}">${profit >= 0 ? '+' : ''}${baht(profit)}</b></div>
        <div class="row"><span>เงินสดคงเหลือ</span><b class="${r.cash < 0 ? 'neg' : ''}">${baht(r.cash)}</b></div>
        ${r.platformDue ? `<div class="row"><span>ค้างรับจากแพลตฟอร์ม · เข้าพรุ่งนี้</span><b>${baht(r.platformDue)}</b></div>` : ''}
      </div>
      <div class="rows">
        <div class="row"><span>เสิร์ฟได้ / เดินออก</span><b>${r.served} / <span class="${r.left ? 'neg' : ''}">${r.left}</span></b></div>
        ${DAYS[r.day - 1].rating ? `<div class="row"><span>เรตติ้ง</span><b>${ratingLabel()}</b></div>` : ''}
        <div class="row"><span>สต็อกคงเหลือ</span><b>${s.ing[0].name} ${r.stock.a} · ${s.ing[1].name} ${r.stock.b}</b></div>
      </div>
      <p class="note">${r.left
        ? 'ลูกค้าที่จ่ายแล้วแต่ไม่ได้ของ ต้องคืนเงิน ยอดขายไม่ถูกหักก็จริง แต่เงินสดหายไปแล้ว และเรตติ้งก็เสียด้วย'
        : 'วันนี้ไม่มีใครเดินออก เงินสดกับยอดขายเลยห่างกันน้อย'}</p>
      <div class="sheet-foot"><button class="btn primary" id="btn-order">${last ? 'ดูผลรวม 7 วัน' : 'สั่งของสำหรับพรุ่งนี้'}</button></div>
    `, 'report');
    $('btn-order').addEventListener('click', () => {
      if (last) { closeSheet(); showDecision('final'); }
      else showOrderPanel();
    });
  }

  /* ---------- สั่งวัตถุดิบ ---------- */
  function showOrderPanel() {
    const s = G.shop;
    const sug = G.tokenHint;
    orderDraft = sug ? { a: sug.a, b: sug.b } : { a: Math.max(0, 22 - G.stock.a), b: Math.max(0, 22 - G.stock.b) };
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
        const step = (window.event && window.event.shiftKey) ? 5 : 1;
        orderDraft[k] = Math.max(0, Math.min(60, orderDraft[k] + Number(b.dataset.d) * step));
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
    const profitAll = h.reduce((n, r) => n + (r.cashIn + r.platformIn - r.expense), 0);
    const rows = h.map(r => {
      const pf = r.cashIn + r.platformIn - r.expense;
      return `<div class="row"><span>วัน ${r.day} · เสิร์ฟ ${r.served} ออก ${r.left}</span><b>${r.sales.toLocaleString()}฿ · <span class="${pf >= 0 ? 'pos' : 'neg'}">${pf >= 0 ? '+' : ''}${Math.round(pf).toLocaleString()}฿</span></b></div>`;
    }).join('');
    openSheet(`
      <div class="sheet-head">
        <div class="kicker"><span class="pix">7 DAYS DONE</span></div>
        <h1>${G.shop.name}ของคุณ</h1>
        <p class="lead">${invested ? 'คุณเลือกลงทุนเพิ่มกำลัง เงินสดลดลงแต่รับคิวได้มากขึ้นในวันถัดไป' : 'คุณเลือกเก็บเงินสดไว้ ปลอดภัยกว่า แต่คิวล้นยังเป็นปัญหาเดิม'}</p>
      </div>
      <div class="rows">
        <div class="row"><span>เงินลงทุนตอนตั้งร้าน</span><b class="neg">-${G.invest.total.toLocaleString()}฿</b></div>
        <div class="row total"><span>ยอดขายรวม 7 วัน</span><b class="pos">${sales.toLocaleString()}฿</b></div>
        <div class="row"><span>กำไร-ขาดทุนรวม 7 วัน</span><b class="${profitAll >= 0 ? 'pos' : 'neg'}">${profitAll >= 0 ? '+' : ''}${Math.round(profitAll).toLocaleString()}฿</b></div>
        <div class="row"><span>เงินสดคงเหลือ</span><b>${Math.round(G.cash).toLocaleString()}฿</b></div>
        <div class="row"><span>เสิร์ฟได้ / เดินออก</span><b>${served} / <span class="${left ? 'neg' : ''}">${left}</span></b></div>
        <div class="row"><span>เรตติ้ง</span><b>${ratingLabel()}</b></div>
      </div>
      <div class="rows small">${rows}</div>
      <p class="note">เงินสดบอกว่าร้านอยู่ได้ไหม เรตติ้งบอกว่าคนอยากกลับมาไหม · ตรงไหนที่อยากให้มีคน เครื่อง
      หรือ E.Token ช่วย คือจุดที่ Egg Token เข้าไปทำงานได้จริง</p>
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
      timer: document.querySelector('.timer'),
      stock: $('hud-stock'), clock: $('hud-clock'), bar: $('hud-bar'),
      token: $('hud-token'), rating: $('hud-rating'),
      served: $('hud-served'), left: $('hud-left'),
      hint: $('hint'), toast: $('toast'), bar2: $('stations')
    };
    canvas = $('game');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    buildStationBar();
    fitCanvas();
    window.addEventListener('resize', fitCanvas);
    window.addEventListener('orientationchange', () => setTimeout(fitCanvas, 120));

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
    init, showSetup, showDayIntro, syncHud, hint, toast, fitCanvas,
    showSummary, showEnding: renderEnding, openTokens, rebuildStations: buildStationBar
  };
})();

window.addEventListener('DOMContentLoaded', UI.init);
