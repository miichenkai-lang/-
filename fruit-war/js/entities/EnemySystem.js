import * as THREE from "three";
import { FruitCharacter } from "./FruitCharacter.js";
import { FRUIT_TYPES } from "../data/fruits.js";

const ARENA_CENTER = { x: 26, z: -22 };
const ARENA_RADIUS = 12;
const ENEMY_TYPES = [
  { fruit: "apple", name: "蘋果兵", hp: 60, attack: 8, speed: 2.5, color: 0xe23b3b },
  { fruit: "banana", name: "香蕉忍者", hp: 45, attack: 12, speed: 3.5, color: 0xf7d548 },
  { fruit: "orange", name: "橘子射手", hp: 50, attack: 10, speed: 2.8, color: 0xf98d2b },
  { fruit: "grape", name: "葡萄法師", hp: 40, attack: 14, speed: 2.2, color: 0x8e44ad },
  { fruit: "strawberry", name: "草莓刺客", hp: 35, attack: 16, speed: 4, color: 0xe8394a },
];

function makeEnemyTag(name, colorHex) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const c = canvas.getContext("2d");
  c.fillStyle = "rgba(80,20,20,0.85)";
  c.beginPath();
  c.roundRect(8, 8, 240, 48, 14);
  c.fill();
  c.strokeStyle = `#${colorHex.toString(16).padStart(6, "0")}`;
  c.lineWidth = 4;
  c.stroke();
  c.fillStyle = "#ff6b6b";
  c.font = "bold 28px 'Microsoft JhengHei','PingFang TC',sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(name, 128, 33);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: true }));
  sprite.scale.set(1.5, 0.38, 1);
  return sprite;
}

class Enemy {
  constructor(typeDef, scene) {
    this.type = typeDef;
    this.hp = typeDef.hp;
    this.maxHp = typeDef.hp;
    this.attack = typeDef.attack;
    this.speed = typeDef.speed;
    this.alive = true;
    this.scene = scene;

    this.char = new FruitCharacter(typeDef.fruit);
    this.group = this.char.group;

    const angle = Math.random() * Math.PI * 2;
    const dist = 3 + Math.random() * (ARENA_RADIUS - 5);
    this.group.position.set(
      ARENA_CENTER.x + Math.cos(angle) * dist,
      0,
      ARENA_CENTER.z + Math.sin(angle) * dist
    );

    this.tag = makeEnemyTag(typeDef.name, typeDef.color);
    this.tag.position.y = 2.2;
    this.group.add(this.tag);

    this.hpBarBg = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.12),
      new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide })
    );
    this.hpBarBg.position.y = 2.55;
    this.hpBarBg.rotation.x = -Math.PI / 4;
    this.group.add(this.hpBarBg);

    this.hpBar = new THREE.Mesh(
      new THREE.PlaneGeometry(1.16, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xef5b5b, side: THREE.DoubleSide })
    );
    this.hpBar.position.y = 2.55;
    this.hpBar.position.z = 0.001;
    this.hpBar.rotation.x = -Math.PI / 4;
    this.group.add(this.hpBar);

    this.targetPos = null;
    this.wanderTimer = 0;
    this.attackCooldown = 0;
    this.hitFlash = 0;
    this.heading = 0;
  }

  update(dt, playerPos) {
    if (!this.alive) return;

    if (this.hitFlash > 0) {
      this.hitFlash -= dt;
      this.char.body.children.forEach((child) => {
        if (child.material && child.material.emissive) {
          child.material.emissiveIntensity = this.hitFlash > 0 ? 1 : 0;
        }
      });
    }

    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    const pos = this.group.position;
    const dToPlayer = Math.hypot(pos.x - playerPos.x, pos.z - playerPos.z);

    if (dToPlayer < 2.5 && this.attackCooldown <= 0) {
      this.attackCooldown = 1.5;
      this.char.animate(dt, 1.5);
      return { type: "attack", damage: this.attack };
    }

    if (dToPlayer < 8) {
      const dx = playerPos.x - pos.x;
      const dz = playerPos.z - pos.z;
      const d = Math.hypot(dx, dz);
      const step = Math.min(this.speed * dt, d - 1.5);
      if (step > 0) {
        pos.x += (dx / d) * step;
        pos.z += (dz / d) * step;
        this.heading = Math.atan2(dx, dz);
        this.char.animate(dt, 1);
      } else {
        this.char.animate(dt, 0);
      }
    } else {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0 || !this.targetPos) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 2 + Math.random() * (ARENA_RADIUS - 4);
        this.targetPos = new THREE.Vector3(
          ARENA_CENTER.x + Math.cos(angle) * dist,
          0,
          ARENA_CENTER.z + Math.sin(angle) * dist
        );
        this.wanderTimer = 2 + Math.random() * 3;
      }

      const dx = this.targetPos.x - pos.x;
      const dz = this.targetPos.z - pos.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.5) {
        const step = Math.min(this.speed * 0.5 * dt, d);
        pos.x += (dx / d) * step;
        pos.z += (dz / d) * step;
        this.heading = Math.atan2(dx, dz);
        this.char.animate(dt, 0.5);
      } else {
        this.wanderTimer = 0;
        this.char.animate(dt, 0);
      }
    }

    pos.x = Math.max(ARENA_CENTER.x - ARENA_RADIUS, Math.min(ARENA_CENTER.x + ARENA_RADIUS, pos.x));
    pos.z = Math.max(ARENA_CENTER.z - ARENA_RADIUS, Math.min(ARENA_CENTER.z + ARENA_RADIUS, pos.z));

    this.group.rotation.y = this.heading;
    this.hpBar.scale.x = Math.max(0, this.hp / this.maxHp);
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.hitFlash = 0.2;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.group.visible = false;
      return true;
    }
    return false;
  }

  distanceTo(v) {
    return Math.hypot(this.group.position.x - v.x, this.group.position.z - v.z);
  }
}

export class EnemySystem {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    this.spawnTimer = 0;
    this.maxEnemies = 5;
    this.spawnInterval = 8;
  }

  spawn() {
    if (this.enemies.filter((e) => e.alive).length >= this.maxEnemies) return;
    const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
    const enemy = new Enemy(type, this.scene);
    this.scene.add(enemy.group);
    this.enemies.push(enemy);
  }

  update(dt, playerPos) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawn();
      this.spawnTimer = this.spawnInterval;
    }

    const events = [];
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const result = enemy.update(dt, playerPos);
      if (result && result.type === "attack") {
        events.push({ enemy, ...result });
      }
    }
    return events;
  }

  checkHit(targetPos, damage) {
    const hits = [];
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const d = enemy.distanceTo(targetPos);
      if (d < 1.5) {
        const killed = enemy.takeDamage(damage);
        hits.push({ enemy, killed });
      }
    }
    return hits;
  }

  removeDead() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (!this.enemies[i].alive) {
        this.scene.remove(this.enemies[i].group);
        this.enemies.splice(i, 1);
      }
    }
  }
}
