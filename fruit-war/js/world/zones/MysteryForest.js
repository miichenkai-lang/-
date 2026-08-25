import * as THREE from "three";
import { mulberry32, createTree, addPath, createTextBoard } from "../WorldUtils.js";

const CENTER_X = 31;
const CENTER_Z = 23;

export function buildMysteryForest(scene, { animate, collide }) {
  const rand = mulberry32(999003);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(10.5, 32),
    new THREE.MeshStandardMaterial({ color: 0x2e5d3a, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(CENTER_X, 0.058, CENTER_Z);
  ground.receiveShadow = true;
  scene.add(ground);

  addPath(scene, 24, 21, CENTER_X - 1, CENTER_Z - 1, { width: 1.8, color: 0x8f8f83, y: 0.066 });
  addPath(scene, CENTER_X - 1, CENTER_Z - 1, CENTER_X + 2, CENTER_Z + 3, { width: 1.6, color: 0x8f8f83, y: 0.066 });

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.95 });
  const darkLeafMats = [0x245c36, 0x1f4f30, 0x2a6842].map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 })
  );

  const placed = [];
  let attempts = 0;
  while (placed.length < 16 && attempts < 200) {
    attempts++;
    const a = rand() * Math.PI * 2;
    const r = 2 + rand() * 7;
    const x = CENTER_X + Math.sin(a) * r;
    const z = CENTER_Z + Math.cos(a) * r;
    if (Math.hypot(x - CENTER_X, z - CENTER_Z) > 9.5) continue;
    if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 2.6)) continue;
    placed.push([x, z]);
    const tree = createTree(rand, darkLeafMats[Math.floor(rand() * 3)], trunkMat);
    tree.scale.setScalar(0.95 + rand() * 0.45);
    tree.position.set(x, 0, z);
    tree.rotation.y = rand() * Math.PI * 2;
    scene.add(tree);
    collide(x, z, 0.5);
  }

  const stemMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.85 });
  const glowColors = [0x7ae0ff, 0xc39bd3, 0x9fe2bf];
  for (let i = 0; i < 8; i++) {
    const a = rand() * Math.PI * 2;
    const r = 3 + rand() * 6;
    const mx = CENTER_X + Math.sin(a) * r;
    const mz = CENTER_Z + Math.cos(a) * r;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.3, 6), stemMat);
    stem.position.set(mx, 0.15, mz);
    scene.add(stem);
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 10, 8),
      new THREE.MeshStandardMaterial({
        color: glowColors[i % 3],
        emissive: glowColors[i % 3],
        emissiveIntensity: 0.85,
        roughness: 0.6,
      })
    );
    cap.scale.y = 0.65;
    cap.position.set(mx, 0.34, mz);
    scene.add(cap);
  }

  function createChest(open) {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x7a4a21, roughness: 0.8 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      metalness: 0.6,
      roughness: 0.3,
      emissive: 0x664400,
    });

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 0.7), woodMat);
    base.position.y = 0.28;
    base.castShadow = true;
    group.add(base);

    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.18, 0.75), woodMat);
    if (open) {
      lid.position.set(0, 0.72, -0.3);
      lid.rotation.x = -0.9;
    } else {
      lid.position.y = 0.64;
    }
    group.add(lid);

    const band1 = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.1, 0.78), goldMat);
    band1.position.y = 0.42;
    group.add(band1);

    return group;
  }

  const openChest = createChest(true);
  openChest.position.set(CENTER_X + 2, 0, CENTER_Z + 3.5);
  openChest.rotation.y = -0.6;
  scene.add(openChest);
  collide(CENTER_X + 2, CENTER_Z + 3.5, 0.7);

  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xffd166,
    metalness: 0.7,
    roughness: 0.25,
    emissive: 0x996600,
    emissiveIntensity: 0.4,
  });
  for (let i = 0; i < 6; i++) {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 10), coinMat);
    coin.position.set(CENTER_X + 2 + (rand() - 0.5) * 0.5, 0.58 + i * 0.035, CENTER_Z + 3.5 + (rand() - 0.5) * 0.3);
    coin.rotation.x = rand() * 0.4;
    scene.add(coin);
  }

  const chestLight = new THREE.PointLight(0xffd166, 1.2, 4.5);
  chestLight.position.set(CENTER_X + 2, 0.9, CENTER_Z + 3.5);
  scene.add(chestLight);
  animate((elapsed) => {
    chestLight.intensity = 1.1 + Math.sin(elapsed * 3) * 0.25;
  });

  const closedChest = createChest(false);
  closedChest.position.set(CENTER_X - 4, 0, CENTER_Z - 3);
  closedChest.rotation.y = 2.2;
  scene.add(closedChest);
  collide(CENTER_X - 4, CENTER_Z - 3, 0.7);

  const shrine = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x777d88, roughness: 0.85 });
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.3, 0.3, 12), stoneMat);
  platform.position.set(CENTER_X + 3, 0.15, CENTER_Z - 4);
  shrine.add(platform);
  collide(CENTER_X + 3, CENTER_Z - 4, 2.35);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.1, 8), stoneMat);
    pillar.position.set(CENTER_X + 3 + Math.sin(a) * 1.5, 0.75, CENTER_Z - 4 + Math.cos(a) * 1.5);
    shrine.add(pillar);
  }
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 14, 10),
    new THREE.MeshStandardMaterial({
      color: 0xc39bd3,
      emissive: 0x9b59b6,
      emissiveIntensity: 1.2,
      roughness: 0.3,
    })
  );
  orb.position.set(CENTER_X + 3, 1.15, CENTER_Z - 4);
  shrine.add(orb);
  scene.add(shrine);
  animate((elapsed) => {
    orb.position.y = 1.15 + Math.sin(elapsed * 2.2) * 0.12;
    orb.rotation.y = elapsed * 0.8;
  });

  const count = 14;
  const positions = new Float32Array(count * 3);
  const seeds = [];
  for (let i = 0; i < count; i++) {
    seeds.push({
      bx: CENTER_X + (rand() - 0.5) * 14,
      by: 0.6 + rand() * 1.8,
      bz: CENTER_Z + (rand() - 0.5) * 14,
      sp: 0.6 + rand() * 1.2,
      ph: rand() * Math.PI * 2,
      amp: 0.5 + rand() * 1,
    });
  }
  const fireflyGeo = new THREE.BufferGeometry();
  fireflyGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const fireflies = new THREE.Points(
    fireflyGeo,
    new THREE.PointsMaterial({ color: 0xd7ff7a, size: 0.16, transparent: true, opacity: 0.9 })
  );
  scene.add(fireflies);
  animate((elapsed) => {
    const arr = fireflyGeo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      arr[i * 3] = s.bx + Math.sin(elapsed * s.sp + s.ph) * s.amp;
      arr[i * 3 + 1] = s.by + Math.sin(elapsed * s.sp * 1.4 + s.ph * 2) * 0.3;
      arr[i * 3 + 2] = s.bz + Math.cos(elapsed * s.sp * 0.8 + s.ph) * s.amp;
    }
    fireflyGeo.attributes.position.needsUpdate = true;
  });

  const signGroup = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 });
  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.7, 8), woodMat);
    pole.position.set(side * 0.8, 0.85, 0);
    signGroup.add(pole);
  }
  const board = createTextBoard("神秘森林", 2.2, 1.0, { bg: "#2e5d3a" });
  board.position.y = 1.95;
  signGroup.add(board);
  signGroup.position.set(23.5, 0, 19.5);
  signGroup.rotation.y = -2.35;
  scene.add(signGroup);
  collide(23.5, 19.5, 0.35);
}
