/* ===========================================================
   Egg Token Demo — config
   ค่าคงที่ ประเภทร้าน ทำเล ธีม และสคริปต์ 7 วัน
   =========================================================== */

const TILE = 16;
const COLS = 12;
const ROWS = 13;            // แถว 12 = นอกจอ ใช้เป็นทางเข้า-ออก
const VIEW = TILE * COLS;   // 192 px

/* ---------- ประเภทร้าน ---------- */
const SHOPS = {
  coffee: {
    key: 'coffee', name: 'ร้านกาแฟ', icon: '☕',
    product: 'กาแฟ', price: 65, prep: 1.8, item: 'cup',
    s2: 'เครื่องกาแฟ', s3: 'จุดหยิบแก้ว',
    s2hint: 'กดเริ่มชงล่วงหน้าได้ ถ้าเครื่องว่าง',
    preMake: true,
    upgrade: { key: 'machine2', label: 'เครื่องกาแฟตัวที่ 2', cost: 900, wage: 0 },
    ing: [
      { key: 'a', name: 'เมล็ดกาแฟ', cost: 12, start: 12 },
      { key: 'b', name: 'นม', cost: 8, start: 12 }
    ]
  },
  ramen: {
    key: 'ramen', name: 'ร้านราเมง', icon: '🍜',
    product: 'ราเมง', price: 85, prep: 2.3, item: 'bowl',
    s2: 'ช่องส่งตั๋ว', s3: 'ช่องอาหารออก',
    s2hint: 'ส่งตั๋วเข้าครัวได้เมื่อมีออเดอร์',
    preMake: false,
    upgrade: { key: 'cook2', label: 'คนครัวคนที่ 2', cost: 400, wage: 150 },
    ing: [
      { key: 'a', name: 'เส้น', cost: 14, start: 12 },
      { key: 'b', name: 'ลูกชิ้น', cost: 12, start: 12 }
    ]
  },
  burger: {
    key: 'burger', name: 'ร้านเบอร์เกอร์', icon: '🍔',
    product: 'เบอร์เกอร์', price: 95, prep: 2.1, item: 'burger',
    s2: 'ช่องส่งตั๋ว', s3: 'ช่องอาหารออก',
    s2hint: 'ส่งตั๋วเข้าครัวได้เมื่อมีออเดอร์',
    preMake: false,
    upgrade: { key: 'cook2', label: 'คนครัวคนที่ 2', cost: 400, wage: 150 },
    ing: [
      { key: 'a', name: 'ขนมปัง', cost: 10, start: 12 },
      { key: 'b', name: 'แพตตี้', cost: 20, start: 12 }
    ]
  }
};

/* ---------- ทำเล ----------
   บรีฟยังไม่ล็อกผลของแต่ละทำเล ที่ใส่ไว้คือค่าเริ่มต้นแบบอ่อน ๆ
   ปรับได้ที่ flow (จำนวนลูกค้า) และ note (ข้อความอธิบาย)      */
const LOCATIONS = {
  office: { key: 'office', name: 'ใกล้ออฟฟิศ', flow: 1.0, note: 'คนทำงานมาเป็นช่วง ๆ สั่งง่าย' },
  community: { key: 'community', name: 'ใกล้ชุมชน', flow: 0.9, note: 'ลูกค้าสม่ำเสมอ ไม่กระชาก' },
  mall: { key: 'mall', name: 'ในห้างสรรพสินค้า', flow: 1.15, note: 'คนเยอะกว่า แต่มากันเป็นกลุ่ม' }
};

/* ---------- ธีม ----------
   สีร้าน สีตัวละคร ขนาดกลุ่มลูกค้า และความอดทน      */
const THEMES = {
  modern: {
    key: 'modern', name: 'โมเดิร์น',
    desc: 'ร้านโทนขาวดำ ตัวละครสีปกติ ลูกค้ามาเดี่ยว สั่งง่าย อดทนสูง',
    group: [1, 1], patience: 1.25,
    pal: {
      floor: '#e9e9e9', floorAlt: '#dedede', rug: '#d2d2d2',
      wall: '#2f2f2f', wallTop: '#404040',
      counter: '#f7f7f7', counterEdge: '#8d8d8d',
      machine: '#4b4b4b', machineLit: '#9f9f9f',
      accent: '#141414', accent2: '#6b6b6b',
      glass: '#cfd6d8'
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
    key: 'sweet', name: 'หวาน',
    desc: 'ร้านชมพูอ่อน ตัวละครพาสเทล ลูกค้ามักมาคู่ รอได้ไม่นาน',
    group: [2, 2], patience: 0.85,
    pal: {
      floor: '#ffeef5', floorAlt: '#ffe2ee', rug: '#ffd6e6',
      wall: '#f6b6ce', wallTop: '#ffc9dc',
      counter: '#fff7fb', counterEdge: '#e79ab8',
      machine: '#d98ab0', machineLit: '#ffd3e6',
      accent: '#ff6fa5', accent2: '#c77fa6',
      glass: '#ffe7f1'
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
    key: 'cyber', name: 'ไซเบอร์พังก์',
    desc: 'ร้านและตัวละครสีฉูดฉาด วัยรุ่นมากันกลุ่มละ 4–6 คน',
    group: [4, 6], patience: 1.0,
    pal: {
      floor: '#1d1336', floorAlt: '#251845', rug: '#2e1d58',
      wall: '#0e0a1f', wallTop: '#1a1136',
      counter: '#2b1b52', counterEdge: '#00e5ff',
      machine: '#3a2070', machineLit: '#ff2fd0',
      accent: '#00e5ff', accent2: '#ff2fd0',
      glass: '#163a4d'
    },
    ui: { bg: '#140e28', panel: '#1e1540', text: '#e8f6ff', sub: '#9b8ccc', accent: '#00e5ff', line: '#33265e' },
    people: [
      { skin: '#e8b48a', hair: '#00e5ff', shirt: '#ff2fd0', pants: '#241a44' },
      { skin: '#b9794f', hair: '#b4ff3b', shirt: '#6a2fff', pants: '#1e1838' },
      { skin: '#f2cfae', hair: '#ff6a3d', shirt: '#00ffa3', pants: '#2a2050' },
      { skin: '#8d5a3b', hair: '#ffe14d', shirt: '#2f6bff', pants: '#1b1736' }
    ]
  }
};

/* สีชุดพนักงานของร้าน (ลูกจ้าง) และไรเดอร์ */
const STAFF_PAL = { skin: '#eac39b', hair: '#241a12', shirt: '#2f6f8f', pants: '#2b2f36', apron: true };
const OWNER_PAL = { skin: '#f3cba4', hair: '#3a2416', shirt: '#b7452f', pants: '#2b2f36', apron: true };
const RIDER_PAL = { skin: '#e0b183', hair: '#1c1c1c', shirt: '#17a34a', pants: '#1f2a24', helmet: '#17a34a' };

/* ---------- ค่าเกม ---------- */
const RULES = {
  startCash: 3000,
  dayLength: 15,          // วินาทีต่อวัน เฉพาะช่วงเปิดร้าน
  wageBase: 120,          // ค่าแรงต่อวัน พนักงานยังไม่เทรน (ขนาดเดโม)
  wageTrained: 180,       // หลังเทรน
  trainCost: 300,
  deliveryFee: 150,
  tokensPerDay: 3,
  queuePatience: 8,       // วินาที ก่อนลูกค้าเดินออกจากคิวสั่ง (คูณด้วยค่าธีม)
  waitPatience: 9,        // วินาที ก่อนลูกค้าเดินออกจากจุดรอรับ
  chatRefill: 0.55,       // คุยกับลูกค้า 1 ครั้ง เติมความอดทนเท่าไร
  takeOrderTime: 0.5,
  pickTime: 0.3,
  placeTime: 0.25,
  collectTime: 0.3,
  payTime: 0.5,
  trayMax: 3,
  counterMax: 3,
  walkSpeed: 70,          // px ต่อวินาที
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
