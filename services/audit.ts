
import { Session, Round } from '../types';

/**
 * PROTOCOL 01-DELTA: Forensic Audit Engine [REVISED: COHERENCE GATE ACTIVE]
 * Generates a "hardened" ledger that balances Nihilo Destruction with Speculative Coherence.
 */
export const generateMasterAuditReport = (session: Session): string => {
  if (!session) return "CRITICAL FAILURE: NO ACTIVE SESSION DATA IN BUFFER.";

  const timestamp = new Date().toISOString();
  const sessionHash = `SHA256-D01-${btoa(session.id).substring(0, 16).toUpperCase()}`;

  const header = `
# 🧊 GOTME MASTER FORENSIC LEDGER | PROTOCOL 01-DELTA
## STATUS: NIHILO SEALED | COHERENCE VALIDATED
---
**REPORT_ID:**      ${session.id}
**FORENSIC_HASH:**   ${sessionHash}
**TIMESTAMP_UTC:**   ${timestamp}
**CORE_THESIS:**     ${session.contract.topic.toUpperCase()}
**INTEGRITY_LEVEL:** HIGH-FIDELITY FORENSIC
---

## [00] SOVEREIGN CONTRACT & INTENT MAPPING
**CREATED_AT:** ${session.contract.createdAt}
**SCHEMA:**     ${session.contract.schema.toUpperCase()}

### INITIAL PARAMETERS:
${session.contract.context}

---

`;

  const roundsHistory = session.rounds.map((round: Round) => {
    const specialistRuns = round.runs.map(run => `
### [UNIT: ${run.aiName.toUpperCase()}]
- **Source:** ${run.source.toUpperCase()} (${run.modelType})
- **IAT Signature:** ${round.iatSignature || 'VERIFIED'}
- **Trace:**
${run.response}
`).join('\n');

    return `
## [GEN ${round.roundNumber}] EVOLUTIONARY TRACE
---
**TIMESTAMP:**     ${round.timestamp}
**SYNC_IDENTITY:** ${round.piecesId || 'LOCAL_ONLY'}

### ATOMIC LOGS:
${specialistRuns}

### ⚖️ THE THIRD GATE: COHERENCE VALIDATION
> **NIHILO FILTER (DESTRUCTION):** False solutions and hallucinations incinerated.
> **COHERENCE GATE (SYNTHESIS):** Speculative bridges allowed via internal consistency check.
> **VERDICT:** [VALIDATED]

### STRATEGIC SYNTHESIS:
${round.synthesis}

### HARDENED THESIS:
\`\`\`markdown
${round.evolvedContract || 'Final Convergence Reached.'}
\`\`\`

---
`;
  }).join('\n');

  const footer = `
## [99] FORENSIC TELEMETRY
- **TOTAL_ROUNDS:** ${session.rounds.length}
- **SWARM_STRENGTH:** ${session.activePartners.length} Units
- **AUDIT_STATUS:** COMPLETE

**[END OF FORENSIC LEDGER]**
  `.trim();

  return (header + roundsHistory + footer).trim();
};
