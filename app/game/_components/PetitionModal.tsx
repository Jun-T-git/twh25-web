
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface PetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => Promise<{ approved: boolean; message: string }>;
}

export function PetitionModal({ isOpen, onClose, onSubmit }: PetitionModalProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ approved: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await onSubmit(text);
      setResult(res);
      if (res.approved) {
          setText('');
      }
    } catch (err) {
      console.error(err);
      alert('送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
      setResult(null);
      setText(''); // Reset text on close if desired, or keep draft
      onClose();
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
            onClick={handleClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.1, x: -120, y: 350 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.1, x: -120, y: 350 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm border-4 border-sky-100 pointer-events-auto max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
              {/* Result View */}
              {result ? (
                <div className="text-center animate-in fade-in zoom-in duration-300">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-inner ${result.approved ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                        {result.approved ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
                    </div>
                    
                    <h2 className="text-2xl font-black text-gray-800 mb-2">
                        {result.approved ? '政策が承認されました！' : '政策が却下されました'}
                    </h2>
                    
                    <div className={`p-4 rounded-xl mb-4 text-left text-sm font-bold border-2 ${result.approved ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                        {result.message}
                    </div>

                    {result.approved && (
                        <p className="text-xs text-gray-500 bg-gray-100 p-3 rounded-lg mb-6 leading-relaxed">
                            この政策は、今後のターンで<br/>
                            <span className="font-bold text-sky-600">政策カードの候補</span>として<br/>
                            登場する可能性があります。
                        </p>
                    )}

                    <button 
                        onClick={handleClose}
                        className="mt-4 w-full py-3 bg-sky-50 text-sky-600 font-bold rounded-lg hover:bg-sky-100 transition-transform active:scale-95"
                    >
                        閉じる
                    </button>
                </div>
              ) : (
                /* Input View */
                <>
                    <h3 className="text-sky-900 font-bold text-xl mb-4 border-b pb-2 border-sky-50 flex items-center justify-center">
                        <div className="p-1 rounded-full bg-sky-100 mr-2">
                           <Sparkles size={18} className="text-sky-500" />
                        </div>
                        政策を提案する
                    </h3>

                    <div className="mb-4 text-center">
                        <p className="text-xs font-bold text-sky-600 bg-sky-50 inline-block px-3 py-1 rounded-full border border-sky-100">
                            ※この権利はゲーム中1回のみ使えます
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-500 mb-1 ml-1 text-left">
                                政策内容
                            </label>
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="例：徴兵令を発令して軍備を強化しましょう。"
                                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all outline-none resize-none h-36 text-lg font-bold text-gray-800 placeholder:text-gray-300 placeholder:font-normal"
                                maxLength={20}
                                required
                            />
                            <div className="absolute bottom-3 right-3 text-xs font-bold" style={{ color: text.length >= 20 ? '#ef4444' : '#9ca3af' }}>
                                {text.length}/20
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting || !text.trim()}
                                className="w-full py-4 bg-sky-500 text-white font-black rounded-xl shadow-lg shadow-sky-200 hover:bg-sky-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={20} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                        提案を提出！
                                    </>
                                )}
                            </button>
                            <button 
                                type="button"
                                onClick={handleClose}
                                className="w-full py-3 bg-sky-50 text-sky-600 font-bold rounded-lg hover:bg-sky-100"
                            >
                                キャンセル
                            </button>
                        </div>
                    </form>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
