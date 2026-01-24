'use client';

import { Game, CurrentTurn } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { ClueHistory } from './ClueHistory';
import { useGameStore } from '@/lib/store/gameStore';

interface GameActionsProps {
  game: Game;
  playerRole: CurrentTurn;
  player1Name: string;
  player2Name: string;
  onEndTurn: () => void;
  hasActiveClue?: boolean;
  guessCount?: number;
}

export function GameActions({ 
  game, 
  playerRole, 
  player1Name, 
  player2Name,
  onEndTurn,
  hasActiveClue = false,
  guessCount = 0
}: GameActionsProps) {
  const { moves } = useGameStore();
  
  const isMyTurn = game.current_turn === playerRole;
  const isGuessPhase = game.current_phase === 'guess';
  // Guesser: it's my turn and we're in guess phase
  const isGuessing = isMyTurn && isGuessPhase;
  const isClueGiver = isMyTurn && game.current_phase === 'clue';
  
  const canEndTurn = isGuessing && guessCount > 0;
  
  return (
    <div className="bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 border-t border-stone-600 p-3">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <ClueHistory
          moves={moves}
          playerRole={playerRole}
          player1Name={player1Name}
          player2Name={player2Name}
          words={game.words}
        />
        
        {canEndTurn && (
          <Button
            onClick={onEndTurn}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold shadow-lg"
          >
            End Turn
          </Button>
        )}
        
        {isClueGiver && (
          <div className="text-sm text-white/60 italic">
            Select words & give clue below
          </div>
        )}
        
        {!isMyTurn && !isGuessing && (
          <div className="text-sm text-white/60 italic animate-pulse">
            Waiting for opponent...
          </div>
        )}
      </div>
    </div>
  );
}
