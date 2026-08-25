import * as THREE from "three";
import { makeStripeTexture, createTextBoard, createArch } from "../WorldUtils.js";

function createStall({ counterColor, stripeA, stripeB, sign, goods }) {
  const rand = Math.random;
  const group = new THREE.Group();

  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.1, 1.5),
    new THREE.MeshStandardMaterial({ color: counterColor, roughness: 0.85 })
  );
  counter.position.y = 0.55;
  counter.castShadow = true;
  group.add(counter);

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(2.85, 0.12, 1.75),
    new THREE.MeshStandardMaterial({ color: 0xf5ecd7, roughness: 0.8 })
  );
  top.position.y = 1.16;
  group.add(top);

  const poleMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 });
  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.5, 6), poleMat);
    pole.position.set(side * 1.25, 1.25, -0.55);
    group.add(pole);
  }

  const awningTex = makeStripeTexture(stripeA, stripeB);
  const awning = new THREE.Mesh(
    new THREE.PlaneGeometry(2.9, 2.0),
    new THREE.MeshStandardMaterial({ map: awningTex, side: THREE.DoubleSide, roughness: 0.8 })
  );
  awning.position.set(0, 2.42, -0.05);
  awning.rotation.x = -Math.PI / 2 + 0.42;
  awning.castShadow = true;
  group.add(awning);

  const board = createTextBoard(sign, 1.7, 0.62, { fontSize: 44 });
  board.position.set(0, 1.85, 0.78);
  group.add(board);

  if (goods === "buns") {
    const mat = new THREE.MeshStandardMaterial({ color: 0xefc98f, roughness: 0.8 });
    for (let i = 0; i < 4; i++) {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), mat);
      bun.scale.y = 0.75;
      bun.position.set(-0.8 + (i % 2) * 0.45 + rand() * 0.1, 1.32, -0.25 + Math.floor(i / 2) * 0.4);
      group.add(bun);
    }
  } else if (goods === "drinks") {
    const colors = [0xff8c42, 0x58b7d9, 0xffd93d];
    for (let i = 0; i < 3; i++) {
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.08, 0.28, 10),
        new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.5 })
      );
      cup.position.set(-0.5 + i * 0.5, 1.36, -0.15);
      group.add(cup);
      const straw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.3, 6),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      straw.position.set(-0.5 + i * 0.5, 1.6, -0.15);
      straw.rotation.z = 0.2;
      group.add(straw);
    }
  } else if (goods === "icecream") {
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.11, 0.3, 8),
        new THREE.MeshStandardMaterial({ color: 0xd9a05b, roughness: 0.9 })
      );
      cone.position.set(-0.4 + i * 0.4, 1.42, -0.15);
      group.add(cone);
      const scoop = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xf7c9d4, roughness: 0.6 })
      );
      scoop.position.set(-0.4 + i * 0.4, 1.62, -0.15);
      group.add(scoop);
    }
  } else if (goods === "snacks") {
    const meatMat = new THREE.MeshStandardMaterial({ color: 0x9a4a2f, roughness: 0.85 });
    for (let i = 0; i < 3; i++) {
      const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6),
        new THREE.MeshStandardMaterial({ color: 0xd9cba8 })
      );
      stick.rotation.z = Math.PI / 2;
      stick.position.set(-0.5 + i * 0.45, 1.32, -0.2);
      group.add(stick);
      for (let j = 0; j < 2; j++) {
        const chunk = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), meatMat);
        chunk.position.set(-0.38 + i * 0.45 + j * 0.22, 1.32 + (j % 2) * 0.001, -0.2);
        group.add(chunk);
      }
    }
  } else if (goods === "dumplings") {
    const mat = new THREE.MeshStandardMaterial({ color: 0xfdfaf2, roughness: 0.75 });
    for (let i = 0; i < 5; i++) {
      const dumpling = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), mat);
      dumpling.scale.set(1.15, 0.55, 0.8);
      dumpling.position.set(-0.75 + i * 0.38, 1.28, -0.2);
      group.add(dumpling);
    }
  }

  return group;
}

export function buildFoodStreet(scene, { collide, collideBox }) {
  const defs = [
    { x: -14, z: -3.6, ry: 0, counterColor: 0xd98e4a, stripeA: "#ff8c42", stripeB: "#ffffff", sign: "早餐店", goods: "buns" },
    { x: -17.5, z: -3.6, ry: 0, counterColor: 0x4fb3d9, stripeA: "#2ea8c9", stripeB: "#ffffff", sign: "飲料店", goods: "drinks" },
    { x: -21, z: -3.6, ry: 0, counterColor: 0xf7c9d4, stripeA: "#ff9db8", stripeB: "#ffffff", sign: "冰淇淋店", goods: "icecream" },
    { x: -24.5, z: -3.6, ry: 0, counterColor: 0xc0623b, stripeA: "#e74c3c", stripeB: "#ffd93d", sign: "小吃攤", goods: "snacks" },
    { x: -15.5, z: 3.6, ry: Math.PI, counterColor: 0xd98e4a, stripeA: "#ffd93d", stripeB: "#ffffff", sign: "點心攤", goods: "dumplings" },
    { x: -19, z: 3.6, ry: Math.PI, counterColor: 0x9b59b6, stripeA: "#9b59b6", stripeB: "#ffffff", sign: "果汁吧", goods: "drinks" },
    { x: -22.5, z: 3.6, ry: Math.PI, counterColor: 0x8fbf5a, stripeA: "#8fbf5a", stripeB: "#ffffff", sign: "水果串", goods: "snacks" },
    { x: -26, z: 3.6, ry: Math.PI, counterColor: 0xe78fb3, stripeA: "#ff6f91", stripeB: "#ffffff", sign: "甜品屋", goods: "icecream" },
  ];

  for (const def of defs) {
    const stall = createStall(def);
    stall.position.set(def.x, 0, def.z);
    stall.rotation.y = def.ry;
    scene.add(stall);
    collide(def.x, def.z, 1.3);
  }

  const restaurant = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(5, 3, 4),
    new THREE.MeshStandardMaterial({ color: 0xc0623b, roughness: 0.85 })
  );
  body.position.y = 1.5;
  body.castShadow = true;
  restaurant.add(body);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(4, 1.6, 4),
    new THREE.MeshStandardMaterial({ color: 0x8f3f22, roughness: 0.8 })
  );
  roof.position.y = 4;
  roof.rotation.y = Math.PI / 4;
  restaurant.add(roof);
  const rBoard = createTextBoard("果汁餐廳", 2.6, 0.9);
  rBoard.position.set(0, 2.6, 2.05);
  restaurant.add(rBoard);
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x6b4226 })
  );
  door.position.set(0, 1, 2.03);
  restaurant.add(door);
  restaurant.position.set(-30, 0, 0);
  scene.add(restaurant);
  collideBox(-30, 0, 2.55, 2.05);

  const arch = createArch(0xff8c42);
  arch.position.set(-12.5, 0, 0);
  arch.rotation.y = Math.PI / 2;
  scene.add(arch);
  collide(-12.5, -3, 0.38);
  collide(-12.5, 3, 0.38);

  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffe9a8,
    emissive: 0xffdf8a,
    emissiveIntensity: 1.1,
    roughness: 0.4,
  });
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.8 });

  for (const rowZ of [-5.4, 5.4]) {
    for (let seg = 0; seg < 3; seg++) {
      const cx = -15 - seg * 4.5;
      const wire = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.02, 0.02), wireMat);
      wire.position.set(cx, 2.55, rowZ);
      scene.add(wire);
      for (let b = 0; b < 5; b++) {
        const t = (b + 0.5) / 5;
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), bulbMat);
        bulb.position.set(cx - 2.25 + t * 4.5, 2.55 - Math.sin(t * Math.PI) * 0.35, rowZ);
        scene.add(bulb);
      }
    }
    for (let p = 0; p < 4; p++) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, 2.6, 6),
        new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 })
      );
      pole.position.set(-13 - p * 4.5, 1.3, rowZ);
      scene.add(pole);
    }
  }

  const sign = createTextBoard("美食街", 2.6, 1.1);
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 });
  const signGroup = new THREE.Group();
  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.6, 8), woodMat);
    pole.position.set(side * 1.05, 1.3, 0);
    signGroup.add(pole);
  }
  sign.position.y = 2.1;
  signGroup.add(sign);
  signGroup.position.set(-10.2, 0, 5);
  signGroup.rotation.y = Math.PI * 0.75;
  scene.add(signGroup);
  collide(-10.2, 5, 0.35);
}
