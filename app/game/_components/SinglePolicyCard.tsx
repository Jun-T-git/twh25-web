import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PolicyCard } from '../types';

interface SinglePolicyCardProps {
  card: PolicyCard;
  isActive?: boolean;
  onClick?: () => void;
  badge?: React.ReactNode;
  imageOverlay?: React.ReactNode;
  fallbackImageIndex?: number;
  className?: string; // allow overrides
}

export function SinglePolicyCard({ card, isActive = false, onClick, badge, imageOverlay, fallbackImageIndex = 0, className }: SinglePolicyCardProps) {
  return (
    <motion.div
      className={clsx(
        "snap-center shrink-0 w-[280px] h-[400px] rounded-xl bg-white opacity-95 shadow-xl flex flex-col overflow-hidden border transition-all duration-300",
        onClick ? "cursor-pointer" : "",
        isActive ? "border-sky-400 ring-2 ring-sky-400 scale-100 shadow-2xl z-10" : "border-gray-100 scale-95",
        className
      )}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {/* Card Image Area */}
      <div className="h-1/2 bg-gray-100 flex items-center justify-center relative overflow-hidden">
        <Image
            src={card.imageUrl ?? `/images/policy-0${(fallbackImageIndex % 4) + 1}.png`}
            alt={card.title}
            fill
            className="object-cover"
        />
        {badge && (
            <div className="absolute top-3 right-3 z-20">
                {badge}
            </div>
        )}
        {imageOverlay}
      </div>

      {/* Card Content */}
      <div className="h-1/2 p-6 flex flex-col text-left">
        <h3 className={clsx("text-xl font-bold mb-2", isActive ? "text-gray-900" : "text-gray-600")}>
          {card.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed overflow-y-auto">
          {card.description}
        </p>
      </div>
    </motion.div>
  );
}
