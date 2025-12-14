'use client';

import { useUser } from '@/app/contexts/UserContext';
import { MasterIdeology, MasterPolicy, PlayerData, RoomData } from '@/app/types/firestore';
import { ChevronsDown, ChevronsUp, History, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GameFooter } from '../_components/GameFooter';
import { GameHeader } from '../_components/GameHeader';
import { PetitionModal } from '../_components/PetitionModal';
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

  // Petition State
  const [showPetitionModal, setShowPetitionModal] = useState(false);

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
    if (!roomData) return;

    const fetchPolicies = async () => {
        const currentIds = roomData.currentPolicyIds || [];
        const passedIds = roomData.passedPolicyIds || [];
        const allIds = Array.from(new Set([...currentIds, ...passedIds]));

        const missingIds = allIds.filter(id => !loadedPolicies[id]);
        if (missingIds.length === 0) return;

        try {
            const policies = await api.getPolicies(missingIds);
            setLoadedPolicies(prev => {
                const next = { ...prev };
                policies.forEach(p => {
                    next[p.id] = p;
                });
                return next;
            });
        } catch (err) {
            console.error('Failed to fetch policies:', err);
        }
    };

    fetchPolicies();
  }, [roomData?.currentPolicyIds, roomData?.passedPolicyIds, loadedPolicies]);

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

  // 5. Auto-select Passed Policy in RESULT
  useEffect(() => {
    if (roomData?.status === 'RESULT' && roomData.lastResult?.passedPolicyId && roomData.currentPolicyIds) {
        const index = roomData.currentPolicyIds.indexOf(roomData.lastResult.passedPolicyId);
        if (index >= 0) {
            setSelectedCardIndex(index);
        }
    }
  }, [roomData?.status, roomData?.lastResult?.passedPolicyId, roomData?.currentPolicyIds]);

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

  const handlePetitionSubmit = async (text: string) => {
    if (!roomId || !myUserId) {
        throw new Error("プレイヤー情報が見つかりません");
    }
    return await api.proposePetition(roomId, myUserId, text);
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

  const passedCards: PolicyCard[] = (roomData.passedPolicyIds || []).map(id => {
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

  const PARAM_LABELS: Record<string, string> = {
    economy: '経済',
    welfare: '福祉',
    education: '教育',
    security: '治安',
    humanRights: '人権',
    environment: '環境'
  };

  const PARAM_STYLES: Record<string, string> = {
    economy: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    welfare: 'bg-pink-100 text-pink-700 border-pink-200',
    education: 'bg-blue-100 text-blue-700 border-blue-200',
    security: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    humanRights: 'bg-purple-100 text-purple-700 border-purple-200',
    environment: 'bg-green-100 text-green-700 border-green-200'
  };

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

            {/* Unified Policy Carousel for Voting & Result to ensure seamless transition */}
            {(roomData.status === 'VOTING' || (roomData.status === 'RESULT' && roomData.lastResult)) && (
                <div className="flex-1 flex flex-col justify-center relative w-full">
                    <PolicyCardCarousel
                        cards={currentCards}
                        selectedIndex={selectedCardIndex}
                        onSelect={setSelectedCardIndex}
                        getBadge={roomData.status === 'RESULT' && roomData.lastResult ? (card, index, isActive) => {
                            const myVote = myUserId && roomData.lastResult!.voteDetails?.[myUserId] === card.id;
                            
                            return (
                                <div className="flex flex-col gap-1 items-end">
                                    {myVote && (
                                         <span className="bg-sky-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md border border-white/20">
                                            あなたが投票
                                         </span>
                                    )}
                                </div>
                            );
                        } : undefined}
                        getOverlay={roomData.status === 'RESULT' && roomData.lastResult ? (card, index, isActive) => {
                             const isPassed = card.id === roomData.lastResult!.passedPolicyId;
                             
                             if (isPassed) {
                                return (
                                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                        <div className="border-[6px] border-red-600 text-red-600 font-black text-6xl px-6 py-2 rounded-xl -rotate-12 opacity-90 shadow-lg bg-white/20 backdrop-blur-sm tracking-widest animate-in fade-in zoom-in duration-300">
                                            可決
                                        </div>
                                    </div>
                                );
                             } else {
                                // Gray out rejected cards
                                return (
                                    <div className="absolute inset-0 bg-slate-500/30 backdrop-grayscale z-0 pointer-events-none transition-all duration-500" />
                                );
                             }
                        } : undefined}
                    />
                    
                    {/* Result News Flash - Animated In */}
                    {roomData.status === 'RESULT' && roomData.lastResult && (
                         <div className="flex justify-center w-full mt-4">
                            <div className="mx-4 p-5 bg-yellow-50/95 backdrop-blur rounded-xl border-2 border-yellow-200 w-full max-w-md shadow-lg relative z-20 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="absolute -top-3 left-4 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded shadow-sm">
                                    本日のニュース！
                                </div>
                                <p className="text-gray-800 font-medium leading-relaxed mt-1 text-left">
                                    {roomData.lastResult.newsFlash}
                                </p>
                            </div>
                         </div>
                    )}
                </div>
            )}

            {roomData.status === 'FINISHED' && (
                  <div className="mx-4 p-6 bg-white/95 backdrop-blur rounded-2xl shadow-xl border-4 border-sky-500 text-center max-h-[85vh] overflow-y-auto no-scrollbar scroll-smooth">
                    <h1 className="text-3xl font-black text-sky-900 mb-6">GAME SET</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-sky-100">
                            <div>
                            <h3 className="text-lg font-bold text-sky-900 mb-4 flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-yellow-500" />
                                <span>最終結果</span>
                            </h3>
                            
                            {roomData.gameResult?.citySummary && (
                                <div className="mb-6 bg-sky-50 p-4 rounded-xl text-left border border-sky-100">
                                    <p className="text-sm font-bold text-sky-400 mb-1">CITY REPORT</p>
                                    <p className="font-bold text-sky-800 leading-relaxed">
                                        {roomData.gameResult.citySummary}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3">
                                {Object.values(playersData)
                                    .map(p => {
                                        let ideologyId: string | undefined;
                                        if (typeof p.ideology === 'string') ideologyId = p.ideology;
                                        else if (p.ideology) ideologyId = (p.ideology as any).id || (p.ideology as any).ideologyId;
                                        
                                        const ideology = ideologyId ? loadedIdeologies[ideologyId] : null;
                                        
                                        let score = 0;
                                        if (ideology && ideology.coefficients) {
                                            score = (['economy', 'welfare', 'education', 'security', 'humanRights', 'environment'] as const).reduce((acc, key) => {
                                                const paramVal = roomData.cityParams[key] || 0;
                                                const coef = ideology.coefficients[key] || 0;
                                                return acc + (paramVal * coef);
                                            }, 0);
                                        }
                                        return {
                                            playerId: p.id,
                                            playerName: p.displayName,
                                            ideologyName: ideology?.name || 'Unknown',
                                            score
                                        };
                                    })
                                    .sort((a, b) => b.score - a.score)
                                    .map((r, i) => (
                                        <div key={r.playerId} className={`flex items-center p-4 rounded-xl ${i===0 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-slate-50 border border-slate-200'}`}>
                                            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-white mr-3 ${i===0 ? 'bg-yellow-500' : 'bg-slate-400'}`}>
                                                {i+1}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="font-bold text-slate-800">{r.playerName}</div>
                                                <div className="text-xs text-slate-500">{r.ideologyName}</div>
                                            </div>
                                            <div className="text-xl font-black text-sky-600">
                                                {Math.round(r.score)}pt
                                            </div>
                                        </div> 
                                    ))
                                }
                            </div>
                            </div>

                            {/* Passed Policies Timeline */}
                            <div className="text-left w-full overflow-hidden">
                              <h3 className="text-lg font-bold text-sky-900 mb-4 flex items-center gap-2 pl-4">
                                  <History className="w-6 h-6 text-sky-600" />
                                  <span>可決された政策</span>
                              </h3>
                              
                              {(roomData.passedPolicyIds || []).length > 0 ? (
                                <div className="space-y-4 px-4">
                                  {passedCards.map((card, index) => {
                                      const policy = loadedPolicies[card.id];
                                      if (!policy) return null;

                                      return (
                                          <div key={card.id} className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 text-left shadow-sm">
                                              <div className="flex justify-between items-start mb-2">
                                                  <h4 className="font-bold text-lg text-slate-800">{policy.title}</h4>
                                                  <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded whitespace-nowrap ml-2 h-fit">
                                                      {index + 1}ターン目
                                                  </span>
                                              </div>
                                              
                                              <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                                                  {policy.description}
                                              </p>

                                              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-3">
                                                  <div className="text-xs font-bold text-yellow-600 mb-1 flex items-center gap-1">
                                                      <span>NEWS</span>
                                                  </div>
                                                  <p className="text-sm font-medium text-slate-800">
                                                      {policy.newsFlash}
                                                  </p>
                                              </div>

                                              <div className="flex flex-wrap gap-2">
                                                  {(['economy', 'welfare', 'education', 'security', 'humanRights', 'environment'] as const).map(key => {
                                                      const val = policy.effects?.[key];
                                                      if (!val) return null;
                                                      
                                                      const label = PARAM_LABELS[key];
                                                      const style = PARAM_STYLES[key];
                                                      return (
                                                          <span key={key} className={`text-xs font-bold px-2 py-1 rounded border flex items-center gap-0.5 ${style}`}>
                                                              {label}
                                                              {val > 0 ? (
                                                                  <ChevronsUp size={14} strokeWidth={3} className="text-green-600" />
                                                              ) : (
                                                                  <ChevronsDown size={14} strokeWidth={3} className="text-red-500" />
                                                              )}
                                                          </span>
                                                      );
                                                  })}
                                              </div>
                                          </div>
                                      );
                                  })}
                                </div>
                              ) : (
                                <div className="px-4 text-gray-500">採用された政策はありません。</div>
                              )}

                            </div>
                    </div>

                    <button onClick={() => router.push('/')} className="w-full px-6 py-4 bg-sky-500 text-white font-bold rounded-xl shadow-lg hover:bg-sky-400 transition-transform active:scale-95 sticky bottom-0 z-20">
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
            defaultOpen={roomData.turn === 1}
            onPetition={() => setShowPetitionModal(true)}
            isPetitionUsed={playersData[myUserId!]?.isPetitionUsed}
        />
      )}
      
      {/* Petition Modal */}
      <PetitionModal 
          isOpen={showPetitionModal}
          onClose={() => setShowPetitionModal(false)}
          onSubmit={handlePetitionSubmit}
      />

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
