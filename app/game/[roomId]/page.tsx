'use client';

import { MOCK_POLICIES } from '@/app/api/_mock/data';
import { PlayerData, RoomData } from '@/app/types/firestore';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { GameFooter } from '../_components/GameFooter';
import { GameHeader } from '../_components/GameHeader';
import { PlayerStatus } from '../_components/PlayerStatus';
import { PolicyCardCarousel } from '../_components/PolicyCardCarousel';
import * as api from '../lib/api';
import { CityStats, Player, PolicyCard } from '../types';

const AVATAR_SEEDS = [
  'Felix', 'Aneka', 'Zack', 'Midnight', 'Luna', 'Spooky', 'Bandit', 'Abby',
  'Coco', 'Willow', 'Bear', 'Tiger', 'Leo', 'Simba', 'Pepper', 'Whiskers'
];

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;

  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [playersData, setPlayersData] = useState<Record<string, PlayerData>>({});
  
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinName, setJoinName] = useState('');

  const isResolvingRef = useRef(false);

  // 1. Initialize & Restore Session
  useEffect(() => {
    if (!roomId) return;
    
    const storedUserId = localStorage.getItem(`user_${roomId}`);
    if (storedUserId) {
        setMyUserId(storedUserId);
    } else {
        // No session found, prompt to join
        setShowJoinModal(true);
    }
    setIsLoading(false);
  }, [roomId]);

  // 2. Real-time Subscription
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = api.subscribeToRoom(roomId, (data) => {
        const { room, players } = data;
        setRoomData(room);
        setPlayersData(players);

        // Reset resolving lock if not in VOTING state
        if (room.status !== 'VOTING') {
            isResolvingRef.current = false;
        }

        // Check if my vote is recorded
        if (myUserId && room.votes && room.votes[myUserId]) {
            setHasVoted(true);
        } else {
            setHasVoted(false);
        }

        // Host Logic: Auto-resolve votes (Demo helper)
        if (myUserId && players[myUserId]?.isHost && room.status === 'VOTING') {
            const voterCount = Object.keys(room.votes || {}).length;
            const playerCount = Object.keys(players).length;
            if (playerCount > 0 && voterCount === playerCount) {
                if (!isResolvingRef.current) {
                    isResolvingRef.current = true;
                    setTimeout(() => {
                        api.resolveVotes(roomId).catch(err => {
                            console.error('Resolve failed:', err);
                            isResolvingRef.current = false;
                        });
                    }, 1000);
                }
            }
        }
    });

    return () => unsubscribe();
  }, [roomId, myUserId]);

  const handleJoinSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!joinName.trim()) return;
      try {
          const res = await api.joinRoom(roomId, joinName);
          localStorage.setItem(`user_${roomId}`, res.playerId);
          setMyUserId(res.playerId);
          setShowJoinModal(false);
      } catch (err) {
          console.error('Failed to join:', err);
          alert('参加に失敗しました');
      }
  };

  const handleVote = async () => {
    if (!roomId || !myUserId || !roomData) return;
    const policyId = roomData.currentPolicyIds[selectedCardIndex];
    if (!policyId) return;

    try {
        await api.votePolicy(roomId, myUserId, policyId);
        setHasVoted(true);
        
        // Mock Bot Logic for Demo: Trigger bots to vote if they haven't
        // Only host triggers this to avoid spam
        if (playersData[myUserId]?.isHost) {
             Object.values(playersData).forEach(async (p) => {
                // If player is a bot (contains "(Bot)") and hasn't voted yet
                if (p.displayName.includes('(Bot)') && !roomData.votes[p.id]) {
                     const randomPolicy = roomData.currentPolicyIds[Math.floor(Math.random() * roomData.currentPolicyIds.length)];
                     await api.votePolicy(roomId, p.id, randomPolicy);
                }
            });
        }
    } catch (err) {
        console.error('Vote failed:', err);
        setHasVoted(false);
    }
  };
  
  // Host Actions
  const handleAddBot = async () => {
      if (!myUserId) return;
      const botNames = ['ゆい', 'れん', '健太先生'];
      const randomName = botNames[Math.floor(Math.random() * botNames.length)];
      try {
          const { playerId: botId } = await api.joinRoom(roomId, `${randomName} (Bot)`);
          await api.toggleReady(roomId, botId);
      } catch (err) {
          console.error(err);
      }
  };

  const handleStartGame = async () => {
      if (!myUserId) return;
      try {
          // Ready myself first
          await api.toggleReady(roomId, myUserId);
          await api.startGame(roomId, myUserId);
      } catch (err) {
          console.error('Failed to start:', err);
      }
  };

  if (isLoading || (!roomData && !showJoinModal)) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-zinc-100">
              <div className="text-xl font-bold text-zinc-500 animate-pulse">
                  読み込み中...
              </div>
          </div>
      );
  }

  // Join Modal
  if (showJoinModal) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">街に参加する</h2>
                <form onSubmit={handleJoinSubmit}>
                    <input 
                        type="text" 
                        value={joinName}
                        onChange={e => setJoinName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 mb-4"
                        placeholder="プレイヤー名"
                        required
                    />
                    <button type="submit" className="w-full bg-sky-500 text-white font-bold py-3 rounded-lg hover:bg-sky-400">
                        参加
                    </button>
                    <button type="button" onClick={() => router.push('/')} className="w-full mt-2 text-slate-500 py-2 hover:underline">
                        トップへ戻る
                    </button>
                </form>
            </div>
        </div>
      );
  }

  if (!roomData) return null;

  // --- LOBBY VIEW ---
  if (roomData.status === 'LOBBY') {
      const isHost = playersData[myUserId!]?.isHost;
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans p-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg text-center">
                <h1 className="text-2xl font-black text-slate-800 mb-2">待合室</h1>
                <p className="text-slate-500 mb-6">ID: {roomId}</p>
                
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                    {Object.values(playersData).map(p => (
                        <span key={p.id} className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full font-bold text-sm">
                            {p.displayName} {p.isHost && '👑'}
                        </span>
                    ))}
                </div>

                {isHost ? (
                    <div className="flex flex-col gap-3">
                         <button onClick={handleAddBot} className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 font-bold rounded-xl hover:bg-slate-50">
                            + BOTを追加
                        </button>
                        <button 
                            onClick={handleStartGame} 
                            disabled={Object.keys(playersData).length !== 4}
                            className={`w-full py-4 font-bold rounded-xl shadow-lg text-lg transition-all ${
                                Object.keys(playersData).length === 4 
                                ? 'bg-sky-500 text-white hover:bg-sky-400' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {Object.keys(playersData).length === 4 ? 'ゲーム開始' : '4人揃うと開始できます'}
                        </button>
                    </div>
                ) : (
                    <div className="text-slate-500 font-bold animate-pulse">
                        ホストがゲームを開始するのを待っています...
                    </div>
                )}
            </div>
        </div>
      );
  }

  // --- GAME VIEW ---

  // Mappers
  const stats: CityStats = roomData.cityParams;
  const uiPlayers: Player[] = Object.values(playersData).map((p) => {
      const isMe = p.id === myUserId;
      const seedIndex = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_SEEDS.length;
      return {
          id: p.id,
          name: isMe ? `${p.displayName} (あなた)` : p.displayName,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${AVATAR_SEEDS[seedIndex]}`,
          status: roomData.votes[p.id] ? 'voted' : 'thinking'
      };
  });

  const currentCards: PolicyCard[] = roomData.currentPolicyIds.map(id => {
      const master = MOCK_POLICIES.find(p => p.id === id);
      return {
          id: id,
          title: master?.title || 'Unknown',
          description: master?.description || '...',
          imageUrl: `https://source.unsplash.com/random/800x600?sig=${id}` 
      }
  });

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans text-gray-900 pb-24">
      {/* Background */}
      <div className="absolute inset-0 z-0">
         <Image 
           src="/images/game-bg.jpg"
           alt="City Background"
           fill
           priority
           className="object-cover object-bottom opacity-80"
           quality={80}
         />
      </div>
      <div className="absolute inset-0 z-0 pointer-events-none" />

      <main className="relative z-10 flex flex-col h-full overflow-y-auto no-scrollbar">
        <GameHeader
            turn={roomData.turn}
            totalTurns={roomData.maxTurns}
            stats={stats}
        />

        <div className="mt-4">
            <PlayerStatus players={uiPlayers} />
        </div>

        <div className="flex-1 flex flex-col justify-center my-4">
            {roomData.status === 'VOTING' && (
                <PolicyCardCarousel
                    cards={currentCards}
                    selectedIndex={selectedCardIndex}
                    onSelect={setSelectedCardIndex}
                />
            )}
            
            {roomData.status === 'RESULT' && roomData.lastResult && (
                <div className="mx-4 p-6 bg-white/90 backdrop-blur rounded-2xl shadow-xl border-4 border-yellow-400 text-center animate-in fade-in zoom-in duration-500">
                    <h2 className="text-lg font-bold text-gray-500 mb-2">可決された政策</h2>
                    <h1 className="text-2xl font-black text-gray-800 mb-4">{roomData.lastResult.passedPolicyTitle}</h1>
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                        <p className="font-bold text-yellow-800 text-sm mb-1">NEWS FLASH</p>
                        <p className="text-gray-700 leading-relaxed">{roomData.lastResult.newsFlash}</p>
                    </div>
                </div>
            )}

            {roomData.status === 'FINISHED' && (
                  <div className="mx-4 p-6 bg-white/95 backdrop-blur rounded-2xl shadow-xl border-4 border-indigo-500 text-center max-h-[80vh] overflow-y-auto">
                    <h1 className="text-3xl font-black text-indigo-900 mb-2">GAME SET</h1>
                    {roomData.gameResult && (
                        <>
                            <p className="text-lg text-indigo-700 font-bold mb-6">{roomData.gameResult.citySummary}</p>
                            
                            <div className="space-y-3 mb-8">
                                {roomData.gameResult.rankings.map((r, i) => (
                                   <div key={r.playerId} className={`flex items-center p-4 rounded-xl ${i===0 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-slate-50 border border-slate-200'}`}>
                                       <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-white mr-3 ${i===0 ? 'bg-yellow-500' : 'bg-slate-400'}`}>
                                         {i+1}
                                       </div>
                                       <div className="flex-1 text-left">
                                           <div className="font-bold text-slate-800">{r.playerName}</div>
                                           <div className="text-xs text-slate-500">{r.ideologyName}</div>
                                       </div>
                                       <div className="text-xl font-black text-indigo-600">
                                           {r.score}pt
                                       </div>
                                   </div> 
                                ))}
                            </div>
                        </>
                    )}
                    <button onClick={() => router.push('/')} className="w-full px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-500 transition-transform active:scale-95">
                        トップへ戻る
                    </button>
                </div>
            )}
        </div>
      </main>

      {/* Footer Actions */}
      {roomData.status === 'VOTING' && (
        <GameFooter
            onVote={handleVote}
            hasVoted={hasVoted}
            myWinCondition="環境スコアを80以上に保ち、ゲーム終了を迎える。"
        />
      )}
      
      {/* Host Controls */}
      {roomData.status === 'RESULT' && playersData[myUserId!]?.isHost && (
           <div className="fixed bottom-8 w-full flex justify-center z-50">
               <button 
                onClick={() => api.nextTurn(roomId!)}
                className="bg-sky-500 text-white font-bold py-3 px-8 rounded-full shadow-xl hover:bg-sky-400 transition-transform active:scale-95"
               >
                 次のターンへ進む
               </button>
          </div>
      )}
    </div>
  );
}



