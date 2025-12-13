import { MOCK_IDEOLOGIES } from '@/app/api/_mock/data';
import { mockStore } from '@/app/api/_mock/store';
import { CityParams } from '@/app/types/firestore';
import { NextResponse } from 'next/server';

export async function POST(request: Request, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  try {
    const { roomId } = params;
    // const { userId } = await request.json();
    const room = mockStore.rooms[roomId];
    // const player = mockStore.players[roomId]?.[userId];

    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    // if (!player?.isHost) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (room.status !== 'RESULT') return NextResponse.json({ error: 'Invalid state: ' + room.status }, { status: 400 });

    // Transition
    room.turn += 1;
    
    // Ensure deckIds is initialized (backward compatibility/safety)
    if (!room.deckIds) room.deckIds = [];

    if (room.turn > room.maxTurns) {
        room.status = 'FINISHED';

        // Calculate Result
        const players = mockStore.players[roomId];
        const rankings = Object.values(players).map(p => {
            const ideology = MOCK_IDEOLOGIES.find(i => i.id === p.ideology);
            let score = 0;
            if (ideology) {
                 Object.entries(ideology.coefficients).forEach(([stat, coeff]) => {
                     const val = room.cityParams[stat as keyof CityParams];
                     score += val * (typeof coeff === 'number' ? coeff : 0);
                 });
            }
            return {
                playerId: p.id,
                playerName: p.displayName,
                score: Math.round(score),
                ideologyName: ideology?.name || 'Unknown'
            };
        }).sort((a, b) => b.score - a.score);

        // City Summary
        const highestStat = Object.entries(room.cityParams).sort((a, b) => b[1] - a[1])[0];
        const summaryMap: Record<string, string> = {
            economy: '経済大国として繁栄しました',
            welfare: '福祉の充実した優しい街になりました',
            education: '知の殿堂として名を馳せました',
            security: '鉄壁の守りを誇る街になりました',
            humanRights: '自由と人権の聖地となりました',
            environment: '緑豊かな理想郷となりました'
        };
        const citySummary = summaryMap[highestStat[0]] || 'バランスの取れた街になりました';

        room.gameResult = {
            citySummary,
            rankings
        };
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
