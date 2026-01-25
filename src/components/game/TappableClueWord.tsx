'use client';

import { useState } from 'react';
import { WordDefinition } from './WordDefinition';
import { cn } from '@/lib/utils';

interface TappableClueWordProps {
  word: string;
  className?: string;
}

export function TappableClueWord({ word, className }: TappableClueWordProps) {
  const [showDefinition, setShowDefinition] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowDefinition(true)}
        className={cn(
          'underline decoration-dotted underline-offset-2 cursor-pointer hover:opacity-80 active:opacity-60',
          className
        )}
      >
        {word}
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
