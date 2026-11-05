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
    this.fallback = false;
    this.fallbackActive = false;
    this.onLockChange = null;

    window.addEventListener("keydown", (e) => {
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === "Escape" && this.fallback && this.fallbackActive) {
        this.fallbackActive = false;
        this._notify();
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
      this._requestStart();
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
      if (!this.locked) this.fallbackActive = false;
      this._notify();
    });

    document.addEventListener("pointerlockerror", () => {
      this._enableFallback();
    });

    document.addEventListener("mousemove", (e) => {
      if (this.locked || (this.fallback && this.fallbackActive)) {
        this.mouseDX += e.movementX;
        this.mouseDY += e.movementY;
      }
    });
  }

  _requestStart() {
    if (this.fallback) {
      this.fallbackActive = true;
      this.mouseDX = 0;
      this.mouseDY = 0;
      this._notify();
      return;
    }
    if (this.locked || document.pointerLockElement === this.domElement) return;
    try {
      const result = this.domElement.requestPointerLock?.();
      if (result && result.catch) {
        result.catch(() => this._enableFallback());
      } else if (result === undefined) {
        // Older API: failure surfaces via the pointerlockerror event.
      }
    } catch {
      this._enableFallback();
    }
  }

  _enableFallback() {
    if (this.fallback) return;
    this.fallback = true;
    this.locked = false;
    this.fallbackActive = true;
    this.mouseDX = 0;
    this.mouseDY = 0;
    document.body.style.cursor = "none";
    this._notify();
  }

  _notify() {
    const active = this.isLookActive();
    document.body.style.cursor = active ? "none" : "default";
    if (this.onLockChange) this.onLockChange(active);
  }

  isLookActive() {
    return this.locked || (this.fallback && this.fallbackActive);
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
