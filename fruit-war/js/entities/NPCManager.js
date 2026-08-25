import * as THREE from "three";
import { FruitCharacter } from "./FruitCharacter.js";
import { FRUIT_TYPES } from "../data/fruits.js";
import { NPC_LIST } from "../data/npcData.js";
import { dampAngle } from "../utils/math.js";

function makeNameTag(name, colorHex) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const c = canvas.getContext("2d");
  c.fillStyle = "rgba(15,25,35,0.78)";
  c.beginPath();
  c.roundRect(8, 8, 240, 48, 14);
  c.fill();
  c.strokeStyle = `#${colorHex.toString(16).padStart(6, "0")}`;
  c.lineWidth = 4;
  c.stroke();
  c.fillStyle = "#ffffff";
  c.font = "bold 28px 'Microsoft JhengHei','PingFang TC',sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(name, 128, 33);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: true }));
  sprite.scale.set(1.7, 0.42, 1);
  return sprite;
}

const ACT_ICONS = {
  eat: "🍽️",
  work: "💼",
  shop: "🛒",
  rest: "💤",
  fish: "🎣",
  walk: "",
};

function makeActIcon() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sprite.scale.set(0.6, 0.6, 1);
  return { sprite, canvas, tex };
}

function updateActIcon(iconObj, act) {
  const { canvas, tex } = iconObj;
  const c = canvas.getContext("2d");
  c.clearRect(0, 0, 64, 64);
  const icon = ACT_ICONS[act];
  if (!icon) {
    tex.needsUpdate = true;
    return;
  }
  c.font = "48px serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(icon, 32, 32);
  tex.needsUpdate = true;
}

export class NPC {
  constructor(def, collisions) {
    this.def = def;
    this.collisions = collisions;
    this.char = new FruitCharacter(def.fruit);
    this.group = this.char.group;

    const start = def.schedule[0];
    this.group.position.set(start.x, 0, start.z);
    this.heading = start.face !== undefined ? start.face : 0;
    this.group.rotation.y = this.heading;

    this.speed = def.speed || 2.2;
    this.entry = null;
    this.visibleWindow = def.visibleWindow || null;

    const color = FRUIT_TYPES[def.fruit] ? FRUIT_TYPES[def.fruit].bodyColor : 0xffffff;
    const tag = makeNameTag(def.name, typeof color === "number" ? color : 0xffffff);
    tag.position.y = def.tagY || 2.05;
    this.group.add(tag);

    this.actIcon = makeActIcon();
    this.actIcon.sprite.position.y = (def.tagY || 2.05) + 0.5;
    this.group.add(this.actIcon.sprite);
    this.lastAct = null;
  }

  update(dt, minutes) {
    const m = ((minutes % 1440) + 1440) % 1440;

    if (this.visibleWindow) {
      const [from, to] = this.visibleWindow;
      const vis = m >= from || m < to;
      this.group.visible = vis;
      if (!vis) return;
    } else {
      this.group.visible = true;
    }

    const schedule = this.def.schedule;
    let entry = null;
    for (let i = schedule.length - 1; i >= 0; i--) {
      if (m >= schedule[i].at) {
        entry = schedule[i];
        break;
      }
    }

    if (!entry && this.def.home) {
      entry = { x: this.def.home.x, z: this.def.home.z, face: 0, act: "rest" };
    } else if (!entry) {
      entry = schedule[0];
    }
    this.entry = entry;

    const pos = this.group.position;
    const dx = entry.x - pos.x;
    const dz = entry.z - pos.z;
    const d = Math.hypot(dx, dz);

    if (d > 0.22) {
      const step = Math.min(this.speed * dt, d);
      pos.x += (dx / d) * step;
      pos.z += (dz / d) * step;
      this.heading = dampAngle(this.heading, Math.atan2(dx, dz), 10, dt);
      this.char.animate(dt, 1);
    } else {
      if (entry.face !== undefined) {
        this.heading = dampAngle(this.heading, entry.face, 8, dt);
      }
      this.char.animate(dt, 0);
    }

    if (this.collisions) {
      this.collisions.resolve(pos, 0.55);
    }

    const islandR = 58;
    const r = Math.hypot(pos.x, pos.z);
    if (r > islandR) {
      pos.x *= islandR / r;
      pos.z *= islandR / r;
    }

    this.group.rotation.y = this.heading;

    if (entry.act !== this.lastAct) {
      this.lastAct = entry.act;
      updateActIcon(this.actIcon, entry.act);
    }
  }

  distanceTo(v) {
    return Math.hypot(this.group.position.x - v.x, this.group.position.z - v.z);
  }
}

export class NPCManager {
  constructor(scene, collisions) {
    this.scene = scene;
    this.collisions = collisions;
    this.list = NPC_LIST.map((def) => new NPC(def, collisions));
    for (const npc of this.list) scene.add(npc.group);
  }

  update(dt, minutes) {
    for (const npc of this.list) npc.update(dt, minutes);
  }
}
