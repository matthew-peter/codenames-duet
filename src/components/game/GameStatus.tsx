'use client';

import { Game, Move, CurrentTurn } from '@/lib/supabase/types';
import { countAgentsFound, countTotalAgentsNeeded, getRemainingAgentsPerPlayer } from '@/lib/game/gameLogic';
import { cn } from '@/lib/utils';
import { Clock, User, Zap } from 'lucide-react';

interface GameStatusProps {
  game: Game;
  playerRole: CurrentTurn;
  opponentName?: string;
  currentClue?: Move | null;
  guessCount?: number;
}

export function GameStatus({ game, playerRole, opponentName, currentClue, guessCount = 0 }: GameStatusProps) {
  const isMyTurn = game.current_turn === playerRole;
  const agentsFound = countAgentsFound(game.board_state);
  const totalAgents = countTotalAgentsNeeded(game.key_card);
  const remaining = getRemainingAgentsPerPlayer(game);
  const inSuddenDeath = game.sudden_death || game.timer_tokens <= 0;
  
  const myRemaining = playerRole === 'player1' ? remaining.player1 : remaining.player2;
  const theirRemaining = playerRole === 'player1' ? remaining.player2 : remaining.player1;
  
  return (
    <div className="bg-gradient-to-r from-rose-800 via-rose-700 to-rose-800 px-4 py-3 shadow-lg">
      <div className="max-w-lg mx-auto">
        {/* Turn indicator */}
        <div className="text-center mb-3">
          <div
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-md',
              isMyTurn
                ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                : 'bg-white/20 text-white/90'
            )}
          >
            {isMyTurn && <Zap className="w-4 h-4" />}
            {isMyTurn ? 'Your Turn' : `${opponentName || 'Opponent'}'s Turn`}
          </div>
        </div>
        
        {/* Current clue */}
        {currentClue && (
          <div className="text-center mb-3 p-3 bg-white/10 backdrop-blur rounded-xl border border-white/20">
            <p className="text-[10px] text-white/70 uppercase tracking-widest mb-1">Current Clue</p>
            <p className="text-xl font-black text-white tracking-wide">
              {currentClue.clue_word}
              <span className="ml-2 text-yellow-300">{currentClue.clue_number}</span>
            </p>
            {guessCount > 0 && (
              <p className="text-xs text-white/60 mt-1">
                Guesses made: {guessCount}
              </p>
            )}
          </div>
        )}
        
        {/* Stats row */}
        <div className="flex items-center justify-between">
          {/* Timer tokens */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/70" />
            <div className="flex gap-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-3 h-3 rounded-full transition-all',
                    i < game.timer_tokens
                      ? 'bg-gradient-to-br from-amber-300 to-amber-500 shadow-sm shadow-amber-400/50'
                      : 'bg-white/20'
                  )}
                />
              ))}
            </div>
            {inSuddenDeath && (
              <span className="text-red-300 font-bold ml-1 text-xs animate-pulse">
                ⚠ SUDDEN DEATH
              </span>
            )}
          </div>
          
          {/* Agents found */}
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <User className="w-4 h-4 text-cyan-300" />
            <span className="text-cyan-300 font-bold">{agentsFound}</span>
            <span className="text-white/50">/</span>
            <span className="text-white/70">{totalAgents}</span>
          </div>
        </div>
        
        {/* Remaining per player */}
        <div className="flex justify-between mt-3 text-xs">
          <div className="bg-white/10 px-3 py-1.5 rounded-lg">
            <span className="text-white/60">Your key: </span>
            <span className="font-bold text-cyan-300">{myRemaining}</span>
            <span className="text-white/60"> left</span>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg">
            <span className="text-white/60">Their key: </span>
            <span className="font-bold text-cyan-300">{theirRemaining}</span>
            <span className="text-white/60"> left</span>
          </div>
        </div>
      </div>
    </div>
  );
}
