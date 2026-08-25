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
import { PlayerState } from "./systems/PlayerState.js";
import { DAILY_ALLOWANCE } from "./data/shopData.js";
import { UIManager } from "./ui/UIManager.js";

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

  ui.hideLoading();
  ui.setLocked(false);

  game.onTick((dt, elapsed) => {
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
      let best = null;
      if (nearNpc && (!nearShop || nearNpc.dist <= nearShop.dist)) best = nearNpc;
      else if (nearShop) best = nearShop;

      if (best) ui.showPrompt(best.kind === "npc" ? `和 ${best.npc.def.name} 說話` : `逛逛 ${best.shop.name}`);
      else if (nearHouse) ui.showPrompt(`進入 ${nearHouse.type === "house" ? "民房" : "店鋪"}`);
      else ui.hidePrompt();

      if (input.wasPressed("KeyE")) {
        if (best) {
          if (best.kind === "npc") dialogue.open(best.npc);
          else shops.open(best.shop, playerState);
        } else if (nearHouse) {
          houses.enter(nearHouse, interiorBuilder);
        }
      }
    }

    input.endFrame();
    ui.tick(dt, player.group.position, timeSystem, playerState, npcs.list);
  });

  game.start();
}

boot();
