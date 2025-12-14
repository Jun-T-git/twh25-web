import { ChevronRight } from 'lucide-react';
import { CityStats } from '../types';
import { CityParamIcon } from './CityParamIcon';

interface GameHeaderProps {
  turn: number;
  totalTurns: number;
  stats: CityStats;
  onShowDetails?: () => void;
}

export function GameHeader({ turn, totalTurns, stats, onShowDetails }: GameHeaderProps) {
  return (
    <div className="px-4 pt-4 pb-2 z-50 sticky top-0">
      <div className="bg-white/95 backdrop-blur shadow-md rounded-2xl p-3 flex gap-4 items-center">
        {/* Turn Counter */}
        <div className="flex flex-col items-center justify-center border-r border-gray-100 pr-4 min-w-[70px]">
          <span className="text-[10px] font-bold text-gray-400">TURN</span>
          <span className="text-xl font-black text-gray-800 leading-none mb-1">
            {turn}/{totalTurns}
          </span>
          {onShowDetails && (
            <button 
                onClick={onShowDetails}
                className="text-[10px] bg-sky-50 hover:bg-sky-100 text-sky-600 font-bold px-2 py-1 rounded-full flex items-center gap-0.5 transition-all shadow-sm border border-sky-100 active:scale-95"
            >
                <span>詳細</span>
                <ChevronRight size={12} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-3 gap-x-2 gap-y-2">
          <CityParamIcon type="economy" label="経済" value={stats.economy} />
          <CityParamIcon type="welfare" label="福祉" value={stats.welfare} />
          <CityParamIcon type="education" label="教育" value={stats.education} />
          <CityParamIcon type="security" label="治安" value={stats.security} />
          <CityParamIcon type="humanRights" label="人権" value={stats.humanRights} />
          <CityParamIcon type="environment" label="環境" value={stats.environment} />
        </div>
      </div>
    </div>
  );
}
