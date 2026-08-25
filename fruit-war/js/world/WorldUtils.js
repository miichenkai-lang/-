import * as THREE from "three";

export function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeTextTexture(text, { bg = "#7a4a21", fg = "#ffffff", fontSize = 52 } = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const c = canvas.getContext("2d");
  c.fillStyle = bg;
  c.fillRect(0, 0, 256, 128);
  c.strokeStyle = "rgba(255,255,255,0.35)";
  c.lineWidth = 6;
  c.strokeRect(8, 8, 240, 112);
  c.fillStyle = fg;
  c.font = `bold ${fontSize}px 'Microsoft JhengHei','PingFang TC',sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(text, 128, 66);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeStripeTexture(c1, c2) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const c = canvas.getContext("2d");
  for (let i = 0; i < 8; i++) {
    c.fillStyle = i % 2 === 0 ? c1 : c2;
    c.fillRect(i * 8, 0, 8, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createTextBoard(text, width = 2.4, height = 1.1, opts = {}) {
  const faceMat = new THREE.MeshBasicMaterial({ map: makeTextTexture(text, opts) });
  const sideMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.9 });
  return new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.1), [
    sideMat,
    sideMat,
    sideMat,
    sideMat,
    faceMat,
    faceMat,
  ]);
}

export function createSignPost(text, { height = 2.3, boardW = 2.2, boardH = 1.0 } = {}) {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 });

  const poleH = height - 0.8;
  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, poleH, 8), woodMat);
    pole.position.set(side * 0.8, poleH / 2, 0);
    pole.castShadow = true;
    group.add(pole);
  }

  const board = createTextBoard(text, boardW, boardH);
  board.position.y = height - 0.45;
  group.add(board);

  return group;
}

export function createArch(color) {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.85 });
  const paintMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });

  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 4.2, 10), woodMat);
    pillar.position.set(side * 3, 2.1, 0);
    pillar.castShadow = true;
    group.add(pillar);
  }

  const beam = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.5, 0.6), paintMat);
  beam.position.y = 4.35;
  beam.castShadow = true;
  group.add(beam);

  const cap = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.22, 0.8), paintMat);
  cap.position.y = 4.72;
  group.add(cap);

  return group;
}

export function addPath(scene, x1, z1, x2, z2, { width = 3, color = 0xd7b98a, y = 0.064 } = {}) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.hypot(dx, dz);
  const geo = new THREE.PlaneGeometry(len, width);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color, roughness: 1 })
  );
  mesh.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
  mesh.rotation.y = -Math.atan2(dz, dx);
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

export function createTree(rand, leafMat, trunkMat, { fruits = null, fruitCount = 4 } = {}) {
  const group = new THREE.Group();
  const trunkH = 1.4 + rand() * 0.8;

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, trunkH, 8), trunkMat);
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  group.add(trunk);

  const blobs = [
    [0, trunkH + 0.9, 0, 1.35],
    [0.75, trunkH + 0.45, 0.2, 0.9],
    [-0.7, trunkH + 0.55, -0.15, 0.85],
  ];
  for (const [bx, by, bz, br] of blobs) {
    const blob = new THREE.Mesh(new THREE.SphereGeometry(br, 14, 10), leafMat);
    blob.position.set(bx, by, bz);
    blob.castShadow = true;
    group.add(blob);
  }

  if (fruits) {
    for (let i = 0; i < fruitCount; i++) {
      const [bx, by, bz, br] = blobs[Math.floor(rand() * blobs.length)];
      const dir = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1)
        .normalize()
        .multiplyScalar(br * 0.92);
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), fruits);
      fruit.position.set(bx + dir.x, by + dir.y, bz + dir.z);
      group.add(fruit);
    }
  }

  return group;
}

export function createBench() {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xb98a4e, roughness: 0.85 });

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.5), woodMat);
  seat.position.y = 0.45;
  seat.castShadow = true;
  group.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.06), woodMat);
  back.position.set(0, 0.72, -0.22);
  back.rotation.x = -0.15;
  group.add(back);

  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.4), woodMat);
    leg.position.set(side * 0.75, 0.225, 0);
    group.add(leg);
  }

  return group;
}

export function createLamp({ glow = 0xffdf9e } = {}) {
  const group = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.6 });

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 3, 8), poleMat);
  pole.position.y = 1.5;
  pole.castShadow = true;
  group.add(pole);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 10),
    new THREE.MeshStandardMaterial({
      color: glow,
      emissive: glow,
      emissiveIntensity: 0.9,
      roughness: 0.4,
    })
  );
  bulb.position.y = 3.1;
  group.add(bulb);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.2, 8), poleMat);
  cap.position.y = 3.32;
  group.add(cap);

  return group;
}

export function createBush(rand, color = 0x3f9142) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
  const count = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < count; i++) {
    const r = 0.25 + rand() * 0.2;
    const blob = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat);
    blob.position.set((rand() - 0.5) * 0.5, r * 0.8, (rand() - 0.5) * 0.5);
    blob.castShadow = true;
    group.add(blob);
  }
  return group;
}

export function createFlowerBed(rand, count = 12) {
  const group = new THREE.Group();
  const dirtMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.95 });
  const dirt = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.12, 16), dirtMat);
  dirt.position.y = 0.06;
  dirt.receiveShadow = true;
  group.add(dirt);

  const colors = [0xff6f91, 0xffd93d, 0xffffff, 0xff8c42, 0xc39bd3, 0xff6b6b, 0x48dbfb];
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x3f9142, roughness: 0.9 });
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + rand() * 0.3;
    const r = 0.4 + rand() * 0.65;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const h = 0.2 + rand() * 0.15;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, h, 5), stemMat);
    stem.position.set(x, 0.12 + h / 2, z);
    group.add(stem);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 6),
      new THREE.MeshStandardMaterial({ color: colors[Math.floor(rand() * colors.length)], roughness: 0.6 })
    );
    head.position.set(x, 0.12 + h + 0.05, z);
    group.add(head);
  }
  return group;
}

export function createMossRock(rand, size = 0.6) {
  const group = new THREE.Group();
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x8a8a82, roughness: 0.95, flatShading: true });
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size), rockMat);
  rock.position.y = size * 0.45;
  rock.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
  rock.castShadow = true;
  rock.receiveShadow = true;
  group.add(rock);

  const mossMat = new THREE.MeshStandardMaterial({ color: 0x4a7a3a, roughness: 0.9 });
  for (let i = 0; i < 3; i++) {
    const moss = new THREE.Mesh(new THREE.SphereGeometry(size * 0.35, 8, 6), mossMat);
    const a = rand() * Math.PI * 2;
    moss.position.set(Math.cos(a) * size * 0.4, size * 0.5 + rand() * 0.15, Math.sin(a) * size * 0.4);
    moss.scale.set(1, 0.5, 1);
    group.add(moss);
  }
  return group;
}

export function createMushroom(rand, color = 0xc0392b) {
  const group = new THREE.Group();
  const stemMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e0, roughness: 0.8 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.25, 8), stemMat);
  stem.position.y = 0.125;
  stem.castShadow = true;
  group.add(stem);

  const capMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), capMat);
  cap.scale.set(1, 0.6, 1);
  cap.position.y = 0.3;
  cap.castShadow = true;
  group.add(cap);

  const spotMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + rand() * 0.5;
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), spotMat);
    spot.position.set(Math.cos(a) * 0.12, 0.35, Math.sin(a) * 0.12);
    group.add(spot);
  }
  return group;
}

export function createPineTree(rand, leafMat, trunkMat) {
  const group = new THREE.Group();
  const trunkH = 1.8 + rand() * 0.6;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, trunkH, 8), trunkMat);
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  group.add(trunk);

  const layers = 4;
  for (let i = 0; i < layers; i++) {
    const t = i / layers;
    const r = 0.9 - t * 0.55;
    const h = 0.7 - t * 0.1;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), leafMat);
    cone.position.y = trunkH * 0.5 + i * 0.55;
    cone.castShadow = true;
    group.add(cone);
  }
  return group;
}

export function createFence(length = 3, color = 0xb98a4e) {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
  const postCount = Math.max(2, Math.floor(length / 1.2) + 1);
  const spacing = length / (postCount - 1);

  for (let i = 0; i < postCount; i++) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.8, 6), woodMat);
    post.position.set(i * spacing - length / 2, 0.4, 0);
    post.castShadow = true;
    group.add(post);
  }

  for (const y of [0.3, 0.6]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(length, 0.06, 0.04), woodMat);
    rail.position.y = y;
    rail.castShadow = true;
    group.add(rail);
  }
  return group;
}

export function createBarrel(rand) {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.85 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.9, 12), woodMat);
  body.position.y = 0.45;
  body.castShadow = true;
  group.add(body);

  const bandMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.7 });
  for (const y of [0.2, 0.7]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 8, 16), bandMat);
    band.position.y = y;
    band.rotation.x = Math.PI / 2;
    group.add(band);
  }
  return group;
}

export function createCrate(rand) {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xb98a4e, roughness: 0.9 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.8), woodMat);
  box.position.y = 0.35;
  box.castShadow = true;
  box.receiveShadow = true;
  group.add(box);

  const plankMat = new THREE.MeshStandardMaterial({ color: 0xa07838, roughness: 0.9 });
  for (const z of [-0.41, 0.41]) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.06, 0.02), plankMat);
    plank.position.set(0, 0.35, z);
    group.add(plank);
  }
  return group;
}

export function createTrashCan() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x5a6a5a, roughness: 0.8 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.6, 10), mat);
  body.position.y = 0.3;
  body.castShadow = true;
  group.add(body);

  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.26, 0.06, 10), mat);
  lid.position.y = 0.63;
  group.add(lid);
  return group;
}

export function createWell() {
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8a8a82, roughness: 0.9 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.6, 12), stoneMat);
  base.position.y = 0.3;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const waterMat = new THREE.MeshStandardMaterial({ color: 0x4a8ab5, roughness: 0.3, metalness: 0.2 });
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.7, 12), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.55;
  group.add(water);

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.85 });
  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.4, 6), woodMat);
    pole.position.set(side * 0.5, 1.3, 0);
    pole.castShadow = true;
    group.add(pole);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), woodMat);
  beam.position.y = 2.05;
  group.add(beam);

  const roofMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.85 });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.5, 4), roofMat);
  roof.position.y = 2.35;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);
  return group;
}

export function createStonePath(scene, x1, z1, x2, z2, { width = 2 } = {}) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.hypot(dx, dz);
  const angle = -Math.atan2(dz, dx);
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xb0a890, roughness: 0.95 });
  const count = Math.floor(len / 0.8);
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const cx = x1 + dx * t + (Math.random() - 0.5) * width * 0.3;
    const cz = z1 + dz * t + (Math.random() - 0.5) * width * 0.3;
    const size = 0.25 + Math.random() * 0.2;
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(size, size * 1.1, 0.06, 8), stoneMat);
    stone.position.set(cx, 0.065, cz);
    stone.rotation.y = Math.random() * Math.PI;
    stone.receiveShadow = true;
    scene.add(stone);
  }
}

export function createBoardwalk(scene, x1, z1, x2, z2, { width = 2.5 } = {}) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.hypot(dx, dz);
  const angle = -Math.atan2(dz, dx);
  const plankMat = new THREE.MeshStandardMaterial({ color: 0xc9a86c, roughness: 0.85 });
  const supportMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 });
  const plankCount = Math.floor(len / 0.35);

  const group = new THREE.Group();
  for (let i = 0; i < plankCount; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, width), plankMat);
    plank.position.set((i - plankCount / 2) * 0.32, 0, 0);
    plank.receiveShadow = true;
    group.add(plank);
  }

  for (const xOff of [-len / 2 + 0.5, len / 2 - 0.5]) {
    for (const zOff of [-width / 2 + 0.3, width / 2 - 0.3]) {
      const support = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6), supportMat);
      support.position.set(xOff, -0.2, zOff);
      group.add(support);
    }
  }

  group.position.set((x1 + x2) / 2, 0.05, (z1 + z2) / 2);
  group.rotation.y = angle;
  scene.add(group);
  return group;
}
