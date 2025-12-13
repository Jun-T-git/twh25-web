import { mockStore } from '@/app/api/_mock/store';
import { PlayerData, RoomData } from '@/app/types/firestore';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export async function GET() {
  const roomsList = Object.entries(mockStore.rooms).map(([id, room]) => {
    const players = mockStore.players[id] || {};
    const host = Object.values(players).find(p => p.isHost);
    return {
      roomId: id,
      hostName: host?.displayName || 'Unknown',
      playerCount: Object.keys(players).length,
      status: room.status,
      createdAt: room.createdAt
    };
  });
  return NextResponse.json({ rooms: roomsList });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { displayName, photoURL } = body;

    if (!displayName) {
      return NextResponse.json({ error: 'displayName is required' }, { status: 400 });
    }

    const roomId = nanoid(6);
    const playerId = nanoid();

    // Init Room
    const newRoom: RoomData = {
      hostId: playerId,
      status: 'LOBBY',
      turn: 1,
      maxTurns: 10,
      createdAt: Date.now(),
      cityParams: mockStore.getInitialCityParams(),
      isCollapsed: false,
      currentPolicyIds: [],
      deckIds: [],
      passedPolicyIds: [],
      votes: {},
      lastResult: null
    };

    // Init Host Player
    const hostPlayer: PlayerData = {
      id: playerId,
      displayName,
      photoURL: photoURL || '',
      isHost: true,
      isReady: false,
      isPetitionUsed: false,
      ideology: mockStore.getRandomIdeologyId(),
      currentVote: ''
    };

    // Save to Mock Store
    mockStore.rooms[roomId] = newRoom;
    mockStore.players[roomId] = { [playerId]: hostPlayer };

    return NextResponse.json({ roomId, status: 'LOBBY', playerId }); // Returning playerId for convenience in mock
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
