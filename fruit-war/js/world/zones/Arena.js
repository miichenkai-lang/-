import * as THREE from "three";
import { mulberry32, createTextBoard } from "../WorldUtils.js";

const CENTER_X = 26;
const CENTER_Z = -22;

export function buildArena(scene, { animate, collide }) {
  const rand = mulberry32(20260824);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(11.5, 40),
    new THREE.MeshStandardMaterial({ color: 0xcbb178, roughness: 1 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(CENTER_X, 0.062, CENTER_Z);
  floor.receiveShadow = true;
  scene.add(floor);

  const emblem = new THREE.Mesh(
    new THREE.CircleGeometry(3, 24),
    new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.9 })
  );
  emblem.rotation.x = -Math.PI / 2;
  emblem.position.set(CENTER_X, 0.07, CENTER_Z);
  scene.add(emblem);

  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xe74c3c,
    emissive: 0x661410,
    roughness: 0.6,
  });
  const redRing = new THREE.Mesh(new THREE.TorusGeometry(8, 0.14, 8, 48), ringMat);
  redRing.rotation.x = -Math.PI / 2;
  redRing.position.set(CENTER_X, 0.09, CENTER_Z);
  scene.add(redRing);

  const entranceAngle = Math.atan2(-CENTER_X, -CENTER_Z);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xa89b8a, roughness: 0.9 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xcabfae, roughness: 0.85 });
  const segments = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    let diff = (a - entranceAngle) % (Math.PI * 2);
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (Math.abs(diff) < 0.52) continue;

    const segGroup = new THREE.Group();
    const wall = new THREE.Mesh(new THREE.BoxGeometry(7.5, 3, 1.2), wallMat);
    wall.position.y = 1.5;
    wall.castShadow = true;
    segGroup.add(wall);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(7.7, 0.28, 1.45), trimMat);
    trim.position.y = 3.12;
    segGroup.add(trim);

    segGroup.position.set(CENTER_X + Math.sin(a) * 13, 0, CENTER_Z + Math.cos(a) * 13);
    segGroup.rotation.y = a;
    scene.add(segGroup);
    const dx = Math.cos(a);
    const dz = -Math.sin(a);
    for (const off of [-2.4, 0, 2.4]) {
      collide(segGroup.position.x + dx * off, segGroup.position.z + dz * off, 1.15);
    }
  }

  const flagGeo = new THREE.PlaneGeometry(1.6, 1.0);
  flagGeo.translate(0.8, 0, 0);
  const flagMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, side: THREE.DoubleSide, roughness: 0.8 });
  segments.forEach((seg, i) => {
    if (i % 3 !== 0) return;
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0, 2.55, 0);
    seg.group.add(flag);
    animate((elapsed) => {
      flag.rotation.y = Math.sin(elapsed * 3 + i * 1.3) * 0.3;
    });
  });

  const poleMat = new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.65 });
  for (const offset of [0.34, -0.34]) {
    const a = entranceAngle + offset;
    const torch = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 2.6, 8), poleMat);
    pole.position.y = 1.3;
    pole.castShadow = true;
    torch.add(pole);
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.18, 0.32, 10),
      new THREE.MeshStandardMaterial({ color: 0x5a5f66, roughness: 0.6 })
    );
    bowl.position.y = 2.72;
    torch.add(bowl);
    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 10, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffa53d,
        emissive: 0xff7733,
        emissiveIntensity: 1.4,
        roughness: 0.35,
      })
    );
    flame.scale.y = 1.35;
    flame.position.y = 3.05;
    torch.add(flame);
    torch.position.set(CENTER_X + Math.sin(a) * 13.2, 0, CENTER_Z + Math.cos(a) * 13.2);
    scene.add(torch);
    animate((elapsed) => {
      flame.scale.setScalar(0.85 + Math.sin(elapsed * 11 + offset * 30) * 0.16);
      flame.scale.y *= 1.35;
    });
  }

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.75, 1.1, 10),
    new THREE.MeshStandardMaterial({ color: 0x777d88, roughness: 0.85 })
  );
  pedestal.position.set(CENTER_X, 0.61, CENTER_Z);
  pedestal.castShadow = true;
  scene.add(pedestal);
  collide(CENTER_X, CENTER_Z, 0.95);

  const trophyOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffd166,
      metalness: 0.6,
      roughness: 0.25,
      emissive: 0xcc7700,
      emissiveIntensity: 0.7,
    })
  );
  trophyOrb.position.set(CENTER_X, 1.55, CENTER_Z);
  scene.add(trophyOrb);
  animate((elapsed) => {
    trophyOrb.position.y = 1.55 + Math.sin(elapsed * 1.8) * 0.15;
    trophyOrb.rotation.y = elapsed * 1.2;
  });

  const signGroup = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 });
  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.7, 8), woodMat);
    pole.position.set(side * 0.8, 0.85, 0);
    signGroup.add(pole);
  }
  const board = createTextBoard("果子競技場", 2.4, 1.0, { bg: "#8f2015" });
  board.position.y = 1.95;
  signGroup.add(board);
  signGroup.position.set(19, 0, -16.5);
  signGroup.rotation.y = -0.86;
  scene.add(signGroup);
  collide(19, -16.5, 0.35);
}
