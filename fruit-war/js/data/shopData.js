export const START_COINS = 100;
export const DAILY_ALLOWANCE = 30;

export const SHOPS = [
  {
    id: "breakfast",
    name: "早餐店",
    x: -14,
    z: -2.3,
    radius: 2.2,
    items: [
      { id: "juice_bread", icon: "🍞", name: "果汁麵包", desc: "回復 40 HP", price: 15, effect: { heal: 40 } },
      { id: "omelette", icon: "🍳", name: "水果蛋餅", desc: "回復 25 HP", price: 10, effect: { heal: 25 } },
    ],
  },
  {
    id: "drinks",
    name: "飲料店",
    x: -17.5,
    z: -2.3,
    radius: 2.2,
    items: [
      { id: "sparkling", icon: "⚡", name: "檸檬氣泡水", desc: "速度 +25%（60 秒）", price: 12, effect: { name: "檸檬氣泡水", icon: "⚡", duration: 60, speedMul: 1.25 } },
      { id: "honey_tea", icon: "🍵", name: "蜂蜜綠茶", desc: "回復 15 HP", price: 8, effect: { heal: 15 } },
    ],
  },
  {
    id: "icecream",
    name: "冰淇淋店",
    x: -21,
    z: -2.3,
    radius: 2.2,
    items: [
      { id: "mango_ice", icon: "🍦", name: "芒果冰淇淋", desc: "回復 30 HP、速度 +15%（30 秒）", price: 14, effect: { heal: 30, name: "芒果冰淇淋", icon: "🍦", duration: 30, speedMul: 1.15 } },
    ],
  },
  {
    id: "snacks",
    name: "小吃攤",
    x: -24.5,
    z: -2.3,
    radius: 2.2,
    items: [
      { id: "skewer", icon: "🍖", name: "烤水果串", desc: "攻擊 +30%（60 秒）", price: 16, effect: { name: "烤水果串", icon: "🍖", duration: 60, attackMul: 1.3 } },
    ],
  },
  {
    id: "dumplings",
    name: "點心攤",
    x: -15.5,
    z: 2.3,
    radius: 2.2,
    items: [
      { id: "dumpling", icon: "🥟", name: "手工水餃", desc: "防禦 +35%（60 秒）", price: 15, effect: { name: "手工水餃", icon: "🥟", duration: 60, defenseMul: 1.35 } },
    ],
  },
  {
    id: "juicebar",
    name: "果汁吧",
    x: -19,
    z: 2.3,
    radius: 2.2,
    items: [
      { id: "mixed_juice", icon: "🧃", name: "綜合果汁", desc: "回復 50 HP", price: 18, effect: { heal: 50 } },
    ],
  },
  {
    id: "fruitstring",
    name: "水果串",
    x: -22.5,
    z: 2.3,
    radius: 2.2,
    items: [
      { id: "fruit_combo", icon: "🍓", name: "綜合水果串", desc: "攻擊 +20%、防禦 +20%（45 秒）", price: 17, effect: { name: "綜合水果串", icon: "🍓", duration: 45, attackMul: 1.2, defenseMul: 1.2 } },
    ],
  },
  {
    id: "dessert",
    name: "甜品屋",
    x: -26,
    z: 2.3,
    radius: 2.2,
    items: [
      { id: "sundae", icon: "🍨", name: "芒果聖代", desc: "回復 45 HP", price: 18, effect: { heal: 45 } },
    ],
  },
  {
    id: "restaurant",
    name: "果汁餐廳",
    x: -30,
    z: 2.6,
    radius: 2.8,
    items: [
      { id: "feast", icon: "🍽️", name: "果汁大餐", desc: "HP 全滿、三能力 +20%（90 秒）", price: 40, effect: { heal: 999, name: "果汁大餐", icon: "🍽️", duration: 90, speedMul: 1.2, attackMul: 1.2, defenseMul: 1.2 } },
    ],
  },
  {
    id: "itemshop",
    name: "道具店",
    x: 27,
    z: -1.5,
    radius: 2.5,
    items: [
      { id: "jelly_shield", icon: "🛡️", name: "果凍護盾", desc: "防禦 +50%（90 秒）", price: 25, effect: { name: "果凍護盾", icon: "🛡️", duration: 90, defenseMul: 1.5 } },
      { id: "energy_jelly", icon: "💥", name: "能量果凍", desc: "速度 +40%（60 秒）", price: 22, effect: { name: "能量果凍", icon: "💥", duration: 60, speedMul: 1.4 } },
    ],
  },
];
