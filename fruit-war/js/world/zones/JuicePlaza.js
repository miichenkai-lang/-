import * as THREE from "three";

export function buildJuicePlaza(scene, { animate, collide, collideBox }) {
  collide(0, 0, 4.2);
  const plazaFloor = new THREE.Mesh(
    new THREE.CircleGeometry(11, 48),
    new THREE.MeshStandardMaterial({ color: 0xdfd6c6, roughness: 0.9 })
  );
  plazaFloor.rotation.x = -Math.PI / 2;
  plazaFloor.position.y = 0.07;
  plazaFloor.receiveShadow = true;
  scene.add(plazaFloor);

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: 0.7 });

  const rim = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.45, 12, 40), stoneMat);
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 0.45;
  rim.castShadow = true;
  rim.receiveShadow = true;
  scene.add(rim);

  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(3.95, 40),
    new THREE.MeshStandardMaterial({ color: 0x29b6f6, emissive: 0x0277bd, roughness: 0.3 })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.5;
  scene.add(pool);

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 1.5, 16), stoneMat);
  pedestal.position.y = 1.2;
  pedestal.castShadow = true;
  scene.add(pedestal);

  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 24, 18),
    new THREE.MeshStandardMaterial({
      color: 0x4fc3f7,
      emissive: 0x29b6f6,
      emissiveIntensity: 0.55,
      roughness: 0.35,
    })
  );
  orb.position.y = 3.3;
  orb.castShadow = true;
  scene.add(orb);

  const splashMat = new THREE.MeshStandardMaterial({
    color: 0x81d4fa,
    transparent: true,
    opacity: 0.6,
    roughness: 0.4,
  });
  const splash = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.07, 8, 32), splashMat);
  splash.rotation.x = -Math.PI / 2;
  splash.position.y = 2.1;
  scene.add(splash);

  animate((elapsed) => {
    orb.position.y = 3.3 + Math.sin(elapsed * 1.6) * 0.18;
    orb.scale.setScalar(1 + Math.sin(elapsed * 2.4) * 0.05);
    const t = (elapsed % 1.8) / 1.8;
    splash.scale.setScalar(1 + t * 1.4);
    splash.material.opacity = 0.6 * (1 - t);
  });

  const woodMat = new THREE.MeshStandardMaterial({ color: 0xb98a4e, roughness: 0.85 });
  for (let i = 0; i < 4; i++) {
    const a = Math.PI * (0.25 + 0.5 * i);
    const benchGroup = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.5), woodMat);
    seat.position.y = 0.45;
    seat.castShadow = true;
    benchGroup.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.06), woodMat);
    back.position.set(0, 0.72, -0.22);
    back.rotation.x = -0.15;
    benchGroup.add(back);
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.4), woodMat);
      leg.position.set(side * 0.75, 0.225, 0);
      benchGroup.add(leg);
    }
    benchGroup.position.set(Math.sin(a) * 7.2, 0, Math.cos(a) * 7.2);
    benchGroup.rotation.y = a + Math.PI;
    scene.add(benchGroup);
    collide(Math.sin(a) * 7.2, Math.cos(a) * 7.2, 0.95);
  }

  for (let i = 0; i < 4; i++) {
    const a = Math.PI * (0.25 + 0.5 * i) + Math.PI * 0.125;
    const lamp = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.6 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 3, 8), poleMat);
    pole.position.y = 1.5;
    pole.castShadow = true;
    lamp.add(pole);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 10),
      new THREE.MeshStandardMaterial({
        color: 0xffdf9e,
        emissive: 0xffdf9e,
        emissiveIntensity: 0.9,
        roughness: 0.4,
      })
    );
    bulb.position.y = 3.1;
    lamp.add(bulb);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.2, 8), poleMat);
    cap.position.y = 3.32;
    lamp.add(cap);
    lamp.position.set(Math.sin(a) * 9.3, 0, Math.cos(a) * 9.3);
    scene.add(lamp);
    collide(Math.sin(a) * 9.3, Math.cos(a) * 9.3, 0.28);
  }

  const notice = new THREE.Group();
  const poleMatN = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.9 });
  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.4, 8), poleMatN);
    pole.position.set(side * 1.0, 1.2, 0);
    pole.castShadow = true;
    notice.add(pole);
  }
  const boardTex = document.createElement("canvas");
  boardTex.width = 256;
  boardTex.height = 144;
  const bc = boardTex.getContext("2d");
  bc.fillStyle = "#f5ecd7";
  bc.fillRect(0, 0, 256, 144);
  bc.fillStyle = "#7a4a21";
  bc.font = "bold 34px 'Microsoft JhengHei',sans-serif";
  bc.textAlign = "center";
  bc.fillText("活動公告", 128, 46);
  bc.font = "20px 'Microsoft JhengHei',sans-serif";
  bc.fillText("・果子大戰 報名中！", 128, 88);
  bc.fillText("・夜市 每晚營業", 128, 116);
  const noticeTex = new THREE.CanvasTexture(boardTex);
  noticeTex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.35, 0.08),
    [
      poleMatN,
      poleMatN,
      poleMatN,
      poleMatN,
      new THREE.MeshBasicMaterial({ map: noticeTex }),
      new THREE.MeshBasicMaterial({ map: noticeTex }),
    ]
  );
  board.position.y = 1.7;
  notice.add(board);
  notice.position.set(6.4, 0, 6.4);
  notice.rotation.y = Math.PI + Math.PI / 4;
  scene.add(notice);
  collideBox(6.4, 6.4, 1.2, 0.15);

  const petalColors = [0xff6f91, 0xffd93d, 0xffffff];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 6),
      new THREE.MeshStandardMaterial({ color: petalColors[i % 3], roughness: 0.7 })
    );
    head.position.set(Math.sin(a) * 6.2, 0.14, Math.cos(a) * 6.2);
    scene.add(head);
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.26, 6),
      new THREE.MeshStandardMaterial({ color: 0x3f9142, roughness: 0.9 })
    );
    stem.position.set(Math.sin(a) * 6.2, 0.13, Math.cos(a) * 6.2);
    scene.add(stem);
  }
}
