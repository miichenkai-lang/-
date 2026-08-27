import * as THREE from "three";
import { GameManager } from "./core/GameManager.js";
import { InputManager } from "./core/InputManager.js";
import { MapManager } from "./world/MapManager.js";
import { InteriorBuilder } from "./world/InteriorBuilder.js";
import { FruitCharacter } from "./entities/FruitCharacter.js";
import { PlayerController } from "./entities/PlayerController.js";
import { NPCManager } from "./entities/NPCManager.js";
import { TimeSystem } from "./systems/TimeSystem.js";
import { DialogueSystem } from "./systems/DialogueSystem.js";
import { ShopSystem } from "./systems/ShopSystem.js";
import { HouseSystem } from "./systems/HouseSystem.js";
import { RocketSystem } from "./systems/RocketSystem.js";
import { PlayerState } from "./systems/PlayerState.js";
import { DAILY_ALLOWANCE } from "./data/shopData.js";
import { MOON_NPCS, MOON_SHOPS } from "./data/moonBaseData.js";
import { UIManager } from "./ui/UIManager.js";

class MoonNpc {
  constructor(def) {
    this.def = def;
    const fruitColors = {
      apple: 0xe23b3b, banana: 0xffd93d, watermelon: 0x4caf50,
      orange: 0xff9800, lemon: 0xffeb3b, grape: 0x7b1fa2,
      strawberry: 0xff6f91, cherry: 0xc62828, coconut: 0x8d6e63,
      mango: 0xffa726, durian: 0x827717,
    };
    this.group = new THREE.Group();
    const color = fruitColors[def.fruit] || 0xe23b3b;
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 10), bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    this.group.add(body);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), eyeMat);
      eye.position.set(side * 0.12, 0.7, 0.35);
      this.group.add(eye);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), new THREE.MeshBasicMaterial({ color: 0x111111 }));
      pupil.position.set(side * 0.12, 0.7, 0.4);
      this.group.add(pupil);
    }

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const c = canvas.getContext("2d");
    c.fillStyle = "rgba(15,25,35,0.78)";
    c.beginPath();
    c.roundRect(8, 8, 240, 48, 14);
    c.fill();
    c.fillStyle = "#ccccff";
    c.font = "bold 28px 'Microsoft JhengHei','PingFang TC',sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(def.name, 128, 33);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: true }));
    tag.scale.set(1.7, 0.42, 1);
    tag.position.y = 2.05;
    this.group.add(tag);

    this.entry = { act: "work" };
    const pos = def.schedule[0] || def.home;
    this.group.position.set(pos.x, 0, pos.z);
  }

  distanceTo(v) {
    return Math.hypot(this.group.position.x - v.x, this.group.position.z - v.z);
  }
}

function boot() {
  const game = new GameManager(document.getElementById("app"));
  game.init();

  const input = new InputManager(game.renderer.domElement);
  const ui = new UIManager();
  input.onLockChange = (locked) => ui.setLocked(locked);

  const timeSystem = new TimeSystem(game.scene);

  const map = new MapManager();
  map.build(game.scene);
  timeSystem.attachLights(map.sun, map.hemi);

  const playerState = new PlayerState("apple");
  const player = new FruitCharacter("apple");
  player.group.position.copy(map.spawnPoint);
  game.scene.add(player.group);

  const controller = new PlayerController(player, game.camera);

  const npcs = new NPCManager(game.scene, map.collisions);
  const dialogue = new DialogueSystem(ui);
  const shops = new ShopSystem(ui);
  const interiorBuilder = new InteriorBuilder();
  const houses = new HouseSystem(ui, game.scene, game.camera, player, controller);
  const rocket = new RocketSystem(ui, game.scene, player);

  if (map.moonData) {
    rocket.setMoonData(map.moonData, map.moonData.group);
  }

  const moonNpcObjs = MOON_NPCS.map((def) => new MoonNpc(def));
  for (const npc of moonNpcObjs) {
    map.moonData.group.add(npc.group);
  }

  const moonShopObjs = MOON_SHOPS.map((s) => ({
    ...s,
    x: s.x,
    z: s.z,
  }));

  timeSystem.onNewDay = (day) => {
    playerState.coins += DAILY_ALLOWANCE;
    ui.toast(`🌅 第 ${day} 天！零用錢 +${DAILY_ALLOWANCE} 金幣`);
    const secret = houses.tryRevealSecret();
    if (secret) {
      ui.toast("🔮 你感應到某個房子裡出現了神秘寶物...");
    }
  };

  function anyMenuOpen() {
    return dialogue.active !== null || shops.menuOpen;
  }

  function findNearestMoonShop(playerPos) {
    let best = null;
    for (const shop of moonShopObjs) {
      const dx = playerPos.x - shop.x;
      const dz = playerPos.z - shop.z;
      const worldX = playerPos.x - (map.moonData ? map.moonData.group.position.x : 0);
      const worldZ = playerPos.z - (map.moonData ? map.moonData.group.position.z : 0);
      const d = Math.hypot(worldX - shop.x, worldZ - shop.z);
      if (d < shop.radius && (!best || d < best.dist)) {
        best = { kind: "shop", shop, dist: d };
      }
    }
    return best;
  }

  ui.hideLoading();
  ui.setLocked(false);

  game.onTick((dt, elapsed) => {
    rocket.update(dt, playerState);

    if (rocket.isTransitioning) {
      if (rocket.launchPhase === "boarding" || rocket.launchPhase === "takeoff") {
        const pos = player.group.position;
        controller.camera.position.set(
          pos.x - Math.sin(controller.yaw) * 3,
          pos.y + 2.5,
          pos.z - Math.cos(controller.yaw) * 3
        );
        controller.camera.lookAt(pos.x, pos.y + 1, pos.z);
      }
      input.endFrame();
      return;
    }

    controller.lowGravity = rocket.isOnMoon;
    controller.groundLevel = rocket.isOnMoon ? 200 : 0;

    if (rocket.isOnMoon) {
      controller.update(dt, input, map.moonData ? map.moonData.moonRadius : 65, null, playerState);

      if (dialogue.active) {
        dialogue.handleInput(input);
        ui.hidePrompt();
      } else if (shops.menuOpen) {
        shops.handleInput(input);
        ui.hidePrompt();
      } else {
        const nearNpc = dialogue.nearest(player.group.position, moonNpcObjs);
        const nearShop = findNearestMoonShop(player.group.position);

        let best = null;
        if (nearNpc && (!nearShop || nearNpc.dist <= nearShop.dist)) best = nearNpc;
        else if (nearShop) best = nearShop;

        if (best) ui.showPrompt(best.kind === "npc" ? `和 ${best.npc.def.name} 說話` : `逛逛 ${best.shop.name}`);
        else ui.hidePrompt();

        if (input.wasPressed("KeyE") && best) {
          if (best.kind === "npc") dialogue.open(best.npc);
          else shops.open(best.shop, playerState);
        }
      }

      const nearMoonTicket = rocket.checkMoonTicketBooth(player.group.position);
      if (nearMoonTicket && !shops.menuOpen && !dialogue.active) {
        ui.showPrompt(`🚀 搭火箭回果汁島（$${rocket.ticketCost}）`);
        if (input.wasPressed("KeyE")) {
          rocket.startReturn(playerState);
        }
      }

      if (input.wasPressed("KeyQ") && !shops.menuOpen && !dialogue.active && !nearMoonTicket) {
        rocket.startReturn(playerState);
      }

      input.endFrame();
      return;
    }

    timeSystem.update(dt);
    playerState.tick(dt);
    npcs.update(dt, timeSystem.minutes);

    const menuOpen = anyMenuOpen();
    controller.enabled = !menuOpen;
    controller.update(dt, input, map.islandRadius, map.collisions, playerState);

    if (dialogue.active) {
      dialogue.handleInput(input);
      ui.hidePrompt();
    } else if (shops.menuOpen) {
      shops.handleInput(input);
      ui.hidePrompt();
    } else if (houses.active) {
      houses.handleInput(input, playerState);
      ui.hidePrompt();
    } else {
      const nearNpc = dialogue.nearest(player.group.position, npcs.list);
      const nearShop = shops.nearest(player.group.position);
      const nearHouse = houses.checkTrigger(player.group.position);
      const nearTicket = rocket.checkTicketBooth(player.group.position);

      let best = null;
      if (nearNpc && (!nearShop || nearNpc.dist <= nearShop.dist)) best = nearNpc;
      else if (nearShop) best = nearShop;

      if (nearTicket && (!best || nearTicket < (best.dist || Infinity))) {
        ui.showPrompt(`🚀 搭火箭去月球（$${rocket.ticketCost}）`);
        if (input.wasPressed("KeyE")) {
          rocket.startLaunch(playerState);
        }
      } else if (best) {
        ui.showPrompt(best.kind === "npc" ? `和 ${best.npc.def.name} 說話` : `逛逛 ${best.shop.name}`);
        if (input.wasPressed("KeyE")) {
          if (best.kind === "npc") dialogue.open(best.npc);
          else shops.open(best.shop, playerState);
        }
      } else if (nearHouse) {
        ui.showPrompt(`進入 ${nearHouse.type === "house" ? "民房" : "店鋪"}`);
        if (input.wasPressed("KeyE")) {
          houses.enter(nearHouse, interiorBuilder);
        }
      } else {
        ui.hidePrompt();
      }
    }

    input.endFrame();
    ui.tick(dt, player.group.position, timeSystem, playerState, npcs.list);
  });

  game.start();
}

boot();
