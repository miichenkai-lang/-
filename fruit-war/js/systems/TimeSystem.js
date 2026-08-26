import * as THREE from "three";

const DAY_REAL_SECONDS = 360;

const SKY_STOPS = [
  { h: 0, color: 0x162040 },
  { h: 4.5, color: 0x162040 },
  { h: 6, color: 0x3d4a7a },
  { h: 7.2, color: 0xe89a6b },
  { h: 8.5, color: 0x8ecae6 },
  { h: 16, color: 0x9fd3ef },
  { h: 17.6, color: 0xffb37e },
  { h: 19, color: 0x524278 },
  { h: 20.5, color: 0x1a2545 },
  { h: 24, color: 0x162040 },
];

export class TimeSystem {
  constructor(scene) {
    this.scene = scene;
    this.minutes = 7 * 60 + 50;
    this.dayCount = 1;
    this.sun = null;
    this.hemi = null;
    this._c1 = new THREE.Color();
    this._c2 = new THREE.Color();
    this._skyColor = new THREE.Color();
  }

  static PHASE_ICON = {
    dawn: "🌅",
    morning: "☀️",
    noon: "🌞",
    afternoon: "🌤️",
    evening: "🌇",
    night: "🌙",
    midnight: "🌌",
  };

  attachLights(sun, hemi) {
    this.sun = sun;
    this.hemi = hemi;
  }

  get hour() {
    return this.minutes / 60;
  }

  get phaseKey() {
    const h = this.hour;
    if (h < 5) return "midnight";
    if (h < 7) return "dawn";
    if (h < 11) return "morning";
    if (h < 14) return "noon";
    if (h < 17) return "afternoon";
    if (h < 19) return "evening";
    if (h < 23) return "night";
    return "midnight";
  }

  formatClock() {
    const hh = Math.floor(this.hour) % 24;
    const mm = Math.floor(this.minutes % 60);
    return `第 ${this.dayCount} 天 ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }

  update(dt) {
    this.minutes += dt * (1440 / DAY_REAL_SECONDS);
    if (this.minutes >= 1440) {
      this.minutes -= 1440;
      this.dayCount++;
      if (this.onNewDay) this.onNewDay(this.dayCount);
    }

    const h = this.hour;

    let sA = SKY_STOPS[0];
    let sB = SKY_STOPS[SKY_STOPS.length - 1];
    for (let i = 0; i < SKY_STOPS.length - 1; i++) {
      if (h >= SKY_STOPS[i].h && h <= SKY_STOPS[i + 1].h) {
        sA = SKY_STOPS[i];
        sB = SKY_STOPS[i + 1];
        break;
      }
    }
    const span = sB.h - sA.h || 1;
    const t = Math.min(1, Math.max(0, (h - sA.h) / span));
    this._c1.setHex(sA.color);
    this._c2.setHex(sB.color);
    this._skyColor.lerpColors(this._c1, this._c2, t);

    if (this.scene.background) {
      this.scene.background.copy(this._skyColor);
    }
    if (this.scene.fog) {
      this.scene.fog.color.copy(this._skyColor);
    }

    const elevRaw = Math.sin(((h - 6) / 13) * Math.PI);
    const dayElev = Math.min(1, Math.max(0, elevRaw));

    if (this.sun) {
      if (dayElev > 0.02) {
        const theta = ((h - 6) / 13) * Math.PI;
        this.sun.position.set(Math.cos(theta) * 55, Math.sin(theta) * 70 + 10, 28);
        this.sun.intensity = 0.15 + dayElev * 1.9;
        this._c1.setHex(0xff9e5e);
        this._c2.setHex(0xfff2d9);
        this.sun.color.lerpColors(this._c1, this._c2, Math.min(1, dayElev * 2));
      } else {
        this.sun.position.set(-30, 55, -25);
        this.sun.intensity = 0.5;
        this.sun.color.setHex(0xb8d0ff);
      }
    }

    if (this.hemi) {
      this.hemi.intensity = 0.38 + dayElev * 0.65;
    }
  }
}
