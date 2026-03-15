export interface Point {
  x: number;
  y: number;
}

export enum WeaponType {
  STANDARD = 'STANDARD',
  HEAVY_ROLLER = 'HEAVY_ROLLER',
  SCATTER = 'SCATTER'
}

export interface GameState {
  currentPlayer: number;
  wind: number;
  player1: PlayerState;
  player2: PlayerState;
  isGameOver: boolean;
  winner: number | null;
  isFiring: boolean;
}

export interface PlayerState {
  id: number;
  health: number;
  x: number;
  y: number;
  angle: number;
  power: number;
  selectedWeapon: WeaponType;
  color: string;
}
