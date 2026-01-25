'use client';

import { Move, CurrentTurn } from '@/lib/supabase/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { History, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TappableClueWord } from './TappableClueWord';

interface ClueHistoryProps {
  moves: Move[];
  playerRole: CurrentTurn;
  player1Name: string;
  player2Name: string;
  player1Id: string;
  player2Id: string;
  words: string[];
}

export function ClueHistory({ moves, playerRole, player1Name, player2Name, player1Id, player2Id, words }: ClueHistoryProps) {
  // Group moves by clue
  const groupedMoves: { clue: Move; guesses: Move[] }[] = [];
  let currentGroup: { clue: Move; guesses: Move[] } | null = null;
  
  for (const move of moves) {
    if (move.move_type === 'clue') {
      if (currentGroup) {
        groupedMoves.push(currentGroup);
      }
      currentGroup = { clue: move, guesses: [] };
    } else if (move.move_type === 'guess' && currentGroup) {
      currentGroup.guesses.push(move);
    }
  }
  
  if (currentGroup) {
    groupedMoves.push(currentGroup);
  }
  
  const getWordFromIndex = (index: number | null) => {
    if (index === null || index < 0 || index >= words.length) return '?';
    return words[index];
  };

  const getPlayerName = (playerId: string) => {
    if (playerId === player1Id) return player1Name;
    if (playerId === player2Id) return player2Name;
    return 'Unknown';
  };

  const isCurrentUser = (playerId: string) => {
    return (playerRole === 'player1' && playerId === player1Id) ||
           (playerRole === 'player2' && playerId === player2Id);
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <History className="h-4 w-4" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Game Log</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4 pr-4">
          {groupedMoves.length === 0 ? (
            <p className="text-center text-stone-500 py-8">
              No moves yet
            </p>
          ) : (
            <div className="space-y-4">
              {groupedMoves.map((group, idx) => {
                const clueGiverName = getPlayerName(group.clue.player_id);
                const isYourClue = isCurrentUser(group.clue.player_id);
                
                return (
                  <div
                    key={group.clue.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      isYourClue 
                        ? "bg-emerald-50 border-emerald-200" 
                        : "bg-blue-50 border-blue-200"
                    )}
                  >
                    {/* Clue header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        "text-xs font-medium flex items-center gap-1",
                        isYourClue ? "text-emerald-600" : "text-blue-600"
                      )}>
                        <User className="h-3 w-3" />
                        {isYourClue ? 'You' : clueGiverName} gave clue
                      </span>
                      <span className="text-xs text-stone-400">
                        Turn #{idx + 1}
                      </span>
                    </div>
                    
                    {/* Clue word */}
                    <div className="font-bold text-lg text-stone-800">
                      <TappableClueWord word={group.clue.clue_word?.toUpperCase() || ''} />: {group.clue.clue_number}
                    </div>
                    
                    {/* Intended words - only show for your clues */}
                    {isYourClue && group.clue.intended_words && group.clue.intended_words.length > 0 && (
                      <div className="mt-1">
                        <span className="text-xs text-stone-500">You meant: </span>
                        <span className="text-xs font-medium text-stone-700">
                          {group.clue.intended_words.map(idx => getWordFromIndex(idx)).join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {/* Guesses */}
                    {group.guesses.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-stone-200">
                        <p className="text-xs text-stone-500 mb-1">
                          {isYourClue ? `${player2Name === clueGiverName ? player1Name : player2Name} guessed:` : 'You guessed:'}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {group.guesses.map((guess) => (
                            <span
                              key={guess.id}
                              className={cn(
                                'px-2 py-1 rounded text-xs font-medium',
                                guess.guess_result === 'agent' && 'bg-emerald-200 text-emerald-800',
                                guess.guess_result === 'bystander' && 'bg-amber-200 text-amber-800',
                                guess.guess_result === 'assassin' && 'bg-stone-800 text-white'
                              )}
                            >
                              {getWordFromIndex(guess.guess_index)}
                              {guess.guess_result === 'agent' && ' ✓'}
                              {guess.guess_result === 'bystander' && ' ✗'}
                              {guess.guess_result === 'assassin' && ' ☠'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
