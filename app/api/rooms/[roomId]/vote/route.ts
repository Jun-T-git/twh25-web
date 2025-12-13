import { mockStore } from '@/app/api/_mock/store';
import { NextResponse } from 'next/server';

export async function POST(request: Request, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  try {
    const { roomId } = params;
    const { playerId, policyId } = await request.json();

    const room = mockStore.rooms[roomId];
    if (!room || room.status !== 'VOTING') {
      return NextResponse.json({ error: 'Invalid room state' }, { status: 400 });
    }

    if (!room.currentPolicyIds.includes(policyId)) {
      return NextResponse.json({ error: 'Invalid policy ID' }, { status: 400 });
    }

    // Record Vote
    if (mockStore.players[roomId]?.[playerId]) {
        mockStore.players[roomId][playerId].currentVote = policyId;
    }
    room.votes[playerId] = policyId;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
