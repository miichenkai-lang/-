import * as THREE from "three";
import { mulberry32, createTextBoard } from "../WorldUtils.js";

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

  const noOpCollide = () => {};

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

  for (let i = 0; i < 28; i++) {
    const craterR = 1.5 + rand() * 4;
    const craterD = 0.2 + rand() * 0.5;
    const ang = rand() * Math.PI * 2;
    const dist = 5 + rand() * (MOON_RADIUS - 15);
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
  for (let i = 0; i < 14; i++) {
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
    const baseY = 2 + rand() * 5;
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
    new THREE.SphereGeometry(7, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    glassMat
  );
  dome.position.set(0, 0, -10);
  group.add(dome);

  const domeBase = new THREE.Mesh(
    new THREE.CylinderGeometry(7, 7.3, 0.5, 24),
    baseMat
  );
  domeBase.position.set(0, 0, -10);
  group.add(domeBase);
  noOpCollide(MOON_OFFSET_X, -10 + MOON_OFFSET_Z, 7.5);

  const innerFloor = new THREE.Mesh(
    new THREE.CircleGeometry(6.8, 24),
    new THREE.MeshStandardMaterial({ color: 0x3a4a5a, roughness: 0.8 })
  );
  innerFloor.rotation.x = -Math.PI / 2;
  innerFloor.position.set(0, 0.05, -10);
  group.add(innerFloor);

  const cmdTower = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.8, 6, 8),
    baseMat
  );
  cmdTower.position.set(0, 3, -10);
  cmdTower.castShadow = true;
  group.add(cmdTower);

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 4, 6),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8 })
  );
  antenna.position.set(0, 8, -10);
  group.add(antenna);

  const antennaLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 8, 6),
    new THREE.MeshStandardMaterial({
      color: 0xff3333,
      emissive: 0xff3333,
      emissiveIntensity: 1,
    })
  );
  antennaLight.position.set(0, 10, -10);
  group.add(antennaLight);

  animate((elapsed) => {
    antennaLight.material.emissiveIntensity = 0.5 + Math.sin(elapsed * 3) * 0.5;
  });

  const solarPanelMat = new THREE.MeshStandardMaterial({ color: 0x2244aa, metalness: 0.6, roughness: 0.3 });
  for (const side of [-1, 1]) {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.08, 2),
      solarPanelMat
    );
    panel.position.set(side * 10, 3, -10);
    panel.rotation.z = side * 0.3;
    group.add(panel);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 3, 6),
      baseMat
    );
    pole.position.set(side * 10, 1.5, -10);
    group.add(pole);
  }

  const secondDome = new THREE.Mesh(
    new THREE.SphereGeometry(5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    glassMat
  );
  secondDome.position.set(-25, 0, 5);
  group.add(secondDome);

  const secondDomeBase = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5.3, 0.5, 24),
    baseMat
  );
  secondDomeBase.position.set(-25, 0, 5);
  group.add(secondDomeBase);
  noOpCollide(MOON_OFFSET_X + (-25), 5 + MOON_OFFSET_Z, 5.5);

  const secondFloor = new THREE.Mesh(
    new THREE.CircleGeometry(4.8, 24),
    new THREE.MeshStandardMaterial({ color: 0x3a4a5a, roughness: 0.8 })
  );
  secondFloor.rotation.x = -Math.PI / 2;
  secondFloor.position.set(-25, 0.05, 5);
  group.add(secondFloor);

  const miningTunnel = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 1.8, 4, 12),
    new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 })
  );
  miningTunnel.rotation.z = Math.PI / 2;
  miningTunnel.position.set(-35, 0, -15);
  group.add(miningTunnel);

  const tunnelEntrance = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 3.6, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 })
  );
  tunnelEntrance.position.set(-35, 0, -17.5);
  group.add(tunnelEntrance);

  const tunnelDark = new THREE.Mesh(
    new THREE.CircleGeometry(1.5, 12),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  tunnelDark.position.set(-35, 0, -17.4);
  group.add(tunnelDark);

  const observatory = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3, 2, 12),
    baseMat
  );
  observatory.position.set(25, 1, 10);
  observatory.castShadow = true;
  group.add(observatory);

  const observatoryDome = new THREE.Mesh(
    new THREE.SphereGeometry(3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.6, metalness: 0.3 })
  );
  observatoryDome.position.set(25, 2, 10);
  group.add(observatoryDome);

  const telescope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.3, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4, metalness: 0.6 })
  );
  telescope.position.set(25, 4, 10);
  telescope.rotation.z = Math.PI / 4;
  group.add(telescope);

  const garage = new THREE.Mesh(
    new THREE.BoxGeometry(5, 3, 6),
    baseMat
  );
  garage.position.set(15, 1.5, -20);
  garage.castShadow = true;
  group.add(garage);

  const garageDoor = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2.5, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.7, metalness: 0.4 })
  );
  garageDoor.position.set(15, 1.25, -17);
  group.add(garageDoor);

  const storageRoom = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    baseMat
  );
  storageRoom.position.set(-20, 1.25, -15);
  storageRoom.castShadow = true;
  group.add(storageRoom);

  for (let i = 0; i < 18; i++) {
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
    const dist = 8 + rand() * (MOON_RADIUS - 20);
    rock.position.set(Math.cos(ang) * dist, size * 0.4, Math.sin(ang) * dist);
    rock.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
    noOpCollide(MOON_OFFSET_X + rock.position.x, MOON_OFFSET_Z + rock.position.z, size * 0.8);
  }

  const landingPad = new THREE.Mesh(
    new THREE.CylinderGeometry(4, 4, 0.15, 24),
    new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6, metalness: 0.4 })
  );
  landingPad.position.set(0, 0.07, 20);
  group.add(landingPad);

  const padMark1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.02, 6),
    new THREE.MeshStandardMaterial({ color: 0xffff00 })
  );
  padMark1.position.set(0, 0.16, 20);
  group.add(padMark1);

  const padMark2 = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.02, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xffff00 })
  );
  padMark2.position.set(0, 0.16, 20);
  group.add(padMark2);

  const rocket = createRocket();
  rocket.position.set(0, 0.15, 20);
  group.add(rocket);

  const signBoard = createTextBoard("月球基地", 4, 1.5, { bg: "#1a1a2e", fg: "#ccccff" });
  signBoard.position.set(0, 3, 12);
  group.add(signBoard);

  const craterLights = [];
  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * Math.PI * 2;
    const dist = 22 + rand() * 12;
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

  const pathMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });
  const pathPoints = [
    [0, 20], [0, 15], [0, 5], [0, -5], [0, -10],
    [0, -5], [-10, -5], [-20, -5], [-25, 0], [-25, 5],
    [0, -5], [10, -5], [20, -10], [25, 10],
    [0, 5], [-10, 5], [-20, 5], [-25, 5],
    [0, 15], [10, 15], [15, -15], [15, -20],
  ];
  for (const [px, pz] of pathPoints) {
    const path = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.05, 1.2),
      pathMat
    );
    path.position.set(px, 0.02, pz);
    group.add(path);
  }

  const roverBody = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.7, 1.4),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.6, metalness: 0.4 })
  );
  roverBody.position.set(-18, 0.5, 8);
  roverBody.castShadow = true;
  group.add(roverBody);

  const roverCab = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.6, 1.1),
    new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5 })
  );
  roverCab.position.set(-18, 1.15, 8);
  group.add(roverCab);

  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
  for (const [wx, wz] of [[-1.3, 0.8], [1.3, 0.8], [-1.3, -0.8], [1.3, -0.8]]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 10), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(-18 + wx, 0.3, 8 + wz);
    group.add(wheel);
  }

  const rover2 = roverBody.clone();
  rover2.position.set(-30, 0.5, 0);
  rover2.rotation.y = Math.PI / 3;
  group.add(rover2);

  for (const [fx, fz, fcolor] of [
    [-25, -20, 0xff4444], [25, -20, 0x44ff44], [-30, 15, 0x4444ff], [30, 15, 0xffff44],
    [-40, -5, 0xff88ff], [40, -5, 0x88ffff], [0, -30, 0xff8800], [0, 30, 0x88ff88],
  ]) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6),
      baseMat
    );
    pole.position.set(fx, 1.1, fz);
    group.add(pole);

    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.6),
      new THREE.MeshStandardMaterial({ color: fcolor, side: THREE.DoubleSide })
    );
    flag.position.set(fx + 0.45, 1.9, fz);
    group.add(flag);
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
  for (let i = 0; i < 14; i++) {
    const ang = rand() * Math.PI * 2;
    const dist = 18 + rand() * 25;
    const size = 0.3 + rand() * 0.8;
    const crystal = new THREE.Mesh(
      new THREE.ConeGeometry(size * 0.4, size * 2, 6),
      crystalMat.clone()
    );
    crystal.position.set(Math.cos(ang) * dist, size, Math.sin(ang) * dist);
    crystal.rotation.z = (rand() - 0.5) * 0.3;
    crystal.castShadow = true;
    group.add(crystal);
    crystals.push(crystal);
  }
  animate((elapsed) => {
    for (const c of crystals) {
      c.material.emissiveIntensity = 0.2 + Math.sin(elapsed * 0.8 + c.position.x) * 0.2;
    }
  });

  const purpleCrystalMat = new THREE.MeshStandardMaterial({
    color: 0xcc88ff,
    emissive: 0x8844cc,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.7,
    roughness: 0.1,
    metalness: 0.5,
  });
  for (let i = 0; i < 6; i++) {
    const ang = rand() * Math.PI * 2;
    const dist = 30 + rand() * 15;
    const size = 0.5 + rand() * 1;
    const crystal = new THREE.Mesh(
      new THREE.ConeGeometry(size * 0.5, size * 2.5, 5),
      purpleCrystalMat.clone()
    );
    crystal.position.set(Math.cos(ang) * dist, size, Math.sin(ang) * dist);
    crystal.rotation.z = (rand() - 0.5) * 0.4;
    crystal.castShadow = true;
    group.add(crystal);
    crystals.push(crystal);
  }

  const dishMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4, metalness: 0.6 });
  const dishPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.5, 8), baseMat);
  dishPole.position.set(20, 1.75, -8);
  group.add(dishPole);

  const dish = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), dishMat);
  dish.position.set(20, 3.5, -8);
  dish.rotation.x = Math.PI;
  group.add(dish);

  const dishCenter = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff3333, emissiveIntensity: 0.5 })
  );
  dishCenter.position.set(20, 3.5, -8);
  group.add(dishCenter);

  animate((elapsed) => {
    dish.rotation.y = elapsed * 0.2;
  });

  const hydroMat = new THREE.MeshStandardMaterial({ color: 0x228833, roughness: 0.7 });
  const hydroBase = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.3, 3),
    baseMat
  );
  hydroBase.position.set(-18, 0.15, -18);
  group.add(hydroBase);

  for (let i = 0; i < 8; i++) {
    const plant = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 6),
      hydroMat.clone()
    );
    plant.position.set(-19.5 + i * 0.9, 0.6, -18);
    plant.scale.y = 1.3;
    group.add(plant);
  }

  const hydroGlass = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 2, 3.2),
    new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.2 })
  );
  hydroGlass.position.set(-18, 1.15, -18);
  group.add(hydroGlass);

  const windmillPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.15, 5, 8),
    baseMat
  );
  windmillPole.position.set(-30, 2.5, -25);
  group.add(windmillPole);

  const windmillBlades = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5 })
    );
    blade.rotation.z = (i / 3) * Math.PI * 2;
    blade.position.y = 1;
    windmillBlades.add(blade);
  }
  windmillBlades.position.set(-30, 5, -25);
  group.add(windmillBlades);

  animate((elapsed) => {
    windmillBlades.rotation.z = elapsed * 0.5;
  });

  const waterTank = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 3, 12),
    new THREE.MeshStandardMaterial({ color: 0x6688cc, roughness: 0.5, metalness: 0.3 })
  );
  waterTank.position.set(30, 1.5, -5);
  waterTank.castShadow = true;
  group.add(waterTank);

  const waterTankTop = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 0.8, 12),
    new THREE.MeshStandardMaterial({ color: 0x5577aa, roughness: 0.5 })
  );
  waterTankTop.position.set(30, 3.4, -5);
  group.add(waterTankTop);

  const benchMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
  for (const [bx, bz] of [[3, 5], [-5, 6], [8, 3], [-8, 12], [12, 8], [-12, 0], [20, 5], [-20, -10]]) {
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.1, 0.5),
      benchMat
    );
    bench.position.set(bx, 0.5, bz);
    group.add(bench);

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
  for (let i = 0; i < 10; i++) {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.5, 0.6),
      cargoBoxMat
    );
    box.position.set(-3 + (i % 4) * 0.8, 0.25, 16 + Math.floor(i / 4) * 0.8);
    box.rotation.y = rand() * 0.5;
    box.castShadow = true;
    group.add(box);
  }

  const fuelBarrelMat = new THREE.MeshStandardMaterial({ color: 0xcc4444, roughness: 0.8 });
  for (let i = 0; i < 4; i++) {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.8, 10),
      fuelBarrelMat
    );
    barrel.position.set(5 + i * 0.8, 0.4, 18);
    barrel.castShadow = true;
    group.add(barrel);
  }

  const cranePole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 6, 8),
    new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.7, metalness: 0.3 })
  );
  cranePole.position.set(20, 3, 15);
  group.add(cranePole);

  const craneArm = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.15, 0.15),
    new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.7, metalness: 0.3 })
  );
  craneArm.position.set(22, 6, 15);
  group.add(craneArm);

  const craneCable = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 2, 4),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  craneCable.position.set(24, 5, 15);
  group.add(craneCable);

  const craneHook = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.03, 8, 12),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  craneHook.position.set(24, 4, 15);
  group.add(craneHook);

  const landingLights = [];
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const lr = 5;
    const ll = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 1 })
    );
    ll.position.set(Math.cos(ang) * lr, 0.2, 20 + Math.sin(ang) * lr);
    group.add(ll);
    landingLights.push(ll);
  }

  animate((elapsed) => {
    for (let i = 0; i < landingLights.length; i++) {
      const phase = (i / landingLights.length) * Math.PI * 2;
      landingLights[i].material.emissiveIntensity = 0.3 + Math.sin(elapsed * 2 + phase) * 0.7;
    }
  });

  const oxygenTankMat = new THREE.MeshStandardMaterial({ color: 0x44aaff, roughness: 0.5, metalness: 0.4 });
  for (let i = 0; i < 3; i++) {
    const tank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 1.5, 10),
      oxygenTankMat
    );
    tank.position.set(-8 + i * 1, 0.75, -14);
    tank.castShadow = true;
    group.add(tank);
  }

  const benchMat2 = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
  const picnicArea = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0x997755, roughness: 0.8 })
  );
  picnicArea.position.set(-5, 0.5, 15);
  group.add(picnicArea);

  const tableLegMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8 });
  for (const [tx, tz] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) {
    const tleg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6),
      tableLegMat
    );
    tleg.position.set(-5 + tx, 0.25, 15 + tz);
    group.add(tleg);
  }

  const tableTop = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0xaa8866, roughness: 0.7 })
  );
  tableTop.position.set(-5, 0.55, 15);
  group.add(tableTop);

  scene.add(group);

  return {
    group,
    spawnPoint: new THREE.Vector3(0, 0.15, 20).add(MOON_OFFSET),
    moonRadius: MOON_RADIUS,
  };
}

function createStarField(rand) {
  const group = new THREE.Group();
  const starGeo = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  for (let i = 0; i < 800; i++) {
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
    size: 0.35,
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

  for (let i = 0; i < 500; i++) {
    const arm = Math.floor(rand() * 3);
    const armAngle = (arm / 3) * Math.PI * 2;
    const dist = rand() * 30;
    const spread = (rand() - 0.5) * 10;
    const angle = armAngle + dist * 0.08;

    positions.push(
      Math.cos(angle) * dist + spread,
      (rand() - 0.5) * 5,
      Math.sin(angle) * dist + spread
    );

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
    size: 0.25,
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
  const core = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 12), coreMat);
  group.add(core);

  return group;
}

function createRocket() {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5, metalness: 0.3 });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0xff4444, roughness: 0.6 });
  const finMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7, metalness: 0.4 });

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.6, 3.5, 12),
    bodyMat
  );
  body.position.y = 2.25;
  body.castShadow = true;
  group.add(body);

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1.2, 12),
    noseMat
  );
  nose.position.y = 4.6;
  nose.castShadow = true;
  group.add(nose);

  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    emissive: 0x4488cc,
    emissiveIntensity: 0.3,
    roughness: 0.1,
  });
  const window1 = new THREE.Mesh(new THREE.CircleGeometry(0.18, 12), windowMat);
  window1.position.set(0, 3.2, 0.51);
  group.add(window1);

  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.4, 0.9),
      finMat
    );
    const ang = (i / 3) * Math.PI * 2;
    fin.position.set(Math.sin(ang) * 0.65, 0.9, Math.cos(ang) * 0.65);
    fin.rotation.y = -ang;
    group.add(fin);
  }

  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.7,
  });
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 1, 8),
    flameMat
  );
  flame.position.y = 0.2;
  flame.rotation.x = Math.PI;
  group.add(flame);

  const flameInner = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.6, 8),
    new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.8 })
  );
  flameInner.position.y = 0.3;
  flameInner.rotation.x = Math.PI;
  group.add(flameInner);

  return group;
}
