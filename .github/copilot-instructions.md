# Copilot Instructions for myAI Maestro

## Architecture Overview

**GOTME** (Governed Orchestrated Thought Machine Engine) is a distributed intelligence orchestration system that evolves research proposals through iterative, auditable cycles.

### Core Concept: Protocol-01-Delta
- **Mission**: Replace sequential AI review with parallel/competitive intelligence synthesis
- **Philosophy**: "Survival of the future requires giving it away" — provide high-fidelity insights through collective reasoning, not generic summaries
- **Three Gates** (implemented in synthesis logic):
  1. **Nihilo Filter**: Destroy hallucinations and false solutions
  2. **Coherence Gate**: Allow speculative bridges across domains if internally consistent
  3. **Distributed Optimization**: Use collective intelligence of all units to make the system better

### Data Flow
```
Contract (topic + context) 
  → User selects schema (parallel/sequential/competitive)
  → Distribute to active model partners
  → Each partner provides specialized review (Feasibility, Adversary, Innovator, Operational, Auditor roles)
  → Synthesize into hardened thesis + strategic debrief
  → Seal with IAT signature (Integrable Auditable Trace)
  → Export as GOTME Master Forensic Ledger for external review
```

## Key Files & Patterns

### Model Management
- **[constants.tsx](../constants.tsx#L79-L115)**: `MODEL_POOL` = available models (cloud + local Ollama), `INITIAL_PARTNERS` = active by default
  - New models: Add entry to MODEL_POOL, include in INITIAL_PARTNERS if default-enabled
  - Types: `'LLM'` (large models) vs `'SLM'` (small local models), `isLocal?: boolean` for Ollama
  - Example: `{ name: "GPT-5.1-Codex-Max", type: 'LLM' }`

### Orchestration Loop
- **[OrchestrationView.tsx](../components/OrchestrationView.tsx#L95-L140)**: `runNextRound()` orchestrates one generation
  - Selects schema from `session.contract.schema` (parallel/sequential/competitive)
  - Calls `simulateParallelAIs` or `simulateSequentialAIs` in [gemini.ts](../services/gemini.ts)
  - Synthesizes results via `synthesizeDebrief` or `synthesizeCompetitiveDebrief`
  - Creates `Round` object with IAT signature via `piecesService.generateIATSignature()`

### Service Integration
- **Gemini** ([services/gemini.ts](../services/gemini.ts)): Cloud-based synthesis using Gemini 3 Pro/Flash
  - `conductSession(prompt, role)`: Basic content generation with system instructions
  - `askGeminiComplex(prompt, history)`: Extended reasoning with thinking budget (32768 tokens)
  - Each partner gets role-specific system instruction (Feasibility Specialist, Adversarial Skeptic, Innovation Architect, etc.)

- **Ollama** ([services/ollama.ts](../services/ollama.ts)): Local model execution (qwen2.5:7b, llama3.2:3b, etc.)
  - Fallback for cost-sensitive or offline scenarios
  - CORS requirement: Set `OLLAMA_ORIGINS="*"` environment variable

- **Pieces** ([services/pieces.ts](../services/pieces.ts)): Asset archival & IAT signing
  - `archiveRound()`: Deposits forensic trace into Pieces OS (mocked in UI, real in production)
  - `generateIATSignature()`: Deterministic hash for audit integrity

- **Audit** ([services/audit.ts](../services/audit.ts)): Forensic ledger generation
  - `generateMasterAuditReport()`: Exports complete session as markdown with all rounds, synthesized insights, and IAT receipts
  - Downloaded from UI via "Download Forensic Snapshot" button

### Session Structure
- **[types.ts](../types.ts#L56-L80)**: `Session` object holds:
  - `contract`: Topic + context + schema (the proposal being evolved)
  - `rounds`: Array of `Round` objects (each generation with runs, synthesis, evolved contract, IAT signature)
  - `activePartners`: Model names currently enabled
  - `activeTools`: `['search', 'code', 'memory']` for agentic capabilities
  - `modelMetrics`: Track char count + rating per model for leaderboarding

### UI Conventions
- **Intent Morphing**: Theme colors shift based on proposal topic
  - "security"/"risk"/"shield" → emerald theme
  - "creative"/"innovate"/"paradigm" → violet theme
  - Default → indigo
- **IAT Pulse**: Green pulsing indicator in chat bubble shows Nihilo Sealed protocol active
- **Forensic Handover**: Bottom-left button exports GOTME Master Ledger for external review

## Common Tasks

### Add a New Model to the Pool
1. [constants.tsx](../constants.tsx#L93): Add entry to `MODEL_POOL`
2. Optionally add to `INITIAL_PARTNERS` for default activation
3. No code changes needed in services (model name is passed as string to Gemini/Ollama)

### Change Synthesis Behavior
- Edit role configs in [gemini.ts](../services/gemini.ts#L92) `getRoleConfig()` function
- Modify system instructions in `conductSession()` to change how partners evaluate proposals
- Adjust `thinkingBudget` in `askGeminiComplex()` for different reasoning depths

### Debug a Stalled Round
- Check [OrchestrationView.tsx](../services/gemini.ts) logs in "Audit Logs" tab
- Verify Ollama connection: `curl http://localhost:11434/api/tags`
- Check Gemini API key in `.env.local` (`GEMINI_API_KEY`)

### Export & Audit Rounds
- Each round auto-seals with IAT signature via `piecesService.generateIATSignature()`
- Download full forensic ledger: "Download Forensic Snapshot" button exports markdown
- Pieces integration (if enabled) deposits to OS for external archival

## Environment Setup
```bash
# Required
GEMINI_API_KEY=your-gemini-api-key

# Optional (for local model execution)
OLLAMA_ORIGINS="*"  # Enable CORS in Ollama

# Optional (for Pieces integration)
# Set PIECES_API_URL in services/pieces.ts (currently http://localhost:1000)
```

## Testing Models
Use the **Governance** tab to:
- Toggle models on/off for a session
- See active model count + char/rating metrics
- Enable/disable agentic tools (Web Search, Code Sandbox, Vector Memory)

## File Naming & Organization
- Components in `components/` are UI views (OrchestrationView, GovernanceView, etc.)
- Services in `services/` handle external integrations (Gemini, Ollama, Pieces, Audit)
- Constants in `constants.tsx` for MODEL_POOL, SCHEMAS, SCENARIOS, NAV_ITEMS
- Types in `types.ts` for Session, Round, Contract, etc.

---

**Philosophy**: This is not a generic chatbot. Every interaction is auditable, every synthesis is hardened, every model failure is logged. The system is designed for **high-stakes R&D** where reproducibility, internal coherence, and forensic integrity matter more than raw speed.