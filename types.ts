
export interface Contract {
  topic: string;
  context: string;
  createdAt: string;
  createdBy: string;
  improvedBy?: string;
}

export interface AIRun {
  aiName: string;
  response: string;
  charCount: number;
}

export interface Round {
  roundNumber: number;
  topic: string;
  runs: AIRun[];
  synthesis: string;
  synthesisCharCount: number;
  timestamp: string;
}

export interface Session {
  id: string;
  contract: Contract;
  rounds: Round[];
  status: 'idle' | 'co-creating' | 'orchestrating' | 'completed' | 'converged';
  convergencePeak?: number;
  convergenceThreshold?: number; // percentage (e.g. 70 meaning 70% of peak)
}

export type ModelRole = 'conductor' | 'partner';
