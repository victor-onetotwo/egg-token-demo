/* ===========================================================
   Egg Token Demo — แผนผังร้าน สถานี และการเดิน
   ตาราง 12 x 13 ช่อง (แถว 12 คือนอกจอ)
     y=0      ผนังหลัง
     y=1      เครื่อง / ช่องของออก / ประตูรับของ
     y=2,3    ทางเดินฝั่งพนักงาน
     y=4      เคาน์เตอร์ (กั้นทั้งสองฝั่ง)
     y=5..11  ฝั่งลูกค้า
     y=12     นอกจอ ทางเข้า-ออก
   =========================================================== */

/* สถานี 2 อยู่ฝั่งขวาใกล้แคชเชียร์
   สถานี 3 (ของออก) อยู่ด้านหลังข้างจุดส่งมอบ แยกจากสถานี 2 ชัดเจน */
const MACHINE_TILES = [[5, 1], [6, 1]];
const TRAY_TILE = [2, 1];
const DOOR_TILE = [9, 1];

const STATIONS = {
  cashier: { key: 'cashier', no: 1, obj: [7, 4], stand: [7, 3], cust: [7, 5] },
  machine: { key: 'machine', no: 2, obj: [5, 1], stand: [6, 2] },
  tray: { key: 'tray', no: 3, obj: [2, 1], stand: [2, 2] },
  handoff: { key: 'handoff', no: 4, obj: [2, 4], stand: [2, 3], cust: [2, 5] },
  door: { key: 'door', no: 0, obj: [9, 1], stand: [9, 2] }
};

/* จุดที่ลูกค้าเดินมารับของ รับพร้อมกันได้ 2 คน */
const COLLECT_SPOTS = [[2, 5], [3, 5]];

const ENTRY_X = 10;

/* ช่องคิวสั่ง: แถวเดียวต่อไปทางซ้าย แล้วค่อยล้นลงแถวล่าง */
const QUEUE_SLOTS = (function () {
  const a = [];
  for (let x = 7; x >= 0; x--) a.push([x, 6]);
  for (let x = 0; x <= 7; x++) a.push([x, 7]);
  return a;
})();

/* ช่องรอรับของ: แยกจากคิวสั่ง มีแถวว่างคั่น */
const WAIT_SLOTS = (function () {
  const a = [];
  for (let x = 1; x <= 9; x++) a.push([x, 9]);
  for (let x = 1; x <= 9; x++) a.push([x, 10]);
  return a;
})();

function tilePx(t) { return [t[0] * TILE + TILE / 2, t[1] * TILE + TILE / 2]; }

function sameTile(a, b) { return a[0] === b[0] && a[1] === b[1]; }

function blockedFor(zone, x, y) {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
  if (zone === 'staff') {
    if (y === 0 || y === 4 || y >= 5) return true;
    if (sameTile([x, y], TRAY_TILE)) return true;
    for (const m of MACHINE_TILES) if (sameTile([x, y], m)) return true;
    return false;
  }
  // zone === 'cust'
  if (y <= 4) return true;
  return false;
}

/* BFS บนตาราง — เล็กมาก ไม่ต้องแคช */
function findPath(zone, from, to) {
  if (sameTile(from, to)) return [];
  const key = (x, y) => y * COLS + x;
  const prev = new Map();
  const q = [from];
  const seen = new Set([key(from[0], from[1])]);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (q.length) {
    const cur = q.shift();
    if (sameTile(cur, to)) {
      const path = [];
      let c = cur;
      while (!sameTile(c, from)) {
        path.unshift(c);
        c = prev.get(key(c[0], c[1]));
      }
      return path;
    }
    for (const d of dirs) {
      const nx = cur[0] + d[0], ny = cur[1] + d[1];
      if (blockedFor(zone, nx, ny)) continue;
      const k = key(nx, ny);
      if (seen.has(k)) continue;
      seen.add(k);
      prev.set(k, cur);
      q.push([nx, ny]);
    }
  }
  return null;
}

/* ---------- วาดห้อง ---------- */
function drawRoom(ctx, pal, state) {
  // พื้นฝั่งพนักงาน
  for (let y = 1; y <= 3; y++) {
    for (let x = 0; x < COLS; x++) {
      px(ctx, x * TILE, y * TILE, TILE, TILE, (x + y) % 2 ? pal.floorAlt : pal.floor);
    }
  }
  // พื้นฝั่งลูกค้า
  for (let y = 5; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      px(ctx, x * TILE, y * TILE, TILE, TILE, (x + y) % 2 ? pal.floor : pal.floorAlt);
    }
  }
  // พรมบอกช่องคิวสั่ง
  for (const s of QUEUE_SLOTS.slice(0, 8)) {
    px(ctx, s[0] * TILE + 1, s[1] * TILE + 1, TILE - 2, TILE - 2, pal.rug);
  }
  // พรมบอกจุดรอรับ
  for (const s of WAIT_SLOTS.slice(0, 9)) {
    px(ctx, s[0] * TILE + 3, s[1] * TILE + 3, TILE - 6, TILE - 6, pal.rug);
  }

  // ผนังหลัง
  px(ctx, 0, 0, VIEW, TILE, pal.wall);
  px(ctx, 0, TILE - 3, VIEW, 3, pal.wallTop);
  // ประตูรับของ
  px(ctx, DOOR_TILE[0] * TILE + 1, 1, TILE - 2, TILE - 2, shade(pal.wall, 26));
  px(ctx, DOOR_TILE[0] * TILE + 3, 4, TILE - 6, TILE - 6, shade(pal.wall, 46));
  px(ctx, DOOR_TILE[0] * TILE + 11, 8, 1, 2, pal.accent);

  // เครื่องชง / ครัว (สถานี 2)
  const mx = MACHINE_TILES[0][0] * TILE, my = MACHINE_TILES[0][1] * TILE;
  px(ctx, mx, my + 2, TILE * 2, TILE - 2, pal.machine);
  px(ctx, mx, my + 2, TILE * 2, 2, shade(pal.machine, 36));
  px(ctx, mx + 3, my + 6, 5, 6, shade(pal.machine, -28));
  px(ctx, mx + 19, my + 6, 5, 6, shade(pal.machine, -28));
  for (let i = 0; i < (state.machine ? state.machine.length : 1); i++) {
    const lit = state.machine && state.machine[i] && state.machine[i].busy;
    px(ctx, mx + 4 + i * 16, my + 4, 3, 2, lit ? '#ffcf4d' : pal.machineLit);
  }

  // ช่องของออก / จุดหยิบ
  const tx = TRAY_TILE[0] * TILE, ty = TRAY_TILE[1] * TILE;
  px(ctx, tx - 2, ty + 4, TILE + 4, TILE - 4, shade(pal.counter, -18));
  px(ctx, tx - 2, ty + 4, TILE + 4, 2, pal.counterEdge);

  // เคาน์เตอร์
  const cy = 4 * TILE;
  px(ctx, 0, cy, VIEW, TILE, pal.counter);
  px(ctx, 0, cy, VIEW, 2, pal.counterEdge);
  px(ctx, 0, cy + TILE - 2, VIEW, 2, shade(pal.counter, -40));
  // จุดแคชเชียร์
  const sx = STATIONS.cashier.obj[0] * TILE;
  px(ctx, sx + 2, cy + 3, TILE - 4, TILE - 7, shade(pal.counter, -55));
  px(ctx, sx + 4, cy + 5, TILE - 8, 3, pal.accent);
  // จุดส่งมอบ กว้าง 2 ช่อง ให้ลูกค้ามารับพร้อมกันได้
  const hx = STATIONS.handoff.obj[0] * TILE;
  px(ctx, hx, cy + 4, TILE * 2, TILE - 7, pal.accent2);
  px(ctx, hx + 2, cy + 6, TILE * 2 - 4, 2, shade(pal.counter, 20));
  for (const s of COLLECT_SPOTS) px(ctx, s[0] * TILE + 4, s[1] * TILE + 2, TILE - 8, 1, pal.accent2);

  // กระจกหน้าร้าน + ทางเข้า
  px(ctx, 0, 11 * TILE + TILE - 2, VIEW, 2, pal.glass);
  px(ctx, ENTRY_X * TILE - 2, 11 * TILE + TILE - 2, TILE + 4, 2, pal.floor);
  px(ctx, ENTRY_X * TILE + 2, 11 * TILE + 4, TILE - 4, TILE - 6, shade(pal.rug, -10));
}

/* เลขสถานีบนจอ ให้ตรงกับปุ่มด้านล่าง */
const DIGITS = {
  1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['###', '..#', '###', '#..', '###'],
  3: ['###', '..#', '.##', '..#', '###'],
  4: ['#.#', '#.#', '###', '..#', '..#']
};

function drawBadge(ctx, n, x, y, bg, ink) {
  px(ctx, x, y, 7, 9, bg);
  const rows = DIGITS[n];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {
      if (rows[r][c] === '#') px(ctx, x + 2 + c, y + 2 + r, 1, 1, ink);
    }
  }
}

/* ป้ายจำนวนชิ้นเล็ก ๆ ติดกับของหรือตัวลูกค้า */
function drawQtyTag(ctx, n, x, y, bg, ink) {
  const rows = DIGITS[n];
  if (!rows) return;
  px(ctx, x, y, 5, 7, bg || '#15121c');
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {
      if (rows[r][c] === '#') px(ctx, x + 1 + c, y + 1 + r, 1, 1, ink || '#ffffff');
    }
  }
}

function drawStationBadges(ctx, pal) {
  const bg = pal.counter, ink = pal.accent;
  drawBadge(ctx, 1, 6 * TILE + 5, 4 * TILE + 4, ink, bg);     // แคชเชียร์
  drawBadge(ctx, 2, 5 * TILE + 5, 4, bg, ink);                // เครื่อง / ครัว
  drawBadge(ctx, 3, 2 * TILE + 5, 4, bg, ink);                // ของออก
  drawBadge(ctx, 4, 0 * TILE + 5, 4 * TILE + 4, ink, bg);     // ส่งมอบ
}

/* ลูกศรชี้ตอนสอน */
function drawArrow(ctx, tile, t, color) {
  const [cx, cy] = tilePx(tile);
  const bob = Math.round(Math.sin(t * 6) * 2);
  const y = cy - 16 + bob;
  for (let i = 0; i < 5; i++) px(ctx, cx - 4 + i, y + i, 9 - i * 2, 1, color);
  px(ctx, cx - 2, y - 4, 5, 4, color);
}
