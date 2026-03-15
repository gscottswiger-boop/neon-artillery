import { Terrain } from './terrain';
import { Tank } from './tank';
import { Projectile } from './projectile';
import { WeaponType, GameState } from '../types';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public terrain: Terrain;
  public player1: Tank;
  public player2: Tank;
  public projectiles: Projectile[] = [];
  public wind: number = 0;
  public currentPlayer: number = 1;
  public onStateChange: (state: GameState) => void;
  public isFiring: boolean = false;

  constructor(canvas: HTMLCanvasElement, onStateChange: (state: GameState) => void) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.onStateChange = onStateChange;
    
    this.terrain = new Terrain(canvas.width, canvas.height);
    
    const p1X = canvas.width * 0.15;
    const p2X = canvas.width * 0.85;
    
    this.player1 = new Tank(1, p1X, this.terrain.getAt(p1X), '#ff00ff'); // Neon Pink
    this.player2 = new Tank(2, p2X, this.terrain.getAt(p2X), '#00ff00'); // Neon Green
    
    this.randomizeWind();
  }

  start() {
    this.updateUI();
    this.loop();
  }

  randomizeWind() {
    this.wind = (Math.random() - 0.5) * 10;
  }

  fire(angle: number, power: number, weapon: WeaponType) {
    if (this.isFiring) return;
    
    this.isFiring = true;
    const activeTank = this.currentPlayer === 1 ? this.player1 : this.player2;
    activeTank.angle = angle;

    const p = new Projectile(
      { x: activeTank.pos.x, y: activeTank.pos.y - activeTank.height },
      angle,
      power,
      this.wind,
      weapon,
      activeTank.color
    );
    
    this.projectiles.push(p);
    this.updateUI();
  }

  update() {
    // Update tanks Y position based on terrain (in case of destruction)
    this.player1.updateY(this.terrain.getAt(this.player1.pos.x));
    this.player2.updateY(this.terrain.getAt(this.player2.pos.x));

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      
      // Scatter shot logic
      if (p.type === WeaponType.SCATTER && !p.isDead && p.vel.y > 0 && !p.projectilesCreated) {
          // Split at apex
          const p1 = new Projectile(p.pos, 45, 20, this.wind, WeaponType.STANDARD, p.color);
          const p2 = new Projectile(p.pos, 90, 20, this.wind, WeaponType.STANDARD, p.color);
          const p3 = new Projectile(p.pos, 135, 20, this.wind, WeaponType.STANDARD, p.color);
          p1.vel = { x: p.vel.x - 1, y: p.vel.y };
          p2.vel = { x: p.vel.x, y: p.vel.y };
          p3.vel = { x: p.vel.x + 1, y: p.vel.y };
          this.projectiles.push(p1, p2, p3);
          p.isDead = true;
          p.projectilesCreated = true;
      }

      p.update(this.terrain.heights);

      if (p.isDead) {
        this.explode(p);
        this.projectiles.splice(i, 1);
        
        if (this.projectiles.length === 0) {
          this.nextTurn();
        }
      }
    }
  }

  explode(p: Projectile) {
    this.terrain.destroy(p.pos.x, p.pos.y, p.explosionRadius);
    
    // Check damage to tanks
    [this.player1, this.player2].forEach(tank => {
      const dx = tank.pos.x - p.pos.x;
      const dy = (tank.pos.y - tank.height/2) - p.pos.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < p.explosionRadius + 15) {
        const damageFactor = 1 - (dist / (p.explosionRadius + 15));
        tank.health -= Math.floor(p.damage * damageFactor);
        tank.health = Math.max(0, tank.health);
      }
    });

    this.updateUI();
  }

  nextTurn() {
    this.isFiring = false;
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.randomizeWind();
    this.updateUI();
  }

  updateUI() {
    this.onStateChange({
      currentPlayer: this.currentPlayer,
      wind: this.wind,
      player1: {
        id: 1,
        health: this.player1.health,
        x: this.player1.pos.x,
        y: this.player1.pos.y,
        angle: this.player1.angle,
        power: 50,
        selectedWeapon: WeaponType.STANDARD,
        color: this.player1.color
      },
      player2: {
        id: 2,
        health: this.player2.health,
        x: this.player2.pos.x,
        y: this.player2.pos.y,
        angle: this.player2.angle,
        power: 50,
        selectedWeapon: WeaponType.STANDARD,
        color: this.player2.color
      },
      isGameOver: this.player1.health <= 0 || this.player2.health <= 0,
      winner: this.player1.health <= 0 ? 2 : (this.player2.health <= 0 ? 1 : null),
      isFiring: this.isFiring
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Background stars/grid
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    for(let x=0; x<this.canvas.width; x+=50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for(let y=0; y<this.canvas.height; y+=50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    this.terrain.draw(this.ctx);
    this.player1.draw(this.ctx, this.currentPlayer === 1);
    this.player2.draw(this.ctx, this.currentPlayer === 2);
    
    this.projectiles.forEach(p => p.draw(this.ctx));
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}
