
import { Round, Contract } from '../types';

const PIECES_API_URL = 'http://localhost:1000';

// Deterministic hash simulation for IAT
const generateIATSignature = (roundNum: number, topic: string) => {
  const seed = `${roundNum}-${topic}-${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `IAT-${Math.abs(hash).toString(16).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
};

export const piecesService = {
  async checkConnection(): Promise<boolean> {
    try {
      return true; // Mocked for UI demonstration
    } catch {
      return false;
    }
  },

  async archiveRound(round: Round, contract: Contract): Promise<string> {
    console.log(`[IAT] Initiating Nihilo Sealed protocol for Gen ${round.roundNumber}...`);
    
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockId = `pieces-asset-${Math.random().toString(36).substring(7)}`;
    return mockId;
  },
  
  generateIATSignature
};
