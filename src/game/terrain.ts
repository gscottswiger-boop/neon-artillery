import { Point } from './types';

export class Terrain {
  public heights: number[];
  public width: number;
  public height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.heights = new Array(width).fill(0);
    this.generate();
  }

  generate() {
    let h = this.height * 0.6;
    let slope = 0;
    for (let x = 0; x < this.width; x++) {
      slope += (Math.random() - 0.5) * 2;
      slope = Math.max(-3, Math.min(3, slope));
      h += slope;
      h = Math.max(this.height * 0.2, Math.min(this.height * 0.8, h));
      this.heights[x] = h;
    }
    // Smooth it a bit
    for (let i = 0; i < 5; i++) {
      for (let x = 1; x < this.width - 1; x++) {
        this.heights[x] = (this.heights[x - 1] + this.heights[x] + this.heights[x + 1]) / 3;
      }
    }
  }

  getAt(x: number): number {
    const ix = Math.floor(Math.max(0, Math.min(this.width - 1, x)));
    return this.heights[ix];
  }

  destroy(x: number, y: number, radius: number) {
    const startX = Math.floor(Math.max(0, x - radius));
    const endX = Math.floor(Math.min(this.width - 1, x + radius));

    for (let i = startX; i <= endX; i++) {
      const dx = i - x;
      const dy = Math.sqrt(Math.max(0, radius * radius - dx * dx));
      
      // We only carve out if the explosion center is near or below the surface
      // or if the explosion is large enough to reach down.
      // For simplicity, we just lower the terrain height at this X.
      const targetY = y + dy;
      if (this.heights[i] < targetY) {
         this.heights[i] = Math.max(this.heights[i], targetY);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    for (let x = 0; x < this.width; x++) {
      ctx.lineTo(x, this.heights[x]);
    }
    ctx.lineTo(this.width, this.height);
    ctx.closePath();

    // Neon terrain style
    ctx.fillStyle = '#0a0a1a';
    ctx.fill();
    
    ctx.strokeStyle = '#00f2ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add a glow effect to the surface
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f2ff';
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}
