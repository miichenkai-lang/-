import * as THREE from "three";
import { mulberry32, createTextBoard } from "../WorldUtils.js";
import { CollisionSystem } from "../../systems/CollisionSystem.js";

const MOON_OFFSET_X = 0;
const MOON_OFFSET_Y = 200;
const MOON_OFFSET_Z = 0;
const MOON_RADIUS = 65;

export const MOON_OFFSET = new THREE.Vector3(MOON_OFFSET_X, MOON_OFFSET_Y, MOON_OFFSET_Z);

export function buildMoonBase(scene, { animate }) {
  const rand = mulberry32(20260901);
  const group = new THREE.Group();
  group.position.copy(MOON_OFFSET);
  group.visible = false;

  const moonCollisions = new CollisionSystem();
  const moonCollide = (x, z, r) => moonCollisions.addCircle(
    MOON_OFFSET_X + x, MOON_OFFSET_Z + z, r
  );

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
    new THREE.CircleGeometry(MOON_RADIUS, 64),
    moonMat
  );
  moonGround.rotation.x = -Math.PI / 2;
  moonGround.position.y = -0.1;
  moonGround.receiveShadow = true;
  group.add(moonGround);

  const moonBase = new THREE.Mesh(
    new THREE.CylinderGeometry(MOON_RADIUS + 1, MOON_RADIUS + 12, 12, 64),
    darkMoonMat
  );
  moonBase.position.y = -6;
  group.add(moonBase);

  for (let i = 0; i < 5; i++) {
    const craterR = 1.5 + rand() * 3.5;
    const craterD = 0.2 + rand() * 0.4;
    const ang = rand() * Math.PI * 2;
    const dist = 30 + rand() * (MOON_RADIUS - 38);
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
    const dist = 10 + rand() * (MOON_RADIUS - 20);
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
    new THREE.SphereGeometry(10, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    glassMat
  );
  dome.position.set(0, 0, -10);
  group.add(dome);

  const domeBase = new THREE.Mesh(
    new THREE.CylinderGeometry(10, 10.4, 0.5, 24),
    baseMat
  );
  domeBase.position.set(0, 0, -10);
  group.add(domeBase);

  const innerFloor = new THREE.Mesh(
    new THREE.CircleGeometry(9.8, 24),
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
  moonCollide(0, -10, 1.5);

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
    moonCollide(side * 8, -10, 1.2);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2.5, 6),
      baseMat
    );
    pole.position.set(side * 8, 1.25, -10);
    group.add(pole);
  }

  const observatory = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3, 2.5, 12),
    baseMat
  );
  observatory.position.set(25, 1.25, 8);
  observatory.castShadow = true;
  group.add(observatory);
  moonCollide(25, 8, 3.5);

  const observatoryDome = new THREE.Mesh(
    new THREE.SphereGeometry(3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.6, metalness: 0.3 })
  );
  observatoryDome.position.set(25, 2.5, 8);
  group.add(observatoryDome);

  const telescope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.25, 3.5, 8),
    new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4, metalness: 0.6 })
  );
  telescope.position.set(25, 4, 8);
  telescope.rotation.z = Math.PI / 4;
  group.add(telescope);

  const waterTank = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 2.5, 10),
    new THREE.MeshStandardMaterial({ color: 0x5588cc, roughness: 0.5, metalness: 0.3 })
  );
  waterTank.position.set(-20, 1.25, -5);
  waterTank.castShadow = true;
  group.add(waterTank);
  moonCollide(-20, -5, 1.5);

  const waterTankTop = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 0.6, 10),
    new THREE.MeshStandardMaterial({ color: 0x4477aa, roughness: 0.5 })
  );
  waterTankTop.position.set(-20, 2.8, -5);
  group.add(waterTankTop);

  const storage = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 2.2, 3.5),
    baseMat
  );
  storage.position.set(-15, 1.1, 8);
  storage.castShadow = true;
  group.add(storage);
  moonCollide(-15, 8, 2.2);

  const storageDoor = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.8, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.7, metalness: 0.4 })
  );
  storageDoor.position.set(-15, 0.9, 6.3);
  group.add(storageDoor);

  const rockMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.95, flatShading: true });
  const addRock = (x, z, size) => {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), rockMat);
    rock.position.set(x, size * 0.4, z);
    rock.rotation.set(rand() * 0.8, rand() * Math.PI, rand() * 0.5);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
    moonCollide(x, z, size * 0.8);
  };

  const rockLine = [[-2.6, 13, 0.7], [2.6, 13, 0.7], [-3.2, 10, 0.55], [3.2, 10, 0.55], [-3.8, 6, 0.6], [3.8, 6, 0.6], [-3.4, 2, 0.5], [3.4, 2, 0.5]];
  for (const [rx, rz, rs] of rockLine) addRock(rx, rz, rs);

  const scatter = [[-28, 30, 1.2], [30, 26, 1.0], [26, -22, 1.3], [-26, -26, 1.1], [34, -34, 0.9], [-34, 34, 1.0]];
  for (const [rx, rz, rs] of scatter) addRock(rx, rz, rs);

  const landingPad = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3, 0.15, 24),
    new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6, metalness: 0.4 })
  );
  landingPad.position.set(0, 0.07, 15);
  group.add(landingPad);

  const landingRing = new THREE.Mesh(
    new THREE.RingGeometry(3.4, 3.8, 40),
    new THREE.MeshStandardMaterial({ color: 0xffb347, emissive: 0xff8c00, emissiveIntensity: 1.2 })
  );
  landingRing.rotation.x = -Math.PI / 2;
  landingRing.position.set(0, 0.02, 15);
  group.add(landingRing);

  const plazaMat = new THREE.MeshStandardMaterial({ color: 0x5a6673, roughness: 0.85, metalness: 0.2 });
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(5.5, 32), plazaMat);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, 0.015, -3);
  plaza.receiveShadow = true;
  group.add(plaza);

  const plazaEdge = new THREE.Mesh(
    new THREE.RingGeometry(5.5, 5.75, 40),
    new THREE.MeshStandardMaterial({ color: 0xfff2cc, emissive: 0xffcf6a, emissiveIntensity: 0.7 })
  );
  plazaEdge.rotation.x = -Math.PI / 2;
  plazaEdge.position.set(0, 0.03, -3);
  group.add(plazaEdge);

  const rocket = createRocket();
  rocket.position.set(0, 0.15, 15);
  group.add(rocket);

  const pathTileMat = new THREE.MeshStandardMaterial({ color: 0x9aa4b0, roughness: 0.9, flatShading: true });
  for (let i = 0; i < 12; i++) {
    const tile = new THREE.Mesh(new THREE.CircleGeometry(0.7, 8), pathTileMat);
    tile.rotation.x = -Math.PI / 2;
    tile.position.set(0, 0.04, 14 - i * 2);
    tile.receiveShadow = true;
    group.add(tile);
  }

  const signBoard = createTextBoard("月球基地", 3, 1.2, { bg: "#1a1a2e", fg: "#ccccff" });
  signBoard.position.set(0, 2.5, 8);
  group.add(signBoard);
  moonCollide(0, 8, 1);

  const craterLights = [];
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const dist = 24;
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 8, 6),
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

  const roverBody = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.6, 1.2),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.6, metalness: 0.4 })
  );
  roverBody.position.set(-18, 0.5, 5);
  roverBody.castShadow = true;
  group.add(roverBody);
  moonCollide(-18, 5, 1.5);

  const roverCab = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.5, 1),
    new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5 })
  );
  roverCab.position.set(-18, 1.05, 5);
  group.add(roverCab);

  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
  for (const [wx, wz] of [[-1.2, 0.7], [1.2, 0.7], [-1.2, -0.7], [1.2, -0.7]]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.15, 10), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(-18 + wx, 0.25, 5 + wz);
    group.add(wheel);
  }

  for (const [fx, fz, fcolor] of [
    [-20, -15, 0xff4444], [20, -15, 0x44ff44], [-25, 10, 0x4444ff], [25, 10, 0xffff44],
  ]) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2, 6),
      baseMat
    );
    pole.position.set(fx, 1, fz);
    group.add(pole);

    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.5),
      new THREE.MeshStandardMaterial({ color: fcolor, side: THREE.DoubleSide })
    );
    flag.position.set(fx + 0.4, 1.7, fz);
    group.add(flag);
    moonCollide(fx, fz, 0.5);
  }

  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x88ddff,
    emissive: 0x4488cc,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.7,
    roughness: 0.1,
    metalness: 0.5,
  });
  const crystals = [];
  const crystalSpots = [[-2.0, 3, 0.5], [2.0, 3, 0.5], [-3.5, 6, 0.4], [3.5, 6, 0.4]];
  for (const [cx_, cz_, size] of crystalSpots) {
    const crystal = new THREE.Mesh(
      new THREE.ConeGeometry(size * 0.4, size * 2, 6),
      crystalMat.clone()
    );
    crystal.position.set(cx_, size, cz_);
    crystal.rotation.z = 0.1;
    crystal.castShadow = true;
    group.add(crystal);
    moonCollide(cx_, cz_, size * 0.5);
    crystals.push(crystal);
  }
  animate((elapsed) => {
    for (const c of crystals) {
      c.material.emissiveIntensity = 0.2 + Math.sin(elapsed * 0.8 + c.position.x) * 0.2;
    }
  });

  const dishMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4, metalness: 0.6 });
  const dishPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3, 8), baseMat);
  dishPole.position.set(18, 1.5, -5);
  group.add(dishPole);
  moonCollide(18, -5, 1.5);

  const dish = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), dishMat);
  dish.position.set(18, 3, -5);
  dish.rotation.x = Math.PI;
  group.add(dish);

  const dishCenter = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff3333, emissiveIntensity: 0.5 })
  );
  dishCenter.position.set(18, 3, -5);
  group.add(dishCenter);

  animate((elapsed) => {
    dish.rotation.y = elapsed * 0.2;
  });

  const hydroMat = new THREE.MeshStandardMaterial({ color: 0x228833, roughness: 0.7 });
  const hydroBase = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.3, 2),
    baseMat
  );
  hydroBase.position.set(-15, 0.15, -12);
  group.add(hydroBase);
  moonCollide(-15, -12, 1.8);

  for (let i = 0; i < 6; i++) {
    const plant = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 6),
      hydroMat.clone()
    );
    plant.position.set(-16.2 + i * 0.8, 0.5, -12);
    plant.scale.y = 1.3;
    group.add(plant);
  }

  const hydroGlass = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 1.5, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.2 })
  );
  hydroGlass.position.set(-15, 0.9, -12);
  group.add(hydroGlass);

  const roverTrackMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });
  for (const side of [-0.6, 0.6]) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 0.05, 0.16),
      roverTrackMat
    );
    rail.position.set(-20 - 2.5 + side * 0.6, 0.05, 5);
    group.add(rail);
  }

  const benchMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
  for (const [bx, bz] of [[3, 5], [-5, 6], [8, 3]]) {
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.1, 0.5),
      benchMat
    );
    bench.position.set(bx, 0.5, bz);
    group.add(bench);
    moonCollide(bx, bz, 0.8);

    for (const side of [-0.6, 0.6]) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.5, 0.08),
        benchMat
      );
      leg.position.set(bx + side, 0.25, bz);
      group.add(leg);
    }
  }

  const cargoBoxMat = new THREE.MeshStandardMaterial({ color: 0x996633, roughness: 0.9 });
  for (let i = 0; i < 5; i++) {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.5, 0.6),
      cargoBoxMat
    );
    box.position.set(-2 + (i % 3) * 0.7, 0.25, 10 + Math.floor(i / 3) * 0.7);
    box.rotation.y = rand() * 0.5;
    box.castShadow = true;
    group.add(box);
    moonCollide(box.position.x, box.position.z, 0.45);
  }

  const spaceShop = buildSpaceShop(group, moonCollide);
  animate((elapsed) => {
    if (spaceShop.holo) {
      spaceShop.holo.rotation.y = elapsed * 1.2;
      spaceShop.holo.position.y = spaceShop.holo._baseY + Math.sin(elapsed * 2) * 0.15;
    }
  });

  scene.add(group);

  return {
    group,
    spawnPoint: new THREE.Vector3(0, 0.15, 15).add(MOON_OFFSET),
    moonRadius: MOON_RADIUS,
    collisions: moonCollisions,
  };
}

function buildSpaceShop(group, moonCollide) {
  const sgroup = new THREE.Group();

  const metal = new THREE.MeshStandardMaterial({ color: 0xb8c2cc, roughness: 0.4, metalness: 0.7 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x5a6673, roughness: 0.5, metalness: 0.6 });
  const edgeGlow = new THREE.MeshStandardMaterial({ color: 0x7ad0ff, emissive: 0x2fa0ff, emissiveIntensity: 1.6, metalness: 0.4 });
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0xffe9a8, emissiveIntensity: 2.2 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.35, roughness: 0.1 });

  const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.3, 0.28, 32), metal);
  platform.position.set(0, 0.14, 0);
  platform.castShadow = true;
  platform.receiveShadow = true;
  sgroup.add(platform);

  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.07, 8, 48), edgeGlow);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.29;
  sgroup.add(baseRing);

  const floorGlow = new THREE.Mesh(new THREE.RingGeometry(1.6, 1.9, 40), edgeGlow);
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.y = 0.285;
  sgroup.add(floorGlow);

  const counter = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 1.0, 20), darkMetal);
  counter.position.set(0, 0.92, 0);
  counter.castShadow = true;
  sgroup.add(counter);

  const counterTop = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.9, 0.12, 20), metal);
  counterTop.position.set(0, 1.48, 0);
  sgroup.add(counterTop);

  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 8), darkMetal);
  lampPole.position.set(0, 2.4, 0);
  sgroup.add(lampPole);
  const topLamp = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), lampMat);
  topLamp.position.set(0, 3.35, 0);
  sgroup.add(topLamp);

  for (const sx of [-0.5, 0.5]) {
    const sidePole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.5, 6), metal);
    sidePole.position.set(sx, 1.9, -0.55);
    sgroup.add(sidePole);
  }
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.06, 24), glass);
  canopy.position.set(0, 2.4, 0);
  sgroup.add(canopy);
  const canopyLamp = new THREE.Mesh(new THREE.CircleGeometry(1.5, 24), lampMat);
  canopyLamp.rotation.x = -Math.PI / 2;
  canopyLamp.position.set(0, 2.37, 0);
  sgroup.add(canopyLamp);

  const fanGlow = new THREE.Mesh(new THREE.CircleGeometry(1.1, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6 }));
  fanGlow.rotation.x = -Math.PI / 2;
  fanGlow.position.set(0, 0.3, 0);
  sgroup.add(fanGlow);

  const holoMat = new THREE.MeshStandardMaterial({ emissive: 0xbfe9ff, emissiveIntensity: 1.8, color: 0xffffff, transparent: true, opacity: 0.9 });
  const holo = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), holoMat);
  holo.position.set(0, 2.2, 0);
  holo.scale.y = 1.5;
  holo._baseY = 2.2;
  sgroup.add(holo);

  const sign = createTextBoard("太空商店", 2.6, 1.0, { bg: "#083b5e", fg: "#e6fbff", fontSize: 56 });
  sign.position.set(0, 4.4, 0);
  sgroup.add(sign);
  const signGlow = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.75, 40), edgeGlow);
  signGlow.position.set(0, 4.4, -0.1);
  sgroup.add(signGlow);

  sgroup.position.set(6, 0, -10);
  group.add(sgroup);

  moonCollide(6, -10, 2.3);

  return { holo, topLamp };
}

function createStarField(rand) {
  const group = new THREE.Group();
  const starGeo = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  for (let i = 0; i < 500; i++) {
    const ang = rand() * Math.PI * 2;
    const elev = rand() * Math.PI;
    const r = 100 + rand() * 80;
    positions.push(
      Math.sin(elev) * Math.cos(ang) * r,
      Math.cos(elev) * r * 0.5 + 25,
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
