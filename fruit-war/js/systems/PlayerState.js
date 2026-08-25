import { START_COINS } from "../data/shopData.js";

export class PlayerState {
  constructor(def) {
    this.maxHp = def.maxHp;
    this.hp = def.maxHp;
    this.coins = START_COINS;
    this.buffs = [];
    this.time = 0;
    this.speedMul = 1;
    this.attackMul = 1;
    this.defenseMul = 1;
    this.abilityCooldown = 0;
  }

  tick(dt) {
    this.time += dt;
    if (this.abilityCooldown > 0) {
      this.abilityCooldown = Math.max(0, this.abilityCooldown - dt);
    }
    if (this.buffs.length > 0) {
      this.buffs = this.buffs.filter((b) => b.until > this.time);
      this.recompute();
    }
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  damage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  applyBuff(effect) {
    this.buffs = this.buffs.filter((b) => b.name !== effect.name);
    this.buffs.push({
      name: effect.name,
      icon: effect.icon,
      until: this.time + effect.duration,
      speedMul: effect.speedMul,
      attackMul: effect.attackMul,
      defenseMul: effect.defenseMul,
    });
    this.recompute();
  }

  recompute() {
    this.speedMul = this.buffs.reduce((m, b) => m * (b.speedMul || 1), 1);
    this.attackMul = this.buffs.reduce((m, b) => m * (b.attackMul || 1), 1);
    this.defenseMul = this.buffs.reduce((m, b) => m * (b.defenseMul || 1), 1);
  }

  buffList() {
    return this.buffs.map((b) => ({
      icon: b.icon,
      remain: Math.max(0, Math.ceil(b.until - this.time)),
    }));
  }
}
