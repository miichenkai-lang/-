import { MinimapSystem } from "./MinimapSystem.js";

export class UIManager {
  constructor() {
    this.hud = document.getElementById("hud");
    this.loading = document.getElementById("loading");
    this.overlay = document.getElementById("lock-overlay");
    this.fpsEl = document.getElementById("stat-fps");
    this.posEl = document.getElementById("stat-pos");
    this.timeEl = document.getElementById("stat-time");
    this.hpFill = document.getElementById("hp-fill");
    this.hpText = document.getElementById("hp-text");
    this.o2Bar = document.getElementById("o2-bar");
    this.o2Fill = document.getElementById("o2-fill");
    this.o2Label = document.getElementById("o2-label");
    this.jetpackBar = document.getElementById("jetpack-bar");
    this.jetpackFill = document.getElementById("jetpack-fill");
    this.jetpackLabel = document.getElementById("jetpack-label");
    this.coinsEl = document.getElementById("stat-coins");
    this.buffRow = document.getElementById("buff-row");
    this.abilityEl = document.getElementById("ability-icon");
    this.abilityCdEl = document.getElementById("ability-cd");
    this.promptEl = document.getElementById("interact-prompt");
    this.promptNameEl = document.getElementById("prompt-name");
    this.dialogEl = document.getElementById("dialog-box");
    this.dialogNameEl = document.getElementById("dialog-name");
    this.dialogTextEl = document.getElementById("dialog-text");
    this.dialogHintEl = document.getElementById("dialog-hint");
    this.shopEl = document.getElementById("shop-menu");
    this.shopNameEl = document.getElementById("shop-name");
    this.shopItemsEl = document.getElementById("shop-items");
    this.shopCoinsEl = document.getElementById("shop-coins");
    this.toastsEl = document.getElementById("toasts");
    this.interiorEl = document.getElementById("interior-menu");
    this.interiorNameEl = document.getElementById("interior-name");
    this.interiorItemsEl = document.getElementById("interior-items");
    this.interiorDescEl = document.getElementById("interior-desc");
    this.interiorHintEl = document.getElementById("interior-hint");
    this._frames = 0;
    this._acc = 0;
    this._lines = [];
    this._lineIdx = 0;
    this._shop = null;
    this._ps = null;
    this._sel = 0;
    this._interiorSel = 0;
    this.minimap = new MinimapSystem();
  }

  hideLoading() {
    this.loading.classList.add("hidden");
    this.hud.classList.remove("hidden");
  }

  setLocked(locked) {
    this.overlay.classList.toggle("hidden", locked);
  }

  toast(msg, isError = false) {
    const el = document.createElement("div");
    el.className = "toast" + (isError ? " error" : "");
    el.textContent = msg;
    this.toastsEl.appendChild(el);
    setTimeout(() => {
      el.classList.add("fade");
      setTimeout(() => el.remove(), 500);
    }, 2100);
    while (this.toastsEl.children.length > 4) {
      this.toastsEl.firstChild.remove();
    }
  }

  showPrompt(label) {
    this.promptNameEl.textContent = label;
    this.promptEl.classList.remove("hidden");
  }

  hidePrompt() {
    this.promptEl.classList.add("hidden");
  }

  showDialog(def, act) {
    this.dialogNameEl.textContent = def.name;
    const actLines = {
      eat: ["嗯～好吃！", "今天的料理不錯！", "吃飽了才有力氣～"],
      work: ["忙著呢～", "工作工作！", "今天的業績要加油！"],
      shop: ["這個好像不錯～", "要買什麼好呢？", "逛逛看有什麼新商品～"],
      rest: ["好累喔……", "休息一下～", "今天真是充實的一天～"],
      fish: ["嘘～魚要上鉤了！", "今天的魚特別多！", "耐心等待是釣魚的秘訣～"],
      walk: ["嗯？有什麼事嗎？", "我只是路過～", "你要去哪裡呀？"],
    };
    const extra = actLines[act] || [];
    this._lines = [...(def.lines || ["……"]), ...extra];
    this._lineIdx = 0;
    this.dialogTextEl.textContent = this._lines[0];
    this._updateHint();
    this.dialogEl.classList.remove("hidden");
  }

  advanceDialog() {
    this._lineIdx++;
    if (this._lineIdx >= this._lines.length) return true;
    this.dialogTextEl.textContent = this._lines[this._lineIdx];
    this._updateHint();
    return false;
  }

  _updateHint() {
    this.dialogHintEl.textContent = `E 繼續 ${this._lineIdx + 1}/${this._lines.length}`;
  }

  hideDialog() {
    this.dialogEl.classList.add("hidden");
  }

  showShop(shop, playerState) {
    this._shop = shop;
    this._ps = playerState;
    this.shopNameEl.textContent = `🛒 ${shop.name}`;
    this.refreshShop(shop, playerState);
    this.shopEl.classList.remove("hidden");
  }

  refreshShop(shop, playerState) {
    this.shopItemsEl.innerHTML = "";
    shop.items.forEach((item, i) => {
      const row = document.createElement("div");
      row.className = "shop-item" + (i === this._sel ? " selected" : "") + (playerState.coins < item.price ? " poor" : "");
      row.innerHTML = `<span class="si-icon">${item.icon}</span><span class="si-name">${item.name}</span><span class="si-desc">${item.desc}</span><span class="si-price">$${item.price}</span>`;
      row.addEventListener("click", () => {
        this._sel = i;
        this.updateShopSelection(i);
      });
      row.addEventListener("dblclick", () => {
        this._sel = i;
        this.updateShopSelection(i);
        this.shopItemsEl.dispatchEvent(new CustomEvent("buyrequest"));
      });
      this.shopItemsEl.appendChild(row);
    });
    this.shopCoinsEl.textContent = `💰 ${playerState.coins}`;
  }

  updateShopSelection(sel) {
    this._sel = sel;
    const rows = this.shopItemsEl.children;
    for (let i = 0; i < rows.length; i++) {
      rows[i].classList.toggle("selected", i === sel);
    }
  }

  hideShop() {
    this.shopEl.classList.add("hidden");
    this._shop = null;
  }

  showInterior(interior, items, beds) {
    this.interiorNameEl.textContent = `🏠 ${interior.name}`;
    this.interiorDescEl.textContent = "";
    this._interiorItems = [...items, ...(beds || [])];
    this._interiorSel = 0;
    this._renderInteriorItems();
    this.interiorEl.classList.remove("hidden");
  }

  _renderInteriorItems() {
    this.interiorItemsEl.innerHTML = "";
    this._interiorItems.forEach((item, i) => {
      const row = document.createElement("div");
      row.className = "interior-item" + (i === this._interiorSel ? " selected" : "") + (item.hidden ? " secret" : "");
      row.innerHTML = `<span class="ii-icon">${item.icon}</span><span class="ii-name">${item.name}</span><span class="ii-desc">${item.desc}</span>`;
      row.addEventListener("click", () => {
        this._interiorSel = i;
        this.updateInteriorSelection(i);
      });
      row.addEventListener("dblclick", () => {
        this._interiorSel = i;
        this.updateInteriorSelection(i);
        this.interiorItemsEl.dispatchEvent(new CustomEvent("userequest"));
      });
      this.interiorItemsEl.appendChild(row);
    });
    if (this._interiorItems.length > 0) {
      this.interiorDescEl.textContent = this._interiorItems[this._interiorSel].desc;
    }
  }

  updateInteriorSelection(sel) {
    this._interiorSel = sel;
    const rows = this.interiorItemsEl.children;
    for (let i = 0; i < rows.length; i++) {
      rows[i].classList.toggle("selected", i === sel);
    }
    if (this._interiorItems[sel]) {
      this.interiorDescEl.textContent = this._interiorItems[sel].desc;
    }
  }

  hideInterior() {
    this.interiorEl.classList.add("hidden");
    this._interiorItems = [];
  }

  tick(dt, playerPos, timeSystem, playerState, npcs) {
    this._frames++;
    this._acc += dt;
    if (this._acc >= 0.5) {
      this.fpsEl.textContent = String(Math.round(this._frames / this._acc));
      this._frames = 0;
      this._acc = 0;
    }
    this.posEl.textContent = `${playerPos.x.toFixed(1)}, ${playerPos.z.toFixed(1)}`;

    if (timeSystem && this.timeEl) {
      const icon = timeSystem.constructor.PHASE_ICON[timeSystem.phaseKey] || "";
      this.timeEl.textContent = `${timeSystem.formatClock()} ${icon}`;
    }

    if (playerState) {
      const pct = Math.max(0, Math.min(100, (playerState.hp / playerState.maxHp) * 100));
      this.hpFill.style.width = pct + "%";
      this.hpFill.style.background = pct > 50 ? "#5ad46a" : pct > 25 ? "#ffd166" : "#ef5b5b";
      this.hpText.textContent = `${Math.ceil(playerState.hp)}/${playerState.maxHp}`;
      this.coinsEl.textContent = String(playerState.coins);

      if (this.o2Bar) {
        if (playerState.hasOxygenMask) {
          this.o2Bar.classList.remove("hidden");
          const o2 = Math.max(0, Math.min(100, playerState.oxygen * 100));
          this.o2Fill.style.width = o2 + "%";
          this.o2Fill.style.background = o2 > 40 ? "#5ad4c9" : "#ef5b5b";
          this.o2Label.textContent = `😷 O₂ ${Math.round(o2)}%`;
        } else {
          this.o2Bar.classList.add("hidden");
        }
      }

      if (this.jetpackBar) {
        if (playerState.hasJetpack) {
          this.jetpackBar.classList.remove("hidden");
          const en = Math.max(0, Math.min(100, playerState.jetpackEnergy * 100));
          this.jetpackFill.style.width = en + "%";
          this.jetpackFill.style.background = en > 30 ? "#ffb347" : "#ef5b5b";
          this.jetpackLabel.textContent = `🎒 能量 ${Math.round(en)}%`;
        } else {
          this.jetpackBar.classList.add("hidden");
        }
      }

      const buffs = playerState.buffList();
      this.buffRow.innerHTML = buffs.map((b) => `<span class="buff">${b.icon}${b.remain}s</span>`).join("");
    }

    if (this.minimap && npcs) {
      this.minimap.tick(playerPos, npcs, timeSystem ? timeSystem.minutes : 0);
    }
  }
}
