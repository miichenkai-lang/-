import * as THREE from "three";
import { mulberry32, createTree, createTextBoard } from "../WorldUtils.js";

const CENTER_X = -30;
const CENTER_Z = -26;

export function buildOrchard(scene, { collide }) {
  const rand = mulberry32(777001);

  const soilMat = new THREE.MeshStandardMaterial({ color: 0x9a6a3f, roughness: 1 });
  const appleLeafMat = new THREE.MeshStandardMaterial({ color: 0x47a04b, roughness: 0.9 });
  const orangeLeafMat = new THREE.MeshStandardMaterial({ color: 0x3f9142, roughness: 0.9 });
  const mangoLeafMat = new THREE.MeshStandardMaterial({ color: 0x2f7d4f, roughness: 0.9 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.95 });
  const appleMat = new THREE.MeshStandardMaterial({ color: 0xe23b3b, roughness: 0.5 });
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xff8c00, roughness: 0.55 });
  const mangoMat = new THREE.MeshStandardMaterial({ color: 0xffb347, roughness: 0.55 });

  function soilPatch(x, z, r = 1.6) {
    const patch = new THREE.Mesh(new THREE.CircleGeometry(r, 16), soilMat);
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(x, 0.058, z);
    scene.add(patch);
  }

  const appleSpots = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      appleSpots.push([CENTER_X - 4 + col * 4, CENTER_Z - 5 + row * 4]);
    }
  }
  for (const [x, z] of appleSpots) {
    soilPatch(x, z);
    const tree = createTree(rand, appleLeafMat, trunkMat, { fruits: appleMat, fruitCount: 4 });
    tree.position.set(x, 0, z);
    tree.rotation.y = rand() * Math.PI * 2;
    scene.add(tree);
    collide(x, z, 0.42);
  }

  const orangeSpots = [
    [CENTER_X + 7, CENTER_Z - 4],
    [CENTER_X + 10, CENTER_Z],
    [CENTER_X + 5, CENTER_Z + 1],
  ];
  for (const [x, z] of orangeSpots) {
    soilPatch(x, z);
    const tree = createTree(rand, orangeLeafMat, trunkMat, { fruits: orangeMat, fruitCount: 5 });
    tree.position.set(x, 0, z);
    tree.rotation.y = rand() * Math.PI * 2;
    scene.add(tree);
    collide(x, z, 0.42);
  }

  const mangoSpots = [
    [CENTER_X - 6, CENTER_Z + 6],
    [CENTER_X - 2, CENTER_Z + 9],
    [CENTER_X + 2, CENTER_Z + 5],
  ];
  for (const [x, z] of mangoSpots) {
    soilPatch(x, z, 1.9);
    const tree = createTree(rand, mangoLeafMat, trunkMat, { fruits: null });
    tree.scale.setScalar(1.25);
    tree.position.set(x, 0, z);
    scene.add(tree);
    collide(x, z, 0.52);
    for (let f = 0; f < 4; f++) {
      const mango = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), mangoMat);
      mango.scale.set(1, 1.35, 0.85);
      const a = rand() * Math.PI * 2;
      mango.position.set(x + Math.sin(a) * 1.1, 2.4 + rand() * 0.7, z + Math.cos(a) * 1.1);
      scene.add(mango);
    }
  }

  const postMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.95 });
  const grapeMat = new THREE.MeshStandardMaterial({ color: 0x7b3fa0, roughness: 0.5 });
  const vineMat = new THREE.MeshStandardMaterial({ color: 0x3f7d36, roughness: 0.9 });

  for (let g = 0; g < 3; g++) {
    const gx = CENTER_X - 4 + g * 4;
    const gz = CENTER_Z - 10;
    soilPatch(gx, gz, 1.2);

    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.3, 6), postMat);
      post.position.set(gx + side * 1.6, 1.15, gz);
      post.castShadow = true;
      scene.add(post);
      collide(gx + side * 1.6, gz, 0.16);
    }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 0.12), postMat);
    bar.position.set(gx, 2.25, gz);
    scene.add(bar);
    const vine = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.07, 0.07), vineMat);
    vine.position.set(gx, 2.1, gz);
    scene.add(vine);

    for (let cIdx = 0; cIdx < 3; cIdx++) {
      const cx = gx - 1.1 + cIdx * 1.1;
      for (let s = 0; s < 6; s++) {
        const berry = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), grapeMat);
        const layer = s % 3;
        berry.position.set(
          cx + (rand() - 0.5) * 0.18,
          2.0 - layer * 0.16 - rand() * 0.05,
          gz + (s % 2 ? 0.09 : -0.09)
        );
        scene.add(berry);
      }
    }
  }

  const crateMat = new THREE.MeshStandardMaterial({ color: 0xb98a4e, roughness: 0.9 });
  for (let i = 0; i < 3; i++) {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.85), crateMat);
    crate.position.set(CENTER_X + 6.5 + (i % 2) * 0.95, 0.43 + (i === 2 ? 0.85 : 0), CENTER_Z + 8 + Math.floor(i / 2));
    crate.rotation.y = i * 0.5;
    crate.castShadow = true;
    scene.add(crate);
  }
  const basket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.4, 0.45, 10),
    new THREE.MeshStandardMaterial({ color: 0xc99a63, roughness: 0.9 })
  );
  basket.position.set(CENTER_X + 9, 0.23, CENTER_Z + 8.5);
  scene.add(basket);
  collide(CENTER_X + 7.5, CENTER_Z + 7.8, 1.2);
  collide(CENTER_X + 9, CENTER_Z + 8.5, 0.55);
  for (let o = 0; o < 5; o++) {
    const orange = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), orangeMat);
    orange.position.set(CENTER_X + 8.8 + (o % 3) * 0.2, 0.5, CENTER_Z + 8.4 + Math.floor(o / 3) * 0.22);
    scene.add(orange);
  }

  const signGroup = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 });
  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.6, 8), woodMat);
    pole.position.set(side * 0.8, 0.8, 0);
    signGroup.add(pole);
  }
  const board = createTextBoard("果園區", 2.2, 1.0);
  board.position.y = 1.85;
  signGroup.add(board);
  signGroup.position.set(-22.8, 0, -20.6);
  signGroup.rotation.y = 0.86;
  scene.add(signGroup);
  collide(-22.8, -20.6, 0.35);
}
