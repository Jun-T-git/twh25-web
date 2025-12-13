import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Check, User } from 'lucide-react';
import { Player } from '../types';

interface PlayerStatusProps {
  players: Player[];
}

export function PlayerStatus({ players }: PlayerStatusProps) {
  return (
    <div className="w-full px-4">
      <div className="bg-white/40 backdrop-blur-md rounded-2xl py-3 px-4 flex justify-between gap-2 shadow-sm border border-white/50">
        {players.map((player) => (
          <div key={player.id} className="relative flex flex-col items-center gap-1 flex-1">
            <div 
              className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white relative",
                player.status === 'voted' 
                  ? "border-green-500" 
                  : "border-white"
              )}
            >
              {player.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={player.avatarUrl} alt={player.name} className="w-full h-full rounded-full object-cover p-0.5" />
              ) : (
                <User className="w-6 h-6 text-gray-400" />
              )}
              
              {/* Voted Badge */}
              {player.status === 'voted' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -bottom-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm"
                >
                  <Check size={10} strokeWidth={4} />
                </motion.div>
              )}
            </div>
            
            <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold text-gray-800 truncate max-w-[60px] leading-tight">
                    {player.name}
                </span>
                <span className={clsx(
                    "text-[9px] font-bold mt-0.5",
                    player.status === 'voted' ? "text-green-700" : "text-gray-500"
                )}>
                    {player.status === 'voted' ? '投票済み!' : (player.status === 'waiting' ? '待機中' : '考え中...')}
                </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
