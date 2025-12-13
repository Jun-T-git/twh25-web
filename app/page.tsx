'use client';

import { useUser } from '@/app/contexts/UserContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as api from './game/lib/api';
import { RoomSummary } from './game/lib/api';

export default function Home() {
  const router = useRouter();
  const { registerUser } = useUser();
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');

  // Fetch API
  useEffect(() => {
    api.listRooms().then(setRooms).catch(console.error);
  }, [refreshKey]);

  const handleOpenCreate = () => {
    setMode('create');
    setDisplayName('');
    setShowModal(true);
  };

  const handleOpenJoin = (roomId: string) => {
    setMode('join');
    setSelectedRoomId(roomId);
    setDisplayName('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    try {
      let roomId = selectedRoomId;
      let userId = '';

      if (mode === 'create') {
        const res = await api.createRoom(displayName);
        roomId = res.roomId;
        userId = res.playerId;
      } else if (mode === 'join' && roomId) {
        const res = await api.joinRoom(roomId, displayName);
        userId = res.playerId;
      }

      if (roomId && userId) {
        // Persist User ID for the game page to pick up via Context
        registerUser(roomId, userId);
        router.push(`/game/${roomId}`);
      }
    } catch (error) {
      console.error('Failed to join/create:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800">
      
      {/* Background Image (Fixed) */}
      <div className="fixed inset-0 z-0">
         <Image
           src="/images/game-bg.jpg"
           alt="Background"
           fill
           priority
           className="object-cover object-center"
           quality={90}
         />
         <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center w-full max-w-md mx-auto min-h-screen px-4 py-12">
        
        {/* Title Image */}
        <div className="w-full max-w-[280px] animate-in fade-in slide-in-from-top-4 duration-700">
            <Image 
                src="/images/title.png"
                alt="おまえの町は俺の町"
                width={600}
                height={400}
                className="w-full h-auto drop-shadow-2xl filter saturate-110"
                priority
            />
        </div>

        {/* Tagline */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
           <div className="inline-block bg-white/70 backdrop-blur-md py-2 px-6 rounded-full border border-white/40 shadow-sm">
             <p className="text-lg font-bold text-slate-900 drop-shadow-sm">
               自分の未来を、切り開け。
             </p>
           </div>
        </div>

        {/* Create Room Button */}
        <button
          onClick={handleOpenCreate}
          className="w-full mb-8 group relative transform transition-all active:scale-95 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
        >
          {/* Shadow/Depth Layer */}
          <span className="absolute inset-0 bg-blue-700 rounded-full translate-y-1.5 translate-x-0 transition-transform group-active:translate-y-0.5" />
          
          {/* Button Face */}
          <span className="relative bg-gradient-to-br from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-white font-black text-xl py-4 px-8 rounded-full border-t border-l border-white/40 border-b-4 border-blue-800/20 shadow-xl flex items-center justify-center gap-3 transition-transform group-active:translate-y-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 drop-shadow-sm" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
            </svg>
            <span className="flex flex-col items-start leading-none drop-shadow-sm text-shadow-sm">
                <span>新規会議を立ち上げる</span>
                <span className="text-[10px] font-normal opacity-90 tracking-wider mt-0.5">(Create Room)</span>
            </span>
          </span>
        </button>

        {/* Room List Card */}
        <div className="w-full bg-white/85 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/60 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/60">
              <h2 className="text-lg font-black text-slate-800">
                  開催中の会議
              </h2>
              <button 
                  onClick={() => setRefreshKey(prev => prev + 1)} 
                  className="p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-100 rounded-full transition-all"
                  aria-label="Refresh list"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
              </button>
          </div>

          <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto pr-1">
             {rooms.length === 0 ? (
                 <div className="text-center py-8 text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-xl">
                     <p>現在開催中の会議はありません</p>
                 </div>
             ) : (
                rooms.map((room, index) => (
                    <div 
                        key={room.roomId}
                        onClick={() => room.status === 'LOBBY' && handleOpenJoin(room.roomId)}
                        className={`relative bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm transition-all cursor-pointer flex items-center justify-between group
                            ${room.status === 'LOBBY' ? 'hover:border-green-400 hover:shadow-md hover:bg-white active:scale-[0.99]' : 'opacity-70 bg-slate-100/50'}`}
                    >
                        <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-bold text-base text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                {index + 1}) {room.hostName}の町
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-slate-500 font-bold text-xs">
                                <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    {room.playerCount}/4
                                </span>
                            </div>
                        </div>

                        <div className="flex-shrink-0">
                            {room.status === 'LOBBY' ? (
                                <span className="bg-[#4ADE80] text-white font-black text-xs px-3 py-1 rounded-full shadow-sm">
                                    募集中
                                </span>
                            ) : (
                                <div className="border border-red-500 bg-red-50 text-red-500 font-black text-xs px-2 py-0.5 transform -rotate-6 rounded opacity-90 select-none">
                                    満員御礼
                                </div>
                            )}
                        </div>
                    </div>
                ))
             )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <h2 className="text-xl font-black mb-6 text-slate-800 text-center">
                        {mode === 'create' ? '新規会議を立ち上げ' : '会議に参加する'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">
                                プレイヤー名
                            </label>
                            <input 
                                type="text" 
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-sky-500 focus:outline-none transition-all font-bold text-lg"
                                placeholder="名前を入力..."
                                autoFocus
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                中止
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 py-3 font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-md active:scale-95 transition-all"
                            >
                                OK
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
