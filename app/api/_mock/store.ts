import { PlayerData, RoomData } from "@/app/types/firestore";
import { MOCK_IDEOLOGIES, MOCK_POLICIES } from "./data";

class InMemoryStore {
  private static instance: InMemoryStore;
  
  public rooms: Record<string, RoomData> = {};
  public players: Record<string, Record<string, PlayerData>> = {}; // { roomId: { userId: PlayerData } }

  private constructor() {}

  public static getInstance(): InMemoryStore {
    if (!InMemoryStore.instance) {
      InMemoryStore.instance = new InMemoryStore();
    }
    return InMemoryStore.instance;
  }

  // Helper: Create initial city params
  public getInitialCityParams() {
    return {
      economy: 50,
      welfare: 50,
      education: 50,
      security: 50,
      humanRights: 50,
      environment: 50,
    };
  }

  // Helper: Get random policies for deck
  public getShuffledDeck(): string[] {
    return [...MOCK_POLICIES]
      .map(p => p.id)
      .sort(() => Math.random() - 0.5);
  }

  // Helper: Get random ideology
  public getRandomIdeologyId(): string {
    const ids = MOCK_IDEOLOGIES.map(i => i.id);
    return ids[Math.floor(Math.random() * ids.length)];
  }
}

export const mockStore = InMemoryStore.getInstance();
