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
    <div className="bg-gradient-to-r from-stone-700 via-stone-600 to-stone-700 px-3 py-2 shadow-lg">
      <div className="max-w-lg mx-auto">
        {/* Top row: Turn indicator + Agents found */}
        <div className="flex items-center justify-between mb-2">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
              isMyTurn
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-500 text-stone-200'
            )}
          >
            {isMyTurn && <Zap className="w-3 h-3" />}
            {isMyTurn ? 'Your Turn' : 'Their Turn'}
          </div>
          
          {/* Timer dots */}
          <div className="flex gap-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  i < game.timer_tokens ? 'bg-amber-400' : 'bg-white/20'
                )}
              />
            ))}
          </div>
          
          {/* Agents counter */}
          <div className="flex items-center gap-1 text-xs">
            <User className="w-3 h-3 text-cyan-300" />
            <span className="text-cyan-300 font-bold">{agentsFound}</span>
            <span className="text-white/50">/</span>
            <span className="text-white/70">{totalAgents}</span>
          </div>
        </div>
        
        {/* Current clue - compact */}
        {currentClue && (
          <div className="text-center py-1.5 px-3 bg-white/10 rounded-lg mb-2">
            <span className="text-lg font-black text-white">{currentClue.clue_word}</span>
            <span className="ml-2 text-yellow-300 font-bold">{currentClue.clue_number}</span>
            {guessCount > 0 && <span className="text-xs text-white/50 ml-2">({guessCount} guessed)</span>}
          </div>
        )}
        
        {/* Remaining per player - inline */}
        <div className="flex justify-between text-[10px] text-white/60">
          <span>Your key: <span className="text-cyan-300 font-bold">{myRemaining}</span> left</span>
          <span>Their key: <span className="text-cyan-300 font-bold">{theirRemaining}</span> left</span>
        </div>
      </div>
    </div>
  );
}
