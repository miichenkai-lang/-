import * as THREE from "three";
import { mulberry32, addPath, createTextBoard } from "../WorldUtils.js";

export function buildFruitBeach(scene, { animate, collide }) {
  const rand = mulberry32(424004);

  const sandPatch = new THREE.Mesh(
    new THREE.CircleGeometry(16, 40),
    new THREE.MeshStandardMaterial({ color: 0xf0dba0, roughness: 1 })
  );
  sandPatch.rotation.x = -Math.PI / 2;
  sandPatch.scale.set(1.2, 1, 1.5);
  sandPatch.position.set(0, 0.056, 48);
  sandPatch.receiveShadow = true;
  scene.add(sandPatch);

  addPath(scene, 0, 36, 0, 42, { width: 2.6, color: 0xc99a63 });

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x9a6a3f, roughness: 0.95 });
  const frondMat = new THREE.MeshStandardMaterial({ color: 0x3fa04b, roughness: 0.85 });
  const coconutMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.9 });

  function createPalm(x, z) {
    const palm = new THREE.Group();
    let py = 0;
    let px = 0;
    const leanDir = rand() * Math.PI * 2;
    for (let s = 0; s < 4; s++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.14 - s * 0.015, 0.18 - s * 0.015, 0.95, 8), trunkMat);
      px += Math.sin(leanDir) * 0.13;
      seg.position.set(px, py + 0.47, 0);
      seg.rotation.z = -Math.sin(leanDir) * 0.09;
      seg.castShadow = true;
      palm.add(seg);
      py += 0.88;
    }
    const topX = px + Math.sin(leanDir) * 0.13;
    for (let f = 0; f < 6; f++) {
      const frond = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), frondMat);
      frond.scale.set(1.7, 0.16, 0.45);
      frond.position.set(topX + Math.sin((f / 6) * Math.PI * 2) * 0.85, py + 0.15 - Math.abs(Math.cos(f)) * 0.05, Math.cos((f / 6) * Math.PI * 2) * 0.85);
      frond.rotation.y = -(f / 6) * Math.PI * 2;
      frond.rotation.z = 0.28;
      frond.castShadow = true;
      palm.add(frond);
    }
    for (const side of [-1, 1]) {
      const nut = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), coconutMat);
      nut.position.set(topX + side * 0.25, py - 0.05, side * 0.12);
      palm.add(nut);
    }
    palm.position.set(x, 0, z);
    scene.add(palm);
    collide(x, z, 0.4);
  }

  const palmSpots = [-0.55, -0.28, 0.02, 0.3, 0.58];
  for (const a of palmSpots) {
    createPalm(Math.sin(a) * (54 + rand() * 4), Math.cos(a) * (54 + rand() * 4));
  }

  const umbrellaColors = [0xff6f91, 0x4fb3d9, 0xffd93d];
  const umbrellaSpots = [
    [-8, 46],
    [5, 48],
    [12, 44],
  ];
  umbrellaSpots.forEach(([ux, uz], i) => {
    const group = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.3, 8),
      new THREE.MeshStandardMaterial({ color: 0xd9cba8 })
    );
    pole.position.y = 1.15;
    group.add(pole);
    const canopyMat = new THREE.MeshStandardMaterial({ color: umbrellaColors[i], roughness: 0.75, side: THREE.DoubleSide });
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.55, 0.75, 8), canopyMat);
    canopy.position.y = 2.25;
    canopy.castShadow = true;
    group.add(canopy);
    group.position.set(ux, 0, uz);
    scene.add(group);
    collide(ux, uz, 0.25);

    const towel = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.03, 0.9),
      new THREE.MeshStandardMaterial({
        color: [0xffffff, 0xffe08a, 0xc8f7ff][i],
        roughness: 0.95,
      })
    );
    towel.position.set(ux + 1.6, 0.075, uz + 1.1);
    towel.rotation.y = rand() * 1 - 0.5;
    scene.add(towel);
  });

  const ballColors = [0xe74c3c, 0xffffff, 0x4fb3d9];
  for (let i = 0; i < 3; i++) {
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 14, 12),
      new THREE.MeshStandardMaterial({ color: ballColors[i], roughness: 0.4 })
    );
    ball.position.set(-3 + i * 5, 0.35, 49 + i * 2);
    scene.add(ball);
  }

  const castleMat = new THREE.MeshStandardMaterial({ color: 0xd9c07f, roughness: 1 });
  const castle = new THREE.Group();
  const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 0.7, 10), castleMat);
  tier1.position.y = 0.35;
  castle.add(tier1);
  const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.78, 0.5, 10), castleMat);
  tier2.position.y = 0.95;
  castle.add(tier2);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.65, 10), castleMat);
  spire.position.y = 1.5;
  castle.add(spire);
  for (let t = 0; t < 4; t++) {
    const a = (t / 4) * Math.PI * 2 + Math.PI / 4;
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 1.1, 8), castleMat);
    tower.position.set(Math.sin(a) * 1.05, 0.55, Math.cos(a) * 1.05);
    castle.add(tower);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.3, 8), castleMat);
    tip.position.set(Math.sin(a) * 1.05, 1.22, Math.cos(a) * 1.05);
    castle.add(tip);
  }
  castle.position.set(-3, 0, 51);
  scene.add(castle);
  collide(-3, 51, 1.5);

  const tubeColors = [0xff8c42, 0x4fb3d9];
  const tubes = [];
  [[2, 57.5], [-6, 56.5]].forEach(([tx, tz], i) => {
    const tube = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.26, 10, 20),
      new THREE.MeshStandardMaterial({ color: tubeColors[i], roughness: 0.6 })
    );
    tube.rotation.x = -Math.PI / 2;
    tube.position.set(tx, -0.05, tz);
    scene.add(tube);
    tubes.push(tube);
  });
  animate((elapsed) => {
    tubes.forEach((tube, i) => {
      tube.position.y = -0.05 + Math.sin(elapsed * 1.1 + i * 1.8) * 0.07;
      tube.rotation.z = Math.sin(elapsed * 0.7 + i) * 0.08;
    });
  });

  const signGroup = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 });
  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.7, 8), woodMat);
    pole.position.set(side * 0.8, 0.85, 0);
    signGroup.add(pole);
  }
  const board = createTextBoard("水果海灘", 2.2, 1.0, { bg: "#2ea8c9" });
  board.position.y = 1.95;
  signGroup.add(board);
  signGroup.position.set(3, 0, 38);
  signGroup.rotation.y = Math.PI;
  scene.add(signGroup);
  collide(3, 38, 0.35);
}
