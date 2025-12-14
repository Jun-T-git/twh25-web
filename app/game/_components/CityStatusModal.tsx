
import { AnimatePresence, motion } from 'framer-motion';
import { AreaChart, X } from 'lucide-react';
import Image from 'next/image';
import { CityStats } from '../types';

interface CityStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityImageUrl?: string;
  stats: CityStats;
}

export function CityStatusModal({ isOpen, onClose, cityImageUrl, stats }: CityStatusModalProps) {
  
  // Radar Chart Components
  const categories = [
    { key: 'economy', label: '経済' },
    { key: 'welfare', label: '福祉' },
    { key: 'education', label: '教育' },
    { key: 'security', label: '治安' },
    { key: 'humanRights', label: '人権' },
    { key: 'environment', label: '環境' },
  ] as const;

  const getPoints = () => {
    const total = categories.length;
    const radius = 65; 
    const centerX = 100;
    const centerY = 100;

    return categories.map((cat, i) => {
      const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
      // Map 0..100 to 0..radius
      const val = stats[cat.key] ?? 50;
      const normalized = Math.max(0, Math.min(100, val)) / 100;
      const r = normalized * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const getAxisLine = (i: number) => {
    const total = categories.length;
    const radius = 65;
    const centerX = 100;
    const centerY = 100;
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x1: centerX, y1: centerY, x2: x, y2: y };
  }

  const getLabelPos = (i: number) => {
     const total = categories.length;
     const radius = 82; 
     const centerX = 100;
     const centerY = 100;
     const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
     const x = centerX + radius * Math.cos(angle);
     const y = centerY + radius * Math.sin(angle);
     
     let anchor: 'middle' | 'end' | 'start' = 'middle';
     if (x < 90) anchor = 'end';
     if (x > 110) anchor = 'start';
     return { x, y, anchor };
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
             onClick={onClose}
          />
          {/* Modal Content */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
              <motion.div
                  initial={{ opacity: 0, scale: 0.1, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.1, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-white p-6 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-sky-100 max-h-[90vh] overflow-y-auto pointer-events-auto mx-4"
                  onClick={e => e.stopPropagation()}
              >
                 <div className="flex justify-between items-center mb-4 border-b border-sky-50 pb-2">
                    <h3 className="text-sky-900 font-bold text-xl flex items-center">
                        <AreaChart className="w-5 h-5 mr-2 text-sky-500" />
                        現在の街の状況
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                        <X size={20} />
                    </button>
                 </div>

                 {/* City Image */}
                 {cityImageUrl && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md mb-6 bg-slate-100">
                         <Image 
                            src={cityImageUrl}
                            alt="Current City"
                            fill
                            className="object-cover"
                            unoptimized={true}
                         />
                    </div>
                 )}
                  
                  {/* Radar Chart */}
                  <div className="relative w-full aspect-square max-w-[240px] mx-auto mb-2">
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                          {/* Grid Circles (0, 25, 50, 75, 100) */}
                          <circle cx="100" cy="100" r="16.25" fill="none" stroke="#e2e8f0" strokeWidth="1" /> 
                          <circle cx="100" cy="100" r="32.5" fill="none" stroke="#e2e8f0" strokeWidth="1" /> 
                          <circle cx="100" cy="100" r="48.75" fill="none" stroke="#e2e8f0" strokeWidth="1" /> 
                          <circle cx="100" cy="100" r="65" fill="none" stroke="#cbd5e1" strokeWidth="1" /> 
                          
                          {/* Axis Lines */}
                          {categories.map((_, i) => {
                              const { x1, y1, x2, y2 } = getAxisLine(i);
                              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth="1" />;
                          })}

                          {/* Data Polygon */}
                              <polygon 
                              points={getPoints()} 
                              fill="rgba(14, 165, 233, 0.4)" 
                              stroke="#0ea5e9" 
                              strokeWidth="2" 
                              />
                              
                          {categories.map((cat, i) => {
                              const { x, y, anchor } = getLabelPos(i);
                              const val = stats[cat.key] ?? 0;
                              
                              // Color logic: High > 70 = Green, Low < 30 = Red
                              const valColor = val >= 70 ? '#16a34a' : (val <= 30 ? '#ef4444' : '#64748b');
                              const fontWeight = (val >= 70 || val <= 30) ? '900' : 'bold';

                              return (
                                  <g key={cat.key}>
                                      <text 
                                          x={x} y={y} 
                                          textAnchor={anchor} 
                                          dominantBaseline="middle" 
                                          className="text-[10px] fill-sky-900 font-bold"
                                          style={{ fontSize: '10px' }}
                                      >
                                          {cat.label}
                                      </text>
                                  </g>
                              );
                          })}
                      </svg>
                  </div>

                  <div className="text-xs text-gray-400 mt-2 mb-4">
                       パラメータは0〜100で推移します
                  </div>

                  <button 
                    onClick={onClose}
                    className="w-full py-3 bg-sky-50 text-sky-600 font-bold rounded-lg hover:bg-sky-100 transition-colors"
                  >
                        閉じる
                  </button>
              </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
