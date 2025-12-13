import { useEffect, useRef } from 'react';
import { PolicyCard } from '../types';
import { SinglePolicyCard } from './SinglePolicyCard';

interface PolicyCardCarouselProps {
  cards: PolicyCard[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  getBadge?: (card: PolicyCard, index: number, isActive: boolean) => React.ReactNode;
  getOverlay?: (card: PolicyCard, index: number, isActive: boolean) => React.ReactNode;
}

export function PolicyCardCarousel({ cards, selectedIndex, onSelect, getBadge, getOverlay }: PolicyCardCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to selected card
  useEffect(() => {
    if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const cardWidth = 280; // Fixed width from SinglePolicyCard
        const gap = 16;       // gap-4
        const paddingLeft = 32; // px-8
        
        const cardLeft = paddingLeft + selectedIndex * (cardWidth + gap);
        const cardCenter = cardLeft + cardWidth / 2;
        const scrollLeft = cardCenter - container.clientWidth / 2;

        container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
        });
    }
  }, [selectedIndex]);

  // Simple scroll snap logic could be enhanced, but we'll use a centered list for now
  return (
    <div className="flex-1 flex flex-col justify-center overflow-hidden relative">
       {/* Background decoration */}
       <div className="absolute inset-0 pointer-events-none" />

      <div 
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-8 pb-4 pt-4 no-scrollbar items-center z-10"
        ref={scrollContainerRef}
      >
        {cards.map((card, index) => {
          const isActive = index === selectedIndex;
          const badge = getBadge ? getBadge(card, index, isActive) : (isActive ? (
                <div className="bg-sky-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                    選択中
                </div>
            ) : undefined);
          const overlay = getOverlay ? getOverlay(card, index, isActive) : undefined;

          return (
            <SinglePolicyCard
                key={card.id}
                card={card}
                isActive={isActive}
                onClick={() => onSelect(index)}
                fallbackImageIndex={index}
                badge={badge}
                imageOverlay={overlay}
            />
          );
        })}
      </div>
    </div>
  );
}
