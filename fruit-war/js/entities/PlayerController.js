import * as THREE from "three";

const GRAVITY = 26;
const CAM_MIN_PITCH = 0.08;
const CAM_MAX_PITCH = 1.25;
const CAM_DISTANCE = 8.5;

function dampAngle(current, target, lambda, dt) {
  let d = (target - current) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return current + d * (1 - Math.exp(-lambda * dt));
}

export class PlayerController {
  constructor(character, camera) {
    this.character = character;
    this.camera = camera;
    this.enabled = true;
    this.inInterior = false;
    this.yaw = 0;
    this.pitch = 0.42;
    this.heading = Math.PI;
    character.group.rotation.y = this.heading;

    this._camPos = new THREE.Vector3();
    this._camTarget = new THREE.Vector3(character.group.position.x, 1.5, character.group.position.z);
    this._desired = new THREE.Vector3();
    this._look = new THREE.Vector3();
    this._forward = new THREE.Vector3();
    this._right = new THREE.Vector3();
    this._move = new THREE.Vector3();
    this._snapped = false;
    this.interiorCollisions = [];
  }

  update(dt, input, boundsRadius, collisions, playerState) {
    const delta = input.takeMouseDelta();
    if (input.locked && this.enabled) {
      this.yaw -= delta.dx * 0.0026;
      this.pitch += delta.dy * 0.0026;
      this.pitch = Math.min(CAM_MAX_PITCH, Math.max(CAM_MIN_PITCH, this.pitch));
    }

    const c = this.character;
    const pos = c.group.position;

    const ix = this.enabled
      ? (input.isDown("KeyD") || input.isDown("ArrowRight") ? 1 : 0) -
        (input.isDown("KeyA") || input.isDown("ArrowLeft") ? 1 : 0)
      : 0;
    const iz = this.enabled
      ? (input.isDown("KeyW") || input.isDown("ArrowUp") ? 1 : 0) -
        (input.isDown("KeyS") || input.isDown("ArrowDown") ? 1 : 0)
      : 0;

    if (this.inInterior) {
      this._forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      this._right.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
      this._move.set(0, 0, 0).addScaledVector(this._forward, iz).addScaledVector(this._right, ix);

      let intensity = 0;
      if (this._move.lengthSq() > 0) {
        this._move.normalize();
        const speed = c.def.speed * 0.6;
        pos.x += this._move.x * speed * dt;
        pos.z += this._move.z * speed * dt;
        this.heading = dampAngle(this.heading, Math.atan2(this._move.x, this._move.z), 12, dt);
        c.group.rotation.y = this.heading;
        intensity = 0.8;
      }

      if (this.interiorCollisions) {
        for (const col of this.interiorCollisions) {
          const dx = pos.x - col.x;
          const dz = pos.z - col.z;
          const dist = Math.hypot(dx, dz);
          if (dist < col.r + 0.3) {
            const push = col.r + 0.3 - dist;
            if (dist > 0.01) {
              pos.x += (dx / dist) * push;
              pos.z += (dz / dist) * push;
            }
          }
        }
      }

      pos.x = Math.max(-6.8, Math.min(6.8, pos.x));
      pos.z = Math.max(-6.8, Math.min(6.8, pos.z));
      pos.y = -99.8;

      c.animate(dt, intensity);

      const behindX = pos.x - Math.sin(this.heading) * 2.5;
      const behindZ = pos.z - Math.cos(this.heading) * 2.5;
      const camX = Math.max(-6.5, Math.min(6.5, behindX));
      const camZ = Math.max(-6.5, Math.min(6.5, behindZ));
      this.camera.position.set(camX, pos.y + 1.5, camZ);
      this.camera.lookAt(pos.x, pos.y + 0.5, pos.z);
      return;
    }

    this._forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    this._right.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    this._move.set(0, 0, 0).addScaledVector(this._forward, iz).addScaledVector(this._right, ix);

    let intensity = 0;
    if (this._move.lengthSq() > 0) {
      this._move.normalize();
      const sprint = input.isDown("ShiftLeft") || input.isDown("ShiftRight");
      const speedMul = playerState ? playerState.speedMul : 1;
      const speed = c.def.speed * (sprint ? c.def.sprintMultiplier : 1) * speedMul;
      pos.x += this._move.x * speed * dt;
      pos.z += this._move.z * speed * dt;
      this.heading = dampAngle(this.heading, Math.atan2(this._move.x, this._move.z), 12, dt);
      c.group.rotation.y = this.heading;
      intensity = sprint ? 1.6 : 1;
    }

    const r = Math.hypot(pos.x, pos.z);
    const maxR = boundsRadius - 2;
    if (r > maxR) {
      pos.x *= maxR / r;
      pos.z *= maxR / r;
    }
    if (collisions) collisions.resolve(pos, 0.55);

    if (input.isDown("Space") && c.onGround) {
      c.velocityY = c.def.jumpPower;
      c.onGround = false;
    }
    c.velocityY -= GRAVITY * dt;
    pos.y += c.velocityY * dt;
    if (pos.y <= 0) {
      pos.y = 0;
      c.velocityY = 0;
      c.onGround = true;
    }

    c.animate(dt, intensity);

    if (this.inInterior) {
      this.camera.position.set(pos.x, pos.y + 2, pos.z + 3);
      this.camera.lookAt(pos.x, pos.y + 0.8, pos.z);
      return;
    }

    const cp = Math.cos(this.pitch);
    this._desired.set(
      pos.x + Math.sin(this.yaw) * cp * CAM_DISTANCE,
      pos.y + Math.sin(this.pitch) * CAM_DISTANCE + 1.4,
      pos.z + Math.cos(this.yaw) * cp * CAM_DISTANCE
    );
    if (!this.inInterior && this._desired.y < 0.7) this._desired.y = 0.7;

    const k = 1 - Math.exp(-9 * dt);
    if (!this._snapped) {
      this._camPos.copy(this._desired);
      this._snapped = true;
    } else {
      this._camPos.lerp(this._desired, k);
    }
    this.camera.position.copy(this._camPos);

    this._look.set(pos.x, pos.y + 1.5, pos.z);
    this._camTarget.lerp(this._look, k);
    this.camera.lookAt(this._camTarget);
  }
}
