
export type SchemaType = 'parallel' | 'sequential' | 'competitive';
export type OrchestrationPhase = 'initial' | 'series' | 'parallel_convergence' | 'completed';

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
  rating?: number;
  modelType: 'SLM' | 'LLM';
  source: 'cloud' | 'local';
  toolCalls?: ToolCall[];
  groundingChunks?: any[];
}

export interface ModelMetric {
  name: string;
  totalChars: number;
  avgRating: number;
  runs: number;
  type: 'SLM' | 'LLM';
}

export interface Round {
  roundNumber: number;
  topic: string;
  runs: AIRun[];
  synthesis: string;
  evolvedContract?: string;
  synthesisCharCount: number;
  timestamp: string;
  piecesId?: string;
  iatSignature?: string; 
  phase: OrchestrationPhase;
}

export interface Session {
  id: string;
  contract: Contract;
  rounds: Round[];
  status: 'idle' | 'co-creating' | 'orchestrating' | 'completed' | 'converged';
  phase: OrchestrationPhase;
  convergencePeak?: number;
  convergenceThreshold?: number;
  activePartners: string[];
  activeTools: string[];
  modelMetrics: Record<string, ModelMetric>;
  isPiecesConnected: boolean;
  isOllamaConnected: boolean;
}
