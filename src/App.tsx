import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/engine';
import { GameState, WeaponType } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Zap, Wind, Shield, RotateCcw, Play } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);
  const [weapon, setWeapon] = useState<WeaponType>(WeaponType.STANDARD);

  useEffect(() => {
    const initEngine = () => {
      if (canvasRef.current && !engineRef.current) {
        try {
          const engine = new GameEngine(canvasRef.current, (state) => {
            setGameState(state);
          });
          engineRef.current = engine;
          
          // Use requestAnimationFrame to ensure React is ready for the first state update
          requestAnimationFrame(() => {
            engine.start();
          });
        } catch (err) {
          console.error('Failed to initialize game engine:', err);
        }
      }
    };

    // Small delay to ensure DOM is fully ready
    const timer = setTimeout(initEngine, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleFire = () => {
    if (engineRef.current && gameState && !gameState.isFiring && !gameState.isGameOver) {
      engineRef.current.fire(angle, power, weapon);
    }
  };

  const resetGame = () => {
    window.location.reload();
  };

  return (
    <div className="relative w-full h-screen bg-[#050510] overflow-hidden font-mono text-white select-none">
      {/* Game Canvas - Always rendered so ref is available */}
      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        className="block w-full h-full object-contain"
      />

      {/* Loading State */}
      <AnimatePresence>
        {!gameState && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black flex flex-col items-center justify-center text-cyan-400 z-[60]"
          >
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xl tracking-[0.5em]"
            >
              INITIALIZING NEON SYSTEMS...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlay */}
      {gameState && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
          {/* Top Bar: Health and Wind */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 bg-black/40 border border-pink-500/30 p-3 rounded-lg backdrop-blur-md">
                <Shield className="text-pink-500 w-5 h-5" />
                <div className="w-48 h-4 bg-pink-950 rounded-full overflow-hidden border border-pink-500/20">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${gameState.player1.health}%` }}
                    className="h-full bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]" 
                  />
                </div>
                <span className="text-pink-400 font-bold w-12">{gameState.player1.health}%</span>
              </div>
              <div className="text-pink-500 text-xs tracking-widest uppercase opacity-70">Player 1 // Neon Striker</div>
            </div>

            <div className="flex flex-col items-center bg-black/40 border border-cyan-500/30 p-3 rounded-lg backdrop-blur-md">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Wind className="w-4 h-4" />
                <span className="text-xs uppercase tracking-tighter">Atmospheric Wind</span>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-2xl font-bold ${gameState.wind > 0 ? 'text-cyan-400' : 'text-blue-400'}`}>
                  {gameState.wind > 0 ? '→' : '←'} {Math.abs(gameState.wind).toFixed(1)}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-end">
              <div className="flex items-center gap-3 bg-black/40 border border-green-500/30 p-3 rounded-lg backdrop-blur-md">
                <span className="text-green-400 font-bold w-12 text-right">{gameState.player2.health}%</span>
                <div className="w-48 h-4 bg-green-950 rounded-full overflow-hidden border border-green-500/20">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${gameState.player2.health}%` }}
                    className="h-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" 
                  />
                </div>
                <Shield className="text-green-500 w-5 h-5" />
              </div>
              <div className="text-green-500 text-xs tracking-widest uppercase opacity-70">Player 2 // Emerald Ghost</div>
            </div>
          </div>

          {/* Bottom Bar: Controls */}
          <div className="flex justify-center items-end gap-8 pointer-events-auto">
            <div className={`flex flex-col gap-4 p-6 rounded-2xl border-2 transition-all duration-500 backdrop-blur-xl ${
              gameState.currentPlayer === 1 
                ? 'bg-pink-500/10 border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.2)]' 
                : 'bg-green-500/10 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-[0.3em] font-bold opacity-80">
                  Active: Player {gameState.currentPlayer}
                </span>
                <div className={`w-3 h-3 rounded-full animate-pulse ${gameState.currentPlayer === 1 ? 'bg-pink-500' : 'bg-green-500'}`} />
              </div>

              <div className="flex gap-8">
                {/* Angle Control */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Launch Angle
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={angle}
                      onChange={(e) => setAngle(parseInt(e.target.value))}
                      className="w-40 accent-white"
                    />
                    <span className="text-xl font-bold w-12">{angle}°</span>
                  </div>
                </div>

                {/* Power Control */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Core Power
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={power}
                      onChange={(e) => setPower(parseInt(e.target.value))}
                      className="w-40 accent-white"
                    />
                    <span className="text-xl font-bold w-12">{power}</span>
                  </div>
                </div>

                {/* Weapon Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-60">Arsenal</label>
                  <div className="flex gap-2">
                    {[WeaponType.STANDARD, WeaponType.HEAVY_ROLLER, WeaponType.SCATTER].map((w) => (
                      <button
                        key={w}
                        onClick={() => setWeapon(w)}
                        className={`px-3 py-1 text-[10px] border rounded transition-all ${
                          weapon === w 
                            ? 'bg-white text-black border-white' 
                            : 'border-white/20 hover:border-white/50'
                        }`}
                      >
                        {w.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fire Button */}
                <button
                  onClick={handleFire}
                  disabled={gameState.isFiring || gameState.isGameOver}
                  className={`px-10 py-2 rounded-lg font-black text-lg tracking-widest transition-all transform active:scale-95 ${
                    gameState.isFiring || gameState.isGameOver
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-white text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]'
                  }`}
                >
                  {gameState.isFiring ? 'FIRING...' : 'FIRE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameState?.isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50"
          >
            <motion.h1 
              initial={{ y: -50, scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
              className={`text-8xl font-black italic tracking-tighter mb-4 ${
                gameState.winner === 1 ? 'text-pink-500' : 'text-green-500'
              }`}
            >
              PLAYER {gameState.winner} WINS
            </motion.h1>
            <p className="text-white/40 uppercase tracking-[1em] mb-12">Combat Sequence Terminated</p>
            <button
              onClick={resetGame}
              className="flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-110 transition-transform"
            >
              <RotateCcw className="w-5 h-5" /> REBOOT SYSTEM
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
