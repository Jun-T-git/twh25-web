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
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans text-slate-900">
      {/* Background */}
      <div className="absolute inset-0 z-0">
         <Image 
           src="/images/game-bg.jpg"
           alt="City Background"
           fill
           priority
           className="object-cover object-bottom"
           quality={80}
         />
         <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 overflow-y-auto w-full">
          
        {/* Hero Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-5xl md:text-7xl font-black mb-4 text-white drop-shadow-2xl tracking-tight">
                Town Hall 2025
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium mb-10 drop-shadow-md">
                未来の街をつくる、対話型シミュレーション。
            </p>
            <button 
                onClick={handleOpenCreate}
                className="bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white text-xl font-bold py-5 px-12 rounded-full shadow-2xl transition-transform active:scale-95 border border-white/20 backdrop-blur-sm"
            >
                ✨ 新しい街をつくる
            </button>
        </div>

        {/* Room List Section */}
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-100">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    🏙 募集中・プレイ中の街
                </h2>
                <button 
                    onClick={() => setRefreshKey(prev => prev + 1)} 
                    className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors font-bold text-sm"
                >
                    🔄 更新
                </button>
            </div>

            {rooms.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-white/20 rounded-2xl text-white/60">
                    <p className="text-lg font-bold">ルームが見つかりません</p>
                    <p className="text-sm mt-2">「新しい街をつくる」からゲームを始めましょう！</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {rooms.map(room => (
                        <div key={room.roomId} className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-3 py-1 text-xs font-black rounded-full shadow-sm ${
                                    room.status === 'LOBBY' 
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                                    : 'bg-slate-200 text-slate-500'
                                }`}>
                                    {room.status === 'LOBBY' ? 'WAITING' : room.status}
                                </span>
                                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">ID: {room.roomId}</span>
                            </div>
                            <h3 className="font-bold text-xl text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                                {room.hostName} の街
                            </h3>
                            <div className="flex items-center text-sm text-slate-500 mb-5">
                                <span className="mr-2">👥</span> 参加者: <span className="font-bold ml-1">{room.playerCount}人</span>
                            </div>
                            
                            {room.status === 'LOBBY' ? (
                                <button 
                                    onClick={() => handleOpenJoin(room.roomId)}
                                    className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl shadow-md hover:bg-slate-700 transition-all active:scale-95"
                                >
                                    参加する
                                </button>
                            ) : (
                                <button disabled className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed border border-slate-200">
                                    進行中
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>

      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/50">
                <div className="p-8">
                    <h2 className="text-2xl font-black mb-6 text-slate-800 text-center">
                        {mode === 'create' ? '✨ 新しい街をつくる' : '👋 街に参加する'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">
                                プレイヤー名
                            </label>
                            <input 
                                type="text" 
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-bold text-lg"
                                placeholder="名前を入力..."
                                autoFocus
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                キャンセル
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 py-4 font-bold text-white bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 rounded-xl shadow-lg transition-transform active:scale-95"
                            >
                                {mode === 'create' ? '作成して開始' : '参加する'}
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
