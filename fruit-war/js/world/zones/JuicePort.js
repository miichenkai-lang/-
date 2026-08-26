import * as THREE from "three";
import { mulberry32, makeStripeTexture, createTextBoard } from "../WorldUtils.js";

export function buildJuicePort(scene, { animate, collide }) {
  const rand = mulberry32(131005);

  const deckMat = new THREE.MeshStandardMaterial({ color: 0xa87d4f, roughness: 0.9 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x7a5a33, roughness: 0.95 });

  const deck = new THREE.Mesh(new THREE.BoxGeometry(13, 0.35, 13), deckMat);
  deck.position.set(-38, 0.02, 38);
  deck.receiveShadow = true;
  scene.add(deck);

  const pierGroup = new THREE.Group();
  pierGroup.position.set(-44.5, 0.02, 44.5);
  pierGroup.rotation.y = -Math.PI / 4;
  scene.add(pierGroup);

  const pierDeck = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.18, 11), deckMat);
  pierDeck.position.set(0, -0.05, 5.5);
  pierDeck.receiveShadow = true;
  pierGroup.add(pierDeck);

  for (let p = 0; p < 3; p++) {
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 2.4, 8), darkWoodMat);
      post.position.set(side * 1.45, -1.1, 2 + p * 3.2);
      pierGroup.add(post);
    }
  }
  for (const side of [-1, 1]) {
    const mooring = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.7, 8), darkWoodMat);
    mooring.position.set(side * 1.2, 0.35, 10.2);
    pierGroup.add(mooring);
  }

  function createBoat(sailStripe) {
    const boat = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x9a4a2f, roughness: 0.8 });
    const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), hullMat);
    hull.scale.set(1.05, 0.55, 2.3);
    boat.add(hull);
    const deckTop = new THREE.Mesh(
      new THREE.CircleGeometry(0.85, 14),
      new THREE.MeshStandardMaterial({ color: 0xc99a63, roughness: 0.9 })
    );
    deckTop.rotation.x = -Math.PI / 2;
    deckTop.scale.set(1.05, 2.1, 1);
    deckTop.position.y = 0.32;
    boat.add(deckTop);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.8, 8), darkWoodMat);
    mast.position.y = 1.6;
    boat.add(mast);
    const sailGeo = new THREE.PlaneGeometry(1.5, 1.9);
    let sailMat;
    if (sailStripe) {
      sailMat = new THREE.MeshStandardMaterial({
        map: makeStripeTexture("#ff8c42", "#ffffff"),
        side: THREE.DoubleSide,
        roughness: 0.9,
      });
    } else {
      sailMat = new THREE.MeshStandardMaterial({ color: 0xfdfaf2, side: THREE.DoubleSide, roughness: 0.9 });
    }
    const sail = new THREE.Mesh(sailGeo, sailMat);
    sail.position.set(0, 1.85, 0.05);
    boat.add(sail);
    return boat;
  }

  const boats = [];
  const boatA = createBoat(true);
  boatA.position.set(-50, -0.35, 41);
  boatA.rotation.y = 0.5;
  scene.add(boatA);
  boats.push(boatA);
  const boatB = createBoat(false);
  boatB.position.set(-43, -0.35, 52);
  boatB.rotation.y = -2.4;
  scene.add(boatB);
  boats.push(boatB);

  animate((elapsed) => {
    boats.forEach((boat, i) => {
      boat.position.y = -0.35 + Math.sin(elapsed * 0.9 + i * 2.2) * 0.09;
      boat.rotation.z = Math.sin(elapsed * 0.8 + i * 1.4) * 0.045;
      boat.rotation.x = Math.cos(elapsed * 0.7 + i) * 0.03;
    });
  });

  const lighthouse = new THREE.Group();
  const rockBase = new THREE.Mesh(
    new THREE.CylinderGeometry(2.3, 2.9, 1.8, 10),
    new THREE.MeshStandardMaterial({ color: 0x777d88, roughness: 1, flatShading: true })
  );
  rockBase.position.y = -0.4;
  lighthouse.add(rockBase);

  for (let seg = 0; seg < 4; seg++) {
    const rBottom = 1.15 - seg * 0.12;
    const rTop = 1.03 - seg * 0.12;
    const color = seg % 2 === 0 ? 0xf5ecd7 : 0xe74c3c;
    const part = new THREE.Mesh(
      new THREE.CylinderGeometry(rTop, rBottom, 1.5, 12),
      new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
    );
    part.position.y = 0.5 + seg * 1.5;
    part.castShadow = true;
    lighthouse.add(part);
  }

  const gallery = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.95, 0.22, 12),
    new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.7 })
  );
  gallery.position.y = 6.6;
  lighthouse.add(gallery);

  const lampRoom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.75, 12),
    new THREE.MeshStandardMaterial({
      color: 0xfff2b0,
      emissive: 0xffe38a,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.92,
    })
  );
  lampRoom.position.y = 7.05;
  lighthouse.add(lampRoom);

  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(0.72, 0.55, 12),
    new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.7 })
  );
  cap.position.y = 7.7;
  lighthouse.add(cap);

  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xfff2b0,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const beamPivot = new THREE.Group();
  beamPivot.position.y = 7.05;
  for (const dir of [1, -1]) {
    const beam = new THREE.Mesh(new THREE.ConeGeometry(0.55, 7, 10, 1, true), beamMat);
    beam.rotation.z = (dir * Math.PI) / 2;
    beam.position.x = dir * 3.5;
    beamPivot.add(beam);
  }
  lighthouse.add(beamPivot);

  lighthouse.position.set(-56, 0, 56);
  scene.add(lighthouse);
  collide(-56, 56, 1.3);

  animate((elapsed) => {
    beamPivot.rotation.y = elapsed * 0.6;
  });

  for (let i = 0; i < 3; i++) {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 12), darkWoodMat);
    barrel.position.set(-41 + i * 1.3, 0.7, 34.5 + (i % 2) * 0.4);
    barrel.castShadow = true;
    scene.add(barrel);
    collide(-41 + i * 1.3, 34.5 + (i % 2) * 0.4, 0.55);
  }
  for (let i = 0; i < 2; i++) {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.85), deckMat);
    crate.position.set(-35.5, 0.62 + i * 0.85, 34.8);
    crate.rotation.y = i * 0.5;
    crate.castShadow = true;
    scene.add(crate);
  }
  collide(-35.5, 34.8, 0.65);

  const signGroup = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 });
  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.7, 8), woodMat);
    pole.position.set(side * 0.8, 0.85, 0);
    signGroup.add(pole);
  }
  const board = createTextBoard("果汁港口", 2.2, 1.0, { bg: "#1f6fb2" });
  board.position.y = 1.95;
  signGroup.add(board);
  signGroup.position.set(-31, 0, 33);
  signGroup.rotation.y = 0.95;
  scene.add(signGroup);
  collide(-31, 33, 0.35);

  const ticketBoothMat = new THREE.MeshStandardMaterial({ color: 0x3a5a8a, roughness: 0.7, metalness: 0.2 });
  const booth = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.5, 2.2), ticketBoothMat);
  booth.position.set(-46, 1.25, 44);
  booth.castShadow = true;
  booth.receiveShadow = true;
  scene.add(booth);
  collide(-46, 44, 1.4);

  const boothRoof = new THREE.Mesh(
    new THREE.ConeGeometry(2, 1, 4),
    new THREE.MeshStandardMaterial({ color: 0xff4444, roughness: 0.7 })
  );
  boothRoof.position.set(-46, 3, 44);
  boothRoof.rotation.y = Math.PI / 4;
  scene.add(boothRoof);

  const rocketSign = createTextBoard("🚀 月球火箭 $15", 2.5, 0.9, { bg: "#0a0a2e", fg: "#aaddff" });
  rocketSign.position.set(-46, 3.8, 44);
  scene.add(rocketSign);

  for (const side of [-1, 1]) {
    const windowPane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5, roughness: 0.1 })
    );
    windowPane.position.set(-46 + side * 0.6, 1.8, 44 + 1.11);
    scene.add(windowPane);
  }
}
