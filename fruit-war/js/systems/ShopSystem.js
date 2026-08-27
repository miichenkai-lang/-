import { SHOPS } from "../data/shopData.js";

export class ShopSystem {
  constructor(ui) {
    this.ui = ui;
    this.shops = SHOPS;
    this.menuOpen = false;
    this.current = null;
    this.playerState = null;
    this.sel = 0;
    this.onPurchase = null;
  }

  nearest(pos) {
    let best = null;
    for (const shop of this.shops) {
      const d = Math.hypot(pos.x - shop.x, pos.z - shop.z);
      if (d < shop.radius && (!best || d < best.dist)) {
        best = { kind: "shop", shop, dist: d };
      }
    }
    return best;
  }

  open(shop, playerState) {
    this.menuOpen = true;
    this.current = shop;
    this.playerState = playerState;
    this.sel = 0;
    this.ui.showShop(shop, playerState);
  }

  close() {
    this.menuOpen = false;
    this.current = null;
    this.ui.hideShop();
  }

  handleInput(input) {
    const items = this.current.items;

    if (input.wasPressed("ArrowUp") || input.wasPressed("KeyW")) {
      this.sel = (this.sel - 1 + items.length) % items.length;
      this.ui.updateShopSelection(this.sel);
    }
    if (input.wasPressed("ArrowDown") || input.wasPressed("KeyS")) {
      this.sel = (this.sel + 1) % items.length;
      this.ui.updateShopSelection(this.sel);
    }
    if (input.wasPressed("KeyE") || input.wasPressed("Enter")) {
      this.buy(items[this.sel]);
    }
    if (input.wasPressed("KeyQ")) {
      this.close();
    }
  }

  buy(item) {
    const ps = this.playerState;
    if (ps.coins < item.price) {
      this.ui.toast("金幣不足！", true);
      return;
    }
    ps.coins -= item.price;
    if (item.effect.oxygenMask) ps.hasOxygenMask = true;
    if (item.effect.jetpack) ps.hasJetpack = true;
    if (item.effect.heal) ps.heal(item.effect.heal);
    if (item.effect.duration) ps.applyBuff(item.effect);
    if (this.onPurchase) this.onPurchase(item);
    this.ui.toast(`${item.icon} 買了 ${item.name}！`);
    this.ui.refreshShop(this.current, ps);
  }
}
