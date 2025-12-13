import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { PolicyCard } from '../types';

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
            <motion.div
              key={card.id}
              className={clsx(
                "snap-center shrink-0 w-[280px] h-[400px] rounded-2xl bg-white shadow-xl flex flex-col overflow-hidden border transition-all duration-300 cursor-pointer",
                isActive ? "border-sky-400 ring-2 ring-sky-100 scale-100 shadow-2xl z-10" : "border-gray-100 scale-95"
              )}
              onClick={() => onSelect(index)}
              whileTap={{ scale: 0.98 }}
            >
              {/* Card Image Area */}
              <div className="h-1/2 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {card.imageUrl ? (
                   // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-sky-50 to-indigo-50 flex items-center justify-center text-sky-200">
                    <span className="text-6xl font-black opacity-20">{index + 1}</span>
                  </div>
                )}
                {isActive && (
                    <div className="absolute top-3 right-3 bg-sky-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                        SELECTED
                    </div>
                )}
              </div>

              {/* Card Content */}
              <div className="h-1/2 p-6 flex flex-col">
                <h3 className={clsx("text-xl font-bold mb-2", isActive ? "text-gray-900" : "text-gray-600")}>
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed overflow-y-auto">
                  {card.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
