import * as THREE from "three";
import { mulberry32, createTextBoard } from "../WorldUtils.js";

const MOON_OFFSET_X = 0;
const MOON_OFFSET_Y = 200;
const MOON_OFFSET_Z = 0;
const MOON_RADIUS = 45;

export const MOON_OFFSET = new THREE.Vector3(MOON_OFFSET_X, MOON_OFFSET_Y, MOON_OFFSET_Z);

export function buildMoonBase(scene, { animate, collide }) {
  const rand = mulberry32(20260901);
  const group = new THREE.Group();
  group.position.copy(MOON_OFFSET);
  group.visible = false;

  const moonMat = new THREE.MeshStandardMaterial({
    color: 0xc8c8c8,
    roughness: 0.95,
    flatShading: true,
  });
  const darkMoonMat = new THREE.MeshStandardMaterial({
    color: 0xa0a0a0,
    roughness: 1,
    flatShading: true,
  });

  const moonGround = new THREE.Mesh(
    new THREE.CircleGeometry(MOON_RADIUS, 48),
    moonMat
  );
  moonGround.rotation.x = -Math.PI / 2;
  moonGround.position.y = -0.1;
  moonGround.receiveShadow = true;
  group.add(moonGround);

  const moonBase = new THREE.Mesh(
    new THREE.CylinderGeometry(MOON_RADIUS + 1, MOON_RADIUS + 8, 8, 48),
    darkMoonMat
  );
  moonBase.position.y = -4;
  group.add(moonBase);

  for (let i = 0; i < 18; i++) {
    const craterR = 1.5 + rand() * 3.5;
    const craterD = 0.2 + rand() * 0.4;
    const ang = rand() * Math.PI * 2;
    const dist = 5 + rand() * (MOON_RADIUS - 12);
    const cx = Math.cos(ang) * dist;
    const cz = Math.sin(ang) * dist;

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(craterR, craterD * 0.6, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0xb0b0b0, roughness: 0.95, flatShading: true })
    );
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(cx, 0.02, cz);
    group.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(craterR * 0.85, 16),
      new THREE.MeshStandardMaterial({ color: 0x909090, roughness: 1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(cx, -craterD * 0.3, cz);
    group.add(floor);
  }

  const floatingRocks = [];
  for (let i = 0; i < 8; i++) {
    const size = 0.6 + rand() * 1.5;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(size, 0),
      new THREE.MeshStandardMaterial({
        color: 0x999999,
        roughness: 0.9,
        flatShading: true,
      })
    );
    const ang = rand() * Math.PI * 2;
    const dist = 10 + rand() * (MOON_RADIUS - 15);
    const baseY = 2 + rand() * 4;
    rock.position.set(Math.cos(ang) * dist, baseY, Math.sin(ang) * dist);
    rock.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
    rock.castShadow = true;
    group.add(rock);
    floatingRocks.push({ mesh: rock, baseY, phase: rand() * Math.PI * 2, speed: 0.3 + rand() * 0.4 });
  }

  animate((elapsed) => {
    for (const fr of floatingRocks) {
      fr.mesh.position.y = fr.baseY + Math.sin(elapsed * fr.speed + fr.phase) * 0.8;
      fr.mesh.rotation.y += 0.003;
    }
  });

  const starField = createStarField(rand);
  starField.position.set(0, 0, 0);
  group.add(starField);

  const galaxy = createGalaxy(rand);
  galaxy.position.set(0, 30, -40);
  group.add(galaxy);

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.7, metalness: 0.3 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.4,
    roughness: 0.1,
    metalness: 0.2,
  });
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xffffcc,
    emissive: 0xffffcc,
    emissiveIntensity: 0.8,
  });

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(6, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    glassMat
  );
  dome.position.set(0, 0, -10);
  group.add(dome);

  const domeBase = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 6.3, 0.5, 24),
    baseMat
  );
  domeBase.position.set(0, 0, -10);
  group.add(domeBase);
  collide(MOON_OFFSET_X, -10 + MOON_OFFSET_Z, 6.5);

  const innerFloor = new THREE.Mesh(
    new THREE.CircleGeometry(5.8, 24),
    new THREE.MeshStandardMaterial({ color: 0x3a4a5a, roughness: 0.8 })
  );
  innerFloor.rotation.x = -Math.PI / 2;
  innerFloor.position.set(0, 0.05, -10);
  group.add(innerFloor);

  const cmdTower = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.5, 5, 8),
    baseMat
  );
  cmdTower.position.set(0, 2.5, -10);
  cmdTower.castShadow = true;
  group.add(cmdTower);

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 3, 6),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8 })
  );
  antenna.position.set(0, 6.5, -10);
  group.add(antenna);

  const antennaLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 6),
    new THREE.MeshStandardMaterial({
      color: 0xff3333,
      emissive: 0xff3333,
      emissiveIntensity: 1,
    })
  );
  antennaLight.position.set(0, 8, -10);
  group.add(antennaLight);

  animate((elapsed) => {
    antennaLight.material.emissiveIntensity = 0.5 + Math.sin(elapsed * 3) * 0.5;
  });

  const solarPanelMat = new THREE.MeshStandardMaterial({ color: 0x2244aa, metalness: 0.6, roughness: 0.3 });
  for (const side of [-1, 1]) {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.08, 1.5),
      solarPanelMat
    );
    panel.position.set(side * 8, 2.5, -10);
    panel.rotation.z = side * 0.3;
    group.add(panel);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2.5, 6),
      baseMat
    );
    pole.position.set(side * 8, 1.25, -10);
    group.add(pole);
  }

  for (let i = 0; i < 12; i++) {
    const size = 0.4 + rand() * 0.8;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(size, 0),
      new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.95,
        flatShading: true,
      })
    );
    const ang = rand() * Math.PI * 2;
    const dist = 8 + rand() * (MOON_RADIUS - 15);
    rock.position.set(Math.cos(ang) * dist, size * 0.4, Math.sin(ang) * dist);
    rock.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
    collide(MOON_OFFSET_X + rock.position.x, MOON_OFFSET_Z + rock.position.z, size * 0.8);
  }

  const landingPad = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3, 0.15, 24),
    new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6, metalness: 0.4 })
  );
  landingPad.position.set(0, 0.07, 15);
  group.add(landingPad);

  const padRing = new THREE.Mesh(
    new THREE.TorusGeometry(3, 0.08, 8, 32),
    new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.3 })
  );
  padRing.rotation.x = -Math.PI / 2;
  padRing.position.set(0, 0.15, 15);
  group.add(padRing);

  const rocket = createRocket();
  rocket.position.set(0, 0.15, 15);
  group.add(rocket);

  const signBoard = createTextBoard("月球基地", 3, 1.2, { bg: "#1a1a2e", fg: "#ccccff" });
  signBoard.position.set(0, 2.5, 8);
  group.add(signBoard);

  const craterLights = [];
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const dist = 18 + rand() * 8;
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 6),
      lightMat.clone()
    );
    lamp.position.set(Math.cos(ang) * dist, 0.15, Math.sin(ang) * dist);
    group.add(lamp);
    craterLights.push(lamp);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6),
      baseMat
    );
    pole.position.set(Math.cos(ang) * dist, 0.6, Math.sin(ang) * dist);
    group.add(pole);
  }

  animate((elapsed) => {
    for (const l of craterLights) {
      l.material.emissiveIntensity = 0.5 + Math.sin(elapsed * 1.5 + l.position.x) * 0.3;
    }
  });

  scene.add(group);

  return {
    group,
    spawnPoint: new THREE.Vector3(0, 0.15, 15).add(MOON_OFFSET),
    moonRadius: MOON_RADIUS,
  };
}

function createStarField(rand) {
  const group = new THREE.Group();
  const starGeo = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  for (let i = 0; i < 500; i++) {
    const ang = rand() * Math.PI * 2;
    const elev = rand() * Math.PI;
    const r = 80 + rand() * 60;
    positions.push(
      Math.sin(elev) * Math.cos(ang) * r,
      Math.cos(elev) * r * 0.5 + 20,
      Math.sin(elev) * Math.sin(ang) * r
    );
    const brightness = 0.6 + rand() * 0.4;
    colors.push(brightness, brightness, brightness + rand() * 0.1);
  }

  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  starGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
  });

  group.add(new THREE.Points(starGeo, starMat));
  return group;
}

function createGalaxy(rand) {
  const group = new THREE.Group();
  const starGeo = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  for (let i = 0; i < 300; i++) {
    const arm = Math.floor(rand() * 3);
    const armAngle = (arm / 3) * Math.PI * 2;
    const dist = rand() * 25;
    const spread = (rand() - 0.5) * 8;
    const angle = armAngle + dist * 0.08;

    positions.push(
      Math.cos(angle) * dist + spread,
      (rand() - 0.5) * 4,
      Math.sin(angle) * dist + spread
    );

    const t = dist / 25;
    if (rand() < 0.3) {
      colors.push(0.8 + rand() * 0.2, 0.6 + rand() * 0.2, 0.6);
    } else if (rand() < 0.5) {
      colors.push(0.6, 0.6 + rand() * 0.2, 0.8 + rand() * 0.2);
    } else {
      const b = 0.7 + rand() * 0.3;
      colors.push(b, b, b);
    }
  }

  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  starGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
  });

  group.add(new THREE.Points(starGeo, starMat));

  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xffffee,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 12), coreMat);
  group.add(core);

  return group;
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
