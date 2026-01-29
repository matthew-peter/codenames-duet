'use client';

import { Game, CurrentTurn } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';

interface GameActionsProps {
  game: Game;
  playerRole: CurrentTurn;
  onEndTurn: () => void;
  guessCount?: number;
}

export function GameActions({ 
  game, 
  playerRole, 
  onEndTurn,
  guessCount = 0
}: GameActionsProps) {
  const isClueGiver = game.current_turn === playerRole;
  const isGuesser = game.current_turn !== playerRole;
  const isGuessPhase = game.current_phase === 'guess';
  const isGuessing = isGuesser && isGuessPhase && game.status === 'playing';
  
  const canEndTurn = isGuessing && guessCount > 0;
  
  return (
    <div className="bg-stone-800 border-t border-stone-600 px-2 py-2">
      <div className="max-w-md mx-auto flex items-center justify-end">
        <div className="flex items-center gap-2">
          {isGuessing && (
            <span className="text-xs text-stone-400">Tap a word to guess</span>
          )}
          
          {canEndTurn && (
            <Button
              onClick={onEndTurn}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              End Turn
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
