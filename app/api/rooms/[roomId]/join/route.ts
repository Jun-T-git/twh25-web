import { mockStore } from '@/app/api/_mock/store';
import { PlayerData } from '@/app/types/firestore';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export async function POST(request: Request, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  try {
    const { roomId } = params;
    const room = mockStore.rooms[roomId];

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.status !== 'LOBBY') {
      return NextResponse.json({ error: 'Game has already started' }, { status: 400 });
    }

    if (Object.keys(mockStore.players[roomId] || {}).length >= 6) {
        return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    const body = await request.json();
    const { displayName, photoURL } = body;

    const userId = nanoid();
    
    // Init Guest Player
    const newPlayer: PlayerData = {
      id: userId,
      displayName: displayName || 'Guest',
      photoURL: photoURL || '',
      isHost: false,
      isReady: false,
      isPetitionUsed: false,
      ideology: mockStore.getRandomIdeologyId(),
      currentVote: ''
    };

    // Save
    if (!mockStore.players[roomId]) mockStore.players[roomId] = {};
    mockStore.players[roomId][userId] = newPlayer;

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
