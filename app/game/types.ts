export interface CityStats {
  economy: number;
  welfare: number;
  education: number;
  security: number;
  humanRights: number;
  environment: number;
}

export interface Player {
  id: string;
  name: string;
  avatarUrl?: string; // Optional, using placeholders for now
  status: 'thinking' | 'voted' | 'waiting';
}

export interface PolicyCard {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}
