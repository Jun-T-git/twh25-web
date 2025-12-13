import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { IdCard } from 'lucide-react';
import { useState } from 'react';

interface GameFooterProps {
  onVote: () => void;
  hasVoted: boolean;
  ideology?: {
    name: string;
    description: string;
    coefficients?: Record<string, number>;
  };
}

export function GameFooter({ onVote, hasVoted, ideology }: GameFooterProps) {
  const [isRevealingIdentity, setIsRevealingIdentity] = useState(false);

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
      // Map -2..+2 to 0..1 scale relative to radius.
      // -2 => 0 (center), 0 => 0.5, +2 => 1.0 (edge)
      const val = coefficients[cat.key] ?? 0;
      const normalized = (Math.max(-2, Math.min(2, val)) + 2) / 4;
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
            <div className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-t-md w-full text-center border-x border-t border-blue-200">
                ユーザID
            </div>
            <button
                className={clsx(
                "w-24 h-16 rounded-b-md rounded-tr-md bg-white border-2 border-blue-200 shadow-lg flex flex-col items-center justify-center p-1 transition-transform active:scale-95",
                isRevealingIdentity ? "bg-blue-50" : ""
                )}
                onClick={() => setIsRevealingIdentity(true)}
            >
                <div className="w-8 h-8 rounded-full bg-gray-200 mb-1 flex items-center justify-center">
                    <IdCard size={16} className="text-gray-400" />
                </div>
                <div className="flex flex-col items-center leading-none">
                    <span className="text-[10px] font-bold text-gray-800">自分の思想</span>
                    <span className="text-[8px] text-gray-500 scale-90">(タップで確認)</span>
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
        {isRevealingIdentity && ideology && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto p-6 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsRevealingIdentity(false)}
          >
             <div className="bg-white p-6 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-indigo-100 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-indigo-900 font-bold text-xl mb-4 border-b pb-2 border-indigo-50">㊙️ あなたの思想</h3>
                <div className="mb-4">
                  <span className="inline-block bg-indigo-100 text-indigo-800 text-lg font-bold px-4 py-1 rounded-full mb-2">
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
                              <circle cx="100" cy="100" r="16.25" fill="none" stroke="#e2e8f0" strokeWidth="1" /> {/* -1.0 */}
                              <circle cx="100" cy="100" r="32.5" fill="none" stroke="#e2e8f0" strokeWidth="1" /> {/* 0.0 */}
                              <circle cx="100" cy="100" r="48.75" fill="none" stroke="#e2e8f0" strokeWidth="1" /> {/* +1.0 */}
                              <circle cx="100" cy="100" r="65" fill="none" stroke="#cbd5e1" strokeWidth="1" /> {/* +2.0 */}
                              
                              {/* Axis Lines */}
                              {categories.map((_, i) => {
                                  const { x1, y1, x2, y2 } = getAxisLine(i);
                                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth="1" />;
                              })}

                              {/* Data Polygon */}
                              <polygon 
                                points={getPoints(ideology.coefficients)} 
                                fill="rgba(99, 102, 241, 0.4)" 
                                stroke="#4f46e5" 
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
                                            className="text-[10px] font-bold"
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
                <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                  ※この情報は他のプレイヤーには公開されません
                </div>
                <button 
                  onClick={() => setIsRevealingIdentity(false)}
                  className="mt-4 w-full py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg hover:bg-indigo-100"
                >
                    閉じる
                </button>
             </div>
          </motion.div>
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
