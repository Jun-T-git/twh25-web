import { mockStore } from '@/app/api/_mock/store';
import { NextResponse } from 'next/server';

export async function GET(request: Request, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  try {
    const { roomId } = params;
    const room = mockStore.rooms[roomId];

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const players = mockStore.players[roomId] || {};
    
    // Combine room and players for easier client consumption
    return NextResponse.json({
        room,
        players
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
