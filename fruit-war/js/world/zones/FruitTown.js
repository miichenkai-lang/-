import * as THREE from "three";
import { mulberry32, createTree, createTextBoard } from "../WorldUtils.js";

const CENTER_X = 31;
const CENTER_Z = 23;

export function buildFruitTown(scene, { collide, collideBox }) {
  const rand = mulberry32(555002);

  const square = new THREE.Mesh(
    new THREE.CircleGeometry(15, 40),
    new THREE.MeshStandardMaterial({ color: 0xcfc5b0, roughness: 0.95 })
  );
  square.rotation.x = -Math.PI / 2;
  square.position.set(0, 0.058, -33);
  square.receiveShadow = true;
  scene.add(square);

  const houseDefs = [
    { x: -11, z: -28, wall: 0xe2504f, roof: 0xb03a3a },
    { x: 11, z: -29, wall: 0xef8c3a, roof: 0xc96a25 },
    { x: -4, z: -39, wall: 0xf2d24b, roof: 0xcfae2f },
    { x: 5, z: -38, wall: 0x9b59b6, roof: 0x7b3fa0 },
    { x: -13, z: -40, wall: 0x8fbf5a, roof: 0x6a9a3e },
    { x: 14, z: -41, wall: 0x5d8fd9, roof: 0x3f6fb5 },
  ];

  for (const def of houseDefs) {
    const house = new THREE.Group();

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.2, 4.2),
      new THREE.MeshStandardMaterial({ color: 0xb0a89a, roughness: 0.95 })
    );
    base.position.y = 0.1;
    house.add(base);

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.8, 3.6),
      new THREE.MeshStandardMaterial({ color: def.wall, roughness: 0.85 })
    );
    body.position.y = 1.6;
    body.castShadow = true;
    house.add(body);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.4, 1.9, 4),
      new THREE.MeshStandardMaterial({ color: def.roof, roughness: 0.8 })
    );
    roof.position.y = 3.95;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    const ballMat = new THREE.MeshStandardMaterial({ color: def.wall, roughness: 0.5 });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 10), ballMat);
    ball.position.y = 5.35;
    house.add(ball);

    const door = new THREE.Mesh(
      new THREE.CircleGeometry(0.62, 20),
      new THREE.MeshStandardMaterial({ color: 0x5b3a1e, roughness: 0.85 })
    );
    door.position.set(0, 0.95, 1.82);
    house.add(door);

    const doorFrame = new THREE.Mesh(
      new THREE.TorusGeometry(0.66, 0.06, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0xf5ecd7, roughness: 0.7 })
    );
    doorFrame.position.copy(door.position);
    house.add(doorFrame);

    const winMat = new THREE.MeshStandardMaterial({
      color: 0xfff2c8,
      emissive: 0xffe9a8,
      emissiveIntensity: 0.35,
      roughness: 0.3,
    });
    for (const side of [-1, 1]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.07), winMat);
      win.position.set(side * 1.25, 1.9, 1.81);
      house.add(win);
    }

    house.position.set(def.x, 0, def.z);
    scene.add(house);
    collideBox(def.x, def.z - 0.1, 1.9, 1.7);
  }

  const pond = new THREE.Mesh(
    new THREE.CircleGeometry(3, 24),
    new THREE.MeshStandardMaterial({ color: 0x58b7d9, roughness: 0.25 })
  );
  pond.rotation.x = -Math.PI / 2;
  pond.scale.set(1.3, 1, 1);
  pond.position.set(9, 0.062, -44);
  scene.add(pond);
  collide(9, -44, 3.8);

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9b9b93, roughness: 1, flatShading: true });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22 + rand() * 0.12), stoneMat);
    stone.position.set(9 + Math.sin(a) * (3 * 1.3 + 0.3), 0.12, -44 + Math.cos(a) * 1.3);
    stone.rotation.y = rand() * Math.PI;
    scene.add(stone);
  }

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.95 });
  const leafMats = [0x47a04b, 0x54ad57].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }));
  const parkTrees = [
    [-6, -34],
    [13, -36],
    [-15, -33],
  ];
  for (const [x, z] of parkTrees) {
    const tree = createTree(rand, leafMats[Math.floor(rand() * 2)], trunkMat);
    tree.position.set(x, 0, z);
    tree.rotation.y = rand() * Math.PI * 2;
    scene.add(tree);
    collide(x, z, 0.45);
  }

  const woodMat = new THREE.MeshStandardMaterial({ color: 0xb98a4e, roughness: 0.85 });
  for (const [bx, bz, ry] of [
    [4.5, -30.5, Math.PI],
    [-6, -35.5, 0],
  ]) {
    const bench = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.5), woodMat);
    seat.position.y = 0.45;
    bench.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.06), woodMat);
    back.position.set(0, 0.72, -0.22);
    back.rotation.x = -0.15;
    bench.add(back);
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.4), woodMat);
      leg.position.set(side * 0.75, 0.225, 0);
      bench.add(leg);
    }
    bench.position.set(bx, 0, bz);
    bench.rotation.y = ry;
    scene.add(bench);
    collide(bx, bz, 0.95);
  }

  const signGroup = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 });
  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.7, 8), poleMat);
    pole.position.set(side * 0.8, 0.85, 0);
    signGroup.add(pole);
  }
  const board = createTextBoard("水果城鎮", 2.2, 1.0);
  board.position.y = 1.95;
  signGroup.add(board);
  signGroup.position.set(0, 0, -25.5);
  scene.add(signGroup);
  collide(0, -25.5, 0.35);
}
