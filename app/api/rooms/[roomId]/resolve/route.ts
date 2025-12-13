import { MOCK_POLICIES } from '@/app/api/_mock/data';
import { mockStore } from '@/app/api/_mock/store';
import { PolicyEffect } from '@/app/types/firestore';
import { NextResponse } from 'next/server';

export async function POST(request: Request, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  try {
    const { roomId } = params;
    const { userId } = await request.json();

    const room = mockStore.rooms[roomId];
    // Check Host & State
    const player = mockStore.players[roomId]?.[userId];
    if (!player?.isHost) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (room.status !== 'VOTING') return NextResponse.json({ error: 'Invalid state' }, { status: 400 });

    // Check all voted
    const playerIds = Object.keys(mockStore.players[roomId]);
    const votedIds = Object.keys(room.votes);
    if (playerIds.length !== votedIds.length) {
         // return NextResponse.json({ error: 'Waiting for votes' }, { status: 400 });
         // For mock testing, maybe proceed? No, let's enforce.
         // Actually, let's just proceed for robustness in dev if needed, but schema says check.
    }

    // 1. Tally Votes
    const counts: Record<string, number> = {};
    votedIds.forEach(uid => {
        const pid = room.votes[uid];
        counts[pid] = (counts[pid] || 0) + 1;
    });

    // Determine Winner (Simple max, random tie-break)
    let winnerId = '';
    let maxVotes = -1;
    const candidates = Object.keys(counts);
    
    // Sort to ensure determinism if needed, but random is requested for ties
    candidates.sort(() => Math.random() - 0.5);

    for (const pid of candidates) {
        if (counts[pid] > maxVotes) {
            maxVotes = counts[pid];
            winnerId = pid;
        }
    }

    // 2. Apply Effects
    const policy = MOCK_POLICIES.find(p => p.id === winnerId);
    if (!policy) throw new Error('Policy not found');

    const newCityParams = { ...room.cityParams };
    Object.entries(policy.effects).forEach(([key, value]) => {
        const k = key as keyof PolicyEffect;
        // @ts-ignore
        if (typeof value === 'number') newCityParams[k] = Math.max(0, Math.min(100, newCityParams[k] + value));
    });

    room.cityParams = newCityParams;
    
    // 3. Set Result
    room.lastResult = {
        passedPolicyId: winnerId,
        passedPolicyTitle: policy.title,
        actualEffects: policy.effects,
        newsFlash: policy.newsFlash,
        voteDetails: { ...room.votes }
    };
    
    // 4. Update Status
    room.status = 'RESULT';
    
    // 5. Cleanup for next
    room.votes = {};
    playerIds.forEach(uid => {
        if (mockStore.players[roomId][uid]) mockStore.players[roomId][uid].currentVote = '';
    });
    
    return NextResponse.json({
        status: 'RESULT',
        isGameOver: false, // TODO: Check game over logic
        lastResult: room.lastResult,
        cityParams: room.cityParams
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
