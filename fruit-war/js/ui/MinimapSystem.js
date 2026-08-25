import { SHOPS } from "../data/shopData.js";
import { NPC_LIST } from "../data/npcData.js";

const MAP_SIZE = 180;
const ISLAND_R = 60;
const SCALE = MAP_SIZE / (ISLAND_R * 2 + 10);
const CENTER = MAP_SIZE / 2;

const ZONES = [
  { x: 0, z: -33, r: 17, color: "#4a7c59", name: "城鎮" },
  { x: -30, z: -26, r: 15, color: "#6b8f3c", name: "果園" },
  { x: -20, z: 0, r: 14, color: "#c97b3a", name: "美食街" },
  { x: 20, z: 0, r: 14, color: "#7b5ea7", name: "商業街" },
  { x: 26, z: -22, r: 16, color: "#8b4040", name: "競技場" },
  { x: 31, z: 23, r: 12, color: "#2d5a3a", name: "森林" },
  { x: 0, z: 48, r: 18, color: "#d4b96a", name: "海灘" },
  { x: -41, z: 41, r: 15, color: "#5a7a8a", name: "港口" },
];

const ROADS = [
  { x1: -11, z1: 0, x2: -27, z2: 0 },
  { x1: 11, z1: 0, x2: 27, z2: 0 },
  { x1: 0, z1: -11, x2: 0, z2: -25 },
  { x1: 0, z1: 11, x2: 0, z2: 36 },
  { x1: 9.5, z1: -9.5, x2: 19, z2: -17 },
  { x1: -9.5, z1: -9.5, x2: -23, z2: -19 },
  { x1: 9.5, z1: 9.5, x2: 23, z2: 20 },
  { x1: -8, z1: 19, x2: -31, z2: 33 },
];

function toMapX(x) { return CENTER + x * SCALE; }
function toMapY(z) { return CENTER + z * SCALE; }

export class MinimapSystem {
  constructor() {
    this.canvas = document.getElementById("minimap");
    this.ctx = this.canvas.getContext("2d");
    this._drawStatic();
  }

  _drawStatic() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);

    ctx.fillStyle = "rgba(15,25,35,0.9)";
    ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

    ctx.beginPath();
    ctx.arc(CENTER, CENTER, ISLAND_R * SCALE, 0, Math.PI * 2);
    ctx.fillStyle = "#3a6b35";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(CENTER, CENTER, ISLAND_R * SCALE + 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#2f86c9";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(180,160,120,0.5)";
    for (const road of ROADS) {
      ctx.beginPath();
      ctx.moveTo(toMapX(road.x1), toMapY(road.z1));
      ctx.lineTo(toMapX(road.x2), toMapY(road.z2));
      ctx.stroke();
    }

    for (const zone of ZONES) {
      ctx.beginPath();
      ctx.arc(toMapX(zone.x), toMapY(zone.z), zone.r * SCALE, 0, Math.PI * 2);
      ctx.fillStyle = zone.color + "40";
      ctx.fill();
      ctx.strokeStyle = zone.color + "80";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  tick(playerPos, npcs, minutes) {
    this._drawStatic();
    const ctx = this.ctx;

    for (const npc of npcs) {
      if (!npc.group.visible) continue;
      const nx = toMapX(npc.group.position.x);
      const ny = toMapY(npc.group.position.z);
      ctx.beginPath();
      ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#aaffaa";
      ctx.fill();
    }

    for (const shop of SHOPS) {
      const sx = toMapX(shop.x);
      const sy = toMapY(shop.z);
      ctx.fillStyle = "#ffcc44";
      ctx.fillRect(sx - 2, sy - 2, 4, 4);
    }

    const px = toMapX(playerPos.x);
    const py = toMapY(playerPos.z);

    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#ff6b6b";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6b6b";
    ctx.fill();
  }
}
