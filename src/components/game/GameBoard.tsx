'use client';

import { useState, useCallback, useRef } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { Game, CurrentTurn, CardType } from '@/lib/supabase/types';
import { getCardTypeForPlayer } from '@/lib/game/keyGenerator';
import { isWordRevealed } from '@/lib/game/gameLogic';
import { cn } from '@/lib/utils';
import { WordDefinition } from './WordDefinition';
import { User, Eye, Skull } from 'lucide-react';

interface WordCardProps {
  word: string;
  index: number;
  game: Game;
  playerRole: CurrentTurn;
  isGivingClue: boolean;
  isGuessing: boolean;
  isSelected: boolean;
  onToggleSelect: (word: string) => void;
  onGuess: (wordIndex: number) => void;
}

function WordCard({
  word,
  index,
  game,
  playerRole,
  isGivingClue,
  isGuessing,
  isSelected,
  onToggleSelect,
  onGuess,
}: WordCardProps) {
  const [showDefinition, setShowDefinition] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  
  const revealed = game.board_state.revealed[word];
  const isRevealed = !!revealed;
  
  // Get card type from current player's key (what they see)
  const cardTypeForMe = getCardTypeForPlayer(index, game.key_card, playerRole);
  
  // Card styling based on state
  const getCardStyles = () => {
    if (isRevealed) {
      if (revealed.type === 'agent') {
        return {
          card: 'bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 border-cyan-300 shadow-cyan-200',
          text: 'text-white',
          label: 'bg-white/90 text-cyan-700',
          icon: <User className="w-8 h-8 text-white/80" />,
        };
      } else if (revealed.type === 'assassin') {
        return {
          card: 'bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900 border-stone-600 shadow-stone-400',
          text: 'text-white',
          label: 'bg-stone-900 text-white',
          icon: <Skull className="w-8 h-8 text-white/80" />,
        };
      } else {
        // Bystander
        return {
          card: 'bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200 border-amber-300 shadow-amber-100',
          text: 'text-amber-900',
          label: 'bg-white/90 text-amber-800',
          icon: <Eye className="w-8 h-8 text-amber-600/60" />,
        };
      }
    }
    
    // Unrevealed card - show subtle hints for clue giver
    let borderHint = 'border-stone-200';
    if (cardTypeForMe === 'agent') {
      borderHint = 'border-cyan-400 border-2';
    } else if (cardTypeForMe === 'assassin') {
      borderHint = 'border-stone-800 border-2';
    }
    
    return {
      card: `bg-gradient-to-br from-stone-50 to-stone-100 ${borderHint} shadow-stone-100`,
      text: 'text-stone-700',
      label: 'bg-white text-stone-800',
      icon: null,
    };
  };
  
  const styles = getCardStyles();
  
  // Selection state for clue giving
  const selectionStyles = isSelected && !isRevealed 
    ? 'ring-4 ring-blue-400 ring-offset-2 border-blue-500 scale-105' 
    : '';
  
  const handleTouchStart = useCallback(() => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setShowDefinition(true);
    }, 500);
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    if (!isLongPress.current && !isRevealed) {
      if (isGivingClue) {
        onToggleSelect(word);
      } else if (isGuessing) {
        onGuess(index);
      }
    }
  }, [isGivingClue, isGuessing, isRevealed, word, index, onToggleSelect, onGuess]);
  
  const handleClick = useCallback(() => {
    if (!isRevealed) {
      if (isGivingClue) {
        onToggleSelect(word);
      } else if (isGuessing) {
        onGuess(index);
      }
    }
  }, [isGivingClue, isGuessing, isRevealed, word, index, onToggleSelect, onGuess]);
  
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowDefinition(true);
  }, []);

  return (
    <>
      <button
        className={cn(
          'relative w-full aspect-[3/4] rounded-xl border-2 flex flex-col items-center justify-between overflow-hidden',
          'transition-all duration-200 ease-out',
          'touch-manipulation select-none shadow-md hover:shadow-lg',
          styles.card,
          selectionStyles,
          !isRevealed && (isGivingClue || isGuessing) && 'active:scale-95 cursor-pointer hover:scale-102',
        )}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
        disabled={isRevealed && !showDefinition}
      >
        {/* Card illustration area */}
        <div className="flex-1 w-full flex items-center justify-center p-2">
          {isRevealed ? (
            <div className="flex flex-col items-center gap-1">
              {styles.icon}
              {revealed.type === 'agent' && (
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Agent</span>
              )}
              {revealed.type === 'assassin' && (
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Assassin</span>
              )}
              {revealed.type === 'bystander' && (
                <span className="text-[10px] font-bold text-amber-600/70 uppercase tracking-wider">Bystander</span>
              )}
            </div>
          ) : (
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-white/50 to-transparent flex items-center justify-center">
              <span className="text-4xl opacity-20">?</span>
            </div>
          )}
        </div>
        
        {/* Word label at bottom */}
        <div className={cn(
          'w-full py-1.5 px-1 text-center border-t',
          styles.label,
          'text-[10px] sm:text-xs font-bold uppercase tracking-tight leading-tight'
        )}>
          {word}
        </div>
        
        {/* Who guessed indicator */}
        {isRevealed && (
          <div className={cn(
            'absolute top-1 right-1 text-[8px] font-bold px-1 rounded',
            revealed.type === 'agent' ? 'bg-white/30 text-white' : 
            revealed.type === 'assassin' ? 'bg-white/20 text-white' : 
            'bg-amber-600/20 text-amber-800'
          )}>
            {revealed.guessedBy === 'player1' ? 'P1' : 'P2'}
          </div>
        )}
        
        {/* Selection checkmark */}
        {isSelected && !isRevealed && (
          <div className="absolute top-1 left-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        )}
      </button>
      
      {showDefinition && (
        <WordDefinition
          word={word}
          onClose={() => setShowDefinition(false)}
        />
      )}
    </>
  );
}

interface GameBoardProps {
  game: Game;
  playerRole: CurrentTurn;
  onGuess: (wordIndex: number) => void;
  hasActiveClue?: boolean;
}

export function GameBoard({ game, playerRole, onGuess, hasActiveClue = false }: GameBoardProps) {
  const { selectedWordsForClue, toggleWordForClue } = useGameStore();
  
  const isMyTurn = game.current_turn === playerRole;
  const isCluePhase = game.current_phase === 'clue';
  const isGuessPhase = game.current_phase === 'guess';
  
  // Clue giver: it's my turn and we're in clue phase
  const isGivingClue = isMyTurn && isCluePhase && game.status === 'playing';
  // Guesser: it's my turn and we're in guess phase
  const isGuessing = isMyTurn && isGuessPhase && game.status === 'playing';
  
  return (
    <div className="w-full max-w-lg mx-auto p-2">
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {game.words.map((word, index) => (
          <WordCard
            key={`${word}-${index}`}
            word={word}
            index={index}
            game={game}
            playerRole={playerRole}
            isGivingClue={isGivingClue}
            isGuessing={isGuessing}
            isSelected={selectedWordsForClue.has(word)}
            onToggleSelect={toggleWordForClue}
            onGuess={onGuess}
          />
        ))}
      </div>
    </div>
  );
}
