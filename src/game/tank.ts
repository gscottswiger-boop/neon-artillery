import { Point, WeaponType } from '../types';

export class Tank {
  public id: number;
  public pos: Point;
  public angle: number;
  public color: string;
  public health: number = 100;
  public width: number = 30;
  public height: number = 15;

  constructor(id: number, x: number, y: number, color: string) {
    this.id = id;
    this.pos = { x, y };
    this.angle = id === 1 ? 45 : 135;
    this.color = color;
  }

  updateY(terrainY: number) {
    this.pos.y = terrainY;
  }

  draw(ctx: CanvasRenderingContext2D, isActive: boolean) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    // Body
    ctx.fillStyle = this.color;
    ctx.shadowBlur = isActive ? 20 : 5;
    ctx.shadowColor = this.color;
    ctx.fillRect(-this.width / 2, -this.height, this.width, this.height);

    // Turret
    ctx.save();
    ctx.translate(0, -this.height);
    ctx.rotate(-(this.angle * Math.PI) / 180);
    ctx.fillRect(0, -2, 25, 4);
    ctx.restore();

    // Indicator for active player
    if (isActive) {
      ctx.beginPath();
      ctx.moveTo(0, -this.height - 30);
      ctx.lineTo(-5, -this.height - 40);
      ctx.lineTo(5, -this.height - 40);
      ctx.closePath();
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    ctx.restore();
    ctx.shadowBlur = 0;
  }

  getBounds() {
    return {
      left: this.pos.x - this.width / 2,
      right: this.pos.x + this.width / 2,
      top: this.pos.y - this.height,
      bottom: this.pos.y
    };
  }
}
