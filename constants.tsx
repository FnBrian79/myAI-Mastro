
import React from 'react';
import { 
  Cpu, 
  BrainCircuit, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Workflow, 
  Terminal,
  History,
  Settings,
  Plus,
  Trophy,
  Users,
  Search,
  Code,
  Database,
  Globe,
  FileCode,
  Lightbulb,
  ShieldAlert,
  TerminalSquare,
  Dna,
  RefreshCcw,
  ZapOff
} from 'lucide-react';
import { Schema, Scenario } from './types';

export const SCHEMAS: Schema[] = [
  { 
    id: 'parallel', 
    name: 'Parallel synthesis', 
    description: 'All models respond simultaneously; Gemini synthesizes the collective intelligence.' 
  },
  { 
    id: 'sequential', 
    name: 'Sequential Chain', 
    description: 'Models respond in order, each critiquing and building upon the previous output.' 
  },
  { 
    id: 'competitive', 
    name: 'Competitive Debate', 
    description: 'Models take opposing sides; Gemini acts as an arbiter to extract the truth.' 
  }
];

export const SCENARIOS: Scenario[] = [
  {
    id: 'distributed-optimization',
    name: 'Distributed System Optimization',
    defaultTopic: 'Optimize the GKE state automation loop using distributed intelligence.',
    defaultContext: 'Harden the Python automation scripts for GKE. Use collective intelligence to find edge cases where manual browser steps can be replaced by headless orchestration.',
    recommendedSchema: 'parallel'
  },
  {
    id: 'meta-optimization',
    name: 'Engine Self-Improvement',
    defaultTopic: 'Refine the GOTME synthesis logic to prioritize structural feasibility over generic summaries.',
    defaultContext: 'Analyze the current Lab Architect prompts. Find logical loops that cause repetition. Propose a "Self-Correcting" prompt structure.',
    recommendedSchema: 'competitive'
  },
  {
    id: 'code-review',
    name: 'Critical Code Review',
    defaultTopic: 'Audit this smart contract for reentrancy vulnerabilities.',
    defaultContext: 'Focus on high-security standards. Ensure sub-agents use Code Sandbox for verification.',
    recommendedSchema: 'competitive'
  },
  {
    id: 'product-strategy',
    name: 'Strategic Innovation',
    defaultTopic: 'Propose a disruptive feature for an AI-native browser.',
    defaultContext: 'Think exponential. Challenge current UI paradigms.',
    recommendedSchema: 'sequential'
  }
];

export const INITIAL_PARTNERS = [
  "Gemini 3 Pro",
  "Claude 3.5 Sonnet",
  "GPT-4o",
  "Llama 3.1 70B",
  "qwen2.5:7b"
];

export interface ModelEntry {
  name: string;
  type: 'SLM' | 'LLM';
  isLocal?: boolean;
}

export const MODEL_POOL: ModelEntry[] = [
  { name: "Gemini 3 Pro", type: 'LLM' },
  { name: "Gemini 3 Flash", type: 'LLM' },
  { name: "Claude 3.5 Sonnet", type: 'LLM' },
  { name: "Claude 3.5 Haiku", type: 'LLM' },
  { name: "GPT-4o", type: 'LLM' },
  { name: "GPT-4o-mini", type: 'LLM' },
  { name: "o1-preview", type: 'LLM' },
  { name: "o1-mini", type: 'LLM' },
  { name: "Llama 3.1 405B", type: 'LLM' },
  { name: "Llama 3.1 70B", type: 'LLM' },
  { name: "DeepSeek V3", type: 'LLM' },
  { name: "Grok-2 (X.AI)", type: 'LLM' },
  { name: "Mistral Large 2", type: 'LLM' },
  { name: "Perplexity Pro", type: 'LLM' },
  { name: "qwen2.5:32b", type: 'LLM', isLocal: true },
  { name: "llama3.1:70b", type: 'LLM', isLocal: true },
  { name: "gemma2:27b", type: 'LLM', isLocal: true },
  { name: "mistral-nemo:12b", type: 'LLM', isLocal: true },
  { name: "qwen2.5:7b", type: 'SLM', isLocal: true },
  { name: "llama3.2:3b", type: 'SLM', isLocal: true },
  { name: "phi3.5:latest", type: 'SLM', isLocal: true },
  { name: "gemma2:9b", type: 'SLM', isLocal: true },
  { name: "llama3.2:1b", type: 'SLM', isLocal: true },
  { name: "qwen2.5:1.5b", type: 'SLM', isLocal: true }
];

export const AVAILABLE_TOOLS = [
  { id: 'search', name: 'Web Search', description: 'Real-time information retrieval', icon: 'Globe' },
  { id: 'code', name: 'Code Sandbox', description: 'Execute and verify logic', icon: 'Code' },
  { id: 'memory', name: 'Vector Memory', description: 'Retrieve long-term context', icon: 'Database' },
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <Layers size={18} /> },
  { id: 'orchestrator', label: 'Orchestrator', icon: <Workflow size={18} /> },
  { id: 'automation', label: 'Automation', icon: <TerminalSquare size={18} /> },
  { id: 'governance', label: 'Governance', icon: <ShieldCheck size={18} /> },
  { id: 'lineage', label: 'Lineage', icon: <History size={18} /> },
];

export const COLORS = {
  primary: '#6366f1',
  secondary: '#0f172a',
  accent: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
};
