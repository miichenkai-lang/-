import * as THREE from "three";

export class InteriorBuilder {
  constructor() {
    this.built = new Map();
  }

  build(scene, type) {
    if (this.built.has(type)) return this.built.get(type);

    const group = new THREE.Group();
    group.visible = false;
    group.userData.isInterior = true;

    const Y = -100;
    group.position.set(0, Y, 0);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5ecd7, roughness: 0.85 });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xc8b89a, roughness: 0.9 });
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0xfaf6f0, roughness: 0.95, side: THREE.DoubleSide });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.85 });
    const darkWood = new THREE.MeshStandardMaterial({ color: 0x5b3a1e, roughness: 0.85 });

    const W = 14, D = 14, H = 5;

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = H;
    group.add(ceiling);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.2), wallMat);
    backWall.position.set(0, H / 2, -D / 2);
    group.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, H, D), wallMat);
    leftWall.position.set(-W / 2, H / 2, 0);
    group.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, H, D), wallMat);
    rightWall.position.set(W / 2, H / 2, 0);
    group.add(rightWall);

    const frontLeft = new THREE.Mesh(new THREE.BoxGeometry((W - 1.8) / 2, H, 0.2), wallMat);
    frontLeft.position.set(-(W / 2 + 0.9) / 2, H / 2, D / 2);
    group.add(frontLeft);

    const frontRight = new THREE.Mesh(new THREE.BoxGeometry((W - 1.8) / 2, H, 0.2), wallMat);
    frontRight.position.set((W / 2 + 0.9) / 2, H / 2, D / 2);
    group.add(frontRight);

    const frontTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, H - 2.4, 0.2), wallMat);
    frontTop.position.set(0, (H + 2.4) / 2, D / 2);
    group.add(frontTop);

    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 0.15), darkWood);
    doorFrame.position.set(0, 1.2, D / 2 - 0.1);
    group.add(doorFrame);

    const doorSign = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.3, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xf5ecd7, roughness: 0.8 })
    );
    doorSign.position.set(0, 2.6, D / 2 - 0.05);
    group.add(doorSign);

    const ceilingLight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.1, 12),
      new THREE.MeshStandardMaterial({ color: 0xffe9a8, emissive: 0xffd93d, emissiveIntensity: 0.6 })
    );
    ceilingLight.position.set(0, H - 0.1, 0);
    group.add(ceilingLight);

    const ambientLight = new THREE.AmbientLight(0xfff8e7, 0.6);
    group.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffe9a8, 2, 15);
    pointLight.position.set(0, H - 0.5, 0);
    pointLight.castShadow = true;
    group.add(pointLight);

    const fillLight = new THREE.PointLight(0xfff0d0, 0.8, 10);
    fillLight.position.set(3, 2, 3);
    group.add(fillLight);

    const backLight = new THREE.PointLight(0xfff0d0, 0.8, 10);
    backLight.position.set(-3, 2, -3);
    group.add(backLight);

    this.addTable(group, woodMat, -3, -2);
    this.addTable(group, woodMat, 3, -2);
    this.addChair(group, woodMat, -3, -0.5);
    this.addChair(group, woodMat, -3, -3.5);
    this.addChair(group, woodMat, 3, -0.5);
    this.addChair(group, woodMat, 3, -3.5);
    this.addChair(group, woodMat, -1.5, -0.5);
    this.addChair(group, woodMat, 1.5, -0.5);

    this.addShelf(group, woodMat, 0, 2.5, -D / 2 + 0.35, 4);
    this.addShelf(group, woodMat, 0, 3, -D / 2 + 0.35, 3.5);

    const itemColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0xff6f91, 0x4fb3a9];
    for (let i = 0; i < 7; i++) {
      const item = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.4, 0.25),
        new THREE.MeshStandardMaterial({ color: itemColors[i], roughness: 0.7 })
      );
      item.position.set(-1.5 + i * 0.5, 2.25, -D / 2 + 0.35);
      group.add(item);
    }

    this.addSofa(group, woodMat, 5, 0, -D / 2 + 1.5);

    this.addPlant(group, -5.5, 0, 3);
    this.addPlant(group, 5.5, 0, -4);
    this.addPlant(group, -5.5, 0, -4);
    this.addPlant(group, 5.5, 0, 3);

    this.addLampStand(group, -6, 0, -3);
    this.addLampStand(group, 6, 0, 3);
    this.addLampStand(group, -6, 0, 3);
    this.addLampStand(group, 6, 0, -3);

    this.addWallPicture(group, -2, 3, -D / 2 + 0.1);
    this.addWallPicture(group, 2, 3, -D / 2 + 0.1);
    this.addWallPicture(group, -4, 2.7, -D / 2 + 0.1);
    this.addWallPicture(group, 4, 2.7, -D / 2 + 0.1);
    this.addWallPicture(group, -W / 2 + 0.1, 3, 3);
    this.addWallPicture(group, W / 2 - 0.1, 3, -3);

    this.addClock(group, W / 2 - 0.1, 3.2, 0);

    this.addCabinet(group, woodMat, -W / 2 + 0.6, 0, -3);
    this.addCabinet(group, woodMat, -W / 2 + 0.6, 0, -1);
    this.addCabinet(group, woodMat, -W / 2 + 0.6, 0, 1);
    this.addCabinet(group, woodMat, -W / 2 + 0.6, 0, 3);

    this.addRug(group, 0, 0.02, 1.5, 3, 2.5);
    this.addRug(group, 0, 0.02, -3, 4, 2);
    this.addRug(group, -4, 0.02, 0, 2, 2);
    this.addRug(group, 4, 0.02, 0, 2, 2);

    this.addWindow(group, darkWood, -W / 2 + 0.1, 2.5, 0);
    this.addWindow(group, darkWood, W / 2 - 0.1, 2.5, 0);
    this.addWindow(group, darkWood, 0, 2.5, -D / 2 + 0.1);
    this.addWindow(group, darkWood, -3, 2.5, -D / 2 + 0.1);
    this.addWindow(group, darkWood, 3, 2.5, -D / 2 + 0.1);

    this.addShoeRack(group, woodMat, 0, 0, D / 2 - 0.6);

    this.addSmallTable(group, woodMat, 0, 0, 0);
    this.addSmallTable(group, woodMat, -3, 0, 1.5);
    this.addSmallTable(group, woodMat, 3, 0, 1.5);

    this.addTV(group, 0, 2, -D / 2 + 0.4);

    this.addBookcase(group, woodMat, W / 2 - 0.7, 0, -5);
    this.addBookcase(group, woodMat, W / 2 - 0.7, 0, -3);

    this.addCoatRack(group, -W / 2 + 0.6, 0, -5);

    this.addBowl(group, 0, 0, -2);

    this.addMirror(group, darkWood, W / 2 - 0.1, 2.5, 3);

    this.addFireplace(group, 0, 0, -D / 2 + 1);

    this.addPiano(group, woodMat, -W / 2 + 1, 0, 5);

    this.addVase(group, -6.5, 0, 5);
    this.addVase(group, 6.5, 0, -5);
    this.addVase(group, -6.5, 0, -5);
    this.addVase(group, 6.5, 0, 5);

    scene.add(group);
    this.built.set(type, group);
    return group;
  }

  addTable(group, woodMat, x, z) {
    const table = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.8), woodMat);
    top.position.y = 0.8;
    table.add(top);
    for (const dx of [-0.45, 0.45]) {
      for (const dz of [-0.3, 0.3]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.08), woodMat);
        leg.position.set(dx, 0.4, dz);
        table.add(leg);
      }
    }
    table.position.set(x, 0, z);
    group.add(table);
  }

  addChair(group, woodMat, x, z) {
    const chair = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.45), woodMat);
    seat.position.y = 0.5;
    chair.add(seat);
    for (const dx of [-0.17, 0.17]) {
      for (const dz of [-0.17, 0.17]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.06), woodMat);
        leg.position.set(dx, 0.25, dz);
        chair.add(leg);
      }
    }
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.06), woodMat);
    back.position.set(0, 0.75, -0.2);
    chair.add(back);
    chair.position.set(x, 0, z);
    group.add(chair);
  }

  addShelf(group, woodMat, x, y, z, width) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, 0.4), woodMat);
    shelf.position.set(x, y, z);
    group.add(shelf);
  }

  addSofa(group, woodMat, x, y, z) {
    const sofa = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 0.8), new THREE.MeshStandardMaterial({ color: 0xc96a4e, roughness: 0.9 }));
    seat.position.y = 0.35;
    sofa.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.2), new THREE.MeshStandardMaterial({ color: 0xb85a3e, roughness: 0.9 }));
    back.position.set(0, 0.7, -0.3);
    sofa.add(back);
    for (const dx of [-0.7, 0.7]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.8), new THREE.MeshStandardMaterial({ color: 0xb85a3e, roughness: 0.9 }));
      arm.position.set(dx, 0.5, 0);
      sofa.add(arm);
    }
    for (const dx of [-0.7, 0.7]) {
      for (const dz of [-0.25, 0.25]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.08), woodMat);
        leg.position.set(dx, 0.1, dz);
        sofa.add(leg);
      }
    }
    sofa.position.set(x, y, z);
    group.add(sofa);
  }

  addPlant(group, x, y, z) {
    const plant = new THREE.Group();
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.15, 0.35, 8),
      new THREE.MeshStandardMaterial({ color: 0xc96a4e, roughness: 0.8 })
    );
    pot.position.y = 0.175;
    plant.add(pot);
    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.05, 8),
      new THREE.MeshStandardMaterial({ color: 0x5b3a1e, roughness: 1 })
    );
    soil.position.y = 0.35;
    plant.add(soil);
    for (let i = 0; i < 5; i++) {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 6, 5),
        new THREE.MeshStandardMaterial({ color: 0x47a04b, roughness: 0.9 })
      );
      const a = (i / 5) * Math.PI * 2;
      leaf.position.set(Math.sin(a) * 0.15, 0.5 + Math.random() * 0.15, Math.cos(a) * 0.15);
      plant.add(leaf);
    }
    plant.position.set(x, y, z);
    group.add(plant);
  }

  addLampStand(group, x, y, z) {
    const lamp = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.18, 0.1, 8),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 })
    );
    base.position.y = 0.05;
    lamp.add(base);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.6 })
    );
    pole.position.y = 0.7;
    lamp.add(pole);
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, 0.3, 8, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xfff3b0, side: THREE.DoubleSide, roughness: 0.8 })
    );
    shade.position.y = 1.4;
    shade.rotation.x = Math.PI;
    lamp.add(shade);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xffe9a8, emissive: 0xffd93d, emissiveIntensity: 0.8 })
    );
    bulb.position.y = 1.25;
    lamp.add(bulb);
    const light = new THREE.PointLight(0xffe9a8, 0.6, 5);
    light.position.y = 1.3;
    lamp.add(light);
    lamp.position.set(x, y, z);
    group.add(lamp);
  }

  addWallPicture(group, x, y, z) {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.45, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x5b3a1e, roughness: 0.8 })
    );
    frame.position.set(x, y, z);
    group.add(frame);
    const canvas = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.35),
      new THREE.MeshStandardMaterial({ color: [0xff6f91, 0xffd93d, 0x4fb3a9, 0x9b59b6][Math.floor(Math.random() * 4)], roughness: 0.8 })
    );
    canvas.position.set(x, y, z + 0.03);
    group.add(canvas);
  }

  addClock(group, x, y, z) {
    const clock = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: 0xf5ecd7, roughness: 0.7 })
    );
    body.rotation.x = Math.PI / 2;
    clock.add(body);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.03, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x5b3a1e, roughness: 0.8 })
    );
    clock.add(rim);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 6, 4),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
      );
      dot.position.set(Math.sin(a) * 0.2, Math.cos(a) * 0.2, 0.05);
      clock.add(dot);
    }
    clock.position.set(x, y, z);
    group.add(clock);
  }

  addCabinet(group, woodMat, x, y, z) {
    const cabinet = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 0.4), woodMat);
    body.position.y = 0.9;
    cabinet.add(body);
    for (let i = 0; i < 3; i++) {
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.5, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.85 })
      );
      door.position.set(0, 0.3 + i * 0.6, 0.22);
      cabinet.add(door);
      const handle = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 6, 4),
        new THREE.MeshStandardMaterial({ color: 0xc9a96e, roughness: 0.5 })
      );
      handle.position.set(0.2, 0.3 + i * 0.6, 0.25);
      cabinet.add(handle);
    }
    cabinet.position.set(x, y, z);
    group.add(cabinet);
  }

  addRug(group, x, y, z, w, d) {
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshStandardMaterial({ color: 0xc96a4e, roughness: 0.95 })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(x, y, z);
    group.add(rug);
    const border = new THREE.Mesh(
      new THREE.PlaneGeometry(w + 0.2, d + 0.2),
      new THREE.MeshStandardMaterial({ color: 0x8b5a33, roughness: 0.95 })
    );
    border.rotation.x = -Math.PI / 2;
    border.position.set(x, y - 0.005, z);
    group.add(border);
  }

  addWindow(group, darkWood, x, y, z) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 1.5), darkWood);
    frame.position.set(x, y, z);
    group.add(frame);
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(1.3, 1.3),
      new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.4, roughness: 0.1 })
    );
    glass.position.set(x > 0 ? x - 0.05 : x + 0.05, y, z);
    glass.rotation.y = Math.PI / 2;
    group.add(glass);
  }

  addShoeRack(group, woodMat, x, y, z) {
    const rack = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.4), woodMat);
    top.position.y = 0.5;
    rack.add(top);
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.4), woodMat);
    bottom.position.y = 0.15;
    rack.add(bottom);
    for (const dx of [-0.5, 0.5]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.4), woodMat);
      side.position.set(dx, 0.3, 0);
      rack.add(side);
    }
    const shoe1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.12, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 })
    );
    shoe1.position.set(-0.25, 0.25, 0);
    rack.add(shoe1);
    const shoe2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.12, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 })
    );
    shoe2.position.set(0.25, 0.25, 0);
    rack.add(shoe2);
    rack.position.set(x, y, z);
    group.add(rack);
  }

  addSmallTable(group, woodMat, x, y, z) {
    const table = new THREE.Group();
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 12), woodMat);
    top.position.y = 0.5;
    table.add(top);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.5, 8), woodMat);
    leg.position.y = 0.25;
    table.add(leg);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 12), woodMat);
    base.position.y = 0.02;
    table.add(base);
    table.position.set(x, y, z);
    group.add(table);
  }

  addTV(group, x, y, z) {
    const tv = new THREE.Group();
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.9, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 })
    );
    tv.add(screen);
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.75),
      new THREE.MeshStandardMaterial({ color: 0x1a1a2e, emissive: 0x0a0a1e, emissiveIntensity: 0.3, roughness: 0.1 })
    );
    panel.position.z = 0.05;
    tv.add(panel);
    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.15, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 })
    );
    stand.position.y = -0.52;
    tv.add(stand);
    tv.position.set(x, y, z);
    group.add(tv);
  }

  addBookcase(group, woodMat, x, y, z) {
    const bookcase = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.2, 0.35), woodMat);
    body.position.y = 1.1;
    bookcase.add(body);
    for (let row = 0; row < 4; row++) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.06, 0.3), woodMat);
      shelf.position.set(0, 0.4 + row * 0.5, 0);
      bookcase.add(shelf);
      const bookColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6];
      for (let i = 0; i < 4; i++) {
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.35, 0.22),
          new THREE.MeshStandardMaterial({ color: bookColors[(row + i) % 5], roughness: 0.8 })
        );
        bookcase.add(book);
      }
    }
    bookcase.position.set(x, y, z);
    group.add(bookcase);
  }

  addCoatRack(group, x, y, z) {
    const rack = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6),
      new THREE.MeshStandardMaterial({ color: 0x5b3a1e, roughness: 0.8 })
    );
    pole.position.y = 0.9;
    rack.add(pole);
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.06, 8),
      new THREE.MeshStandardMaterial({ color: 0x5b3a1e, roughness: 0.8 })
    );
    base.position.y = 0.03;
    rack.add(base);
    for (let i = 0; i < 4; i++) {
      const hook = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.25, 6),
        new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.6 })
      );
      const a = (i / 4) * Math.PI * 2;
      hook.position.set(Math.sin(a) * 0.15, 1.7, Math.cos(a) * 0.15);
      hook.rotation.z = Math.PI / 2 * (i % 2 === 0 ? 1 : -1);
      rack.add(hook);
    }
    rack.position.set(x, y, z);
    group.add(rack);
  }

  addBowl(group, x, y, z) {
    const bowl = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xf5ecd7, roughness: 0.6, side: THREE.DoubleSide })
    );
    bowl.rotation.x = Math.PI;
    bowl.position.set(x, y + 0.55, z);
    group.add(bowl);
    const fruit1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.7 })
    );
    fruit1.position.set(x - 0.05, y + 0.65, z);
    group.add(fruit1);
    const fruit2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xf39c12, roughness: 0.7 })
    );
    fruit2.position.set(x + 0.08, y + 0.62, z - 0.03);
    group.add(fruit2);
    const fruit3 = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.7 })
    );
    fruit3.position.set(x + 0.02, y + 0.68, z + 0.06);
    group.add(fruit3);
  }

  addMirror(group, darkWood, x, y, z) {
    const mirror = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.8), darkWood);
    mirror.add(frame);
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(0.08, 1.0),
      new THREE.MeshStandardMaterial({ color: 0xc0d0e0, transparent: true, opacity: 0.6, roughness: 0.05, metalness: 0.8 })
    );
    glass.rotation.y = Math.PI / 2;
    glass.position.x = 0.02;
    mirror.add(glass);
    mirror.position.set(x, y, z);
    group.add(mirror);
  }

  addFireplace(group, x, y, z) {
    const fp = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.2, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9 })
    );
    body.position.y = 0.6;
    fp.add(body);
    const opening = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.8, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x1a0e08, roughness: 1 })
    );
    opening.position.set(0, 0.5, 0.15);
    fp.add(opening);
    const mantle = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.1, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x5b3a1e, roughness: 0.8 })
    );
    mantle.position.y = 1.25;
    fp.add(mantle);
    const fire = new THREE.PointLight(0xff6633, 1.5, 5);
    fire.position.set(0, 0.6, 0.2);
    fp.add(fire);
    fp.position.set(x, y, z);
    group.add(fp);
  }

  addPiano(group, woodMat, x, y, z) {
    const piano = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.7), woodMat);
    body.position.y = 0.45;
    piano.add(body);
    const keys = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.06, 0.25),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    keys.position.set(0, 0.7, 0.35);
    piano.add(keys);
    for (let i = 0; i < 7; i++) {
      const blackKey = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.08, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 })
      );
      blackKey.position.set(-0.35 + i * 0.12, 0.78, 0.3);
      piano.add(blackKey);
    }
    piano.position.set(x, y, z);
    group.add(piano);
  }

  addVase(group, x, y, z) {
    const vase = new THREE.Mesh(
      new THREE.LatheGeometry([
        new THREE.Vector2(0.08, 0),
        new THREE.Vector2(0.12, 0.1),
        new THREE.Vector2(0.14, 0.25),
        new THREE.Vector2(0.1, 0.4),
        new THREE.Vector2(0.06, 0.5),
        new THREE.Vector2(0.08, 0.55),
        new THREE.Vector2(0.07, 0.6),
      ], 10),
      new THREE.MeshStandardMaterial({ color: 0x4fb3a9, roughness: 0.5 })
    );
    vase.position.set(x, y, z);
    group.add(vase);
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xff6f91, roughness: 0.7 })
    );
    flower.position.set(x, y + 0.7, z);
    group.add(flower);
  }

  show(type) {
    const g = this.built.get(type);
    if (g) g.visible = true;
  }

  hideAll() {
    for (const g of this.built.values()) {
      g.visible = false;
    }
  }
}
