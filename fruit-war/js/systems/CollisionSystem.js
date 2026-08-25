export class CollisionSystem {
  constructor() {
    this.circles = [];
    this.boxes = [];
  }

  addCircle(x, z, r) {
    this.circles.push({ x, z, r });
  }

  addBox(x, z, hw, hd) {
    this.boxes.push({ x, z, hw, hd });
  }

  resolve(pos, radius) {
    for (const c of this.circles) {
      const dx = pos.x - c.x;
      const dz = pos.z - c.z;
      const d = Math.hypot(dx, dz);
      const minD = radius + c.r;
      if (d < minD && d > 0.0001) {
        const push = (minD - d) / d;
        pos.x += dx * push;
        pos.z += dz * push;
      } else if (d <= 0.0001) {
        pos.x += minD;
      }
    }

    for (const b of this.boxes) {
      const cx = Math.max(b.x - b.hw, Math.min(pos.x, b.x + b.hw));
      const cz = Math.max(b.z - b.hd, Math.min(pos.z, b.z + b.hd));
      let dx = pos.x - cx;
      let dz = pos.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 < radius * radius) {
        if (d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const push = (radius - d) / d;
          pos.x += dx * push;
          pos.z += dz * push;
        } else {
          const left = Math.abs(pos.x - (b.x - b.hw));
          const right = Math.abs(b.x + b.hw - pos.x);
          const near = Math.abs(pos.z - (b.z - b.hd));
          const far = Math.abs(b.z + b.hd - pos.z);
          const minEdge = Math.min(left, right, near, far);
          if (minEdge === left) pos.x = b.x - b.hw - radius;
          else if (minEdge === right) pos.x = b.x + b.hw + radius;
          else if (minEdge === near) pos.z = b.z - b.hd - radius;
          else pos.z = b.z + b.hd + radius;
        }
      }
    }
  }
}
