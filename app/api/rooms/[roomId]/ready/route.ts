import { mockStore } from '@/app/api/_mock/store';
import { NextResponse } from 'next/server';

export async function POST(request: Request, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  try {
    const { roomId } = params;
    const { userId } = await request.json();

    const room = mockStore.rooms[roomId];
    if (!room || room.status !== 'LOBBY') {
      return NextResponse.json({ error: 'Invalid room state' }, { status: 400 });
    }

    const player = mockStore.players[roomId]?.[userId];
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Toggle Ready
    player.isReady = !player.isReady;

    return NextResponse.json({ isReady: player.isReady });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
