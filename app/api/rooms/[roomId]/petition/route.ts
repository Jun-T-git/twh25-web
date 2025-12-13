import { mockStore } from '@/app/api/_mock/store';
import { NextResponse } from 'next/server';

export async function POST(request: Request, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  try {
    const { roomId } = params;
    const { userId, text } = await request.json();

    const room = mockStore.rooms[roomId];
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    const player = mockStore.players[roomId]?.[userId];
    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });

    if (player.isPetitionUsed) {
        return NextResponse.json({ error: 'Petition already used' }, { status: 400 });
    }

    // Mock AI process
    // In reality, this would call OpenAI
    const isApproved = text.length > 5; // Simple Mock validation
    
    if (isApproved) {
        // Create new policy
        const newPolicyId = `petition_${Date.now()}`;
        // Note: In a real app we would add this to master_policies or a temporary room deck.
        // For mock, we just inject it into the deck.
        room.deckIds.unshift(newPolicyId);
        
        player.isPetitionUsed = true;

        return NextResponse.json({
            approved: true,
            policyId: newPolicyId,
            message: '政策が承認されました'
        });
    } else {
        return NextResponse.json({
            approved: false,
            message: '政策は却下されました（文字数が少なすぎます）'
        });
    }

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
