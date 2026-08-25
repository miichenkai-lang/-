import * as THREE from "three";

export class AttackSystem {
  constructor(scene, collisions) {
    this.scene = scene;
    this.collisions = collisions;
    this.projectiles = [];
    this.zones = [];
    this.clones = [];
    this.activeShields = [];
    this._tmpDir = new THREE.Vector3();
    this._tmpPos = new THREE.Vector3();
  }

  useAbility(player, playerState, input, camera) {
    const ability = player.def.ability;
    if (!ability) return false;
    if (playerState.abilityCooldown > 0) return false;

    playerState.abilityCooldown = ability.cooldown;
    const ps = player.group.position;
    const fwd = this._getForward(camera);

    switch (ability.type) {
      case "shield":
        this._activateShield(player, playerState, ability);
        break;
      case "dash":
        this._activateDash(player, playerState, ability, fwd);
        break;
      case "area":
        this._activateArea(player, playerState, ability, ps);
        break;
      case "projectile":
        this._activateProjectile(player, playerState, ability, ps, fwd);
        break;
      case "zone":
        this._activateZone(player, playerState, ability, ps, fwd);
        break;
      case "teleport":
        this._activateTeleport(player, playerState, ability, fwd);
        break;
      case "clone":
        this._activateClone(player, playerState, ability, ps, camera);
        break;
      case "heal":
        this._activateHeal(player, playerState, ability);
        break;
    }
    return true;
  }

  _getForward(camera) {
    this._tmpDir.set(0, 0, -1);
    this._tmpDir.applyQuaternion(camera.quaternion);
    this._tmpDir.y = 0;
    this._tmpDir.normalize();
    return this._tmpDir;
  }

  _activateShield(player, ps, ability) {
    ps.applyBuff({
      name: ability.name,
      icon: ability.icon,
      duration: ability.duration,
      ...ability.effect,
    });
    this._spawnShieldVfx(player);
  }

  _spawnShieldVfx(player) {
    const geo = new THREE.SphereGeometry(1.1, 16, 12);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x5ad46a,
      transparent: true,
      opacity: 0.25,
      emissive: 0x5ad46a,
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide,
    });
    const shield = new THREE.Mesh(geo, mat);
    shield.position.copy(player.group.position);
    shield.position.y += 0.6;
    this.scene.add(shield);
    const start = performance.now();
    const animate = () => {
      const t = (performance.now() - start) / 1000;
      if (t > 0.3) {
        this.scene.remove(shield);
        geo.dispose();
        mat.dispose();
        return;
      }
      shield.scale.setScalar(1 + t * 2);
      mat.opacity = 0.25 * (1 - t / 0.3);
      requestAnimationFrame(animate);
    };
    animate();
  }

  _activateDash(player, ps, ability, fwd) {
    const speed = ability.effect.dashSpeed;
    const damage = ability.effect.dashDamage;
    const range = ability.effect.dashRange;
    const startPos = player.group.position.clone();
    const endPos = fwd.clone().multiplyScalar(4).add(startPos);
    endPos.x = Math.max(-58, Math.min(58, endPos.x));
    endPos.z = Math.max(-58, Math.min(58, endPos.z));

    const t0 = performance.now();
    const dur = ability.duration * 1000;
    const trailMat = new THREE.MeshStandardMaterial({
      color: 0xf7d548,
      transparent: true,
      opacity: 0.5,
      emissive: 0xf7d548,
      emissiveIntensity: 0.6,
    });
    const trail = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), trailMat);
    this.scene.add(trail);

    const animate = () => {
      const elapsed = performance.now() - t0;
      const t = Math.min(1, elapsed / dur);
      const ease = 1 - Math.pow(1 - t, 3);
      player.group.position.lerpVectors(startPos, endPos, ease);
      player.group.position.y = 0;
      trail.position.copy(player.group.position);
      trail.position.y += 0.5;
      trail.scale.setScalar(1 - t * 0.5);

      if (t >= 1) {
        this.scene.remove(trail);
        trailMat.dispose();
        trail.geometry.dispose();
        return;
      }
      requestAnimationFrame(animate);
    };
    animate();
  }

  _activateArea(player, ps, ability, pos) {
    const radius = ability.effect.areaRadius;
    const damage = ability.effect.areaDamage;
    const selfDamage = ability.effect.selfDamage || 0;

    if (selfDamage > 0) {
      ps.damage(selfDamage);
    }

    const geo = new THREE.CylinderGeometry(radius, radius, 0.1, 24);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x3f9142,
      transparent: true,
      opacity: 0.35,
      emissive: 0x3f9142,
      emissiveIntensity: 0.5,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.position.set(pos.x, 0.1, pos.z);
    this.scene.add(ring);

    const t0 = performance.now();
    const dur = ability.duration * 1000;
    const animate = () => {
      const t = (performance.now() - t0) / dur;
      if (t >= 1) {
        this.scene.remove(ring);
        geo.dispose();
        mat.dispose();
        return;
      }
      ring.scale.setScalar(1 + t * 0.5);
      mat.opacity = 0.35 * (1 - t);
      requestAnimationFrame(animate);
    };
    animate();

    this.zones.push({
      x: pos.x,
      z: pos.z,
      radius,
      damage,
      startTime: performance.now(),
      duration: dur,
      type: "burst",
    });
  }

  _activateProjectile(player, ps, ability, pos, fwd) {
    const eff = ability.effect;
    const count = eff.count;
    const spread = eff.spread;
    const speed = eff.projSpeed;
    const damage = eff.projDamage;
    const life = eff.projLife;

    for (let i = 0; i < count; i++) {
      const angle = (i - (count - 1) / 2) * spread;
      const dir = fwd.clone();
      const axis = new THREE.Vector3(0, 1, 0);
      dir.applyAxisAngle(axis, angle);

      const geo = new THREE.SphereGeometry(0.15, 8, 6);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xf98d2b,
        emissive: 0xf98d2b,
        emissiveIntensity: 0.8,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pos.x, 0.7, pos.z);
      this.scene.add(mesh);

      this.projectiles.push({
        mesh,
        dir: dir.clone(),
        speed,
        damage,
        life,
        born: performance.now(),
      });
    }
  }

  _activateZone(player, ps, ability, pos, fwd) {
    const eff = ability.effect;
    const center = fwd.clone().multiplyScalar(3).add(pos);
    center.x = Math.max(-58, Math.min(58, center.x));
    center.z = Math.max(-58, Math.min(58, center.z));

    const geo = new THREE.CylinderGeometry(eff.zoneRadius, eff.zoneRadius, 0.08, 20);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xf7d548,
      transparent: true,
      opacity: 0.3,
      emissive: 0xf7d548,
      emissiveIntensity: 0.4,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.position.set(center.x, 0.08, center.z);
    this.scene.add(ring);

    this.zones.push({
      x: center.x,
      z: center.z,
      radius: eff.zoneRadius,
      damage: eff.zoneDamage,
      tick: eff.zoneTick,
      startTime: performance.now(),
      duration: ability.duration * 1000,
      type: "dot",
      ring,
      mat,
      geo,
    });
  }

  _activateTeleport(player, ps, ability, fwd) {
    const dist = ability.effect.teleDist;
    const startPos = player.group.position.clone();
    const endPos = fwd.clone().multiplyScalar(dist).add(startPos);
    endPos.x = Math.max(-58, Math.min(58, endPos.x));
    endPos.z = Math.max(-58, Math.min(58, endPos.z));

    const vanishMat = new THREE.MeshStandardMaterial({
      color: 0xe8394a,
      transparent: true,
      opacity: 0.6,
      emissive: 0xe8394a,
      emissiveIntensity: 0.7,
    });
    const vanish = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), vanishMat);
    vanish.position.copy(startPos);
    vanish.position.y += 0.5;
    this.scene.add(vanish);

    const appearMat = new THREE.MeshStandardMaterial({
      color: 0xe8394a,
      transparent: true,
      opacity: 0.6,
      emissive: 0xe8394a,
      emissiveIntensity: 0.7,
    });
    const appear = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), appearMat);
    appear.position.copy(endPos);
    appear.position.y += 0.5;
    appear.scale.setScalar(0.1);
    this.scene.add(appear);

    player.group.position.copy(endPos);

    const t0 = performance.now();
    const animate = () => {
      const t = (performance.now() - t0) / 300;
      if (t >= 1) {
        this.scene.remove(vanish);
        this.scene.remove(appear);
        vanishMat.dispose();
        vanish.geometry.dispose();
        appearMat.dispose();
        appear.geometry.dispose();
        return;
      }
      vanish.scale.setScalar(1 - t);
      vanishMat.opacity = 0.6 * (1 - t);
      appear.scale.setScalar(0.1 + t);
      appearMat.opacity = 0.6 * Math.min(1, t * 2);
      requestAnimationFrame(animate);
    };
    animate();
  }

  _activateClone(player, ps, ability, pos, camera) {
    const fwd = this._getForward(camera);
    const cloneOffset = new THREE.Vector3(-fwd.z, 0, fwd.x).multiplyScalar(1.2);
    const clonePos = pos.clone().add(cloneOffset);

    const clone = new THREE.Group();
    const body = player.body.clone();
    clone.add(body);
    clone.position.copy(clonePos);
    clone.position.y = 0;
    clone.rotation.y = player.group.rotation.y;
    this.scene.add(clone);

    this.clones.push({
      mesh: clone,
      born: performance.now(),
      duration: ability.duration * 1000,
      damageMul: ability.effect.cloneDamageMul,
    });

    const t0 = performance.now();
    const animate = () => {
      const t = (performance.now() - t0) / (ability.duration * 1000);
      if (t >= 1) {
        this.scene.remove(clone);
        return;
      }
      clone.position.x = clonePos.x + Math.sin(t * 20) * 0.3;
      clone.rotation.y = player.group.rotation.y + Math.sin(t * 15) * 0.3;
      requestAnimationFrame(animate);
    };
    animate();
  }

  _activateHeal(player, ps, ability) {
    const heal = Math.floor(ps.maxHp * ability.effect.healPct);
    ps.heal(heal);

    const geo = new THREE.SphereGeometry(0.8, 12, 10);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffc04d,
      transparent: true,
      opacity: 0.5,
      emissive: 0xffc04d,
      emissiveIntensity: 0.6,
    });
    const fx = new THREE.Mesh(geo, mat);
    fx.position.copy(player.group.position);
    fx.position.y += 0.8;
    this.scene.add(fx);

    const t0 = performance.now();
    const animate = () => {
      const t = (performance.now() - t0) / 600;
      if (t >= 1) {
        this.scene.remove(fx);
        geo.dispose();
        mat.dispose();
        return;
      }
      fx.scale.setScalar(1 + t);
      fx.position.y += 0.02;
      mat.opacity = 0.5 * (1 - t);
      requestAnimationFrame(animate);
    };
    animate();
  }

  update(dt, elapsed) {
    const now = performance.now();

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const age = (now - p.born) / 1000;
      if (age > p.life) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.projectiles.splice(i, 1);
        continue;
      }
      p.mesh.position.x += p.dir.x * p.speed * dt;
      p.mesh.position.z += p.dir.z * p.speed * dt;
      p.mesh.position.y = 0.7 + Math.sin(age * 12) * 0.15;
    }

    for (let i = this.zones.length - 1; i >= 0; i--) {
      const z = this.zones[i];
      const age = now - z.startTime;
      if (age > z.duration) {
        if (z.ring) {
          this.scene.remove(z.ring);
          z.geo.dispose();
          z.mat.dispose();
        }
        this.zones.splice(i, 1);
        continue;
      }
      if (z.type === "dot" && z.ring) {
        const t = age / z.duration;
        z.mat.opacity = 0.3 * (1 - t);
        z.ring.scale.setScalar(1 + Math.sin(elapsed * 6) * 0.1);
      }
    }

    for (let i = this.clones.length - 1; i >= 0; i--) {
      const c = this.clones[i];
      if (now - c.born > c.duration) {
        this.scene.remove(c.mesh);
        this.clones.splice(i, 1);
      }
    }
  }

  checkHit(targetPos, targetRadius) {
    const hits = [];
    const now = performance.now();

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const dx = p.mesh.position.x - targetPos.x;
      const dz = p.mesh.position.z - targetPos.z;
      if (Math.hypot(dx, dz) < targetRadius + 0.2) {
        hits.push({ damage: p.damage, type: "projectile" });
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.projectiles.splice(i, 1);
      }
    }

    for (const z of this.zones) {
      if (z.type !== "burst") continue;
      const dx = targetPos.x - z.x;
      const dz = targetPos.z - z.z;
      if (Math.hypot(dx, dz) < z.radius + targetRadius) {
        const age = now - z.startTime;
        if (age < 200) {
          hits.push({ damage: z.damage, type: "area" });
        }
      }
    }

    for (const c of this.clones) {
      const dx = c.mesh.position.x - targetPos.x;
      const dz = c.mesh.position.z - targetPos.z;
      if (Math.hypot(dx, dz) < targetRadius + 0.6) {
        const cloneDmg = Math.floor(10 * c.damageMul);
        hits.push({ damage: cloneDmg, type: "clone" });
      }
    }

    return hits;
  }
}
