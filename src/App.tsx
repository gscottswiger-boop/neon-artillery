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
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-4 md:p-6">
          {/* Top Bar: Health and Wind */}
          <div className="flex justify-between items-start gap-1">
            <div className="flex flex-col gap-1 md:gap-2">
              <div className="flex items-center gap-1 md:gap-3 bg-black/40 border border-pink-500/30 p-2 md:p-3 rounded-lg backdrop-blur-md">
                <Shield className="text-pink-500 w-4 h-4 md:w-5 md:h-5 hidden sm:block" />
                <div className="w-16 sm:w-32 md:w-48 h-2 md:h-4 bg-pink-950 rounded-full overflow-hidden border border-pink-500/20">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${gameState.player1.health}%` }}
                    className="h-full bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]" 
                  />
                </div>
                <span className="text-pink-400 font-bold text-[10px] md:text-base w-6 md:w-12">{gameState.player1.health}%</span>
              </div>
              <div className="text-pink-500 text-[8px] md:text-xs tracking-widest uppercase opacity-70">P1 // Neon</div>
            </div>

            <div className="flex flex-col items-center bg-black/40 border border-cyan-500/30 p-2 md:p-3 rounded-lg backdrop-blur-md">
              <div className="flex items-center gap-1 md:gap-2 text-cyan-400 mb-1">
                <Wind className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-[8px] md:text-xs uppercase tracking-tighter hidden sm:block">Atmospheric Wind</span>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <div className={`text-sm md:text-2xl font-bold ${gameState.wind > 0 ? 'text-cyan-400' : 'text-blue-400'}`}>
                  {gameState.wind > 0 ? '→' : '←'} {Math.abs(gameState.wind).toFixed(1)}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 md:gap-2 items-end">
              <div className="flex items-center gap-1 md:gap-3 bg-black/40 border border-green-500/30 p-2 md:p-3 rounded-lg backdrop-blur-md">
                <span className="text-green-400 font-bold text-[10px] md:text-base w-6 md:w-12 text-right">{gameState.player2.health}%</span>
                <div className="w-16 sm:w-32 md:w-48 h-2 md:h-4 bg-green-950 rounded-full overflow-hidden border border-green-500/20">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${gameState.player2.health}%` }}
                    className="h-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" 
                  />
                </div>
                <Shield className="text-green-500 w-4 h-4 md:w-5 md:h-5 hidden sm:block" />
              </div>
              <div className="text-green-500 text-[8px] md:text-xs tracking-widest uppercase opacity-70">P2 // Emerald</div>
            </div>
          </div>

          {/* Bottom Bar: Controls */}
          <div className="flex justify-center items-end pointer-events-auto w-full">
            <div className={`flex flex-col gap-3 md:gap-4 p-3 md:p-6 rounded-2xl border-2 transition-all duration-500 backdrop-blur-xl w-full max-w-4xl ${
              gameState.currentPlayer === 1 
                ? 'bg-pink-500/10 border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.2)]' 
                : 'bg-green-500/10 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
            }`}>
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold opacity-80">
                  Active: Player {gameState.currentPlayer}
                </span>
                <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full animate-pulse ${gameState.currentPlayer === 1 ? 'bg-pink-500' : 'bg-green-500'}`} />
              </div>

              <div className="flex flex-col lg:flex-row gap-4 md:gap-8 items-center w-full">
                <div className="flex w-full lg:w-auto gap-4 md:gap-8 justify-between flex-1">
                  {/* Angle Control */}
                  <div className="flex flex-col gap-1 md:gap-2 flex-1">
                    <label className="text-[8px] md:text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-1">
                      <Target className="w-3 h-3" /> Angle
                    </label>
                    <div className="flex items-center gap-2 md:gap-4">
                      <input
                        type="range"
                        min="0"
                        max="180"
                        value={angle}
                        onChange={(e) => setAngle(parseInt(e.target.value))}
                        className="w-full sm:w-24 md:w-32 lg:w-40 accent-white"
                      />
                      <span className="text-sm md:text-xl font-bold w-10 md:w-14 shrink-0">{angle}°</span>
                    </div>
                  </div>

                  {/* Power Control */}
                  <div className="flex flex-col gap-1 md:gap-2 flex-1">
                    <label className="text-[8px] md:text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Power
                    </label>
                    <div className="flex items-center gap-2 md:gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={power}
                        onChange={(e) => setPower(parseInt(e.target.value))}
                        className="w-full sm:w-24 md:w-32 lg:w-40 accent-white"
                      />
                      <span className="text-sm md:text-xl font-bold w-10 md:w-14 shrink-0">{power}</span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full lg:w-auto gap-4 md:gap-8 items-end justify-between lg:justify-end shrink-0">
                  {/* Weapon Selection */}
                  <div className="flex flex-col gap-1 md:gap-2 flex-1 lg:flex-none">
                    <label className="text-[8px] md:text-[10px] uppercase tracking-widest opacity-60 hidden sm:block">Arsenal</label>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {[WeaponType.STANDARD, WeaponType.HEAVY_ROLLER, WeaponType.SCATTER].map((w) => (
                        <button
                          key={w}
                          onClick={() => setWeapon(w)}
                          className={`px-2 py-2 md:px-3 md:py-1 text-[10px] border rounded transition-all flex-1 lg:flex-none whitespace-nowrap ${
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
                    className={`px-6 py-3 md:px-10 md:py-2 rounded-lg font-black text-base md:text-lg tracking-widest transition-all transform active:scale-95 w-full lg:w-auto shrink-0 ${
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
              className={`text-4xl md:text-8xl font-black italic tracking-tighter mb-4 ${
                gameState.winner === 1 ? 'text-pink-500' : 'text-green-500'
              }`}
            >
              PLAYER {gameState.winner} WINS
            </motion.h1>
            <p className="text-white/40 uppercase tracking-[1em] mb-12 text-center text-xs md:text-base">Combat Sequence Terminated</p>
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
