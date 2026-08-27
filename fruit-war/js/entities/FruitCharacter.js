import * as THREE from "three";
import { FRUIT_TYPES } from "../data/fruits.js";

function makeWatermelonTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const c = canvas.getContext("2d");
  c.fillStyle = "#3f9142";
  c.fillRect(0, 0, 256, 128);
  c.fillStyle = "#2a6b30";
  for (let s = 0; s < 6; s++) {
    const x = s * 44 + 10;
    c.beginPath();
    c.moveTo(x, 0);
    c.quadraticCurveTo(x + 9, 64, x, 128);
    c.lineTo(x + 16, 128);
    c.quadraticCurveTo(x + 25, 64, x + 16, 0);
    c.closePath();
    c.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class FruitCharacter {
  constructor(typeId = "apple") {
    this.def = FRUIT_TYPES[typeId] || FRUIT_TYPES.apple;
    this.velocityY = 0;
    this.onGround = true;
    this.walkTime = 0;
    this.idleTime = 0;
    this.leaf = null;

    this.group = new THREE.Group();
    this.body = new THREE.Group();

    switch (this.def.build) {
      case "banana":
        this.buildBanana();
        break;
      case "grape":
        this.buildGrape();
        break;
      case "strawberry":
        this.buildStrawberry();
        break;
      case "cherry":
        this.buildCherry();
        break;
      case "durian":
        this.buildDurian();
        break;
      case "lemon":
        this.buildSphereFruit({ radius: 0.55, squash: 0.78, tips: true, stem: "nub" });
        break;
      case "coconut":
        this.buildSphereFruit({ radius: 0.56, squash: 0.88, stem: null, leaf: false });
        break;
      case "watermelon":
        this.buildSphereFruit({
          radius: 0.78,
          squash: 0.94,
          texture: makeWatermelonTexture(),
          stem: "nub",
        });
        break;
      case "mango":
        this.buildSphereFruit({ radius: 0.58, sx: 0.95, sz: 1.25 });
        break;
      default:
        this.buildSphereFruit({});
    }

    this.group.add(this.body);
  }

  addFace({
    cy,
    k = 1,
    zMul = 1,
    eyeDX = 0.2,
    eyeDY = 0.2,
    eyeR = 0.125,
  } = {}) {
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2118, roughness: 0.4 });

    for (const side of [-1, 1]) {
      const white = new THREE.Mesh(new THREE.SphereGeometry(eyeR * k, 12, 10), eyeWhiteMat);
      white.scale.set(1, 1.3, 0.55);
      white.position.set(side * eyeDX * k, cy + eyeDY * k, 0.5 * k * zMul);
      this.body.add(white);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(eyeR * 0.5 * k, 10, 8), darkMat);
      pupil.position.set(side * eyeDX * k, cy + eyeDY * k, 0.585 * k * zMul);
      this.body.add(pupil);

      const shine = new THREE.Mesh(new THREE.SphereGeometry(eyeR * 0.19 * k, 6, 6), eyeWhiteMat);
      shine.position.set(side * eyeDX * k - 0.03 * k, cy + eyeDY * k + 0.05 * k, 0.63 * k * zMul);
      this.body.add(shine);
    }

    const smile = new THREE.Mesh(
      new THREE.TorusGeometry(0.13 * k, 0.028 * k, 8, 16, Math.PI),
      darkMat
    );
    smile.rotation.z = Math.PI;
    smile.position.set(0, cy + 0.04 * k, 0.6 * k * zMul);
    this.body.add(smile);

    const cheekMat = new THREE.MeshStandardMaterial({ color: 0xff8fa3, roughness: 0.7 });
    for (const side of [-1, 1]) {
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.075 * k, 10, 8), cheekMat);
      cheek.scale.set(1, 0.7, 0.4);
      cheek.position.set(side * 0.33 * k, cy - 0.02 * k, 0.5 * k * zMul);
      this.body.add(cheek);
    }
  }

  addStemLeaf(cyTop, k = 1) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05 * k, 0.075 * k, 0.38 * k, 8),
      new THREE.MeshStandardMaterial({ color: 0x7a4a21, roughness: 0.9 })
    );
    stem.position.set(0, cyTop + 0.09 * k, 0);
    stem.rotation.z = 0.12;
    stem.castShadow = true;
    this.body.add(stem);

    this.addLeaf(stem.position.y + 0.08 * k, k);
  }

  addLeaf(y, k = 1) {
    this.leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.17 * k, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x3fae49, roughness: 0.8 })
    );
    this.leaf.scale.set(1.5, 0.4, 0.75);
    this.leaf.position.set(0.24 * k, y, 0);
    this.leaf.rotation.z = -0.5;
    this.body.add(this.leaf);
  }

  buildSphereFruit({
    radius = 0.62,
    squash = 0.92,
    sx = 1,
    sz = 1,
    texture = null,
    stem = "brown",
    leaf = true,
    tips = false,
  } = {}) {
    const k = radius / 0.62;
    const skinMat = texture
      ? new THREE.MeshStandardMaterial({ map: texture, roughness: 0.55 })
      : new THREE.MeshStandardMaterial({ color: this.def.bodyColor, roughness: 0.55 });

    const body = new THREE.Mesh(new THREE.SphereGeometry(radius, 26, 20), skinMat);
    body.scale.set(sx, squash, sz);
    body.position.y = radius * squash + 0.07;
    body.castShadow = true;
    this.body.add(body);

    const cy = body.position.y;

    if (tips) {
      const tipMat = new THREE.MeshStandardMaterial({ color: 0xd9b23a, roughness: 0.7 });
      for (const side of [-1, 1]) {
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.09 * k, 0.22 * k, 8), tipMat);
        tip.rotation.z = side * (Math.PI / 2);
        tip.position.set(side * (radius * sx + 0.07 * k), cy, 0);
        this.body.add(tip);
      }
    }

    if (stem === "brown") {
      this.addStemLeaf(cy + radius * squash, k);
    } else if (stem === "nub") {
      const nub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06 * k, 0.09 * k, 0.18 * k, 8),
        new THREE.MeshStandardMaterial({ color: 0x7a4a21, roughness: 0.9 })
      );
      nub.position.y = cy + radius * squash + 0.05 * k;
      nub.rotation.z = 0.15;
      this.body.add(nub);
      if (leaf) this.addLeaf(nub.position.y + 0.1 * k, k);
    }

    this.addFace({ cy, k, zMul: sz });
  }

  buildBanana() {
    const lift = 1.25;
    const angles = [205, 240, 270, 300, 335].map((d) => (d * Math.PI) / 180);
    const radii = [0.85, 0.85, 0.85, 0.85, 0.85];
    const sizes = [0.24, 0.275, 0.295, 0.275, 0.24];
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf7d548, roughness: 0.5 });
    const tipMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.85 });

    for (let i = 0; i < angles.length; i++) {
      const seg = new THREE.Mesh(new THREE.SphereGeometry(sizes[i], 14, 12), yellowMat);
      seg.position.set(Math.cos(angles[i]) * radii[i], Math.sin(angles[i]) * radii[i] + lift, 0);
      seg.castShadow = true;
      this.body.add(seg);
    }

    for (const deg of [196, 344]) {
      const a = (deg * Math.PI) / 180;
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), tipMat);
      tip.position.set(Math.cos(a) * 0.84, Math.sin(a) * 0.84 + lift, 0);
      this.body.add(tip);
    }

    const cy = 0.47;
    this.addFace({ cy, k: 0.82, zMul: 0.92, eyeDY: 0.02 });
  }

  buildGrape() {
    const shades = [0x8e44ad, 0x7b3fa0];
    const berryPos = [
      [0, 1.18],
      [-0.29, 0.95],
      [0.29, 0.95],
      [-0.52, 0.68],
      [0.52, 0.68],
      [-0.18, 0.62],
      [0.18, 0.62],
      [0, 0.4],
    ];

    berryPos.forEach(([bx, by], i) => {
      const mat = new THREE.MeshStandardMaterial({
        color: shades[i % 2],
        roughness: 0.45,
      });
      const berry = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 12), mat);
      berry.position.set(bx, by, 0);
      berry.castShadow = true;
      this.body.add(berry);
    });

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.32, 8),
      new THREE.MeshStandardMaterial({ color: 0x7a4a21, roughness: 0.9 })
    );
    stem.position.y = 1.42;
    this.body.add(stem);
    this.addLeaf(1.52, 0.9);

    this.addFace({ cy: 0.62, k: 0.72, eyeDX: 0.22, eyeDY: 0.04 });
  }

  buildStrawberry() {
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe8394a, roughness: 0.45 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.6, 22, 18), skinMat);
    body.scale.set(0.84, 1.06, 0.84);
    body.position.y = 0.74;
    body.castShadow = true;
    this.body.add(body);

    const seedMat = new THREE.MeshStandardMaterial({ color: 0xf7e8a0, roughness: 0.6 });
    for (let i = 0; i < 14; i++) {
      const seed = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), seedMat);
      const a = (i / 14) * Math.PI * 2;
      const row = i % 3;
      const dx = Math.sin(a) * (0.42 - row * 0.08);
      const dz = Math.cos(a) * (0.42 - row * 0.08);
      seed.position.set(dx, 0.95 - row * 0.26, Math.max(dz, -dz * 0.2));
      this.body.add(seed);
    }

    const crownMat = new THREE.MeshStandardMaterial({ color: 0x3fae49, roughness: 0.8 });
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), crownMat);
      petal.scale.set(1.6, 0.35, 0.7);
      petal.position.set(Math.sin(a) * 0.22, 1.36, Math.cos(a) * 0.22);
      petal.rotation.y = -a;
      petal.rotation.z = -0.3;
      petal.castShadow = true;
      this.body.add(petal);
    }
    const stalk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.2, 8),
      crownMat
    );
    stalk.position.y = 1.46;
    this.body.add(stalk);

    const cy = 0.74;
    const k = 0.88;
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2118, roughness: 0.4 });
    for (const side of [-1, 1]) {
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.105 * k, 12, 10), eyeWhiteMat);
      white.scale.set(1, 1.3, 0.55);
      white.position.set(side * 0.17, cy + 0.02, 0.45);
      this.body.add(white);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.052 * k, 10, 8), darkMat);
      pupil.position.set(side * 0.17, cy + 0.02, 0.49);
      this.body.add(pupil);
    }
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.1 * k, 0.024 * k, 8, 16, Math.PI), darkMat);
    smile.rotation.z = Math.PI;
    smile.position.set(0, cy - 0.08, 0.47);
    this.body.add(smile);
    const cheekMat = new THREE.MeshStandardMaterial({ color: 0xff8fa3, roughness: 0.7 });
    for (const side of [-1, 1]) {
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.06 * k, 10, 8), cheekMat);
      cheek.scale.set(1, 0.7, 0.4);
      cheek.position.set(side * 0.27, cy - 0.02, 0.41);
      this.body.add(cheek);
    }
  }

  buildCherry() {
    const redMat = new THREE.MeshStandardMaterial({ color: 0xd63c50, roughness: 0.45 });
    for (const side of [-1, 1]) {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 14), redMat);
      ball.position.set(side * 0.32, 0.44, 0);
      ball.castShadow = true;
      this.body.add(ball);
    }

    const stemMat = new THREE.MeshStandardMaterial({ color: 0x6a8f3c, roughness: 0.9 });
    for (const side of [-1, 1]) {
      const from = new THREE.Vector3(side * 0.32, 0.76, 0);
      const to = new THREE.Vector3(0, 1.18, 0);
      const dir = to.clone().sub(from);
      const len = dir.length();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, len, 6), stemMat);
      stem.position.copy(from).addScaledVector(dir, 0.5);
      stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      this.body.add(stem);
    }
    this.addLeaf(1.24, 0.75);

    const cx = 0.32;
    const cy = 0.44;
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2118, roughness: 0.4 });
    for (const side of [-1, 1]) {
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), eyeWhiteMat);
      white.scale.set(1, 1.3, 0.55);
      white.position.set(cx + side * 0.115, cy + 0.06, 0.295);
      this.body.add(white);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), darkMat);
      pupil.position.set(cx + side * 0.115, cy + 0.06, 0.33);
      this.body.add(pupil);
    }
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.02, 8, 16, Math.PI), darkMat);
    smile.rotation.z = Math.PI;
    smile.position.set(cx, cy - 0.06, 0.315);
    this.body.add(smile);
  }

  buildDurian() {
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x9aa83f, roughness: 0.8 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 16), skinMat);
    body.scale.y = 0.96;
    body.position.y = 0.66;
    body.castShadow = true;
    this.body.add(body);

    const spikeMat = new THREE.MeshStandardMaterial({ color: 0x7f8c30, roughness: 0.85 });
    const up = new THREE.Vector3(0, 1, 0);
    const goldenRatio = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < 52; i++) {
      const y = 1 - (i / 51) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenRatio * i;
      const dir = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r);

      if (dir.z > 0.5 && Math.abs(y - 0.15) < 0.6) continue;

      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.26, 6), spikeMat);
      spike.position.set(dir.x * 0.58, 0.66 + dir.y * 0.58, dir.z * 0.58);
      spike.quaternion.setFromUnitVectors(up, dir.clone());
      this.body.add(spike);
    }

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.12, 0.32, 8),
      new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.9 })
    );
    stem.position.y = 1.34;
    stem.castShadow = true;
    this.body.add(stem);
    this.addLeaf(1.44, 1.1);

    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2118, roughness: 0.4 });
    for (const side of [-1, 1]) {
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), eyeWhiteMat);
      white.scale.set(1, 1.3, 0.55);
      white.position.set(side * 0.17, 0.84, 0.6);
      this.body.add(white);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), darkMat);
      pupil.position.set(side * 0.17, 0.84, 0.65);
      this.body.add(pupil);
    }
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.026, 8, 16, Math.PI), darkMat);
    smile.rotation.z = Math.PI;
    smile.position.set(0, 0.7, 0.63);
    this.body.add(smile);
  }

  addOxygenMask() {
    if (this._mask) return this._mask;
    const glass = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 18, 14),
      new THREE.MeshStandardMaterial({
        color: 0xcfeaff,
        transparent: true,
        opacity: 0.55,
        roughness: 0.15,
        metalness: 0.2,
      })
    );
    glass.scale.set(0.95, 0.72, 0.55);
    glass.position.set(0, 0.32, 0.5);
    glass.rotation.x = 0.35;
    glass.castShadow = true;
    this.body.add(glass);

    const strap = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.03, 8, 20, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.8 })
    );
    strap.rotation.z = Math.PI / 2;
    strap.position.set(0, 0.45, 0.05);
    this.body.add(strap);

    const canister = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.07, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xd8d8d8, roughness: 0.4, metalness: 0.3 })
    );
    canister.position.set(-0.18, 0.2, 0.25);
    canister.rotation.x = 0.4;
    this.body.add(canister);

    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.28, 6),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
    );
    tube.position.set(-0.16, 0.3, 0.4);
    tube.rotation.x = 0.6;
    this.body.add(tube);

    this._mask = { glass, strap, canister, tube };
    return this._mask;
  }

  addJetpack() {
    if (this._jetpack) return this._jetpack;
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5, metalness: 0.6 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.4, metalness: 0.4 });

    const leftTank = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.55, 10), tankMat);
    leftTank.position.set(-0.14, 0.82, -0.28);
    leftTank.rotation.x = 0.25;
    leftTank.castShadow = true;
    this.body.add(leftTank);

    const rightTank = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.55, 10), tankMat);
    rightTank.position.set(0.14, 0.82, -0.28);
    rightTank.rotation.x = 0.25;
    rightTank.castShadow = true;
    this.body.add(rightTank);

    const harness = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.3, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6, metalness: 0.4 })
    );
    harness.position.set(0, 0.82, -0.18);
    this.body.add(harness);

    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xffa640,
      emissive: 0xff6a00,
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.9,
    });
    const leftFlame = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 8), flameMat);
    leftFlame.position.set(-0.14, 0.52, -0.34);
    leftFlame.rotation.x = Math.PI / 2;
    leftFlame.visible = false;
    this.body.add(leftFlame);

    const rightFlame = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 8), flameMat);
    rightFlame.position.set(0.14, 0.52, -0.34);
    rightFlame.rotation.x = Math.PI / 2;
    rightFlame.visible = false;
    this.body.add(rightFlame);

    this._jetpack = { leftTank, rightTank, harness, leftFlame, rightFlame };
    return this._jetpack;
  }

  setJetpackFlames(active) {
    if (!this._jetpack) return;
    this._jetpack.leftFlame.visible = active;
    this._jetpack.rightFlame.visible = active;
    if (active) {
      const scale = 0.8 + Math.random() * 0.4;
      this._jetpack.leftFlame.scale.set(scale, scale, scale);
      this._jetpack.rightFlame.scale.set(scale, scale, scale);
    }
  }

  animate(dt, intensity) {
    const b = this.body;

    if (intensity > 0.01) {
      this.idleTime = 0;
      this.walkTime += dt * (7 + 5 * intensity);
      const amp = Math.min(intensity, 1.2);
      b.rotation.z = Math.sin(this.walkTime) * 0.09 * amp;
      b.rotation.x = Math.cos(this.walkTime * 2) * 0.05 * amp;
      b.position.y = Math.abs(Math.cos(this.walkTime)) * 0.07 * amp;
      b.scale.y = 1;
    } else {
      this.walkTime = 0;
      this.idleTime += dt;
      const decay = Math.max(0, 1 - 8 * dt);
      b.rotation.z *= decay;
      b.rotation.x *= decay;
      b.position.y = Math.sin(this.idleTime * 2) * 0.015;
      b.scale.y = 1 + Math.sin(this.idleTime * 2) * 0.012;
    }

    if (this.leaf) {
      this.leaf.rotation.z = -0.5 + Math.sin((this.walkTime + this.idleTime) * 3) * 0.12;
    }
  }
}
