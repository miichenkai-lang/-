export const MOON_NPCS = [
  {
    id: "astronaut",
    name: "宇航員蘋果",
    fruit: "apple",
    speed: 1.5,
    home: { x: -3, z: -12 },
    schedule: [
      { at: 0, x: -3, z: -12, face: 0, act: "work" },
      { at: 1440, x: -3, z: -12, face: 0, act: "work" },
    ],
    lines: [
      "歡迎來到月球基地！這裡是果汁島的太空前哨站。",
      "低重力環境下，跳躍會特別高喔！好好享受吧。",
      "月球表面的坑洞是數百萬年前隕石撞擊形成的。",
    ],
  },
  {
    id: "alien",
    name: "外星人咕嚕",
    fruit: "grape",
    speed: 2,
    home: { x: 5, z: -8 },
    schedule: [
      { at: 0, x: 5, z: -8, face: Math.PI, act: "walk" },
      { at: 600, x: -8, z: -5, face: 0, act: "walk" },
      { at: 900, x: 10, z: -15, face: Math.PI * 0.5, act: "walk" },
      { at: 1200, x: 5, z: -8, face: 0, act: "rest" },
    ],
    lines: [
      "咕嚕咕嚕！……啊，你聽得懂我說話嗎？",
      "我的家鄉在仙女座星系，偶爾來月球度假。",
      "你們果汁島的水果真好吃，可以帶一些回去嗎？",
    ],
  },
  {
    id: "scientist",
    name: "科學家博士",
    fruit: "lemon",
    speed: 1.2,
    home: { x: -6, z: -14 },
    schedule: [
      { at: 0, x: 0, z: -10, face: 0, act: "work" },
      { at: 720, x: -5, z: -8, face: Math.PI * 0.5, act: "walk" },
      { at: 900, x: 0, z: -10, face: 0, act: "work" },
      { at: 1320, x: -6, z: -14, face: 0, act: "rest" },
    ],
    lines: [
      "我是負責月球基地研究的科學家。",
      "低重力環境會讓你的跳躍高度翻倍！",
      "月球上沒有大氣層，所以背景可以看到銀河。",
    ],
  },
];

export const MOON_SHOPS = [
  {
    id: "space_shop",
    name: "太空商店",
    x: 6,
    z: -10,
    radius: 2.5,
    items: [
      { id: "moon_shield", icon: "🛡️", name: "月球護盾", desc: "防禦 +60%（90 秒）", price: 30, effect: { name: "月球護盾", icon: "🛡️", duration: 90, defenseMul: 1.6 } },
      { id: "star_boots", icon: "👢", name: "星辰之靴", desc: "速度 +50%（60 秒）", price: 28, effect: { name: "星辰之靴", icon: "👢", duration: 60, speedMul: 1.5 } },
      { id: "galaxy_potion", icon: "🧪", name: "銀河藥水", desc: "HP 全滿 + 攻擊 +40%（60 秒）", price: 45, effect: { heal: 999, name: "銀河藥水", icon: "🧪", duration: 60, attackMul: 1.4 } },
    ],
  },
];
