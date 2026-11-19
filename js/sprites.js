/* ===========================================================
   Egg Token Demo — สไปรต์
   ตัวละครวาดจากสี่เหลี่ยมพิกเซล ของใช้ในร้านวาดจากตาราง 8x8
   ไม่มีไฟล์ภาพภายนอก เปิดจากไฟล์ตรง ๆ ได้เลย
   =========================================================== */

function px(ctx, x, y, w, h, c) {
  if (!c) return;
  ctx.fillStyle = c;
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
}

function shade(hex, amt) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(s => s + s).join('') : h, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.max(0, Math.min(255, r + amt));
  g = Math.max(0, Math.min(255, g + amt));
  b = Math.max(0, Math.min(255, b + amt));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* ---------- ตัวละคร 16x16 เท้าอยู่ขอบล่าง ---------- */
/* facing: 'down' | 'up' | 'left' | 'right'   frame: 0|1 (ขาสลับ) */
function drawPerson(ctx, x, y, pal, facing, frame, opt) {
  opt = opt || {};
  const dark = '#1b1620';
  const skin = pal.skin, hair = pal.hair, shirt = pal.shirt, pants = pal.pants;
  const side = facing === 'left' || facing === 'right';
  const bob = frame ? 1 : 0;

  // เงา
  ctx.globalAlpha = 0.18;
  px(ctx, x + 4, y + 15, 8, 1, '#000');
  ctx.globalAlpha = 1;

  // ขา
  const legY = y + 12 - bob;
  if (frame === 0) {
    px(ctx, x + 5, legY, 2, 3 + bob, pants);
    px(ctx, x + 9, legY, 2, 3 + bob, pants);
  } else {
    px(ctx, x + 4, legY, 2, 3 + bob, pants);
    px(ctx, x + 10, legY, 2, 3 + bob, pants);
  }
  px(ctx, x + 4, y + 15, 3, 1, dark);
  px(ctx, x + 9, y + 15, 3, 1, dark);

  // ลำตัว
  const bodyY = y + 7 - bob;
  px(ctx, x + 4, bodyY, 8, 5, shirt);
  px(ctx, x + 3, bodyY + 1, 1, 3, shade(shirt, -22));   // แขนซ้าย
  px(ctx, x + 12, bodyY + 1, 1, 3, shade(shirt, -22));  // แขนขวา
  if (opt.apron) {
    px(ctx, x + 5, bodyY + 2, 6, 3, shade(shirt, 52));
    px(ctx, x + 6, bodyY + 1, 4, 1, shade(shirt, 52));
  }
  if (opt.vest) {
    px(ctx, x + 4, bodyY, 2, 5, opt.vest);
    px(ctx, x + 10, bodyY, 2, 5, opt.vest);
  }

  // หัว
  const headY = y + 2 - bob;
  px(ctx, x + 4, headY, 8, 6, skin);
  px(ctx, x + 4, headY - 1, 8, 2, hair);
  if (side) {
    px(ctx, facing === 'left' ? x + 4 : x + 11, headY, 1, 4, hair);
  } else {
    px(ctx, x + 3, headY, 1, 4, hair);
    px(ctx, x + 12, headY, 1, 4, hair);
  }

  // หน้า
  if (facing === 'down') {
    px(ctx, x + 6, headY + 3, 1, 1, dark);
    px(ctx, x + 9, headY + 3, 1, 1, dark);
    if (opt.happy) px(ctx, x + 7, headY + 5, 2, 1, dark);
  } else if (facing === 'left') {
    px(ctx, x + 5, headY + 3, 1, 1, dark);
  } else if (facing === 'right') {
    px(ctx, x + 10, headY + 3, 1, 1, dark);
  }

  // หมวกกันน็อกไรเดอร์
  if (opt.helmet) {
    px(ctx, x + 3, headY - 2, 10, 4, opt.helmet);
    px(ctx, x + 3, headY + 1, 10, 1, shade(opt.helmet, -40));
    if (facing === 'down') px(ctx, x + 5, headY + 2, 6, 2, '#1d2b26');
  }
}

/* ---------- ของในร้าน ตาราง 8x8 ---------- */
const ART = {
  cup: [
    '........',
    '.wwwwww.',
    '.wkkkkw.',
    '.wwwwww.',
    '..wwww..',
    '..wwww..',
    '..wwww..',
    '...ww...'
  ],
  bowl: [
    '........',
    '..nnnn..',
    '.nnrnnn.',
    'wwwwwwww',
    'wkkkkkkw',
    '.wwwwww.',
    '..wwww..',
    '........'
  ],
  burger: [
    '........',
    '..bbbb..',
    '.bbbbbb.',
    '.gggggg.',
    '.kkkkkk.',
    '.rrrrrr.',
    '.bbbbbb.',
    '........'
  ],
  coin: [
    '..yyyy..',
    '.yooooy.',
    'yooyyooy',
    'yoyooyoy',
    'yoyooyoy',
    'yooyyooy',
    '.yooooy.',
    '..yyyy..'
  ],
  crate: [
    'kkkkkkkk',
    'kwwwwwwk',
    'kwkwwkwk',
    'kwwkkwwk',
    'kwwkkwwk',
    'kwkwwkwk',
    'kwwwwwwk',
    'kkkkkkkk'
  ],
  ticket: [
    '........',
    '.wwwwww.',
    '.wkkkkw.',
    '.wwwwww.',
    '.wkkkkw.',
    '.wwwwww.',
    '.wkkwww.',
    '........'
  ],
  bag: [
    '..k..k..',
    '..k..k..',
    '.bbbbbb.',
    '.bwwwwb.',
    '.bwwwwb.',
    '.bwwwwb.',
    '.bbbbbb.',
    '........'
  ]
};

const ART_PAL = {
  cup: { w: '#f6f6f6', k: '#6b4226' },
  bowl: { n: '#f4e2a8', r: '#d64545', w: '#f1f1f1', k: '#c9763d' },
  burger: { b: '#d8973c', g: '#5ea65e', k: '#8a4b2a', r: '#e0574d' },
  coin: { y: '#ffd34d', o: '#e0a21a' },
  crate: { k: '#8a5a31', w: '#c08a52' },
  ticket: { w: '#fdfdfd', k: '#8f8f8f' },
  bag: { k: '#8a6a3a', b: '#d9b382', w: '#f0dcbb' }
};

function drawArt(ctx, name, x, y, scale, palOverride) {
  const rows = ART[name];
  if (!rows) return;
  const pal = Object.assign({}, ART_PAL[name], palOverride || {});
  const s = scale || 1;
  for (let r = 0; r < rows.length; r++) {
    const line = rows[r];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '.') continue;
      px(ctx, x + c * s, y + r * s, s, s, pal[ch]);
    }
  }
}

/* ---------- มอเตอร์ไซค์ไรเดอร์ 12x8 ---------- */
function drawBike(ctx, x, y, color) {
  const k = '#1d1d22';
  px(ctx, x + 3, y + 1, 6, 3, color);
  px(ctx, x + 2, y + 2, 2, 2, shade(color, -30));
  px(ctx, x + 8, y + 2, 3, 1, shade(color, 30));
  px(ctx, x + 1, y + 4, 3, 3, k);
  px(ctx, x + 8, y + 4, 3, 3, k);
  px(ctx, x + 2, y + 5, 1, 1, '#777');
  px(ctx, x + 9, y + 5, 1, 1, '#777');
  px(ctx, x + 4, y + 4, 4, 1, k);
}

/* ---------- แถบความอดทน ---------- */
function drawBar(ctx, x, y, w, v, pal) {
  const h = 3;
  px(ctx, x - 1, y - 1, w + 2, h + 2, '#15121c');
  px(ctx, x, y, w, h, '#4a4458');
  const col = v > 0.55 ? '#49c56a' : v > 0.28 ? '#f0c13b' : '#e2544a';
  px(ctx, x, y, Math.max(0, Math.round(w * v)), h, col);
}
