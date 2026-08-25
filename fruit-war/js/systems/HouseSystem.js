import * as THREE from "three";
import { INTERIORS, HOUSE_TRIGGERS } from "../data/interiors.js";

export class HouseSystem {
  constructor(ui, scene, camera, player, controller) {
    this.ui = ui;
    this.scene = scene;
    this.camera = camera;
    this.player = player;
    this.controller = controller;
    this.interiors = INTERIORS;
    this.triggers = HOUSE_TRIGGERS;
    this.currentHouse = null;
    this.active = false;
    this.selectedItem = 0;
    this.revealedSecrets = new Set();
    this.savedPos = new THREE.Vector3();
    this.savedRot = 0;
    this.interiorGroups = new Map();
    this.savedVisible = new Map();
  }

  checkTrigger(playerPos) {
    if (this.active) return null;
    for (const trigger of this.triggers) {
      const d = Math.hypot(playerPos.x - trigger.x, playerPos.z - trigger.z);
      if (d < 2.5) {
        return trigger;
      }
    }
    return null;
  }

  enter(trigger, interiorBuilder) {
    const interior = this.interiors[trigger.type];
    if (!interior) return;

    this.currentHouse = { trigger, interior };
    this.active = true;
    this.selectedItem = 0;

    this.savedPos.copy(this.player.group.position);
    this.savedRot = this.player.group.rotation.y;
    this.savedBg = this.scene.background;
    this.savedFog = this.scene.fog;

    if (!this.interiorGroups.has(trigger.type)) {
      const g = interiorBuilder.build(this.scene, trigger.type);
      this.interiorGroups.set(trigger.type, g);
    }

    const interiorGroup = this.interiorGroups.get(trigger.type);

    for (const [i, child] of this.scene.children.entries()) {
      this.savedVisible.set(i, child.visible);
      child.visible = false;
    }

    interiorGroup.visible = true;
    this.player.group.visible = true;
    this.player.group.scale.set(0.4, 0.4, 0.4);

    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = null;

    this.player.group.position.set(0, -99.8, 2);
    this.player.group.rotation.y = Math.PI;

    if (this.controller) {
      this.controller.inInterior = true;
      this.controller._snapped = false;
      this.controller.heading = Math.PI;
      this.player.group.rotation.y = Math.PI;

      this.controller.interiorCollisions = [
        { x: -3, z: -2, r: 0.6 },
        { x: 3, z: -2, r: 0.6 },
        { x: -3, z: -0.5, r: 0.3 },
        { x: -3, z: -3.5, r: 0.3 },
        { x: 3, z: -0.5, r: 0.3 },
        { x: 3, z: -3.5, r: 0.3 },
        { x: -1.5, z: -0.5, r: 0.3 },
        { x: 1.5, z: -0.5, r: 0.3 },
        { x: 5, z: -5.5, r: 0.8 },
        { x: -5.5, z: 3, r: 0.3 },
        { x: 5.5, z: -4, r: 0.3 },
        { x: -5.5, z: -4, r: 0.3 },
        { x: 5.5, z: 3, r: 0.3 },
        { x: -6, z: -3, r: 0.3 },
        { x: 6, z: 3, r: 0.3 },
        { x: -6, z: 3, r: 0.3 },
        { x: 6, z: -3, r: 0.3 },
        { x: -6.4, z: -3, r: 0.35 },
        { x: -6.4, z: -1, r: 0.35 },
        { x: -6.4, z: 1, r: 0.35 },
        { x: -6.4, z: 3, r: 0.35 },
        { x: 0, z: 6.4, r: 0.5 },
        { x: 0, z: 0, r: 0.3 },
        { x: -3, z: 1.5, r: 0.3 },
        { x: 3, z: 1.5, r: 0.3 },
        { x: 0, z: -6.6, r: 0.6 },
        { x: 6.3, z: -5, r: 0.4 },
        { x: 6.3, z: -3, r: 0.4 },
        { x: -6.4, z: -5, r: 0.3 },
        { x: 0, z: -2, r: 0.3 },
        { x: 6.9, z: 3, r: 0.3 },
        { x: 0, z: -6.2, r: 0.6 },
        { x: -6.4, z: 5, r: 0.5 },
        { x: -6.5, z: 5, r: 0.2 },
        { x: 6.5, z: -5, r: 0.2 },
        { x: -6.5, z: -5, r: 0.2 },
        { x: 6.5, z: 5, r: 0.2 },
      ];
    }

    this.camera.position.set(0, -98.5, 4.5);
    this.camera.lookAt(0, -99.5, 0);

    this.ui.toast("按 E 看看有什麼，按 Q 離開");
  }

  exit() {
    if (!this.currentHouse) return;

    for (const [i, child] of this.scene.children.entries()) {
      if (this.savedVisible.has(i)) {
        child.visible = this.savedVisible.get(i);
      } else {
        child.visible = true;
      }
    }
    this.savedVisible.clear();

    for (const g of this.interiorGroups.values()) g.visible = false;

    this.player.group.position.copy(this.savedPos);
    this.player.group.rotation.y = this.savedRot;
    this.player.group.scale.set(1, 1, 1);

    if (this.controller) {
      this.controller.inInterior = false;
      this.controller._snapped = false;
      this.controller.heading = this.savedRot;
      this.controller.interiorCollisions = [];
    }

    if (this.savedBg) this.scene.background = this.savedBg;
    if (this.savedFog) this.scene.fog = this.savedFog;

    this.active = false;
    this.currentHouse = null;
    this.ui.hideInterior();
  }

  handleInput(input, playerState) {
    if (!this.active || !this.currentHouse) return false;

    if (input.wasPressed("KeyQ") || input.wasPressed("Escape")) {
      if (this.ui.interiorEl && !this.ui.interiorEl.classList.contains("hidden")) {
        this.ui.hideInterior();
        this.toastShown = false;
      } else {
        this.exit();
      }
      return true;
    }

    if (input.wasPressed("KeyE") || input.wasPressed("Enter")) {
      if (!this.ui.interiorEl || this.ui.interiorEl.classList.contains("hidden")) {
        const interior = this.currentHouse.interior;
        const items = interior.items.filter((item) => {
          if (item.hidden) return this.revealedSecrets.has(item.id);
          return true;
        });
        this.ui.showInterior(interior, items, interior.beds);
        this.selectedItem = 0;
      } else {
        const allItems = [...(this.ui._interiorItems || [])];
        const item = allItems[this.selectedItem];
        if (item) {
          this.useItem(item, playerState);
        }
      }
      return true;
    }

    if (input.wasPressed("ArrowUp") || input.wasPressed("KeyW")) {
      if (this.ui.interiorEl && !this.ui.interiorEl.classList.contains("hidden")) {
        this.selectedItem = (this.selectedItem - 1 + (this.ui._interiorItems || []).length) % (this.ui._interiorItems || []).length;
        this.ui.updateInteriorSelection(this.selectedItem);
      }
      return true;
    }

    if (input.wasPressed("ArrowDown") || input.wasPressed("KeyS")) {
      if (this.ui.interiorEl && !this.ui.interiorEl.classList.contains("hidden")) {
        this.selectedItem = (this.selectedItem + 1) % (this.ui._interiorItems || []).length;
        this.ui.updateInteriorSelection(this.selectedItem);
      }
      return true;
    }

    return false;
  }

  useItem(item, playerState) {
    if (!item.effect) {
      this.ui.toast(`${item.icon} ${item.name}：${item.desc || "看起來很有趣..."}`);
      return;
    }

    if (item.effect.heal) {
      playerState.heal(item.effect.heal);
    }

    if (item.effect.coins) {
      playerState.coins += item.effect.coins;
    }

    if (item.effect.duration) {
      playerState.applyBuff({
        name: item.name,
        icon: item.icon,
        duration: item.effect.duration,
        attackMul: item.effect.attackMul,
        defenseMul: item.effect.defenseMul,
        speedMul: item.effect.speedMul,
      });
    } else if (item.effect.attackMul || item.effect.defenseMul || item.effect.speedMul) {
      playerState.applyBuff({
        name: item.name,
        icon: item.icon,
        duration: 60,
        attackMul: item.effect.attackMul,
        defenseMul: item.effect.defenseMul,
        speedMul: item.effect.speedMul,
      });
    }

    const isHidden = item.hidden;
    this.ui.toast(`${item.icon} 使用了 ${item.name}！${isHidden ? "（彩蛋！）" : ""}`);
    this.ui.updateInteriorSelection(this.selectedItem);
  }

  revealSecret(secretId) {
    this.revealedSecrets.add(secretId);
  }

  tryRevealSecret() {
    const allSecrets = [];
    for (const [type, interior] of Object.entries(this.interiors)) {
      for (const item of interior.items) {
        if (item.hidden && !this.revealedSecrets.has(item.id)) {
          allSecrets.push(item.id);
        }
      }
    }
    if (allSecrets.length > 0 && Math.random() < 0.3) {
      const secret = allSecrets[Math.floor(Math.random() * allSecrets.length)];
      this.revealedSecrets.add(secret);
      return secret;
    }
    return null;
  }
}
