import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { IdCard } from 'lucide-react';
import { useState } from 'react';

interface GameFooterProps {
  onVote: () => void;
  hasVoted: boolean;
  myWinCondition: string;
}

export function GameFooter({ onVote, hasVoted, myWinCondition }: GameFooterProps) {
  const [isRevealingIdentity, setIsRevealingIdentity] = useState(false);

  return (
    <>
      <footer className="fixed bottom-0 w-full p-4 pb-8 z-50 pointer-events-none">
        <div className="flex gap-4 items-end pointer-events-auto max-w-md mx-auto">
          {/* Secret Identity Button (ID Card Style) */}
          <div className="flex flex-col gap-1 items-center">
            <div className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-t-md w-full text-center border-x border-t border-blue-200">
                学ID
            </div>
            <button
                className={clsx(
                "w-24 h-16 rounded-b-md rounded-tr-md bg-white border-2 border-blue-200 shadow-lg flex flex-col items-center justify-center p-1 transition-transform active:scale-95",
                isRevealingIdentity ? "bg-blue-50" : ""
                )}
                onPointerDown={() => setIsRevealingIdentity(true)}
                onPointerUp={() => setIsRevealingIdentity(false)}
                onPointerLeave={() => setIsRevealingIdentity(false)}
                onTouchStart={() => setIsRevealingIdentity(true)}
                onTouchEnd={() => setIsRevealingIdentity(false)}
            >
                <div className="w-8 h-8 rounded-full bg-gray-200 mb-1 flex items-center justify-center">
                    <IdCard size={16} className="text-gray-400" />
                </div>
                <div className="flex flex-col items-center leading-none">
                    <span className="text-[10px] font-bold text-gray-800">自分の思想</span>
                    <span className="text-[8px] text-gray-500 scale-90">(長押しで確認)</span>
                </div>
            </button>
          </div>

          {/* Key Spacer */}
          <div className="flex-1" />

          {/* Vote Button */}
          <button
            onClick={onVote}
            disabled={hasVoted}
            className={clsx(
              "flex-1 max-w-[200px] h-14 rounded-2xl font-bold text-lg tracking-wide shadow-xl shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 border-b-4",
              hasVoted
                ? "bg-gray-400 border-gray-600 text-white cursor-not-allowed shadow-none border-b-0 translate-y-1"
                : "bg-sky-500 border-sky-600 text-white hover:bg-sky-400"
            )}
          >
            <div className="bg-white/20 p-1 rounded">
                <VoteBoxIcon size={20} />
            </div>
            <div className="flex flex-col items-start leading-none">
                <span className="text-sm">投票する</span>
                <span className="text-[10px] opacity-80">(VOTE)</span>
            </div>
          </button>
        </div>
      </footer>

      {/* Secret Identity Modal Overlay */}
      <AnimatePresence>
        {isRevealingIdentity && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none p-6 bg-black/50 backdrop-blur-sm"
          >
             <div className="bg-white p-6 rounded-3xl shadow-2xl text-center max-w-xs w-full border-4 border-indigo-100">
                <h3 className="text-indigo-900 font-bold text-xl mb-4 border-b pb-2 border-indigo-50">㊙️ 勝利条件</h3>
                <p className="text-gray-800 font-bold text-lg leading-relaxed">
                    {myWinCondition}
                </p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Custom simple icon for Vote Box since generic Lucide might not match perfectly, 
// strictly using Lucide here to fit the request "VoteBoxIcon" needs to be defined or imported.
// Actually standard lucide `Vote` or `Inbox` works. Let's use `Vote` from Lucide if available or `Archive`.
// Updating imports in next block.
function VoteBoxIcon({ size }: { size: number }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 7v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7" />
            <path d="M10 12h4" />
        </svg>
    )
}
