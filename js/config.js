/* ===========================================================
   Egg Token Demo — config
   ค่าคงที่ ประเภทร้าน ทำเล ธีม และสคริปต์ 7 วัน
   =========================================================== */

const TILE = 16;
const COLS = 12;
const ROWS = 13;            // แถว 12 = นอกจอ ใช้เป็นทางเข้า-ออก
const VIEW = TILE * COLS;   // 192 px

/* ---------- โหมดการเล่น ----------
   เดโม = รอบสั้น ไว้โชว์ให้จบใน 3 นาที
   ปกติ = วันละ 2 นาที ลูกค้าเยอะขึ้นตามเวลา ค่าแรงกับค่าเช่าคิดเต็มวัน
   scale ใช้คูณค่าใช้จ่ายรายวัน ให้สัดส่วนกำไรขาดทุนเท่ากันทั้งสองโหมด   */
const MODES = {
  demo: {
    key: 'demo', name: 'เดโม', time: '15 วินาที/วัน',
    desc: 'เล่นจบ 7 วันในไม่กี่นาที เหมาะกับการโชว์',
    dayLength: 15, grace: 6, tokens: 3, headScale: 1, scale: 1
  },
  normal: {
    key: 'normal', name: 'ปกติ', time: '2 นาที/วัน',
    desc: 'มีเวลาจัดคิวจริง ลูกค้าเยอะขึ้นตามเวลาที่เปิดร้าน',
    dayLength: 120, grace: 20, tokens: 8, headScale: 6, scale: 6
  }
};

/* ---------- ประเภทร้าน ----------
   setup = เงินลงทุนอุปกรณ์หน้าร้านครั้งแรก
   price = ราคาต่อชิ้น · ลูกค้า 1 คนสั่งได้ 1–3 ชิ้นต่อออเดอร์   */
const SHOPS = {
  coffee: {
    key: 'coffee', name: 'ร้านกาแฟ', icon: '☕',
    product: 'กาแฟ', price: 95, prep: 1.5, item: 'cup',
    setup: 36000, setupNote: 'เครื่องชง เครื่องบด ตู้แช่นม',
    s2: 'เครื่องกาแฟ', s3: 'จุดหยิบแก้ว',
    s2hint: 'กดเริ่มชงล่วงหน้าได้ ถ้าเครื่องว่าง',
    preMake: true,
    upgrade: { key: 'machine2', label: 'เครื่องกาแฟตัวที่ 2', cost: 6000, wage: 0 },
    ing: [
      { key: 'a', name: 'เมล็ดกาแฟ', cost: 14, start: 24 },
      { key: 'b', name: 'นม', cost: 9, start: 24 }
    ]
  },
  ramen: {
    key: 'ramen', name: 'ร้านราเมง', icon: '🍜',
    product: 'ราเมง', price: 110, prep: 1.9, item: 'bowl',
    setup: 42000, setupNote: 'เตา หม้อต้ม ระบบระบายควัน',
    s2: 'ช่องส่งตั๋ว', s3: 'ช่องอาหารออก',
    s2hint: 'ส่งตั๋วเข้าครัวได้เมื่อมีออเดอร์',
    preMake: false,
    upgrade: { key: 'cook2', label: 'คนครัวคนที่ 2', cost: 2500, wage: 250 },
    ing: [
      { key: 'a', name: 'เส้น', cost: 17, start: 24 },
      { key: 'b', name: 'ลูกชิ้น', cost: 14, start: 24 }
    ]
  },
  burger: {
    key: 'burger', name: 'ร้านเบอร์เกอร์', icon: '🍔',
    product: 'เบอร์เกอร์', price: 105, prep: 1.8, item: 'burger',
    setup: 39000, setupNote: 'เตาย่าง ตู้แช่ เครื่องอุ่นขนมปัง',
    s2: 'ช่องส่งตั๋ว', s3: 'ช่องอาหารออก',
    s2hint: 'ส่งตั๋วเข้าครัวได้เมื่อมีออเดอร์',
    preMake: false,
    upgrade: { key: 'cook2', label: 'คนครัวคนที่ 2', cost: 2500, wage: 250 },
    ing: [
      { key: 'a', name: 'ขนมปัง', cost: 13, start: 24 },
      { key: 'b', name: 'แพตตี้', cost: 21, start: 24 }
    ]
  }
};

/* ---------- ทำเล ----------
   deposit = ค่าเซ้ง/มัดจำ จ่ายครั้งเดียวตอนตั้งร้าน
   rent    = ค่าเช่าต่อวัน หักตอนปิดบัญชีสิ้นวัน
   บรีฟยังไม่ล็อกผลอื่นของทำเล flow คือจำนวนลูกค้าเทียบกับฐาน   */
const LOCATIONS = {
  office: {
    key: 'office', name: 'ใกล้ออฟฟิศ', flow: 1.0,
    deposit: 20000, rent: 350,
    note: 'คนทำงานมาเป็นช่วง ๆ สั่งง่าย'
  },
  community: {
    key: 'community', name: 'ใกล้ชุมชน', flow: 0.9,
    deposit: 16000, rent: 250,
    note: 'ลูกค้าสม่ำเสมอ ไม่กระชาก ค่าเช่าถูกสุด'
  },
  mall: {
    key: 'mall', name: 'ในห้างสรรพสินค้า', flow: 1.15,
    deposit: 24000, rent: 500,
    note: 'คนเยอะกว่า แต่มากันเป็นกลุ่ม ค่าเช่าแพงสุด'
  }
};

/* ---------- ธีม ----------
   สีร้าน สีตัวละคร ขนาดกลุ่มลูกค้า และความอดทน      */
const THEMES = {
  modern: {
    key: 'modern', name: 'โมเดิร์น', setup: 18000,
    desc: 'ร้านโทนขาวดำ ตัวละครสีปกติ ลูกค้ามาเดี่ยว สั่งง่าย อดทนสูง',
    short: 'ขาวดำ · ลูกค้ามาเดี่ยว อดทนสูง',
    group: [1, 1], patience: 1.25,
    pal: {
      floor: '#e9e9e9', floorAlt: '#dedede', rug: '#d2d2d2',
      wall: '#2f2f2f', wallTop: '#404040',
      counter: '#f7f7f7', counterEdge: '#8d8d8d',
      machine: '#4b4b4b', machineLit: '#9f9f9f',
      accent: '#141414', accent2: '#6b6b6b',
      glass: '#cfd6d8', plant: '#4a7a52', pot: '#8a6a52', wood: '#b08968', neon: '#f0c13b'
    },
    ui: { bg: '#f3f3f3', panel: '#ffffff', text: '#161616', sub: '#6a6a6a', accent: '#161616', line: '#d8d8d8' },
    people: [
      { skin: '#f0c49a', hair: '#2b2118', shirt: '#44506b', pants: '#2f3542' },
      { skin: '#d9a271', hair: '#1b1b1b', shirt: '#7a7f87', pants: '#3a3f46' },
      { skin: '#f7d7b5', hair: '#5a3a22', shirt: '#9d4b4b', pants: '#30343b' },
      { skin: '#c98a5e', hair: '#171717', shirt: '#3f6f5a', pants: '#2b2f36' }
    ]
  },
  sweet: {
    key: 'sweet', name: 'หวาน', setup: 20000,
    desc: 'ร้านชมพูอ่อน ตัวละครพาสเทล ลูกค้ามักมาคู่ รอได้ไม่นาน',
    short: 'ชมพูพาสเทล · มาคู่ รอไม่นาน',
    group: [2, 2], patience: 0.85,
    pal: {
      floor: '#ffeef5', floorAlt: '#ffe2ee', rug: '#ffd6e6',
      wall: '#f6b6ce', wallTop: '#ffc9dc',
      counter: '#fff7fb', counterEdge: '#e79ab8',
      machine: '#d98ab0', machineLit: '#ffd3e6',
      accent: '#ff6fa5', accent2: '#c77fa6',
      glass: '#ffe7f1', plant: '#7fbf87', pot: '#e0a6bd', wood: '#e8c7a8', neon: '#ff9ec4'
    },
    ui: { bg: '#fff2f7', panel: '#ffffff', text: '#5b3246', sub: '#a4778a', accent: '#ff6fa5', line: '#ffd8e7' },
    people: [
      { skin: '#ffe0c8', hair: '#c98fb0', shirt: '#ffc2d8', pants: '#e3b7cf' },
      { skin: '#f9d3b4', hair: '#a9c7e8', shirt: '#cfe4ff', pants: '#b9c9e0' },
      { skin: '#ffd9bd', hair: '#e3b06b', shirt: '#fff0b8', pants: '#e2cf96' },
      { skin: '#f3c9a8', hair: '#b7a2d8', shirt: '#ded0ff', pants: '#bdaee0' }
    ]
  },
  cyber: {
    key: 'cyber', name: 'ไซเบอร์พังก์', setup: 22000,
    desc: 'ร้านและตัวละครสีฉูดฉาด วัยรุ่นมากันกลุ่มละ 4–6 คน',
    short: 'นีออน · มากลุ่มละ 4–6 คน',
    group: [4, 6], patience: 1.0,
    /* โทนมืดแบบ dark mode แต่ไม่ดำสนิท พื้นเป็นม่วงน้ำเงินกลาง ๆ
       ของทุกอย่างบนพื้นจึงยังตัดกันเห็นชัด */
    pal: {
      floor: '#2e2457', floorAlt: '#372b66', rug: '#4a3a8c',
      wall: '#1d1740', wallTop: '#2b2159',
      counter: '#3c2d75', counterEdge: '#49f2ff',
      machine: '#56399f', machineLit: '#ff7ae8',
      accent: '#49f2ff', accent2: '#ff6ae0',
      glass: '#2f6a86', plant: '#4dffbe', pot: '#6a51b8', wood: '#7a5bc4', neon: '#ffe14d',
      rim: '#dff2ff',      // ขอบเรืองแสงรอบตัวละคร ให้คนที่ขยับเด่นออกจากพื้น
      ink: '#140f2a'       // สีเส้นหน้าและรองเท้า เข้มกว่าพื้นชัดเจน
    },
    ui: { bg: '#1f1850', panel: '#2b2366', text: '#f3f8ff', sub: '#c0b2f0', accent: '#49f2ff', line: '#453a8c' },
    people: [
      { skin: '#f6c69c', hair: '#49f2ff', shirt: '#ff4fd8', pants: '#6a4fe0' },
      { skin: '#d08a5c', hair: '#c9ff4d', shirt: '#8a5cff', pants: '#2fd3e8' },
      { skin: '#ffdcba', hair: '#ff8a4d', shirt: '#45ffb8', pants: '#5a7cff' },
      { skin: '#a56a46', hair: '#ffe14d', shirt: '#4f9bff', pants: '#c25ce8' }
    ],
    /* ชุดเจ้าของ ลูกจ้าง และไรเดอร์ เปลี่ยนเป็นสีนีออนเฉพาะธีมนี้ */
    crew: {
      owner: { skin: '#f6cfa8', hair: '#ff5fa8', shirt: '#ff7a2f', pants: '#4a3f8c' },
      staff: { skin: '#f0cba6', hair: '#2a2340', shirt: '#2fd3e8', pants: '#3f3880' },
      rider: { skin: '#e8bd8d', hair: '#201d30', shirt: '#39ff88', pants: '#2f5a46', helmet: '#39ff88' }
    }
  }
};

/* สีชุดพนักงานของร้าน (ลูกจ้าง) และไรเดอร์ */
const STAFF_PAL = { skin: '#eac39b', hair: '#241a12', shirt: '#2f6f8f', pants: '#2b2f36', apron: true };
const OWNER_PAL = { skin: '#f3cba4', hair: '#3a2416', shirt: '#b7452f', pants: '#2b2f36', apron: true };
const RIDER_PAL = { skin: '#e0b183', hair: '#1c1c1c', shirt: '#17a34a', pants: '#1f2a24', helmet: '#17a34a' };

/* ชุดทีมงานของธีมนั้น ๆ ถ้าธีมไม่ได้กำหนดไว้ ใช้ชุดมาตรฐาน */
function crewPal(theme, who) {
  const base = who === 'owner' ? OWNER_PAL : who === 'staff' ? STAFF_PAL : RIDER_PAL;
  const over = theme && theme.crew && theme.crew[who];
  return over ? Object.assign({}, base, over) : base;
}

/* ---------- ค่าเกม ---------- */
const RULES = {
  startCash: 100000,      // เงินทุนตั้งต้น ก่อนหักค่าลงทุนตอนตั้งร้าน
  dayLength: 15,          // ค่าสำรอง ถ้าไม่ได้เลือกโหมด
  wageBase: 200,          // ค่าแรงต่อวัน พนักงานยังไม่เทรน
  wageTrained: 280,       // หลังเทรน
  trainCost: 1200,        // ค่าเทรน จ่ายครั้งเดียว
  deliveryFee: 600,       // ค่าสมัครเข้าระบบเดลิเวอรี จ่ายครั้งเดียว
  platformCut: 0.15,      // ค่าคอมแพลตฟอร์มเดลิเวอรี
  platformDelay: 1,       // เงินเดลิเวอรีเข้าช้ากว่า 1 วัน
  orderQtyWeights: [35, 30, 20, 15],  // โอกาสที่ลูกค้าจะสั่ง 1 / 2 / 3 / 4 ชิ้น
  queuePatience: 13,      // วินาที ก่อนลูกค้าเดินออกจากคิวสั่ง (คูณด้วยค่าธีม)
  waitPatience: 16,       // วินาที ก่อนลูกค้าเดินออกจากจุดรอรับ
  chatRefill: 0.55,       // คุยกับลูกค้า 1 ครั้ง เติมความอดทนเท่าไร
  takeOrderTime: 0.4,
  pickTime: 0.2,
  placeTime: 0.2,
  collectTime: 0.25,
  payTime: 0.4,
  trayMax: 3,
  counterMax: 3,
  walkSpeed: 95,          // px ต่อวินาที
  ratingMinReviews: 6
};

/* ---------- เส้นเรื่อง 7 วัน ---------- */
const DAYS = [
  {
    n: 1, title: 'เปิดร้านคนเดียว',
    intro: 'วันแรก ยังไม่มีใครช่วย เกมจะชี้ทีละจังหวะว่าให้กดตรงไหน',
    heads: 4, tutorial: true, calm: 1.9, decision: null
  },
  {
    n: 2, title: 'ลูกค้าเริ่มล้น',
    intro: 'ของที่สั่งไว้เมื่อคืนมาส่งระหว่างวัน ต้องเดินไปรับและจ่ายเงินเอง ช่วงนั้นคิวหน้าร้านจะเดินต่อ',
    heads: 8, calm: 1.25, delivery: true, decision: 'hire'
  },
  {
    n: 3, title: 'มีคนช่วยรับออเดอร์',
    intro: 'ถ้าจ้างไว้ พนักงานจะประจำแคชเชียร์ ลูกค้าพอ ๆ กับเมื่อวาน แต่รับออเดอร์ได้มากขึ้นถ้าจัดงานดี',
    heads: 9, decision: 'train'
  },
  {
    n: 4, title: 'ร้านเริ่มแบ่งงาน',
    intro: 'ถ้าเทรนแล้ว พนักงานช่วยทำ หยิบ และส่งมอบได้ ของมาส่งยังเป็นงานของเจ้าของ',
    heads: 10, delivery: true, decision: 'hire2'
  },
  {
    n: 5, title: 'เจ้าของมีเวลาดูลูกค้า',
    intro: 'ถ้าทีมครบ ลองแตะลูกค้าที่กำลังรอ เพื่อเข้าไปคุยและเติมความอดทน',
    heads: 11, chat: true, decision: 'delivery'
  },
  {
    n: 6, title: 'เดลิเวอรีเพิ่มงาน',
    intro: 'ไรเดอร์เข้าคิวเหมือนลูกค้าปกติ คิวแน่นขึ้น และเรตติ้งเริ่มแสดงแล้ว',
    heads: 13, riders: true, rating: true, delivery: true, decision: 'invest'
  },
  {
    n: 7, title: 'ตัดสินใจขยายกำลัง',
    intro: 'วันสุดท้ายของเดโม ดูว่าเงินสดกับเรตติ้งบอกคนละเรื่องยังไง',
    heads: 14, riders: true, rating: true, decision: 'final'
  }
];

/* ---------- กู้เงินเปิดสาขา 2 ----------
   ปลดล็อกตอนปิดร้านวันที่ 3 เพื่อให้มีเวลาเล่นสองสาขาจริง 4 วัน
   ธนาคารดูสองอย่าง: หลักประกัน (สินทรัพย์ในร้านเดิม + เงินสด) และเงินดาวน์   */
const BRANCH = {
  minDay: 3,                 // ต้องเปิดร้านเดิมมาแล้วกี่วัน
  downRate: 0.20,            // วางดาวน์เองกี่ % ของค่าเปิดสาขา
  collateralRate: 0.60,      // สินทรัพย์ + เงินสด ต้องไม่น้อยกว่า % นี้ของวงเงินกู้
  minCashAfter: 5000,        // วางดาวน์แล้วต้องเหลือเงินสดหมุนเวียนอย่างน้อยเท่านี้
  interest: 0.10,            // ดอกเบี้ยรวมตลอดสัญญา
  termDemo: 60,              // จำนวนงวด (วัน) โหมดเดโม
  termNormal: 20,            // จำนวนงวด โหมดปกติ
  depreciation: 0.02,        // ค่าเสื่อมสินทรัพย์ต่อวัน ใช้ตีมูลค่าหลักประกัน
  equipDiscount: 0.9,        // อุปกรณ์สาขาใหม่ถูกกว่าเดิมนิดหน่อย
  decorDiscount: 0.7,        // ตกแต่งถูกกว่าเพราะใช้แบบเดิม
  ramp: [0.7, 0.85, 1.0, 1.1],      // สาขาใหม่ค่อย ๆ มีลูกค้า ตามจำนวนวันที่เปิด
  staffFactor: [0.35, 0.7, 1.0],    // ไม่มีคน / 1 คน / 2 คน ทำได้กี่ส่วน
  staffMax: 2,
  ingredientRate: 0.26,      // ค่าวัตถุดิบคิดเป็นสัดส่วนของยอดขายสาขา
  avgQty: 2.15               // จำนวนชิ้นเฉลี่ยต่อออเดอร์ ใช้ประมาณยอดขายสาขา
};

/* ---------- E.Token ---------- */
const TOKEN_ACTIONS = [
  {
    key: 'order', name: 'ช่วยรับออเดอร์',
    desc: 'รับออเดอร์ของคิวที่รออยู่ให้ทันที ไม่ต้องเดินไปแคชเชียร์'
  },
  {
    key: 'stock', name: 'เตือนสต็อก',
    desc: 'ดูว่าของพอถึงสิ้นวันไหม และจดจำนวนที่ควรสั่งไว้ให้ตอนปิดร้าน'
  },
  {
    key: 'summary', name: 'สรุปยอดตอนนี้',
    desc: 'สรุปยอดขาย ลูกค้าที่เสิร์ฟได้ และคนที่กำลังจะเดินออก'
  }
];
