import * as THREE from "three";

export class RocketSystem {
  constructor(ui, scene, player) {
    this.ui = ui;
    this.scene = scene;
    this.player = player;
    this.isTransitioning = false;
    this.isOnMoon = false;
    this.moonData = null;
    this.launchTimer = 0;
    this.launchPhase = "";
    this.returnTimer = 0;
    this.returnPhase = "";
    this.overlay = document.getElementById("lock-overlay");
    this.ticketCost = 15;
    this._keepVisible = new Set();
    this._savedIslandVisible = new Map();
  }

  setMoonData(moonData, moonGroup) {
    this.moonData = moonData;
    this.moonGroup = moonGroup;
  }

  checkTicketBooth(playerPos) {
    if (this.isOnMoon || this.isTransitioning) return false;
    const ticketPos = { x: -46, z: 44 };
    const d = Math.hypot(playerPos.x - ticketPos.x, playerPos.z - ticketPos.z);
    return d < 2.5;
  }

  canAfford(playerState) {
    return playerState.coins >= this.ticketCost;
  }

  startLaunch(playerState) {
    if (this.isTransitioning) return false;
    if (!this.canAfford(playerState)) {
      this.ui.toast(`金幣不足！需要 ${this.ticketCost} 金幣`, true);
      return false;
    }

    playerState.coins -= this.ticketCost;
    this.isTransitioning = true;
    this.launchPhase = "countdown";
    this.launchTimer = 3;
    this.countdownValue = 3;
    this._savedBg = this.scene.background ? this.scene.background.clone() : null;
    this._savedFog = this.scene.fog ? this.scene.fog.clone() : null;

    this.ui.toast(`🚀 火箭發射倒數：${this.countdownValue}`);
    return true;
  }

  startReturn() {
    if (this.isTransitioning || !this.isOnMoon) return;
    this.isTransitioning = true;
    this.returnPhase = "blackout";
    this.returnTimer = 2;
  }

  update(dt) {
    if (this.isTransitioning) {
      if (this.launchPhase) {
        this._updateLaunch(dt);
      } else if (this.returnPhase) {
        this._updateReturn(dt);
      }
    }
  }

  _updateLaunch(dt) {
    if (this.launchPhase === "countdown") {
      this.launchTimer -= dt;
      const newVal = Math.ceil(this.launchTimer);
      if (newVal !== this.countdownValue && newVal > 0) {
        this.countdownValue = newVal;
        this.ui.toast(`🚀 火箭發射倒數：${this.countdownValue}`);
      }
      if (this.launchTimer <= 0) {
        this.launchPhase = "blackout";
        this.launchTimer = 1.5;
        this._showOverlay("火箭發射中...");
      }
    } else if (this.launchPhase === "blackout") {
      this.launchTimer -= dt;
      if (this.launchTimer <= 0) {
        this.launchPhase = "flying";
        this.launchTimer = 2;
        this._showOverlay("飛往月球中...");
      }
    } else if (this.launchPhase === "flying") {
      this.launchTimer -= dt;
      if (this.launchTimer <= 0) {
        this.launchPhase = "arriving";
        this.launchTimer = 1.5;
        this._showOverlay("即將降落月球...");
      }
    } else if (this.launchPhase === "arriving") {
      this.launchTimer -= dt;
      if (this.launchTimer <= 0) {
        this._arriveMoon();
      }
    }
  }

  _updateReturn(dt) {
    if (this.returnPhase === "blackout") {
      this.returnTimer -= dt;
      this._showOverlay("返回果汁島中...");
      if (this.returnTimer <= 0) {
        this._arriveIsland();
      }
    }
  }

  _showOverlay(text) {
    if (this.overlay) {
      this.overlay.classList.remove("hidden");
      const box = this.overlay.querySelector(".lock-box");
      if (box) {
        box.innerHTML = `<h2>${text}</h2><div class="spinner" style="margin:20px auto"></div>`;
      }
    }
  }

  _hideOverlay() {
    if (this.overlay) this.overlay.classList.add("hidden");
  }

  _arriveMoon() {
    if (!this.moonData || !this.moonGroup) return;

    this._savedIslandVisible.clear();
    for (const child of this.scene.children) {
      if (child === this.moonGroup) continue;
      if (child.isLight) {
        this._keepVisible.add(child);
        continue;
      }
      this._savedIslandVisible.set(child, child.visible);
      child.visible = false;
    }

    this.moonGroup.visible = true;

    this.scene.background = new THREE.Color(0x050510);
    this.scene.fog = null;

    this.player.group.position.copy(this.moonData.spawnPoint);
    this.player.group.rotation.y = 0;
    this.player.group.scale.set(1, 1, 1);
    this.player.group.visible = true;

    this.isOnMoon = true;
    this.isTransitioning = false;
    this.launchPhase = "";

    this._hideOverlay();
    this.ui.toast("🌙 歡迎來到月球基地！低重力模式啟動！");
  }

  _arriveIsland() {
    for (const [child, vis] of this._savedIslandVisible) {
      child.visible = vis;
    }
    this._savedIslandVisible.clear();
    this._keepVisible.clear();

    if (this.moonGroup) this.moonGroup.visible = false;

    this.player.group.position.set(-44, 0, 44);
    this.player.group.rotation.y = 0;
    this.player.group.scale.set(1, 1, 1);

    if (this._savedBg) this.scene.background = this._savedBg;
    if (this._savedFog) this.scene.fog = this._savedFog;

    this.isOnMoon = false;
    this.isTransitioning = false;
    this.returnPhase = "";

    this._hideOverlay();
    this.ui.toast("🏝️ 歡迎回到果汁島！");
  }
}
