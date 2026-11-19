/* ===========================================================
   Egg Token Demo — ตัวละคร
   ทุกตัวเดินจริงบนตาราง ไม่เปลี่ยนสถานะทันทีหลังคลิก
   =========================================================== */

class Actor {
  constructor(tile, zone, pal, opt) {
    const p = tilePx(tile);
    this.x = p[0];
    this.y = p[1];
    this.zone = zone;
    this.pal = pal;
    this.opt = opt || {};
    this.path = [];
    this.goal = tile.slice();
    this.facing = 'down';
    this.frame = 0;
    this.walked = 0;
    this.speed = RULES.walkSpeed;
  }

  get tile() {
    return [Math.floor(this.x / TILE), Math.floor(this.y / TILE)];
  }

  atGoal() {
    return this.path.length === 0 && sameTile(this.tile, this.goal);
  }

  goTo(tile) {
    if (sameTile(this.goal, tile) && (this.path.length || this.atGoal())) return true;
    const path = findPath(this.zone, this.tile, tile);
    if (path === null) return false;
    this.path = path;
    this.goal = tile.slice();
    return true;
  }

  update(dt) {
    if (!this.path.length) { this.frame = 0; return; }
    const target = tilePx(this.path[0]);
    const dx = target[0] - this.x;
    const dy = target[1] - this.y;
    const d = Math.hypot(dx, dy);
    const step = this.speed * dt;
    if (d <= step) {
      this.x = target[0];
      this.y = target[1];
      this.path.shift();
    } else {
      this.x += (dx / d) * step;
      this.y += (dy / d) * step;
      if (Math.abs(dx) > Math.abs(dy)) this.facing = dx > 0 ? 'right' : 'left';
      else this.facing = dy > 0 ? 'down' : 'up';
    }
    this.walked += step;
    this.frame = Math.floor(this.walked / 6) % 2;
  }

  draw(ctx) {
    drawPerson(ctx, this.x - 8, this.y - 13, this.pal, this.facing, this.frame, this.opt);
  }
}

/* ---------- ลูกค้า ---------- */
class Customer extends Actor {
  constructor(pal, isRider) {
    super([ENTRY_X, 12], 'cust', pal, isRider ? { helmet: RIDER_PAL.helmet } : {});
    this.state = 'enter';
    this.patience = 1;
    this.slot = -1;
    this.isRider = !!isRider;
    this.actT = 0;
    this.bubble = 0;
    this.bubbleKind = null;
    this.hold = null;
  }

  say(kind, time) { this.bubbleKind = kind; this.bubble = time || 1.2; }

  draw(ctx) {
    super.draw(ctx);
    if (this.state === 'queue' || this.state === 'order' || this.state === 'wait') {
      drawBar(ctx, this.x - 5, this.y - 20, 10, this.patience);
    }
    if (this.hold) drawArt(ctx, this.hold, this.x - 4, this.y - 28, 1);
    if (this.bubble > 0 && this.bubbleKind) {
      const bx = this.x + 4, by = this.y - 26;
      px(ctx, bx - 1, by - 1, 10, 10, '#ffffff');
      px(ctx, bx, by, 8, 8, '#ffffff');
      if (this.bubbleKind === 'coin') drawArt(ctx, 'coin', bx, by, 1);
      else if (this.bubbleKind === 'angry') { px(ctx, bx + 3, by + 1, 2, 4, '#e2544a'); px(ctx, bx + 3, by + 6, 2, 2, '#e2544a'); }
      else if (this.bubbleKind === 'heart') { px(ctx, bx + 1, by + 2, 2, 2, '#ff5f8f'); px(ctx, bx + 5, by + 2, 2, 2, '#ff5f8f'); px(ctx, bx + 1, by + 4, 6, 2, '#ff5f8f'); px(ctx, bx + 2, by + 6, 4, 1, '#ff5f8f'); }
      else if (this.bubbleKind === 'item') drawArt(ctx, this.hold || 'cup', bx, by, 1);
    }
  }
}

/* ---------- เจ้าของร้าน / พนักงาน ---------- */
class Worker extends Actor {
  constructor(tile, pal, kind) {
    super(tile, 'staff', pal, { apron: true });
    this.kind = kind;              // 'owner' | 'staff'
    this.hold = null;              // ไอเทมที่ถืออยู่
    this.station = null;           // สถานีที่กำลังมุ่งไป
    this.busyT = 0;                // เวลาทำงานที่จุดนั้น
    this.busyMax = 1;
    this.busyKind = null;
    this.trained = false;
    this.pop = null;               // ข้อความลอย
    this.popT = 0;
    this.chatTarget = null;
  }

  sendTo(stationKey) {
    const st = STATIONS[stationKey];
    if (!st) return false;
    if (this.station === stationKey && (this.path.length || sameTile(this.tile, st.stand))) return true;
    if (!this.goTo(st.stand)) return false;
    this.station = stationKey;
    this.busyT = 0;
    this.busyKind = null;
    return true;
  }

  atStation(stationKey) {
    const st = STATIONS[stationKey];
    return st && sameTile(this.tile, st.stand) && this.path.length === 0;
  }

  get busyProgress() { return this.busyMax ? 1 - this.busyT / this.busyMax : 0; }

  popup(text, color) { this.pop = { text, color: color || '#ffffff' }; this.popT = 1.1; }

  draw(ctx) {
    super.draw(ctx);
    if (this.hold) drawArt(ctx, this.hold, this.x - 4, this.y - 26, 1);
    if (this.busyT > 0 && this.busyKind) {
      const w = 12;
      px(ctx, this.x - w / 2 - 1, this.y - 20, w + 2, 4, '#15121c');
      px(ctx, this.x - w / 2, this.y - 19, Math.round(w * this.busyProgress), 2, '#ffd34d');
    }
  }
}
