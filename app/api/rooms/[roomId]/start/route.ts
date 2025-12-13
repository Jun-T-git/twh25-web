import { mockStore } from '@/app/api/_mock/store';
import { NextResponse } from 'next/server';

export async function POST(request: Request, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  try {
    const { roomId } = params;
    const { playerId } = await request.json(); // Host check

    const room = mockStore.rooms[roomId];
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    // Host check
    const player = mockStore.players[roomId]?.[playerId];
    if (!player?.isHost) {
      return NextResponse.json({ error: 'Only host can start game' }, { status: 403 });
    }

    if (room.status !== 'LOBBY') {
      return NextResponse.json({ error: 'Game already started' }, { status: 400 });
    }
    
    // Check players count and readiness
    const players = Object.values(mockStore.players[roomId]);
    if (players.length !== 4) {
         // Debug override still useful? Maybe keep strict for now as requested.
         if (!player.displayName.includes('Debug')) {
             return NextResponse.json({ error: 'Need exactly 4 players to start' }, { status: 400 });
         }
    }
    
    const allReady = players.every(p => p.isReady);
    if (!allReady) {
        return NextResponse.json({ error: 'Not all players are ready' }, { status: 400 });
    }

    // Start Game Logic
    const deck = mockStore.getShuffledDeck();
    const current = deck.splice(0, 3);

    room.status = 'VOTING';
    room.turn = 1;
    room.deckIds = deck;
    room.currentPolicyIds = current;

    return NextResponse.json({ 
      status: 'VOTING',
      turn: 1,
      currentPolicyIds: current
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
