import { PlayerData, RoomData } from "@/app/types/firestore";

const API_BASE = '/api/rooms';

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
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch rooms');
  const data = await res.json();
  return data.rooms;
}

export async function createRoom(displayName: string, photoURL?: string): Promise<{ roomId: string, playerId: string }> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName, photoURL }),
  });
  if (!res.ok) throw new Error('Failed to create room');
  return res.json();
}

export async function joinRoom(roomId: string, displayName: string, photoURL?: string): Promise<{ playerId: string }> {
  const res = await fetch(`${API_BASE}/${roomId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName, photoURL }),
  });
  if (!res.ok) throw new Error('Failed to join room');
  return res.json();
}

export async function toggleReady(roomId: string, userId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/${roomId}/ready`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId: userId }),
  });
  return res.ok;
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

export async function getRoom(roomId: string): Promise<RoomResponse> {
  const res = await fetch(`${API_BASE}/${roomId}`);
  if (!res.ok) throw new Error('Failed to fetch room');
  return res.json();
}

export function subscribeToRoom(roomId: string, onUpdate: (data: RoomResponse) => void): () => void {
  // Mock implementation of onSnapshot using polling
  const fetchData = async () => {
    try {
      const data = await getRoom(roomId);
      onUpdate(data);
    } catch (error) {
      console.error('Subscription polling error:', error);
    }
  };

  fetchData(); // Initial fetch
  const intervalId = setInterval(fetchData, 1000); // 1 sec polling

  // Return unsubscribe function
  return () => clearInterval(intervalId);
}

// ...existing code...

export async function votePolicy(roomId: string, userId: string, policyId: string) {
  const res = await fetch(`${API_BASE}/${roomId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId: userId, policyId }),
  });
  if (!res.ok) throw new Error('Failed to vote');
  return res.json();
}

export async function resolveVotes(roomId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/${roomId}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error('Failed to resolve votes');
  return res.json();
}

export async function nextTurn(roomId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/${roomId}/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error('Failed to proceed to next turn');
    return res.json();
}

