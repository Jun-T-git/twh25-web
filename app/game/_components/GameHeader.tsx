import { CityStats } from '../types';
import { CityParamIcon } from './CityParamIcon';

interface GameHeaderProps {
  turn: number;
  totalTurns: number;
  stats: CityStats;
}

export function GameHeader({ turn, totalTurns, stats }: GameHeaderProps) {
  return (
    <div className="px-4 pt-4 pb-2 z-50 sticky top-0">
      <div className="bg-white/95 backdrop-blur shadow-md rounded-2xl p-3 flex gap-4 items-center">
        {/* Turn Counter */}
        <div className="flex flex-col items-center justify-center border-r border-gray-100 pr-4 min-w-[70px]">
          <span className="text-xs font-bold text-gray-500">ターン</span>
          <span className="text-2xl font-black text-gray-800 leading-none mt-1">
            {turn}/{totalTurns}
          </span>
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
