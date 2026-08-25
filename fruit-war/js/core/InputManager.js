export class InputManager {
  constructor(domElement) {
    this.domElement = domElement;
    this.keys = new Set();
    this.pressed = new Set();
    this.mouseButtons = new Set();
    this.mouseButtonsPressed = new Set();
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.locked = false;
    this.onLockChange = null;

    window.addEventListener("keydown", (e) => {
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
      if (!e.repeat) this.pressed.add(e.code);
      this.keys.add(e.code);
    });

    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    window.addEventListener("blur", () => {
      this.keys.clear();
      this.mouseButtons.clear();
    });

    document.addEventListener("mousedown", (e) => {
      if (!this.locked && document.pointerLockElement !== domElement) {
        try {
          const result = domElement.requestPointerLock();
          if (result && result.catch) result.catch(() => {});
        } catch {
          /* ignore */
        }
      }
      const btn = `mouse${e.button}`;
      if (!this.mouseButtons.has(btn)) this.mouseButtonsPressed.add(btn);
      this.mouseButtons.add(btn);
    });

    document.addEventListener("mouseup", (e) => {
      this.mouseButtons.delete(`mouse${e.button}`);
    });

    document.addEventListener("pointerlockchange", () => {
      this.locked = document.pointerLockElement === domElement;
      this.mouseDX = 0;
      this.mouseDY = 0;
      if (this.onLockChange) this.onLockChange(this.locked);
    });

    document.addEventListener("mousemove", (e) => {
      if (this.locked) {
        this.mouseDX += e.movementX;
        this.mouseDY += e.movementY;
      }
    });
  }

  isDown(code) {
    return this.keys.has(code) || this.mouseButtons.has(code);
  }

  wasPressed(code) {
    return this.pressed.has(code) || this.mouseButtonsPressed.has(code);
  }

  endFrame() {
    this.pressed.clear();
    this.mouseButtonsPressed.clear();
  }

  takeMouseDelta() {
    const delta = { dx: this.mouseDX, dy: this.mouseDY };
    this.mouseDX = 0;
    this.mouseDY = 0;
    return delta;
  }
}
