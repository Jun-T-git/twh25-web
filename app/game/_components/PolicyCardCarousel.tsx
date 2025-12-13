import { useRef } from 'react';
import { PolicyCard } from '../types';
import { SinglePolicyCard } from './SinglePolicyCard';

interface PolicyCardCarouselProps {
  cards: PolicyCard[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function PolicyCardCarousel({ cards, selectedIndex, onSelect }: PolicyCardCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Simple scroll snap logic could be enhanced, but we'll use a centered list for now
  return (
    <div className="flex-1 flex flex-col justify-center py-4 overflow-hidden relative">
       {/* Background decoration */}
       <div className="absolute inset-0 pointer-events-none" />

      <div 
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-8 pb-8 pt-4 no-scrollbar items-center z-10"
        ref={scrollContainerRef}
      >
        {cards.map((card, index) => {
          const isActive = index === selectedIndex;
          return (
            <SinglePolicyCard
                key={card.id}
                card={card}
                isActive={isActive}
                onClick={() => onSelect(index)}
                fallbackImageIndex={index}
                badge={isActive ? (
                    <div className="bg-sky-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                        選択中
                    </div>
                ) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
