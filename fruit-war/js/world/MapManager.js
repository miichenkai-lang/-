import * as THREE from "three";
import {
  mulberry32,
  addPath,
  createBush,
  createFlowerBed,
  createMossRock,
  createMushroom,
  createPineTree,
  createFence,
  createBarrel,
  createCrate,
  createTrashCan,
  createWell,
  createStonePath,
  createBoardwalk,
} from "./WorldUtils.js";
import { CollisionSystem } from "../systems/CollisionSystem.js";
import { buildJuicePlaza } from "./zones/JuicePlaza.js";
import { buildFruitTown } from "./zones/FruitTown.js";
import { buildFoodStreet } from "./zones/FoodStreet.js";
import { buildMarketStreet } from "./zones/MarketStreet.js";
import { buildOrchard } from "./zones/Orchard.js";
import { buildMysteryForest } from "./zones/MysteryForest.js";
import { buildFruitBeach } from "./zones/FruitBeach.js";
import { buildJuicePort } from "./zones/JuicePort.js";
import { buildArena } from "./zones/Arena.js";
import { buildMoonBase, MOON_OFFSET } from "./zones/MoonBase.js";

const ISLAND_RADIUS = 60;

const ZONE_AREAS = [
  { x: 0, z: -33, r: 17 },
  { x: -30, z: -26, r: 15 },
  { x: -20, z: 0, r: 14 },
  { x: 20, z: 0, r: 14 },
  { x: 26, z: -22, r: 16 },
  { x: 31, z: 23, r: 12 },
  { x: 0, z: 48, r: 18 },
  { x: -41, z: 41, r: 15 },
];

function distToSegment(px, pz, seg) {
  const dx = seg.x2 - seg.x1;
  const dz = seg.z2 - seg.z1;
  const lenSq = dx * dx + dz * dz;
  let t = ((px - seg.x1) * dx + (pz - seg.z1) * dz) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (seg.x1 + dx * t), pz - (seg.z1 + dz * t));
}

export class MapManager {
  constructor() {
    this.islandRadius = ISLAND_RADIUS;
    this.spawnPoint = new THREE.Vector3(0, 0, 22);
    this.animators = [];
    this.collisions = new CollisionSystem();
    this.paths = [
      { x1: -11, z1: 0, x2: -27, z2: 0, width: 4.5, color: 0xd7b98a },
      { x1: 11, z1: 0, x2: 27, z2: 0, width: 4.5, color: 0xd7b98a },
      { x1: 0, z1: -11, x2: 0, z2: -25, width: 4, color: 0xd7b98a },
      { x1: 9.5, z1: -9.5, x2: 19, z2: -17, width: 3, color: 0xcbb178 },
      { x1: -9.5, z1: -9.5, x2: -23, z2: -19, width: 3, color: 0xd7b98a },
      { x1: 9.5, z1: 9.5, x2: 23, z2: 20, width: 3, color: 0x6f8f5a },
      { x1: 0, z1: 11, x2: 0, z2: 36, width: 4, color: 0xd7b98a },
      { x1: -8, z1: 19, x2: -31, z2: 33, width: 3, color: 0xc99a63 },
    ];
  }

  build(scene) {
    this.addLights(scene);
    this.addOcean(scene);
    this.addIslandBase(scene);

    const ctx = {
      animate: (fn) => this.animators.push(fn),
      collide: (x, z, r) => this.collisions.addCircle(x, z, r),
      collideBox: (x, z, hw, hd) => this.collisions.addBox(x, z, hw, hd),
    };
    buildJuicePlaza(scene, ctx);
    buildFruitTown(scene, ctx);
    buildFoodStreet(scene, ctx);
    buildMarketStreet(scene, ctx);
    buildOrchard(scene, ctx);
    buildMysteryForest(scene, ctx);
    buildFruitBeach(scene, ctx);
    buildJuicePort(scene, ctx);
    buildArena(scene, ctx);
    this.moonData = buildMoonBase(scene, ctx);

    for (let i = 0; i < this.paths.length; i++) {
      const p = this.paths[i];
      addPath(scene, p.x1, p.z1, p.x2, p.z2, { width: p.width, color: p.color, y: 0.062 + i * 0.0012 });
    }

    this.addNature(scene);
    this.addDecorations(scene);
    this.addLightingEffects(scene);
  }

  update(dt, elapsed) {
    for (const fn of this.animators) fn(elapsed, dt);
  }

  isInZone(x, z, margin = 0) {
    return ZONE_AREAS.some((zone) => Math.hypot(x - zone.x, z - zone.z) < zone.r + margin);
  }

  isNearPath(x, z, margin = 0) {
    return this.paths.some((p) => distToSegment(x, z, p) < p.width / 2 + margin);
  }

  addLights(scene) {
    this.hemi = new THREE.HemisphereLight(0xcfe8ff, 0x6fae62, 1.0);
    scene.add(this.hemi);

    this.sun = new THREE.DirectionalLight(0xfff2d9, 2.0);
    this.sun.position.set(45, 70, 30);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.left = -85;
    this.sun.shadow.camera.right = 85;
    this.sun.shadow.camera.top = 85;
    this.sun.shadow.camera.bottom = -85;
    this.sun.shadow.camera.near = 10;
    this.sun.shadow.camera.far = 220;
    this.sun.shadow.bias = -0.0005;
    scene.add(this.sun);
  }

  addOcean(scene) {
    const water = new THREE.Mesh(
      new THREE.CircleGeometry(400, 64),
      new THREE.MeshStandardMaterial({ color: 0x2f86c9, roughness: 0.25, metalness: 0.1 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.6;
    scene.add(water);

    const foamMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.6,
    });
    const foam = new THREE.Mesh(new THREE.TorusGeometry(ISLAND_RADIUS + 2.4, 0.55, 8, 96), foamMat);
    foam.rotation.x = -Math.PI / 2;
    foam.position.y = -0.3;
    scene.add(foam);

    this.animators.push((elapsed) => {
      foam.scale.setScalar(1 + Math.sin(elapsed * 0.8) * 0.008);
    });
  }

  addIslandBase(scene) {
    const dirt = new THREE.Mesh(
      new THREE.CylinderGeometry(ISLAND_RADIUS + 1, ISLAND_RADIUS + 9, 10, 48),
      new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.95 })
    );
    dirt.position.y = -5;
    scene.add(dirt);

    const sand = new THREE.Mesh(
      new THREE.CircleGeometry(ISLAND_RADIUS + 1, 48),
      new THREE.MeshStandardMaterial({ color: 0xe9d18b, roughness: 1 })
    );
    sand.rotation.x = -Math.PI / 2;
    sand.position.y = 0.02;
    sand.receiveShadow = true;
    scene.add(sand);

    const grass = new THREE.Mesh(
      new THREE.CircleGeometry(ISLAND_RADIUS - 4, 48),
      new THREE.MeshStandardMaterial({ color: 0x67b04e, roughness: 0.95 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = 0.05;
    grass.receiveShadow = true;
    scene.add(grass);
  }

  addNature(scene) {
    const rand = mulberry32(20260824);

    const leafMats = [0x3f9142, 0x47a04b, 0x54ad57].map(
      (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 })
    );
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.95 });
    const appleMat = new THREE.MeshStandardMaterial({ color: 0xe23b3b, roughness: 0.5 });

    for (let i = 0; i < 26; i++) {
      const ang = rand() * Math.PI * 2;
      const rad = 16 + rand() * (ISLAND_RADIUS - 26);
      const x = Math.sin(ang) * rad;
      const z = Math.cos(ang) * rad;
      if (Math.hypot(x - this.spawnPoint.x, z - this.spawnPoint.z) < 5) continue;
      if (this.isInZone(x, z)) continue;
      if (this.isNearPath(x, z, 2)) continue;

      const tree = new THREE.Group();
      const trunkH = 1.4 + rand() * 0.8;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, trunkH, 8), trunkMat);
      trunk.position.y = trunkH / 2;
      trunk.castShadow = true;
      tree.add(trunk);

      const leafMat = leafMats[Math.floor(rand() * leafMats.length)];
      const blobs = [
        [0, trunkH + 0.9, 0, 1.35],
        [0.75, trunkH + 0.45, 0.2, 0.9],
        [-0.7, trunkH + 0.55, -0.15, 0.85],
      ];
      for (const [bx, by, bz, br] of blobs) {
        const blob = new THREE.Mesh(new THREE.SphereGeometry(br, 14, 10), leafMat);
        blob.position.set(bx, by, bz);
        blob.castShadow = true;
        tree.add(blob);
      }
      for (let f = 0; f < 3; f++) {
        const [bx, by, bz, br] = blobs[Math.floor(rand() * blobs.length)];
        const dir = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1)
          .normalize()
          .multiplyScalar(br * 0.92);
        const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), appleMat);
        fruit.position.set(bx + dir.x, by + dir.y, bz + dir.z);
        tree.add(fruit);
      }

      tree.position.set(x, 0, z);
      tree.rotation.y = rand() * Math.PI * 2;
      scene.add(tree);
      this.collisions.addCircle(x, z, 0.42);
    }

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x9b9b93,
      roughness: 1,
      flatShading: true,
    });
    for (let i = 0; i < 12; i++) {
      const size = 0.35 + rand() * 0.55;
      const ang = rand() * Math.PI * 2;
      const rad = 15 + rand() * (ISLAND_RADIUS - 24);
      const x = Math.sin(ang) * rad;
      const z = Math.cos(ang) * rad;
      if (this.isInZone(x, z)) continue;
      if (this.isNearPath(x, z, 1)) continue;

      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size), rockMat);
      rock.position.set(x, size * 0.45, z);
      rock.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
      rock.castShadow = true;
      rock.receiveShadow = true;
      scene.add(rock);
      this.collisions.addCircle(x, z, size * 0.85);
    }

    const flowerColors = [0xff6f91, 0xffd93d, 0xffffff, 0xff8c42, 0xc39bd3];
    const flowerMats = flowerColors.map(
      (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 })
    );
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x3f9142, roughness: 0.9 });

    for (let i = 0; i < 46; i++) {
      const ang = rand() * Math.PI * 2;
      const rad = 12.5 + rand() * (ISLAND_RADIUS - 20);
      const x = Math.sin(ang) * rad;
      const z = Math.cos(ang) * rad;
      if (Math.hypot(x - this.spawnPoint.x, z - this.spawnPoint.z) < 3) continue;
      if (this.isInZone(x, z)) continue;
      if (this.isNearPath(x, z, 0.8)) continue;

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.26, 6), stemMat);
      stem.position.set(x, 0.13, z);
      scene.add(stem);

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 6),
        flowerMats[Math.floor(rand() * flowerMats.length)]
      );
      head.position.set(x, 0.3, z);
      scene.add(head);
    }

    const bushColors = [0x3f9142, 0x47a04b, 0x2d6b30, 0x54ad57];
    for (let i = 0; i < 35; i++) {
      const ang = rand() * Math.PI * 2;
      const rad = 14 + rand() * (ISLAND_RADIUS - 24);
      const x = Math.sin(ang) * rad;
      const z = Math.cos(ang) * rad;
      if (Math.hypot(x - this.spawnPoint.x, z - this.spawnPoint.z) < 4) continue;
      if (this.isInZone(x, z)) continue;
      if (this.isNearPath(x, z, 1.5)) continue;

      const bush = createBush(rand, bushColors[Math.floor(rand() * bushColors.length)]);
      bush.position.set(x, 0, z);
      bush.rotation.y = rand() * Math.PI * 2;
      scene.add(bush);
      this.collisions.addCircle(x, z, 0.4);
    }

    const mossRockSpots = [];
    for (let i = 0; i < 15; i++) {
      const ang = rand() * Math.PI * 2;
      const rad = 18 + rand() * 30;
      const x = Math.sin(ang) * rad;
      const z = Math.cos(ang) * rad;
      if (this.isInZone(x, z, -3)) continue;
      if (this.isNearPath(x, z, 1)) continue;
      mossRockSpots.push([x, z]);
    }
    for (const [x, z] of mossRockSpots) {
      const rock = createMossRock(rand, 0.4 + rand() * 0.4);
      rock.position.set(x, 0, z);
      scene.add(rock);
      this.collisions.addCircle(x, z, 0.5);
    }

    const mushroomColors = [0xc0392b, 0x8b4513, 0xf5f0e0, 0xe67e22];
    for (let i = 0; i < 20; i++) {
      const ang = rand() * Math.PI * 2;
      const rad = 25 + rand() * 20;
      const x = Math.sin(ang) * rad;
      const z = Math.cos(ang) * rad;
      if (this.isInZone(x, z, -2)) continue;

      const mush = createMushroom(rand, mushroomColors[Math.floor(rand() * mushroomColors.length)]);
      mush.position.set(x, 0, z);
      mush.rotation.y = rand() * Math.PI * 2;
      const s = 0.8 + rand() * 0.6;
      mush.scale.setScalar(s);
      scene.add(mush);
    }

    const pineLeafMat = new THREE.MeshStandardMaterial({ color: 0x2d5a2d, roughness: 0.9 });
    for (let i = 0; i < 8; i++) {
      const ang = rand() * Math.PI * 2;
      const rad = 38 + rand() * 12;
      const x = Math.sin(ang) * rad;
      const z = Math.cos(ang) * rad;
      if (this.isInZone(x, z)) continue;

      const pine = createPineTree(rand, pineLeafMat, trunkMat);
      pine.position.set(x, 0, z);
      pine.rotation.y = rand() * Math.PI * 2;
      scene.add(pine);
      this.collisions.addCircle(x, z, 0.5);
    }
  }

  addDecorations(scene) {
    const rand = mulberry32(20260825);

    const fenceSpots = [
      { x1: -36, z1: -20, x2: -26, z2: -20 },
      { x1: -36, z1: -32, x2: -26, z2: -32 },
      { x1: -36, z1: -20, x2: -36, z2: -32 },
    ];
    for (const spot of fenceSpots) {
      const dx = spot.x2 - spot.x1;
      const dz = spot.z2 - spot.z1;
      const len = Math.hypot(dx, dz);
      const fence = createFence(len);
      fence.position.set((spot.x1 + spot.x2) / 2, 0, (spot.z1 + spot.z2) / 2);
      fence.rotation.y = -Math.atan2(dz, dx);
      scene.add(fence);
      this.collisions.addCircle((spot.x1 + spot.x2) / 2, (spot.z1 + spot.z2) / 2, len / 2 + 0.2);
    }

    const barrelSpots = [
      [-38, 36], [-36, 38], [-40, 34],
      [-20, -4], [-22, -4],
    ];
    for (const [x, z] of barrelSpots) {
      const barrel = createBarrel(rand);
      barrel.position.set(x, 0, z);
      barrel.rotation.y = rand() * Math.PI * 2;
      scene.add(barrel);
      this.collisions.addCircle(x, z, 0.5);
    }

    const crateSpots = [
      [18, 2], [20, 2], [22, 2],
      [22, -26], [30, -26],
      [-28, -28], [-30, -28],
    ];
    for (const [x, z] of crateSpots) {
      const crate = createCrate(rand);
      crate.position.set(x, 0, z);
      crate.rotation.y = rand() * Math.PI;
      scene.add(crate);
      this.collisions.addCircle(x, z, 0.5);
    }

    const well = createWell();
    well.position.set(5, 0, -35);
    scene.add(well);
    this.collisions.addCircle(5, -35, 1.2);

    const trashSpots = [
      [12, 0], [-12, 0], [0, -12], [0, 12],
      [26, -10], [-30, 0],
    ];
    for (const [x, z] of trashSpots) {
      const trash = createTrashCan();
      trash.position.set(x, 0, z);
      scene.add(trash);
      this.collisions.addCircle(x, z, 0.35);
    }

    const flowerBedSpots = [
      [5, -28], [-5, -28], [0, -38],
      [-15, 5], [15, 5],
      [26, -18], [26, -26],
    ];
    for (const [x, z] of flowerBedSpots) {
      const bed = createFlowerBed(rand, 10 + Math.floor(rand() * 6));
      bed.position.set(x, 0, z);
      bed.rotation.y = rand() * Math.PI * 2;
      scene.add(bed);
    }

    createStonePath(scene, -8, -6, -14, -6, { width: 1.5 });
    createStonePath(scene, 8, -6, 14, -6, { width: 1.5 });
    createStonePath(scene, 0, 40, 0, 46, { width: 2 });

    createBoardwalk(scene, -35, 42, -45, 52, { width: 2 });
    createBoardwalk(scene, 0, 50, 6, 54, { width: 2 });
  }

  addLightingEffects(scene) {
    const fireflyMat = new THREE.MeshBasicMaterial({
      color: 0xffff88,
      transparent: true,
      opacity: 0.8,
    });
    const fireflyGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const fireflies = [];

    const fireflyZones = [
      { x: 31, z: 23, r: 12, count: 25 },
      { x: -30, z: -26, r: 10, count: 15 },
      { x: 0, z: 48, r: 12, count: 12 },
    ];
    for (const zone of fireflyZones) {
      for (let i = 0; i < zone.count; i++) {
        const ff = new THREE.Mesh(fireflyGeo, fireflyMat.clone());
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * zone.r;
        ff.position.set(zone.x + Math.cos(a) * r, 0.5 + Math.random() * 1.5, zone.z + Math.sin(a) * r);
        scene.add(ff);
        fireflies.push({
          mesh: ff,
          baseX: ff.position.x,
          baseY: ff.position.y,
          baseZ: ff.position.z,
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 0.5,
        });
      }
    }

    this.animators.push((elapsed) => {
      for (const ff of fireflies) {
        ff.mesh.position.x = ff.baseX + Math.sin(elapsed * ff.speed + ff.phase) * 0.8;
        ff.mesh.position.y = ff.baseY + Math.sin(elapsed * ff.speed * 1.3 + ff.phase) * 0.3;
        ff.mesh.position.z = ff.baseZ + Math.cos(elapsed * ff.speed * 0.8 + ff.phase) * 0.8;
        ff.mesh.material.opacity = 0.4 + Math.sin(elapsed * 2 + ff.phase) * 0.4;
      }
    });
  }
}
