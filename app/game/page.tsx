'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { GameFooter } from './_components/GameFooter';
import { GameHeader } from './_components/GameHeader';
import { PlayerStatus } from './_components/PlayerStatus';
import { PolicyCardCarousel } from './_components/PolicyCardCarousel';
import { CityStats, Player, PolicyCard } from './types';

const AVATAR_SEEDS = [
  'Felix', 'Aneka', 'Zack', 'Midnight', 'Luna', 'Spooky', 'Bandit', 'Abby',
  'Coco', 'Willow', 'Bear', 'Tiger', 'Leo', 'Simba', 'Pepper', 'Whiskers'
];

// TODO: Fetch available policy cards for the current turn
const CARDS: PolicyCard[] = [
  {
    id: 'c3',
    title: '市街地へのAI監視カメラ網構築',
    description: 'AI顔認証カメラを街中に設置し、指名手配犯の即時検知と犯罪抑止を行います。',
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'c1',
    title: '郊外型ショッピングモール誘致',
    description: '郊外に大規模なショッピングモールを建設します。経済効果は高いですが、商店街の衰退が懸念されます。',
    imageUrl: 'https://images.unsplash.com/photo-1519567241046-7f570eee3d9f?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'c2',
    title: '駅前緑化プロジェクト',
    description: '駅前の工場跡地を公園にします。環境と福祉が向上しますが、維持費がかかります。',
    imageUrl: 'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?q=80&w=800&auto=format&fit=crop',
  },
];


export default function GamePage() {
  // TODO: Sync current turn number from server state
  const [turn] = useState(3);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  // TODO: Check if the current user has already voted in this turn
  const [hasVoted, setHasVoted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    // Randomize avatar seeds without duplication
    const shuffledSeeds = [...AVATAR_SEEDS].sort(() => Math.random() - 0.5);

    // TODO: Fetch real player list and their statuses from the multiplayer session
    setPlayers([
      { id: '1', name: 'あなた', status: 'thinking', avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${shuffledSeeds[0]}` },
      { id: '2', name: 'ゆい', status: 'voted', avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${shuffledSeeds[1]}` },
      { id: '3', name: 'れん', status: 'voted', avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${shuffledSeeds[2]}` },
      { id: '4', name: '健太先生', status: 'thinking', avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${shuffledSeeds[3]}` },
    ]);
  }, []);

  const handleVote = () => {
    // TODO: Implement vote submission logic (Server Action / API call)
    // - Send selected card ID
    // - Send player ID
    setHasVoted(true);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans text-gray-900 pb-24">
      {/* Optimized Background Image Layer */}
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
      
      {/* Overlay Gradient for readability */}
      <div className="absolute inset-0 z-0 pointer-events-none" />

      <main className="relative z-10 flex flex-col h-full overflow-y-auto no-scrollbar">
        <GameHeader
            turn={turn}
            totalTurns={10}
            stats={INITIAL_STATS}
        />

        <div className="mt-4">
            <PlayerStatus players={players} />
        </div>

        <div className="flex-1 flex flex-col justify-center my-4">
            <PolicyCardCarousel
            cards={CARDS}
            selectedIndex={selectedCardIndex}
            onSelect={setSelectedCardIndex}
            />
        </div>
      </main>

      <GameFooter
        onVote={handleVote}
        hasVoted={hasVoted}
        // TODO: Fetch the user's specific hidden role/win condition
        myWinCondition="環境スコアを80以上に保ち、ゲーム終了を迎える。"
      />
    </div>
  );
}

// Mock Data
const INITIAL_STATS: CityStats = {
  economy: 65,
  welfare: 45,
  education: 80,
  security: 25,
  humanRights: 50,
  environment: 30,
};

const PLAYERS: Player[] = [
  { id: '1', name: 'あなた', status: 'thinking' },
  { id: '2', name: 'ゆい', status: 'voted', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yui' },
  { id: '3', name: 'れん', status: 'voted', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ren' },
  { id: '4', name: '健太先生', status: 'thinking', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenta' },
];


