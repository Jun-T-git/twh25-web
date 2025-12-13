import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { IdCard, Lightbulb, Target } from 'lucide-react';
import { useRef, useState } from 'react';

interface GameFooterProps {
  onVote: () => void;
  hasVoted: boolean;
  ideology?: {
    name: string;
    description: string;
    coefficients?: Record<string, number>;
  };
  defaultOpen?: boolean;
}

export function GameFooter({ onVote, hasVoted, ideology, defaultOpen = false }: GameFooterProps) {
  const [isRevealingIdentity, setIsRevealingIdentity] = useState(defaultOpen);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  // Calculate Radar Chart Points
  const categories = [
    { key: 'economy', label: '経済' },
    { key: 'welfare', label: '福祉' },
    { key: 'education', label: '教育' },
    { key: 'security', label: '治安' },
    { key: 'humanRights', label: '人権' },
    { key: 'environment', label: '環境' },
  ];

  const getPoints = (coefficients: Record<string, number> = {}) => {
    const total = categories.length;
    const radius = 65; // Reduced from 80
    const centerX = 100;
    const centerY = 100;

    return categories.map((cat, i) => {
      const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
      // Map -3..+3 to 0..1 scale relative to radius.
      // -3 => 0 (center), 0 => 0.5, +3 => 1.0 (edge)
      const val = coefficients[cat.key] ?? 0;
      const normalized = (Math.max(-3, Math.min(3, val)) + 3) / 6;
      const r = normalized * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const getAxisLine = (i: number) => {
    const total = categories.length;
    const radius = 65; // Reduced from 80
    const centerX = 100;
    const centerY = 100;
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x1: centerX, y1: centerY, x2: x, y2: y };
  }

  const getLabelPos = (i: number) => {
     const total = categories.length;
     const radius = 82; // Reduced from 95, giving ~18px padding
     const centerX = 100;
     const centerY = 100;
     const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
     const x = centerX + radius * Math.cos(angle);
     const y = centerY + radius * Math.sin(angle);
     // Adust alignment based on position
     let anchor: 'middle' | 'end' | 'start' = 'middle';
     if (x < 90) anchor = 'end';
     if (x > 110) anchor = 'start';
     return { x, y, anchor };
  }

  return (
    <>
      <footer className="fixed bottom-0 w-full p-4 pb-8 z-50 pointer-events-none">
        <div className="flex gap-4 items-end pointer-events-auto max-w-md mx-auto">
          {/* Secret Identity Button (ID Card Style) */}
          <div className="flex flex-col gap-1 items-center">
            <button
                className={clsx(
                "h-16 w-24 rounded-2xl bg-white border-2 border-sky-100 border-b-4 border-b-sky-200 shadow-xl flex flex-col items-center justify-center p-1 transition-all active:translate-y-1 active:border-b-0 active:mb-1",
                isRevealingIdentity ? "bg-sky-50 border-sky-300 border-b-sky-400" : ""
                )}
                onClick={() => setIsRevealingIdentity(true)}
            >
                <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center mb-1">
                    <IdCard size={18} className="text-sky-500" />
                </div>
                <span className="text-[10px] font-bold text-gray-700 leading-tight">
                    あなたの思想<br/>(勝利条件)
                </span>
            </button>
          </div>

          {/* Key Spacer */}
          <div className="flex-1" />

          <button
            onClick={onVote}
            disabled={hasVoted}
            className={clsx(
              "w-36 px-2 h-16 rounded-2xl font-bold text-lg tracking-wide shadow-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden group border-b-4 active:translate-y-1 active:border-b-0 active:mb-1",
              hasVoted
                ? "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed shadow-none border-b-0 translate-y-1"
                : "bg-sky-500 border-sky-700 text-white shadow-sky-500/20 hover:bg-sky-400"
            )}
          >
            {/* Top Gloss Highlight */}
            {!hasVoted && (
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            )}

            <div className={clsx(
                "p-1.5 rounded-xl transition-transform group-hover:scale-110",
                hasVoted ? "bg-slate-300" : "bg-sky-700/50"
            )}>
                <VoteBoxIcon size={20} />
            </div>
            <div className="flex flex-col items-start leading-none gap-0.5">
                <span className="text-sm font-black tracking-widest drop-shadow-sm">{hasVoted ? '投票済み' : '投票する'}</span>
                <span className={clsx("text-[9px] font-bold tracking-widest", hasVoted ? "opacity-60" : "text-sky-100")}>
                    {hasVoted ? 'COMPLETED' : 'SUBMIT VOTE'}
                </span>
            </div>
          </button>
        </div>
      </footer>

      {/* Secret Identity Modal Overlay */}
      <AnimatePresence>
        {isRevealingIdentity && ideology && (
          <>
            {/* Backdrop */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
               onClick={() => setIsRevealingIdentity(false)}
            />
            {/* Modal Content */}
            <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.1, x: -120, y: 350 }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.1, x: -120, y: 350 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white p-6 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-sky-100 max-h-[90vh] overflow-y-auto pointer-events-auto mx-4"
                    onClick={e => e.stopPropagation()}
                >
                    <h3 className="text-sky-900 font-bold text-xl mb-4 border-b pb-2 border-sky-50">
                        <Target className="inline-block mr-2 w-6 h-6 text-sky-500 mb-0.5" />
                        あなたの思想 (勝利条件)
                    </h3>
                    <div className="mb-4">
                    <span className="inline-block bg-sky-100 text-sky-800 text-lg font-bold px-4 py-1 rounded-full mb-2">
                        {ideology.name}
                    </span>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                        {ideology.description}
                    </p>
                    
                    {/* Radar Chart */}
                    {ideology.coefficients && (
                        <div className="relative w-full aspect-square max-w-[240px] mx-auto mb-2">
                            <svg viewBox="0 0 200 200" className="w-full h-full">
                                {/* Grid Circles */}
                                <circle cx="100" cy="100" r="16.25" fill="none" stroke="#e2e8f0" strokeWidth="1" /> {/* -1.5 */}
                                <circle cx="100" cy="100" r="32.5" fill="none" stroke="#e2e8f0" strokeWidth="1" /> {/* 0.0 */}
                                <circle cx="100" cy="100" r="48.75" fill="none" stroke="#e2e8f0" strokeWidth="1" /> {/* +1.5 */}
                                <circle cx="100" cy="100" r="65" fill="none" stroke="#cbd5e1" strokeWidth="1" /> {/* +3.0 */}
                                
                                {/* Axis Lines */}
                                {categories.map((_, i) => {
                                    const { x1, y1, x2, y2 } = getAxisLine(i);
                                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth="1" />;
                                })}

                                {/* Data Polygon */}
                                    <polygon 
                                    points={getPoints(ideology.coefficients)} 
                                    fill="rgba(14, 165, 233, 0.4)" 
                                    stroke="#0ea5e9" 
                                    strokeWidth="2" 
                                    />
                                    
                                {categories.map((cat, i) => {
                                    const { x, y, anchor } = getLabelPos(i);
                                    const val = ideology.coefficients?.[cat.key] ?? 0;
                                    const valText = `x${val}`;
                                    // Color logic: >1 = Green, <0 = Red, 0-1 = Gray
                                    const valColor = val > 1 ? '#16a34a' : (val < 0 ? '#ef4444' : '#64748b');
                                    const fontWeight = Math.abs(val) > 1 ? '900' : 'bold';

                                    return (
                                        <g key={cat.key}>
                                            <text 
                                                x={x} y={y - 4} 
                                                textAnchor={anchor} 
                                                dominantBaseline="auto" 
                                                className="text-[10px] fill-sky-900 font-bold"
                                                fill={valColor}
                                                style={{ fontSize: '10px' }}
                                            >
                                                {cat.label}
                                            </text>
                                            <text 
                                                x={x} y={y + 6}
                                                textAnchor={anchor} 
                                                dominantBaseline="auto" 
                                                fill={valColor}
                                                style={{ fontSize: '10px', fontWeight }}
                                            >
                                                {valText}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    )}

                    </div>
                    
                    <div className="bg-sky-50 p-3 rounded-xl mb-4 text-left border border-sky-100 shadow-sm">
                        <p className="text-sm font-bold text-sky-800 mb-1 flex items-center">
                            <Lightbulb className="w-4 h-4 mr-2 text-yellow-500 fill-yellow-500" />
                            勝利へのヒント
                        </p>
                        <p className="text-xs text-sky-700 leading-relaxed">
                            <span className="font-bold text-green-600">緑色 (プラス)</span> の項目が伸びるような政策を選びましょう。<br/>
                            逆に <span className="font-bold text-red-500">赤色 (マイナス)</span> の項目は下げることでスコアが上がります！
                        </p>
                    </div>

                    <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                    ※この情報は他のプレイヤーには公開されません
                    </div>
                    <button 
                    onClick={() => setIsRevealingIdentity(false)}
                    className="mt-4 w-full py-3 bg-sky-50 text-sky-600 font-bold rounded-lg hover:bg-sky-100"
                    >
                        閉じる
                    </button>
                </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

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
