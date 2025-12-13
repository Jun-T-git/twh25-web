'use client';

import { useUser } from '@/app/contexts/UserContext';
import { MasterIdeology, MasterPolicy, PlayerData, RoomData } from '@/app/types/firestore';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

  const { userId: myUserId, registerUser, loadUser } = useUser();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [playersData, setPlayersData] = useState<Record<string, PlayerData>>({});
  const [loadedPolicies, setLoadedPolicies] = useState<Record<string, MasterPolicy>>({});
  const [loadedIdeologies, setLoadedIdeologies] = useState<Record<string, MasterIdeology>>({});
  
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinName, setJoinName] = useState('');



  // 1. Initialize & Restore Session
  useEffect(() => {
    if (!roomId) return;
    
    // Attempt to load user from context/local storage
    const loadedId = loadUser(roomId);
    
    if (!loadedId) {
         // No session found, prompt to join
         setShowJoinModal(true);
    }
    
    // Set loading to false
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // 2. Real-time Subscription
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = api.subscribeToRoom(roomId, (data) => {
        const { room, players } = data;
        setRoomData(room);
        setPlayersData(players);



        // Check if my vote is recorded
        if (myUserId && room.votes && room.votes[myUserId]) {
            setHasVoted(true);
        } else {
            setHasVoted(false);
        }


    });

    return () => unsubscribe();
  }, [roomId, myUserId]);

  // 3. Fetch Policies
  useEffect(() => {
    if (!roomData?.currentPolicyIds) return;

    const fetchPolicies = async () => {
        const missingIds = roomData.currentPolicyIds.filter(id => !loadedPolicies[id]);
        if (missingIds.length === 0) return;

        try {
            const policies = await api.getPolicies(missingIds);
            const newPolicies = { ...loadedPolicies };
            policies.forEach(p => {
                newPolicies[p.id] = p;
            });
            setLoadedPolicies(newPolicies);
        } catch (err) {
            console.error('Failed to fetch policies:', err);
        }
    };

    fetchPolicies();
  }, [roomData?.currentPolicyIds, loadedPolicies]);

  // 4. Fetch Ideologies
  useEffect(() => {
    const fetchIdeologies = async () => {
        const ideologyIds = new Set<string>();
        Object.values(playersData).forEach(p => {
            if (!p.ideology) return;
            if (typeof p.ideology === 'string') {
                ideologyIds.add(p.ideology);
            } else if (typeof p.ideology === 'object') {
                 // We already have the data, ensure it's in loadedIdeologies
                 // Careful: The object from backend might satisfy MasterIdeology or be slightly different
                 // The log showed: { ideologyId: '...', ... }
                 // Check if it has 'id' or 'ideologyId'
                 const i = p.ideology as MasterIdeology & { ideologyId?: string };
                 const id = i.id || i.ideologyId;
                 
                 // Only update if id exists and not already loaded to prevent infinite loops
                 if (id && !loadedIdeologies[id]) {
                     setLoadedIdeologies(prev => ({
                         ...prev,
                         [id]: { ...i, id } 
                     }));
                 }
            }
        });

        const missingIds = Array.from(ideologyIds).filter(id => !loadedIdeologies[id]);
        if (missingIds.length === 0) return;

        try {
            const ideologies = await api.getIdeologies(missingIds);
            const newIdeologies = { ...loadedIdeologies };
            ideologies.forEach(i => {
                newIdeologies[i.id] = i;
            });
            setLoadedIdeologies(newIdeologies);
        } catch (err) {
            console.error('Failed to fetch ideologies:', err);
        }
    };

    fetchIdeologies();
  }, [playersData, loadedIdeologies]);



  const handleJoinSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!joinName.trim()) return;
      try {
          const res = await api.joinRoom(roomId, joinName);
          // Update Context instead of local state
          registerUser(roomId, res.playerId);
          
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
    } catch (err) {
        console.error('Vote failed:', err);
        setHasVoted(false);
    }
  };
  
  // Host Actions

  const handleStartGame = async () => {
      if (!myUserId) return;
      try {
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



  // --- GAME VIEW ---

  // Mappers
  const stats: CityStats = roomData.cityParams;
  const uiPlayers: Player[] = Object.values(playersData).map((p) => {
      const isMe = p.id === myUserId;
      const seedIndex = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_SEEDS.length;
      const hasVoted = roomData.votes && roomData.votes[p.id];
      let status: Player['status'] = 'thinking';
      if (roomData.status === 'LOBBY') {
           status = 'waiting';
      } else if (hasVoted) {
           status = 'voted';
      }

      return {
          id: p.id,
          name: isMe ? `${p.displayName} (あなた)` : p.displayName,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${AVATAR_SEEDS[seedIndex]}`,
          status: status
      };
  });

  const currentCards: PolicyCard[] = (roomData.currentPolicyIds || []).map(id => {
      const master = loadedPolicies[id];
      return {
          id: id,
          title: master?.title || 'Unknown Policy',
          description: master?.description || 'Loading...',
          imageUrl: undefined
      }
  });

  /* Player Ideology Resolution */
  const myPlayer = playersData[myUserId || ''];
  const myIdeology = myPlayer?.ideology 
    ? (() => {
        let ideologyId: string | undefined;
        let ideologyObj: MasterIdeology | undefined;

        if (typeof myPlayer.ideology === 'string') {
            ideologyId = myPlayer.ideology;
        } else if (typeof myPlayer.ideology === 'object') {
            // Assume object has id or ideologyId
            const i = myPlayer.ideology as MasterIdeology & { ideologyId?: string };
            ideologyId = i.id || i.ideologyId;
            ideologyObj = { ...i, id: ideologyId || '' };
        }

        if (!ideologyId && !ideologyObj) return undefined;

        const i = (ideologyId ? loadedIdeologies[ideologyId] : undefined) || ideologyObj;
        return i ? { ...i, coefficients: i.coefficients as Record<string, number> } : undefined;
      })()
    : undefined;

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
            {roomData.status === 'LOBBY' && (
                <div className="mx-4 p-6 bg-white/90 backdrop-blur rounded-2xl shadow-xl border-4 text-center animate-in fade-in zoom-in duration-500 border-sky-400">
                     <h2 className="text-lg font-bold text-sky-600 mb-2">待合室</h2>
                     <h1 className="text-3xl font-black text-gray-800 mb-2">参加者募集中</h1>
                     <p className="text-gray-500 mb-6 font-mono bg-gray-100 inline-block px-4 py-1 rounded-full">ID: {roomId}</p>
                     
                     <div className="mb-6">
                         <p className="text-sm font-bold text-gray-400 mb-1">現在の参加人数</p>
                         <p className="text-4xl font-black text-sky-500">{Object.keys(playersData).length} <span className="text-lg text-gray-400">/ 4</span></p>
                     </div>
 
                     {playersData[myUserId!]?.isHost ? (
                        <div className="flex flex-col gap-3">
                             <button 
                                 onClick={handleStartGame} 
                                 disabled={Object.keys(playersData).length !== 4}
                                 className={`w-full py-4 font-bold rounded-xl shadow-lg text-lg transition-transform active:scale-95 ${
                                     Object.keys(playersData).length === 4 
                                     ? 'bg-sky-500 text-white hover:bg-sky-400 animate-pulse' 
                                     : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                 }`}
                             >
                                 {Object.keys(playersData).length === 4 ? 'ゲーム開始' : '4人揃うと開始できます'}
                             </button>
                        </div>
                     ) : (
                         <div className="py-4 bg-sky-50 rounded-xl border border-sky-100">
                             <p className="text-sky-600 font-bold animate-pulse">
                                 ホストがゲームを開始するのを待っています...
                             </p>
                         </div>
                     )}
                </div>
            )}

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
            ideology={myIdeology}
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

      {/* Guest Waiting Message in RESULT */}
      {roomData.status === 'RESULT' && !playersData[myUserId!]?.isHost && (
           <div className="fixed bottom-8 w-full flex justify-center z-50 pointer-events-none">
             <div className="bg-slate-800/80 backdrop-blur text-white px-8 py-4 rounded-full animate-pulse shadow-lg font-bold border border-white/20">
               ホストが次のターンに進むのを待っています...
             </div>
           </div>
      )}
    </div>
  );
}



