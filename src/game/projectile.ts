import { Point, WeaponType } from '../types';

export class Projectile {
  public pos: Point;
  public vel: Point;
  public radius: number = 3;
  public gravity: number = 0.25;
  public wind: number = 0;
  public type: WeaponType;
  public isDead: boolean = false;
  public color: string;
  public damage: number = 25;
  public explosionRadius: number = 30;
  public projectilesCreated: boolean = false;

  constructor(pos: Point, angle: number, power: number, wind: number, type: WeaponType, color: string) {
    this.pos = { ...pos };
    const rad = (angle * Math.PI) / 180;
    const speed = power * 0.25;
    this.vel = {
      x: Math.cos(rad) * speed,
      y: -Math.sin(rad) * speed,
    };
    this.wind = wind;
    this.type = type;
    this.color = color;

    if (type === WeaponType.HEAVY_ROLLER) {
      this.damage = 35;
      this.explosionRadius = 40;
    } else if (type === WeaponType.SCATTER) {
      this.damage = 15;
      this.explosionRadius = 20;
    }
  }

  update(terrainHeights: number[]) {
    this.vel.y += this.gravity;
    this.vel.x += this.wind * 0.001;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    // Check terrain collision
    const tx = Math.floor(this.pos.x);
    if (tx >= 0 && tx < terrainHeights.length) {
      if (this.pos.y >= terrainHeights[tx]) {
        if (this.type === WeaponType.HEAVY_ROLLER && Math.abs(this.vel.y) > 0.5) {
           // Roll logic: stick to terrain and move based on slope
           this.pos.y = terrainHeights[tx];
           const nextX = tx + (this.vel.x > 0 ? 1 : -1);
           if (nextX >= 0 && nextX < terrainHeights.length) {
             const slope = terrainHeights[nextX] - terrainHeights[tx];
             this.vel.x += slope * 0.1;
             this.vel.x *= 0.98; // friction
             this.vel.y = 0;
             
             if (Math.abs(this.vel.x) < 0.2) this.isDead = true;
           } else {
             this.isDead = true;
           }
        } else {
          this.isDead = true;
        }
      }
    }

    // Out of bounds
    if (this.pos.x < -100 || this.pos.x > terrainHeights.length + 100 || this.pos.y > 2000) {
      this.isDead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
