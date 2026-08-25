export class DialogueSystem {
  constructor(ui) {
    this.ui = ui;
    this.active = null;
  }

  nearest(playerPos, npcs) {
    let best = null;
    let bestDist = 2.7;
    for (const npc of npcs) {
      if (!npc.group.visible) continue;
      const d = npc.distanceTo(playerPos);
      if (d < bestDist) {
        bestDist = d;
        best = { kind: "npc", npc, dist: d };
      }
    }
    return best;
  }

  open(npc) {
    this.active = npc;
    const act = npc.entry ? npc.entry.act : "walk";
    this.ui.showDialog(npc.def, act);
  }

  handleInput(input) {
    if (input.wasPressed("KeyE") || input.wasPressed("Enter")) {
      const done = this.ui.advanceDialog();
      if (done) this.close();
    }
  }

  close() {
    this.active = null;
    this.ui.hideDialog();
  }
}
