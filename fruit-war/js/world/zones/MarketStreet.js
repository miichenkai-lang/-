import * as THREE from "three";
import { makeStripeTexture, createTextBoard, createArch } from "../WorldUtils.js";

function createShop({ facade, roofColor, stripeA, stripeB, sign }) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(5, 3.4, 4),
    new THREE.MeshStandardMaterial({ color: facade, roughness: 0.85 })
  );
  body.position.y = 1.7;
  body.castShadow = true;
  group.add(body);

  const parapet = new THREE.Mesh(
    new THREE.BoxGeometry(5.3, 0.35, 4.3),
    new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.8 })
  );
  parapet.position.y = 3.55;
  group.add(parapet);

  const awning = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 1.5),
    new THREE.MeshStandardMaterial({
      map: makeStripeTexture(stripeA, stripeB),
      side: THREE.DoubleSide,
      roughness: 0.8,
    })
  );
  awning.position.set(0, 2.75, 2.55);
  awning.rotation.x = -Math.PI / 2 + 0.38;
  group.add(awning);

  const windowMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.4, 0.08),
    new THREE.MeshStandardMaterial({
      color: 0xbfe8ff,
      emissive: 0x9fd0e8,
      emissiveIntensity: 0.25,
      roughness: 0.2,
      transparent: true,
      opacity: 0.85,
    })
  );
  windowMesh.position.set(-1, 1.7, 2.03);
  group.add(windowMesh);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 2.05, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x6b4226 })
  );
  door.position.set(1.6, 1.02, 2.03);
  group.add(door);

  const board = createTextBoard(sign, 2.8, 0.85);
  board.position.set(0, 3.25, 2.06);
  group.add(board);

  return group;
}

export function buildMarketStreet(scene, { collide, collideBox }) {
  const defs = [
    { x: 15, facade: 0xe78fb3, roofColor: 0xc96a92, stripeA: "#ff6f91", stripeB: "#ffffff", sign: "服裝店" },
    { x: 21, facade: 0xa9744f, roofColor: 0x7d5236, stripeA: "#b98a4e", stripeB: "#f5ecd7", sign: "家具店" },
    { x: 27, facade: 0x4fb3a9, roofColor: 0x33887f, stripeA: "#4fb3a9", stripeB: "#ffffff", sign: "道具店" },
  ];

  for (const def of defs) {
    const shop = createShop(def);
    shop.position.set(def.x, 0, -4);
    scene.add(shop);
    collideBox(def.x, -4, 2.55, 2.05);
  }

  const mannequinMat = new THREE.MeshStandardMaterial({ color: 0xf0e6d8, roughness: 0.6 });
  const mannequinSpots = [
    [13.6, -1.2],
    [15, -0.8],
  ];
  for (let i = 0; i < 2; i++) {
    const m = new THREE.Group();
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1.15, 10), mannequinMat);
    stand.position.y = 0.58;
    m.add(stand);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), mannequinMat);
    head.position.y = 1.32;
    m.add(head);
    m.position.set(mannequinSpots[i][0], 0, mannequinSpots[i][1]);
    scene.add(m);
    collide(mannequinSpots[i][0], mannequinSpots[i][1], 0.32);
  }

  const crateMat = new THREE.MeshStandardMaterial({ color: 0xb98a4e, roughness: 0.9 });
  const cratePositions = [
    [19, 1],
    [20, 1.6],
    [19.6, 0.4],
  ];
  cratePositions.forEach(([x, z], i) => {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), crateMat);
    crate.position.set(x, 0.4 + (i === 2 ? 0.8 : 0), z);
    crate.rotation.y = i * 0.4;
    crate.castShadow = true;
    scene.add(crate);
    collide(x, z, 0.5);
  });

  const arch = createArch(0x9b59b6);
  arch.position.set(12.5, 0, 0);
  arch.rotation.y = Math.PI / 2;
  scene.add(arch);
  collide(12.5, -3, 0.38);
  collide(12.5, 3, 0.38);

  const signGroup = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 });
  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.6, 8), woodMat);
    pole.position.set(side * 1.05, 1.3, 0);
    signGroup.add(pole);
  }
  const board = createTextBoard("商業街", 2.6, 1.1);
  board.position.y = 2.1;
  signGroup.add(board);
  signGroup.position.set(10.2, 0, 5);
  signGroup.rotation.y = Math.PI * 0.25;
  scene.add(signGroup);
  collide(10.2, 5, 0.35);
}
