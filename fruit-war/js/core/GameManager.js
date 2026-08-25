import * as THREE from "three";

export class GameManager {
  constructor(container) {
    this.container = container;
    this.tickCallbacks = [];
    this.elapsed = 0;
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x8ecae6);
    this.scene.fog = new THREE.Fog(0x8ecae6, 90, 260);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    window.addEventListener("resize", () => this.handleResize());

    this.clock = new THREE.Clock();
  }

  onTick(callback) {
    this.tickCallbacks.push(callback);
  }

  start() {
    this.renderer.setAnimationLoop(() => {
      const dt = Math.min(this.clock.getDelta(), 0.05);
      this.elapsed += dt;
      for (const callback of this.tickCallbacks) callback(dt, this.elapsed);
      this.renderer.render(this.scene, this.camera);
    });
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
