'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as api from './game/lib/api';
import { RoomSummary } from './game/lib/api';

export default function Home() {
  const router = useRouter();
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
        // Persist User ID for the game page to pick up (Simple approach)
        // Ideally checking localStorage in GamePage.
        localStorage.setItem(`user_${roomId}`, userId);
        router.push(`/game/${roomId}`);
      }
    } catch (error) {
      console.error('Failed to join/create:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-6">Town Hall 2025</h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
          市民となり、議論し、未来の街をつくる。<br/>
          対話型シミュレーションゲーム。
        </p>
        <button 
          onClick={handleOpenCreate}
          className="bg-sky-500 hover:bg-sky-400 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg transition-transform active:scale-95"
        >
          ルームを作成して開始
        </button>
      </section>

      {/* Room List Section */}
      <section className="max-w-4xl mx-auto py-16 px-6">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-700">募集中・プレイ中のルーム</h2>
            <button onClick={() => setRefreshKey(prev => prev + 1)} className="text-sky-600 hover:underline">
                更新
            </button>
        </div>

        {rooms.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">
                ルームが見つかりません。新しく作成しましょう！
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2">
                {rooms.map(room => (
                    <div key={room.roomId} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-1 text-xs font-bold rounded ${room.status === 'LOBBY' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {room.status}
                            </span>
                            <span className="text-xs text-slate-400">ID: {room.roomId}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{room.hostName} の街</h3>
                        <p className="text-sm text-slate-500 mb-4">参加者: {room.playerCount}人</p>
                        
                        {room.status === 'LOBBY' ? (
                            <button 
                                onClick={() => handleOpenJoin(room.roomId)}
                                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                            >
                                参加する
                            </button>
                        ) : (
                             <button disabled className="w-full py-2 bg-slate-50 text-slate-300 font-bold rounded-lg cursor-not-allowed">
                                進行中
                            </button>
                        )}
                    </div>
                ))}
            </div>
        )}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">
                        {mode === 'create' ? '新しい街をつくる' : '街に参加する'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                プレイヤー名
                            </label>
                            <input 
                                type="text" 
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                placeholder="名前を入力..."
                                autoFocus
                                required
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button 
                                type="button" 
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                キャンセル
                            </button>
                            <button 
                                type="submit" 
                                className="px-6 py-2 font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-full shadow-lg transition-transform active:scale-95"
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
