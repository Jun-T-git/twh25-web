import { mockStore } from '@/app/api/_mock/store';
import { NextResponse } from 'next/server';

export async function POST(request: Request, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  try {
    const { roomId } = params;
    const { userId } = await request.json();
    const room = mockStore.rooms[roomId];
    const player = mockStore.players[roomId]?.[userId];

    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    if (!player?.isHost) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (room.status !== 'RESULT') return NextResponse.json({ error: 'Invalid state: ' + room.status }, { status: 400 });

    // Transition
    room.turn += 1;
    
    // Ensure deckIds is initialized (backward compatibility/safety)
    if (!room.deckIds) room.deckIds = [];

    if (room.turn > room.maxTurns) {
        room.status = 'FINISHED';
    } else {
        room.status = 'VOTING';
        
        // Check if deck needs replenishment
        if (room.deckIds.length < 3) {
             // Replenish deck
             const freshDeck = mockStore.getShuffledDeck();
             room.deckIds = [...room.deckIds, ...freshDeck];
        }

        // Deal new cards
        const nextCards = room.deckIds.splice(0, 3);
        room.currentPolicyIds = nextCards;
    }

    return NextResponse.json({
        status: room.status,
        turn: room.turn
    });
  } catch (error) {
    console.error('Next Turn Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
