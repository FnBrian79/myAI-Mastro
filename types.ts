
export type SchemaType = 'parallel' | 'sequential' | 'competitive';

export interface Schema {
  id: SchemaType;
  name: string;
  description: string;
}

export interface Scenario {
  id: string;
  name: string;
  defaultTopic: string;
  defaultContext: string;
  recommendedSchema: SchemaType;
}

export interface Contract {
  topic: string;
  context: string;
  createdAt: string;
  createdBy: string;
  schema: SchemaType;
  scenarioId?: string;
  improvedBy?: string;
}

export interface ToolCall {
  toolName: string;
  action: string;
  result: string;
}

export interface AIRun {
  aiName: string;
  response: string;
  charCount: number;
  rating?: number; // User-provided quality score 1-5
  modelType: 'SLM' | 'LLM';
  source: 'cloud' | 'local';
  toolCalls?: ToolCall[];
}

export interface ModelMetric {
  name: string;
  totalChars: number;
  avgRating: number;
  runs: number;
  type: 'SLM' | 'LLM';
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Round {
  roundNumber: number;
  topic: string;
  runs: AIRun[];
  synthesis: string;
  evolvedContract?: string; // The refined constraints for the NEXT round
  synthesisCharCount: number;
  timestamp: string;
  piecesId?: string; // Reference to the archived asset in Pieces OS
}

export interface Session {
  id: string;
  contract: Contract;
  rounds: Round[];
  status: 'idle' | 'co-creating' | 'orchestrating' | 'completed' | 'converged';
  convergencePeak?: number;
  convergenceThreshold?: number;
  activePartners: string[]; // List of currently active models
  activeTools: string[]; // List of IDs of enabled tools
  modelMetrics: Record<string, ModelMetric>; // Performance tracking
  isPiecesConnected: boolean;
  isOllamaConnected: boolean;
}

export type ModelRole = 'conductor' | 'partner';
