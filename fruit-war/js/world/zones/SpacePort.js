import * as THREE from "three";
import { mulberry32, createTextBoard } from "../WorldUtils.js";

export function buildSpacePort(scene, { animate, collide }) {
  const rand = mulberry32(20261001);

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.7, metalness: 0.3 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.6 });
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: 0xffffcc, emissiveIntensity: 0.8 });

  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 0.2, 32),
    new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6, metalness: 0.4 })
  );
  pad.position.set(0, 0.1, 0);
  pad.receiveShadow = true;
  scene.add(pad);
  collide(0, 0, 5.5);

  const padMark1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.05, 8),
    new THREE.MeshStandardMaterial({ color: 0xffff00 })
  );
  padMark1.position.set(0, 0.22, 0);
  scene.add(padMark1);

  const padMark2 = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.05, 0.15),
    new THREE.MeshStandardMaterial({ color: 0xffff00 })
  );
  padMark2.position.set(0, 0.22, 0);
  scene.add(padMark2);

  const padRing = new THREE.Mesh(
    new THREE.TorusGeometry(5, 0.08, 8, 32),
    new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.3 })
  );
  padRing.rotation.x = -Math.PI / 2;
  padRing.position.set(0, 0.22, 0);
  scene.add(padRing);

  const rocket = createRocket();
  rocket.position.set(0, 0.2, 0);
  scene.add(rocket);

  const landingLights = [];
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const ll = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 1 })
    );
    ll.position.set(Math.cos(ang) * 5.5, 0.25, Math.sin(ang) * 5.5);
    scene.add(ll);
    landingLights.push(ll);
  }

  animate((elapsed) => {
    for (let i = 0; i < landingLights.length; i++) {
      const phase = (i / landingLights.length) * Math.PI * 2;
      landingLights[i].material.emissiveIntensity = 0.3 + Math.sin(elapsed * 2 + phase) * 0.7;
    }
  });

  const controlTower = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.8, 6, 8),
    baseMat
  );
  controlTower.position.set(8, 3, -6);
  controlTower.castShadow = true;
  scene.add(controlTower);
  collide(8, -6, 1.8);

  const towerWindows = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.6, 1.2, 8, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      side: THREE.DoubleSide,
    })
  );
  towerWindows.position.set(8, 5, -6);
  scene.add(towerWindows);

  const towerRoof = new THREE.Mesh(
    new THREE.ConeGeometry(1.8, 1, 8),
    new THREE.MeshStandardMaterial({ color: 0xff4444, roughness: 0.7 })
  );
  towerRoof.position.set(8, 6.5, -6);
  scene.add(towerRoof);

  const towerAntenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 2, 6),
    metalMat
  );
  towerAntenna.position.set(8, 7.5, -6);
  scene.add(towerAntenna);

  const towerLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff3333, emissiveIntensity: 1 })
  );
  towerLight.position.set(8, 8.5, -6);
  scene.add(towerLight);

  animate((elapsed) => {
    towerLight.material.emissiveIntensity = 0.5 + Math.sin(elapsed * 3) * 0.5;
  });

  const boothMat = new THREE.MeshStandardMaterial({ color: 0x3a5a8a, roughness: 0.7, metalness: 0.2 });
  const booth = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.8, 2.5), boothMat);
  booth.position.set(-8, 1.4, -4);
  booth.castShadow = true;
  booth.receiveShadow = true;
  scene.add(booth);
  collide(-8, -4, 1.5);

  const boothRoof = new THREE.Mesh(
    new THREE.ConeGeometry(2.2, 1.1, 4),
    new THREE.MeshStandardMaterial({ color: 0xff4444, roughness: 0.7 })
  );
  boothRoof.position.set(-8, 3.35, -4);
  boothRoof.rotation.y = Math.PI / 4;
  scene.add(boothRoof);

  const rocketSign = createTextBoard("🚀 月球火箭 $15", 2.8, 1.0, { bg: "#0a0a2e", fg: "#aaddff" });
  rocketSign.position.set(-8, 4.2, -4);
  scene.add(rocketSign);

  for (const side of [-1, 1]) {
    const windowPane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5, roughness: 0.1 })
    );
    windowPane.position.set(-8 + side * 0.7, 1.8, -4 + 1.26);
    scene.add(windowPane);
  }

  const benchMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
  for (const [bx, bz] of [[6, 4], [-5, 5], [3, -8]]) {
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.1, 0.5),
      benchMat
    );
    bench.position.set(bx, 0.5, bz);
    scene.add(bench);

    for (const bside of [-0.6, 0.6]) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.5, 0.08),
        benchMat
      );
      leg.position.set(bx + bside, 0.25, bz);
      scene.add(leg);
    }
    collide(bx, bz, 0.8);
  }

  const signGroup = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 });
  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.7, 8), woodMat);
    pole.position.set(side * 0.8, 0.85, 0);
    signGroup.add(pole);
  }
  const board = createTextBoard("太空港", 2.2, 1.0, { bg: "#0a0a2e", fg: "#aaddff" });
  board.position.y = 1.95;
  signGroup.add(board);
  signGroup.position.set(-12, 0, 6);
  signGroup.rotation.y = 0.5;
  scene.add(signGroup);
  collide(-12, 6, 0.35);

  const pathMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });
  for (let i = 0; i < 8; i++) {
    const path = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.05, 1.5),
      pathMat
    );
    path.position.set(-6 + i * 2, 0.03, -4);
    scene.add(path);
  }

  for (let i = 0; i < 5; i++) {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.8, 10),
      new THREE.MeshStandardMaterial({ color: 0xcc4444, roughness: 0.8 })
    );
    barrel.position.set(10 + i * 0.9, 0.4, 2);
    barrel.castShadow = true;
    scene.add(barrel);
  }
  collide(10, 2, 0.5);

  const solarMat = new THREE.MeshStandardMaterial({ color: 0x2244aa, metalness: 0.6, roughness: 0.3 });
  for (const side of [-1, 1]) {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.08, 1.2),
      solarMat
    );
    panel.position.set(12, 2, -8 + side * 3);
    panel.rotation.z = side * 0.3;
    scene.add(panel);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2, 6),
      baseMat
    );
    pole.position.set(12, 1, -8 + side * 3);
    scene.add(pole);
  }
}

function createRocket() {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5, metalness: 0.3 });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0xff4444, roughness: 0.6 });
  const finMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7, metalness: 0.4 });

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.5, 3, 12),
    bodyMat
  );
  body.position.y = 2;
  body.castShadow = true;
  group.add(body);

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 1, 12),
    noseMat
  );
  nose.position.y = 4;
  nose.castShadow = true;
  group.add(nose);

  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    emissive: 0x4488cc,
    emissiveIntensity: 0.3,
    roughness: 0.1,
  });
  const window1 = new THREE.Mesh(new THREE.CircleGeometry(0.15, 12), windowMat);
  window1.position.set(0, 2.8, 0.41);
  group.add(window1);

  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.2, 0.8),
      finMat
    );
    const ang = (i / 3) * Math.PI * 2;
    fin.position.set(Math.sin(ang) * 0.55, 0.8, Math.cos(ang) * 0.55);
    fin.rotation.y = -ang;
    group.add(fin);
  }

  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.7,
  });
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.8, 8),
    flameMat
  );
  flame.position.y = 0.2;
  flame.rotation.x = Math.PI;
  group.add(flame);

  const flameInner = new THREE.Mesh(
    new THREE.ConeGeometry(0.15, 0.5, 8),
    new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.8 })
  );
  flameInner.position.y = 0.3;
  flameInner.rotation.x = Math.PI;
  group.add(flameInner);

  return group;
}
