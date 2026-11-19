/* ===========================================================
   Egg Token Demo — ตัวเกม
   ลูป: เปิดร้าน (15 วินาที) → ปิดร้าน → สรุปยอด → สั่งของ → ตัดสินใจ
   =========================================================== */

const G = {
  screen: 'setup',
  shop: null, theme: null, loc: null, pal: null,
  day: 1,
  cash: 0,
  stock: { a: 0, b: 0 },
  flags: { hired: false, trained: false, hired2: false, delivery: false, machine2: false, cook2: false },
  nightOrder: { a: 0, b: 0 },
  delivery: { due: false, at: 0, arrived: false, taken: false, cost: 0, qty: { a: 0, b: 0 } },
  player: null, staff: [],
  customers: [], queue: [], waiting: [], collectors: [],
  orderSpotCust: null,
  spawns: [], spawnI: 0,
  machine: [], tray: [], counterItems: [],
  ordersTaken: 0, itemsStarted: 0,
  todaySales: 0, servedToday: 0, leftToday: 0, wageToday: 0, supplyToday: 0,
  totalServed: 0, totalLeft: 0,
  reviews: { good: 0, bad: 0 },
  timeLeft: 0, dayLen: 0, elapsed: 0,
  running: false, paused: false, hold: false,
  tokens: 0, tokenHint: null,
  tutorial: { on: false, step: 0 },
  pops: [],
  t: 0,
  lastResult: null
};

let ctx = null, canvas = null, rafId = 0, lastTs = 0;

/* ---------- เริ่มเกม ---------- */
function newGame(shopKey, themeKey, locKey) {
  G.shop = SHOPS[shopKey];
  G.theme = THEMES[themeKey];
  G.loc = LOCATIONS[locKey];
  G.pal = G.theme.pal;
  G.cash = RULES.startCash;
  G.stock = { a: G.shop.ing[0].start, b: G.shop.ing[1].start };
  G.flags = { hired: false, trained: false, hired2: false, delivery: false, machine2: false, cook2: false };
  G.nightOrder = { a: 0, b: 0 };
  G.totalServed = 0; G.totalLeft = 0;
  G.reviews = { good: 0, bad: 0 };
  G.history = [];
  G.finalChoice = null;
  G.day = 0;
  applyTheme(G.theme);
  nextDay();
}

function nextDay() {
  G.day++;
  if (G.day > DAYS.length) { showEnding(); return; }
  const d = DAYS[G.day - 1];

  G.dayLen = RULES.dayLength;
  G.timeLeft = G.dayLen;
  G.elapsed = 0;
  G.tokens = RULES.tokensPerDay;
  G.tokenHint = null;
  G.customers = []; G.queue = []; G.waiting = []; G.collectors = [];
  G.orderSpotCust = null;
  G.tray = []; G.counterItems = []; G.pops = [];
  G.ordersTaken = 0; G.itemsStarted = 0;
  G.todaySales = 0; G.servedToday = 0; G.leftToday = 0; G.supplyToday = 0;
  G.wageToday = dailyWage();

  const slots = 1 + (G.flags.machine2 ? 1 : 0);
  G.machine = [];
  for (let i = 0; i < slots; i++) G.machine.push({ busy: false, t: 0, done: false });

  // ตัวละครฝั่งพนักงาน
  G.player = new Worker([5, 3], OWNER_PAL, 'owner');
  G.staff = [];
  if (G.flags.hired) G.staff.push(makeStaff([8, 3]));
  if (G.flags.hired2) G.staff.push(makeStaff([4, 2]));

  // ของมาส่ง
  const q = G.nightOrder;
  const cost = q.a * G.shop.ing[0].cost + q.b * G.shop.ing[1].cost;
  G.delivery = {
    due: (q.a + q.b) > 0 && !!d.delivery,
    at: G.dayLen * 0.45,
    arrived: false, taken: false, cost: cost, qty: { a: q.a, b: q.b }
  };
  // ถ้าวันนี้ไม่มีคิวของมาส่ง ให้ของเข้าสต็อกตั้งแต่เปิดร้าน
  if ((q.a + q.b) > 0 && !d.delivery) {
    G.stock.a += q.a; G.stock.b += q.b;
    G.cash -= cost; G.supplyToday += cost;
    G.delivery.taken = true;
  }
  G.nightOrder = { a: 0, b: 0 };

  G.tutorial = { on: !!d.tutorial, step: 0 };
  G.hold = false;
  G.hintTile = null;
  G.running = false;
  G.paused = false;
  G.screen = 'intro';
  G.spawns = buildSpawns(d);
  G.spawnI = 0;

  UI.rebuildStations();
  UI.showDayIntro(d);
}

function makeStaff(tile) {
  const w = new Worker(tile, STAFF_PAL, 'staff');
  w.trained = G.flags.trained;
  return w;
}

function dailyWage() {
  let w = 0;
  if (G.flags.hired) w += G.flags.trained ? RULES.wageTrained : RULES.wageBase;
  if (G.flags.hired2) w += G.flags.trained ? RULES.wageTrained : RULES.wageBase;
  if (G.flags.cook2) w += G.shop.upgrade.wage;
  return w;
}

function buildSpawns(d) {
  const list = [];
  let heads = Math.round(d.heads * G.loc.flow);
  const gmin = G.theme.group[0], gmax = G.theme.group[1];
  const from = 0.4, to = G.dayLen - 1.2;
  if (d.tutorial) { list.push({ t: 0.3, size: 1, rider: false }); heads -= 1; }
  const groups = [];
  while (heads > 0) {
    let size = gmin + Math.floor(Math.random() * (gmax - gmin + 1));
    size = Math.min(size, heads);
    const rider = !!d.riders && Math.random() < 0.3;
    groups.push({ size: rider ? 1 : size, rider: rider });
    heads -= rider ? 1 : size;
  }
  for (let i = 0; i < groups.length; i++) {
    const frac = groups.length === 1 ? 0.5 : i / (groups.length - 1);
    const t = from + (to - from) * frac + (Math.random() - 0.5) * 0.7;
    list.push({ t: Math.max(from, t), size: groups[i].size, rider: groups[i].rider });
  }
  list.sort((a, b) => a.t - b.t);
  return list;
}

/* ---------- เปิดร้าน ---------- */
function openStore() {
  G.screen = 'play';
  G.running = true;
  G.paused = false;
  lastTs = 0;
  // วันสอน: ปล่อยลูกค้าคนแรกเข้ามาเลย เพราะเวลาจะถูกหยุดไว้ระหว่างสอน
  if (G.tutorial.on && G.spawnI === 0 && G.spawns.length) {
    spawnGroup(G.spawns[0]);
    G.spawnI = 1;
  }
  SFX.unlock();
  SFX.start();
  UI.syncHud();
  if (!rafId) rafId = requestAnimationFrame(loop);
  startWatchdog();
}

let lastFrame = 0, watchdog = 0;

function loop(ts) {
  rafId = requestAnimationFrame(loop);
  step(ts);
}

function step(ts) {
  lastFrame = performance.now();
  if (!lastTs) lastTs = ts;
  let dt = (ts - lastTs) / 1000;
  lastTs = ts;
  if (dt > 0.1) dt = 0.1;
  G.t += dt;
  if (G.running && !G.paused) update(dt);
  render();
}

/* บางเบราว์เซอร์หยุด requestAnimationFrame เมื่อแท็บไม่ได้อยู่หน้าสุด
   ตัวนี้คอยกันไม่ให้เกมค้างกลางวัน */
function startWatchdog() {
  if (watchdog) return;
  watchdog = setInterval(() => {
    if (!G.running || G.paused) return;
    if (performance.now() - lastFrame > 110) step(performance.now());
  }, 50);
}

/* ---------- อัปเดต ---------- */
function update(dt) {
  const clockRuns = !G.hold;
  if (clockRuns) {
    G.elapsed += dt;
    G.timeLeft = Math.max(0, G.timeLeft - dt);
  }

  // ลูกค้าเข้าร้าน
  while (G.spawnI < G.spawns.length && G.spawns[G.spawnI].t <= G.elapsed) {
    spawnGroup(G.spawns[G.spawnI]);
    G.spawnI++;
  }

  // ของมาส่ง
  if (G.delivery.due && !G.delivery.arrived && G.elapsed >= G.delivery.at) {
    G.delivery.arrived = true;
    SFX.ready();
    UI.toast('ของมาส่งแล้ว แตะประตูหลังเพื่อไปรับและจ่ายเงิน');
  }

  // เครื่อง / ครัว
  for (const m of G.machine) {
    if (m.busy) {
      m.t -= dt;
      if (m.t <= 0) m.done = true;
    }
    if (m.done && G.tray.length < RULES.trayMax) {
      G.tray.push(G.shop.item);
      m.busy = false; m.done = false;
      SFX.ready();
    }
  }

  // ตัวละคร
  workerTick(G.player, dt);
  for (const s of G.staff) { staffBrain(s); workerTick(s, dt); }

  for (let i = G.customers.length - 1; i >= 0; i--) {
    const c = G.customers[i];
    customerTick(c, dt, clockRuns);
    if (c.dead) removeCustomer(c, i);
  }

  flowQueue();
  flowCollect();
  updatePops(dt);
  if (G.tutorial.on) tutorialTick();

  if (clockRuns && G.timeLeft <= 0) closeStore();
  UI.syncHud();
}

function updatePops(dt) {
  for (let i = G.pops.length - 1; i >= 0; i--) {
    const p = G.pops[i];
    p.t -= dt; p.y -= dt * 12;
    if (p.t <= 0) G.pops.splice(i, 1);
  }
}

function pop(x, y, text, color) { G.pops.push({ x, y, text, color: color || '#ffffff', t: 1.1 }); }

/* ---------- ลูกค้า ---------- */
function spawnGroup(g) {
  for (let i = 0; i < g.size; i++) {
    const pal = g.rider ? RIDER_PAL : G.theme.people[Math.floor(Math.random() * G.theme.people.length)];
    const c = new Customer(pal, g.rider);
    c.delay = i * 0.28;
    c.x = ENTRY_X * TILE + TILE / 2;
    c.y = (12 + i * 0.45) * TILE + TILE / 2;
    G.customers.push(c);
    joinQueue(c);
  }
  if (g.rider) { SFX.bike(); UI.toast('ออเดอร์มาแล้ว · ไรเดอร์เข้าคิว'); }
}

function joinQueue(c) {
  if (G.queue.length >= QUEUE_SLOTS.length) {
    // คิวเต็มจริง ๆ ลูกค้าหันกลับ
    c.state = 'leave';
    c.say('angry', 1.4);
    c.goTo([ENTRY_X, 12]);
    countLeave(c);
    return;
  }
  G.queue.push(c);
  c.state = 'queue';
  c.goTo(QUEUE_SLOTS[G.queue.length - 1]);
}

function reflowQueue() {
  for (let i = 0; i < G.queue.length; i++) {
    const t = QUEUE_SLOTS[i];
    if (!sameTile(G.queue[i].goal, t)) G.queue[i].goTo(t);
  }
}

function reflowWait() {
  for (let i = 0; i < G.waiting.length; i++) {
    const t = WAIT_SLOTS[i];
    if (!sameTile(G.waiting[i].goal, t)) G.waiting[i].goTo(t);
  }
}

function flowQueue() {
  if (!G.orderSpotCust && G.queue.length) {
    const c = G.queue.shift();
    c.state = 'toOrder';
    c.goTo(STATIONS.cashier.cust);
    G.orderSpotCust = c;
    reflowQueue();
  }
}

function flowCollect() {
  while (G.collectors.length < COLLECT_SPOTS.length &&
         G.counterItems.length > G.collectors.length &&
         G.waiting.length > 0) {
    const spot = COLLECT_SPOTS.find(s => !G.collectors.some(c => c.spot && sameTile(c.spot, s)));
    if (!spot) break;
    const c = G.waiting.shift();
    c.state = 'toCollect';
    c.spot = spot;
    c.goTo(spot);
    G.collectors.push(c);
    reflowWait();
  }
}

function dropCollector(c) {
  const i = G.collectors.indexOf(c);
  if (i >= 0) G.collectors.splice(i, 1);
  c.spot = null;
}

function customerTick(c, dt, clockRuns) {
  c.update(dt);
  if (c.bubble > 0) c.bubble -= dt;

  const drain = clockRuns ? dt : 0;
  const pm = G.theme.patience * (DAYS[G.day - 1].calm || 1);

  switch (c.state) {
    case 'queue':
      c.patience -= drain / (RULES.queuePatience * pm);
      break;
    case 'toOrder':
      if (c.atGoal()) c.state = 'order';
      break;
    case 'order':
      c.patience -= drain / (RULES.queuePatience * pm);
      break;
    case 'ordering':
      break;
    case 'toWait':
      if (c.atGoal()) c.state = 'wait';
      break;
    case 'wait':
      c.patience -= drain / (RULES.waitPatience * pm);
      break;
    case 'toCollect':
      if (c.atGoal()) { c.state = 'collect'; c.actT = 0; }
      break;
    case 'collect':
      c.actT += dt;
      if (c.actT >= RULES.collectTime) {
        if (G.counterItems.length) G.counterItems.shift();
        c.hold = G.shop.item;
        c.say('item', 1.0);
        c.opt.happy = true;
        c.state = 'leave';
        c.goTo([ENTRY_X, 12]);
        dropCollector(c);
        G.servedToday++; G.totalServed++;
        if (DAYS[G.day - 1].rating) G.reviews.good++;
        SFX.serve();
      }
      break;
    case 'leave':
      if (c.atGoal()) c.dead = true;
      break;
  }

  if (c.patience <= 0 && (c.state === 'queue' || c.state === 'order' || c.state === 'wait')) {
    walkOut(c);
  }
}

function walkOut(c) {
  const from = c.state;
  c.state = 'leave';
  c.say('angry', 1.6);
  c.goTo([ENTRY_X, 12]);
  if (from === 'queue') {
    const i = G.queue.indexOf(c);
    if (i >= 0) { G.queue.splice(i, 1); reflowQueue(); }
  } else if (from === 'order') {
    if (G.orderSpotCust === c) G.orderSpotCust = null;
  } else if (from === 'wait') {
    const i = G.waiting.indexOf(c);
    if (i >= 0) { G.waiting.splice(i, 1); reflowWait(); }
  }
  countLeave(c);
  SFX.angry();
}

function countLeave(c) {
  G.leftToday++; G.totalLeft++;
  if (DAYS[G.day - 1].rating) G.reviews.bad++;
}

function removeCustomer(c, i) {
  G.customers.splice(i, 1);
  if (G.orderSpotCust === c) G.orderSpotCust = null;
  dropCollector(c);
}

/* ---------- การทำงานที่สถานี ---------- */
function canPromise() {
  const inFlight = cookingCount() + G.tray.length + G.counterItems.length;
  const owed = Math.max(0, G.ordersTaken - G.servedToday);
  if (inFlight > owed) return true;                 // ของที่ทำไว้แล้วพอรับออเดอร์ใหม่
  return G.stock.a > 0 && G.stock.b > 0;
}

function cookingCount() { let n = 0; for (const m of G.machine) if (m.busy) n++; return n; }

function demand() { return G.ordersTaken - G.itemsStarted; }

function canStartMake() {
  if (G.stock.a <= 0 || G.stock.b <= 0) return false;
  const free = G.machine.some(m => !m.busy);
  if (!free) return false;
  if (demand() > 0) return true;
  if (G.shop.preMake) return (cookingCount() + G.tray.length + G.counterItems.length) < 3;
  return false;
}

function workerTick(w, dt) {
  w.update(dt);
  if (w.popT > 0) w.popT -= dt;

  if (w.busyT > 0) {
    w.busyT -= dt;
    if (w.busyT <= 0) { w.busyT = 0; finishAction(w); }
    return;
  }

  if (w.chatTarget) {
    const c = w.chatTarget;
    if (!c || c.dead || (c.state !== 'wait' && c.state !== 'queue' && c.state !== 'order')) { w.chatTarget = null; }
    else if (w.atGoal()) {
      c.patience = Math.min(1, c.patience + RULES.chatRefill);
      c.say('heart', 1.2);
      SFX.chat();
      pop(c.x, c.y - 24, '+ใจเย็น', '#ff8fb4');
      w.chatTarget = null;
    }
    return;
  }

  if (w.station && w.atStation(w.station)) tryStart(w);
}

function tryStart(w) {
  const k = w.station;
  // แจ้งเตือนเฉพาะครั้งแรกหลังผู้เล่นสั่ง ไม่ขึ้นซ้ำทุกเฟรม
  const fresh = w.kind === 'owner' && w.cmdFresh;
  const no = (text) => { if (fresh) { denyOnce(w, text); w.cmdFresh = false; } };

  if (k === 'cashier') {
    const c = G.orderSpotCust;
    if (!c || c.state !== 'order') return;
    if (w.hold) { no('ถือของอยู่ รับออเดอร์ไม่ได้'); return; }
    if (!canPromise()) {
      c.say('angry', 1.4);
      pop(c.x, c.y - 26, 'ของหมด', '#e2544a');
      G.orderSpotCust = null;
      c.state = 'leave'; c.goTo([ENTRY_X, 12]);
      countLeave(c);
      SFX.deny();
      return;
    }
    c.state = 'ordering';
    begin(w, 'order', RULES.takeOrderTime);
  } else if (k === 'machine') {
    if (!canStartMake()) {
      if (G.stock.a <= 0 || G.stock.b <= 0) no('วัตถุดิบหมด');
      else if (!G.shop.preMake && demand() <= 0) no('ยังไม่มีออเดอร์ให้ส่งตั๋ว');
      return;
    }
    begin(w, 'make', 0.25);
  } else if (k === 'tray') {
    if (w.hold) { no('ถืออยู่แล้ว'); return; }
    if (!G.tray.length) return;
    begin(w, 'pick', RULES.pickTime);
  } else if (k === 'handoff') {
    if (!w.hold) { no('ยังไม่ได้หยิบของ'); return; }
    if (G.counterItems.length >= RULES.counterMax) { no('ที่ส่งมอบเต็ม'); return; }
    begin(w, 'place', RULES.placeTime);
  } else if (k === 'door') {
    if (!G.delivery.arrived || G.delivery.taken) { no('ยังไม่มีของมาส่ง'); return; }
    begin(w, 'pay', RULES.payTime);
  }
}

function begin(w, kind, time) {
  w.cmdFresh = false;
  w.busyKind = kind;
  w.busyMax = time;
  w.busyT = time;
}

let denyT = 0;
function denyOnce(w, text) {
  if (G.t - denyT < 0.8) return;
  denyT = G.t;
  pop(w.x, w.y - 22, text, '#e2544a');
  SFX.deny();
}

function finishAction(w) {
  const kind = w.busyKind;
  w.busyKind = null;
  if (kind === 'order') {
    const c = G.orderSpotCust;
    if (!c) return;
    G.orderSpotCust = null;
    G.ordersTaken++;
    G.cash += G.shop.price;
    G.todaySales += G.shop.price;
    c.state = 'toWait';
    c.say('coin', 1.0);
    G.waiting.push(c);
    c.goTo(WAIT_SLOTS[Math.min(G.waiting.length - 1, WAIT_SLOTS.length - 1)]);
    pop(w.x, w.y - 22, '+' + G.shop.price, '#ffd34d');
    SFX.coin();
  } else if (kind === 'make') {
    const m = G.machine.find(m => !m.busy);
    if (!m) return;
    G.stock.a--; G.stock.b--;
    G.itemsStarted++;
    m.busy = true;
    m.t = G.shop.prep * (G.flags.cook2 ? 0.6 : 1);
    m.done = false;
    SFX.start();
  } else if (kind === 'pick') {
    if (!G.tray.length) return;
    w.hold = G.tray.shift();
    SFX.pick();
  } else if (kind === 'place') {
    if (!w.hold) return;
    G.counterItems.push(w.hold);
    w.hold = null;
    SFX.place();
  } else if (kind === 'pay') {
    G.delivery.taken = true;
    G.stock.a += G.delivery.qty.a;
    G.stock.b += G.delivery.qty.b;
    G.cash -= G.delivery.cost;
    G.supplyToday += G.delivery.cost;
    pop(w.x, w.y - 22, '-' + G.delivery.cost, '#e2544a');
    SFX.coin();
    UI.toast('รับของเข้าสต็อกแล้ว');
  }
}

/* ---------- พนักงาน AI ---------- */
function stationClaimedBy(key, self) {
  if (G.player !== self && G.player.station === key) return G.player;
  for (const s of G.staff) if (s !== self && s.station === key) return s;
  return null;
}

function staffBrain(s) {
  if (s.busyT > 0) return;

  // ถือของอยู่ ต้องเอาไปวางที่จุดส่งมอบก่อนเสมอ
  if (s.hold) { s.sendTo('handoff'); return; }

  const taken = (k) => !!stationClaimedBy(k, s);

  if (!s.trained) { s.sendTo('cashier'); return; }

  if (G.tray.length > 0 && G.counterItems.length < RULES.counterMax && !taken('tray')) { s.sendTo('tray'); return; }
  if (canStartMake() && !taken('machine')) { s.sendTo('machine'); return; }
  if (G.orderSpotCust && G.orderSpotCust.state === 'order' && !taken('cashier')) { s.sendTo('cashier'); return; }
  if (!taken('cashier')) s.sendTo('cashier');
  else if (!taken('machine')) s.sendTo('machine');
  else if (!taken('tray')) s.sendTo('tray');
}

/* ---------- คำสั่งจากผู้เล่น ---------- */
function commandStation(key) {
  if (!G.running || G.paused) return;
  const w = G.player;
  w.chatTarget = null;
  w.cmdFresh = true;
  w.sendTo(key);
  // ผู้เล่นมีสิทธิ์ก่อน พนักงานหลบไปทำอย่างอื่น
  for (const s of G.staff) if (s.station === key) s.station = null;
  SFX.click();
}

function commandChat(c) {
  const w = G.player;
  if (w.busyT > 0) return;
  const tx = Math.max(0, Math.min(COLS - 1, Math.round((c.x - TILE / 2) / TILE)));
  w.station = null;
  w.chatTarget = c;
  w.goTo([tx, 3]);
  SFX.click();
}

function chatUnlocked() { return G.day >= 5 && G.flags.hired2; }

function handleTap(lx, ly) {
  if (!G.running || G.paused) return;
  // ลูกค้าก่อน
  let best = null, bestD = 14;
  for (const c of G.customers) {
    if (c.state === 'leave') continue;
    const d = Math.hypot(c.x - lx, c.y - ly - 6);
    if (d < bestD) { bestD = d; best = c; }
  }
  if (best) {
    if (chatUnlocked() && (best.state === 'wait' || best.state === 'queue') && !G.player.hold) {
      commandChat(best); return;
    }
    if (best.state === 'queue' || best.state === 'order' || best.state === 'toOrder') {
      commandStation('cashier'); return;
    }
  }
  const tx = Math.floor(lx / TILE), ty = Math.floor(ly / TILE);
  const hit = stationAt(tx, ty);
  if (hit) commandStation(hit);
}

function stationAt(tx, ty) {
  const tiles = [
    ['machine', [[5, 1], [6, 1], [5, 2], [6, 2], [4, 1], [4, 2], [6, 3], [5, 3]]],
    ['tray', [[2, 1], [2, 2], [1, 1], [3, 1], [1, 2], [3, 2]]],
    ['handoff', [[2, 4], [3, 4], [2, 3], [2, 5], [3, 5], [1, 4], [1, 3], [3, 3]]],
    ['cashier', [[7, 3], [7, 4], [7, 5], [6, 4], [8, 4], [8, 3], [6, 5], [7, 2]]],
    ['door', [[9, 1], [9, 2], [8, 1], [10, 1], [10, 2], [9, 3]]]
  ];
  for (const [key, list] of tiles) {
    for (const t of list) if (t[0] === tx && t[1] === ty) return key;
  }
  return null;
}

/* ---------- การสอนวันแรก ---------- */
function tutorialTick() {
  const st = G.tutorial;
  if (st.step === 0) {
    const c = G.orderSpotCust;
    const ready = !!c && (c.state === 'order' || c.state === 'ordering');
    G.hold = true;                        // วันแรก เวลายังไม่เดินจนกว่าจะรับออเดอร์แรกได้
    G.hintTile = ready ? STATIONS.cashier.obj : null;
    UI.hint(ready ? 'แตะลูกค้า หรือจุดแคชเชียร์ เพื่อเดินไปรับออเดอร์' : 'ลูกค้าคนแรกกำลังเดินเข้ามา');
    if (G.ordersTaken >= 1) st.step = 1;
  } else if (st.step === 1) {
    G.hold = true;
    G.hintTile = STATIONS.machine.obj;
    UI.hint('แตะ' + G.shop.s2 + ' เพื่อเริ่มทำออเดอร์');
    if (G.itemsStarted >= 1) st.step = 2;
  } else if (st.step === 2) {
    G.hold = true;
    G.hintTile = STATIONS.tray.obj;
    UI.hint('ของกำลังทำอยู่ พอพร้อมแล้วแตะ' + G.shop.s3 + ' เพื่อหยิบ');
    if (G.player.hold) st.step = 3;
  } else if (st.step === 3) {
    G.hold = true;
    G.hintTile = STATIONS.handoff.obj;
    UI.hint('แตะจุดส่งมอบ แล้ววางไว้ ลูกค้าจะเดินมารับเอง');
    if (G.counterItems.length > 0) {
      st.step = 4; st.on = false;
      G.hold = false; G.hintTile = null;
      UI.hint('');
      UI.toast('ครบลูปแล้ว · ที่เหลือลองจัดคิวเอง');
    }
  }
}

/* ---------- ปิดร้าน ---------- */
function closeStore() {
  G.running = false;
  SFX.close();
  // คนที่จ่ายเงินแล้วแต่ยังไม่ได้ของ นับเป็นลูกค้าที่ผิดหวัง
  // ส่วนคนที่ยังไม่ได้สั่ง แค่กลับบ้านเพราะร้านปิด
  for (const c of G.customers) {
    if (c.state === 'leave') continue;
    const paid = c.state === 'wait' || c.state === 'toWait' || c.state === 'toCollect' || c.state === 'collect';
    if (paid) { countLeave(c); c.say('angry', 1.6); }
    c.state = 'leave';
    c.goTo([ENTRY_X, 12]);
  }
  G.queue = []; G.waiting = []; G.collectors = []; G.orderSpotCust = null;

  // ของที่ยังไม่ได้ไปรับ รับตอนปิดร้าน
  let lateNote = null;
  if (G.delivery.due && G.delivery.arrived && !G.delivery.taken) {
    G.stock.a += G.delivery.qty.a;
    G.stock.b += G.delivery.qty.b;
    G.cash -= G.delivery.cost;
    G.supplyToday += G.delivery.cost;
    G.delivery.taken = true;
    lateNote = 'ของที่ยังไม่ได้ไปรับ ซัพพลายเออร์ฝากไว้ตอนปิดร้าน และหักเงินแล้ว';
  }
  G.cash -= G.wageToday;

  G.lastResult = {
    day: G.day,
    sales: G.todaySales,
    served: G.servedToday,
    left: G.leftToday,
    wage: G.wageToday,
    supply: G.supplyToday,
    cash: G.cash,
    stock: { a: G.stock.a, b: G.stock.b },
    lateNote: lateNote
  };
  G.history.push(G.lastResult);
  G.screen = 'summary';
  UI.showSummary(G.lastResult);
}

function ratingValue() {
  const r = G.reviews;
  const n = r.good + r.bad;
  if (n === 0) return 0;
  return Math.max(0, Math.min(5, 5 * (r.good / (r.good + r.bad * 1.6))));
}

function ratingLabel() {
  const n = G.reviews.good + G.reviews.bad;
  if (n < RULES.ratingMinReviews) return '0.0 · New Store';
  return ratingValue().toFixed(1) + ' ★';
}

/* ---------- การตัดสินใจตอนปิดร้าน ---------- */
function applyDecision(key, choice) {
  if (key === 'hire' && choice === 'yes') G.flags.hired = true;
  if (key === 'train' && choice === 'yes') { G.flags.trained = true; G.cash -= RULES.trainCost; }
  if (key === 'hire2' && choice === 'yes') G.flags.hired2 = true;
  if (key === 'delivery' && choice === 'yes') { G.flags.delivery = true; G.cash -= RULES.deliveryFee; }
  if (key === 'invest' && choice === 'yes') {
    const up = G.shop.upgrade;
    G.cash -= up.cost;
    if (up.key === 'machine2') G.flags.machine2 = true; else G.flags.cook2 = true;
  }
  if (key === 'final') G.finalChoice = choice;
}

function placeNightOrder(a, b) {
  G.nightOrder = { a: a, b: b };
}

function nightOrderCost(a, b) {
  return a * G.shop.ing[0].cost + b * G.shop.ing[1].cost;
}

function showEnding() {
  G.screen = 'end';
  G.running = false;
  UI.showEnding();
}

/* ---------- วาดภาพ ---------- */
function render() {
  if (!ctx || !G.shop || !G.player) return;
  const pal = G.pal || THEMES.modern.pal;
  ctx.clearRect(0, 0, VIEW, VIEW);
  drawRoom(ctx, pal, G);
  drawStationBadges(ctx, pal);

  // ของบนชั้นพัก
  for (let i = 0; i < G.tray.length; i++) {
    drawArt(ctx, G.shop.item, TRAY_TILE[0] * TILE - 4 + i * 6, TRAY_TILE[1] * TILE + 5, 1);
  }
  // ของบนจุดส่งมอบ
  for (let i = 0; i < G.counterItems.length; i++) {
    drawArt(ctx, G.shop.item, STATIONS.handoff.obj[0] * TILE + 1 + i * 9, 4 * TILE + 3, 1);
  }
  // ลังของที่มาส่ง
  if (G.delivery.arrived && !G.delivery.taken) {
    const bob = Math.round(Math.sin(G.t * 4));
    drawArt(ctx, 'crate', DOOR_TILE[0] * TILE + 4, DOOR_TILE[1] * TILE + 4 + bob, 1);
  }

  // ตัวละคร เรียงตามแกน y
  const list = [G.player].concat(G.staff).concat(G.customers);
  list.sort((a, b) => a.y - b.y);
  for (const a of list) a.draw(ctx);

  // มอเตอร์ไซค์ไรเดอร์ที่จอดอยู่
  if (G.customers.some(c => c.isRider && c.state !== 'leave')) {
    drawBike(ctx, ENTRY_X * TILE - 14, 12 * TILE - 10, '#17a34a');
  }

  // ลูกศรสอน
  if (G.hintTile) drawArrow(ctx, G.hintTile, G.t, pal.accent === '#141414' ? '#e2544a' : pal.accent);

  // ตัวเลขลอย
  ctx.font = 'bold 7px "Courier New", monospace';
  ctx.textAlign = 'center';
  for (const p of G.pops) {
    ctx.globalAlpha = Math.min(1, p.t);
    ctx.fillStyle = '#000';
    ctx.fillText(p.text, (p.x | 0) + 1, (p.y | 0) + 1);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x | 0, p.y | 0);
  }
  ctx.globalAlpha = 1;
  for (const w of [G.player].concat(G.staff)) {
    if (w.popT > 0 && w.pop) {
      ctx.globalAlpha = Math.min(1, w.popT);
      ctx.fillStyle = w.pop.color;
      ctx.fillText(w.pop.text, w.x, w.y - 24);
      ctx.globalAlpha = 1;
    }
  }
}

/* ---------- ธีมกับหน้าเว็บ ---------- */
function applyTheme(theme) {
  const r = document.documentElement;
  r.style.setProperty('--bg', theme.ui.bg);
  r.style.setProperty('--panel', theme.ui.panel);
  r.style.setProperty('--text', theme.ui.text);
  r.style.setProperty('--sub', theme.ui.sub);
  r.style.setProperty('--accent', theme.ui.accent);
  r.style.setProperty('--line', theme.ui.line);
  r.style.setProperty('--accent-ink', theme.key === 'cyber' ? '#0c0a18' : (theme.key === 'sweet' ? '#ffffff' : '#ffffff'));
  document.body.dataset.theme = theme.key;
}

/* ---------- E.Token ---------- */
function useToken(key) {
  if (G.tokens <= 0) { SFX.deny(); return; }
  G.tokens--;
  SFX.token();
  if (key === 'order') {
    let n = 0;
    const list = [];
    if (G.orderSpotCust && G.orderSpotCust.state === 'order') list.push(G.orderSpotCust);
    for (const c of G.queue.slice(0, 3)) list.push(c);
    for (const c of list) {
      if (n >= 3) break;
      if (!canPromise()) break;
      instantOrder(c);
      n++;
    }
    UI.toast('E.Token รับออเดอร์ให้ ' + n + ' คิว');
  } else if (key === 'stock') {
    const pace = G.elapsed > 0.5 ? G.ordersTaken / G.elapsed : 0;
    const projected = Math.ceil(pace * G.dayLen * 1.25) + 2;
    const need = Math.max(0, projected - Math.min(G.stock.a, G.stock.b));
    G.tokenHint = { a: Math.max(6, need), b: Math.max(6, need) };
    UI.toast('ของที่เหลือ ' + G.stock.a + '/' + G.stock.b + ' · คืนนี้ควรสั่งราว ' + G.tokenHint.a + ' ชุด จดไว้ให้แล้ว');
  } else if (key === 'summary') {
    const risk = G.customers.filter(c => c.patience < 0.35 && c.state !== 'leave').length;
    UI.toast('ยอดวันนี้ ' + G.todaySales + '฿ · เสิร์ฟแล้ว ' + G.servedToday + ' · ใกล้เดินออก ' + risk + ' คน');
  }
  UI.syncHud();
}

function instantOrder(c) {
  if (c.state === 'queue') {
    const i = G.queue.indexOf(c);
    if (i >= 0) G.queue.splice(i, 1);
    reflowQueue();
  }
  if (G.orderSpotCust === c) G.orderSpotCust = null;
  G.ordersTaken++;
  G.cash += G.shop.price;
  G.todaySales += G.shop.price;
  c.state = 'toWait';
  c.say('coin', 1.0);
  G.waiting.push(c);
  c.goTo(WAIT_SLOTS[Math.min(G.waiting.length - 1, WAIT_SLOTS.length - 1)]);
  pop(c.x, c.y - 26, '+' + G.shop.price, '#ffd34d');
  SFX.coin();
}
