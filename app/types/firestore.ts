export type RoomStatus = 'LOBBY' | 'VOTING' | 'RESULT' | 'FINISHED';

export interface CityParams {
  economy: number;
  welfare: number;
  education: number;
  security: number;
  humanRights: number;
  environment: number;
}

export interface PolicyEffect {
  economy?: number;
  welfare?: number;
  education?: number;
  security?: number;
  humanRights?: number;
  environment?: number;
}

export interface MasterPolicy {
  id: string;
  title: string;
  description: string;
  newsFlash: string;
  effects: PolicyEffect;
}

export interface MasterIdeology {
  id: string;
  name: string;
  description: string;
  coefficients: PolicyEffect; // Reusing PolicyEffect structure for coefficients
}

export interface PlayerData {
  id: string; // Internal User ID (oderId)
  displayName: string;
  photoURL?: string;
  isHost: boolean;
  isReady: boolean;
  isPetitionUsed: boolean;
  ideology?: string; // ID of the ideology (Hidden to others in real API, but mock store holds it)
  currentVote?: string; // Policy ID (Hidden to others in real API)
}

export interface RoomData {
  hostId: string;
  status: RoomStatus;
  turn: number;
  maxTurns: number;
  createdAt: number; // Timestamp
  cityParams: CityParams;
  isCollapsed: boolean;
  currentPolicyIds: string[];
  deckIds: string[];
  votes: Record<string, string>; // { userId: policyId }
  lastResult?: {
    passedPolicyId: string;
    passedPolicyTitle: string;
    actualEffects: PolicyEffect;
    newsFlash: string;
    voteDetails: Record<string, string>;
  } | null;
}
