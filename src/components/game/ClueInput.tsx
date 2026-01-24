'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { Game, CurrentTurn } from '@/lib/supabase/types';
import { validateClue } from '@/lib/game/clueValidator';
import { getUnrevealedWords } from '@/lib/game/gameLogic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ClueInputProps {
  game: Game;
  playerRole: CurrentTurn;
  onGiveClue: (clue: string, intendedWordIndices: number[]) => void;
  hasActiveClue?: boolean;
}

export function ClueInput({ game, playerRole, onGiveClue, hasActiveClue = false }: ClueInputProps) {
  const [clue, setClue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { selectedWordsForClue, clearSelectedWords } = useGameStore();
  
  const isMyTurn = game.current_turn === playerRole;
  const isCluePhase = game.current_phase === 'clue';
  const isGivingClue = isMyTurn && isCluePhase && game.status === 'playing';
  
  if (!isGivingClue) return null;
  
  const unrevealedWords = getUnrevealedWords(game.words, game.board_state);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const trimmedClue = clue.trim().toUpperCase();
    
    // Validate clue
    const validation = validateClue(trimmedClue, unrevealedWords, game.clue_strictness);
    if (!validation.valid) {
      setError(validation.reason || 'Invalid clue');
      return;
    }
    
    // Convert selected words to indices
    const intendedWordIndices = Array.from(selectedWordsForClue).map(word => 
      game.words.indexOf(word)
    ).filter(idx => idx !== -1);
    
    onGiveClue(trimmedClue, intendedWordIndices);
    setClue('');
    clearSelectedWords();
  };
  
  const selectedCount = selectedWordsForClue.size;
  
  return (
    <div className="bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 border-t border-stone-600 shadow-lg p-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-3">
          <p className="text-sm font-semibold text-white mb-1">
            🎯 Your turn to give a clue
          </p>
          <p className="text-xs text-white/60">
            Tap words you&apos;re hinting at, then type your one-word clue
          </p>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedCount === 0 ? (
              <span className="text-sm text-white/40 italic">
                No words selected (will be &quot;0&quot; clue)
              </span>
            ) : (
              Array.from(selectedWordsForClue).map((word) => (
                <span
                  key={word}
                  className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full font-medium border border-cyan-400/30"
                >
                  {word}
                </span>
              ))
            )}
          </div>
          {selectedCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelectedWords}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              Clear
            </Button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <Input
              value={clue}
              onChange={(e) => {
                setClue(e.target.value.replace(/\s/g, ''));
                setError(null);
              }}
              placeholder="Enter one-word clue"
              className={cn(
                'uppercase font-bold bg-white/10 border-white/20 text-white placeholder:text-white/40',
                error && 'border-red-500 focus:ring-red-500'
              )}
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold min-w-[110px] shadow-lg"
            disabled={!clue.trim()}
          >
            Give Clue ({selectedCount})
          </Button>
        </form>
        
        {error && (
          <p className="text-sm text-red-400 mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
