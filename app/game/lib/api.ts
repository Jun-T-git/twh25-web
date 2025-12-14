import { MasterIdeology, MasterPolicy, PlayerData, RoomData } from "@/app/types/firestore";
import { db } from "@/lib/firebase/client";
import { collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query } from "firebase/firestore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/rooms` 
  : '/api/rooms';

export interface RoomResponse {
  room: RoomData;
  players: Record<string, PlayerData>;
}

export interface RoomSummary {
  roomId: string;
  hostName: string;
  playerCount: number;
  status: string;
  createdAt: number;
}

export async function listRooms(): Promise<RoomSummary[]> {
  const roomsRef = collection(db, 'rooms');
  const q = query(roomsRef, orderBy('createdAt', 'desc'), limit(20));
  const snapshot = await getDocs(q);

  const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoomData & { id: string }));

  // Helper to get host name (efficiently would be better, but for 20 items parallel fetch is okay)
  const summaries = await Promise.all(rooms.map(async (room) => {
    // Fetch all players to get count and host name
    const playersRef = collection(db, 'rooms', room.id, 'players');
    const playersSnap = await getDocs(playersRef);
    const playerCount = playersSnap.size;

    let hostName = 'Unknown';
    if (room.hostId) {
       const hostDoc = playersSnap.docs.find(d => d.id === room.hostId);
       if (hostDoc) {
           hostName = (hostDoc.data() as PlayerData).displayName;
       }
    }
    
    return {
        roomId: room.id,
        hostName,
        playerCount,
        status: room.status,
        createdAt: room.createdAt
    };
  }));

  return summaries.filter(s => s.playerCount > 0 && s.status === 'LOBBY' && s.playerCount < 4);
}

export async function createRoom(displayName: string, photoURL?: string): Promise<{ roomId: string, playerId: string }> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName, photoURL }),
  });
  if (!res.ok) throw new Error('Failed to create room');
  const data = await res.json();
  return data;
}

export async function joinRoom(roomId: string, displayName: string, photoURL?: string): Promise<{ playerId: string }> {
  const res = await fetch(`${API_BASE}/${roomId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName, photoURL }),
  });
  if (!res.ok) throw new Error('Failed to join room');
  const data = await res.json();
  return data;
}



export async function startGame(roomId: string, userId: string) {
  const res = await fetch(`${API_BASE}/${roomId}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId: userId }),
  });
  if (!res.ok) throw new Error('Failed to start game');
  return res.json();
}



export function subscribeToRoom(roomId: string, onUpdate: (data: RoomResponse) => void): () => void {
  let roomData: RoomData | null = null;
  let playersData: Record<string, PlayerData> = {};

  // Listen to Room Document
  const roomRef = doc(db, 'rooms', roomId);
  const unsubRoom = onSnapshot(roomRef, (docSnap) => {
    if (docSnap.exists()) {
      roomData = docSnap.data() as RoomData;
      // Send update if we have room data (even if players empty initially)
      onUpdate({ room: roomData, players: playersData });
    }
  }, (error) => {
      console.error("Error listening to room:", error);
  });

  // Listen to Players Collection
  const playersRef = collection(db, 'rooms', roomId, 'players');
  const unsubPlayers = onSnapshot(playersRef, (querySnap) => {
    const newPlayers: Record<string, PlayerData> = {};
    querySnap.forEach((docSnap) => {
      // Inject document ID as id property
      newPlayers[docSnap.id] = { id: docSnap.id, ...docSnap.data() } as PlayerData;
    });
    playersData = newPlayers;
    
    if (roomData) {
        onUpdate({ room: roomData, players: playersData });
    }
  }, (error) => {
      console.error("Error listening to players:", error);
  });

  return () => {
    unsubRoom();
    unsubPlayers();
  };
}

export async function votePolicy(roomId: string, userId: string, policyId: string) {
  const res = await fetch(`${API_BASE}/${roomId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId: userId, policyId }),
  });
  if (!res.ok) throw new Error('Failed to vote');
  return res.json();
}




export async function nextTurn(roomId: string): Promise<{ status: string, turn: number }> {
    const res = await fetch(`${API_BASE}/${roomId}/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error('Failed to proceed to next turn');
    return res.json();
}


export async function getPolicies(policyIds: string[]): Promise<MasterPolicy[]> {
  const promises = policyIds.map(async (id) => {
    // 1. Try master_policies
    let docRef = doc(db, 'master_policies', id);
    let snap = await getDoc(docRef);

    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as MasterPolicy;
    }

    // 2. Try generatedPolicies
    docRef = doc(db, 'generatedPolicies', id);
    snap = await getDoc(docRef);

    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as MasterPolicy;
    }
    
    return null;
  });

  const policies = await Promise.all(promises);
  return policies.filter((p): p is MasterPolicy => p !== null);
}


export async function getIdeologies(ideologyIds: string[]): Promise<MasterIdeology[]> {
    const promises = ideologyIds.map(async (id) => {
        const docRef = doc(db, 'master_ideologies', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            return { id: snap.id, ...snap.data() } as MasterIdeology;
        }
        return null;
    });

    const ideologies = await Promise.all(promises);
    return ideologies.filter((i): i is MasterIdeology => i !== null);
}

export async function proposePetition(roomId: string, playerId: string, text: string): Promise<{ approved: boolean, policyId: string, message: string }> {
  const res = await fetch(`${API_BASE}/${roomId}/petition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, text }),
  });
  if (!res.ok) {
     const error = await res.json();
     throw new Error(error.message || 'Failed to submit petition');
  }
  return res.json();
}

export async function markPetitionUsed(roomId: string, playerId: string) {
    const playerRef = doc(db, 'rooms', roomId, 'players', playerId);
    await import('firebase/firestore').then(({ updateDoc }) => {
        updateDoc(playerRef, { isPetitionUsed: true });
    });
}
