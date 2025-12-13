import { mockStore } from '@/app/api/_mock/store';
import { NextResponse } from 'next/server';

export async function POST(request: Request, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  try {
    const { roomId } = params;
    const body = await request.json();
    const { userId } = body; // In real app, get from Auth

    if (!mockStore.rooms[roomId]) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Delete player
    if (mockStore.players[roomId] && mockStore.players[roomId][userId]) {
      delete mockStore.players[roomId][userId];
      
      // Also remove from votes
      delete mockStore.rooms[roomId].votes[userId];

      // If room empty or host left, handle clean up (Skip for simple mock)
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
