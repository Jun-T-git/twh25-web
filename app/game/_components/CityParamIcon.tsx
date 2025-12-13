import { clsx } from 'clsx';
import { BookOpen, Heart, Leaf, Shield, TrendingUp, Users } from 'lucide-react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

type ParamType = 'economy' | 'welfare' | 'education' | 'security' | 'humanRights' | 'environment';

interface CityParamIconProps {
  type: ParamType;
  value: number;
  label: string;
  className?: string;
}

const icons: Record<ParamType, React.ElementType> = {
  economy: TrendingUp,
  welfare: Heart,
  education: BookOpen,
  security: Shield,
  humanRights: Users,
  environment: Leaf,
};

const colors: Record<ParamType, string> = {
  economy: 'text-yellow-500',
  welfare: 'text-pink-500',
  education: 'text-blue-500',
  security: 'text-indigo-500',
  humanRights: 'text-purple-500',
  environment: 'text-green-500',
};

const barColors: Record<ParamType, string> = {
  economy: 'bg-yellow-400',
  welfare: 'bg-pink-400',
  education: 'bg-blue-400',
  security: 'bg-indigo-400',
  humanRights: 'bg-purple-400',
  environment: 'bg-green-400',
};

export function CityParamIcon({ type, value, label, className }: CityParamIconProps) {
  const Icon = icons[type];
  const isDanger = value < 30;

  return (
    <div className={twMerge("flex flex-col gap-0.5", className)}>
      <div className="flex items-center gap-1">
        <Icon 
          size={12} 
          className={clsx(
            colors[type],
            isDanger && "text-red-500"
          )} 
        />
        <span className="text-[10px] font-bold text-gray-700 leading-none">{label}</span>
      </div>
      
      {/* Bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={clsx(
            "h-full rounded-full transition-all duration-500",
            isDanger ? "bg-red-500 animate-pulse" : barColors[type]
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
