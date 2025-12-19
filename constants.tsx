
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
  Plus
} from 'lucide-react';

export const PARTNER_MODELS = [
  "Claude 3.5 Sonnet",
  "GPT-4o",
  "Grok-1",
  "Copilot Pro",
  "Perplexity Llama-3"
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <Layers size={18} /> },
  { id: 'orchestrator', label: 'Orchestrator', icon: <Workflow size={18} /> },
  { id: 'lineage', label: 'Lineage', icon: <History size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

export const COLORS = {
  primary: '#6366f1',
  secondary: '#0f172a',
  accent: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
};
