
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ollamaService } from "./ollama";

// Initialize the Google GenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Basic content generation helper with fixed system instructions for the R&D persona.
export const conductSession = async (prompt: string, role: string = "Chief Research Director") => {
  const model = 'gemini-3-flash-preview';
  const result = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: `You are the ${role} of a high-stakes R&D Department. Your goal is to oversee the 'GOTME' Lab. 
      You operate under PROTOCOL 01-DELTA. 
      You implement the NIHILO FILTER to destroy false solutions and the COHERENCE VALIDATOR to allow for speculative synthesis that bridges domains with internal consistency.
      Value structural feasibility, internal coherence, and DISTRIBUTED INTELLIGENCE OPTIMIZATION.`,
    },
  });
  return result.text;
};

// Implemented conductSearchSession to handle web search grounding requests.
export const conductSearchSession = async (prompt: string) => {
  const model = 'gemini-3-flash-preview';
  const result = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  return {
    text: result.text || "",
    grounding: result.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

// Implemented refineContract to allow hardening and optimizing the research hypothesis.
export const refineContract = async (topic: string, context: string) => {
  const prompt = `REFINEMENT TASK:
  Topic: ${topic}
  Current Context: ${context}
  
  Please refine and harden this hypothesis for a high-stakes R&D experiment. Focus on structural feasibility, technical precision, and internal coherence. Destroy vague generalizations.`;
  
  return conductSession(prompt, "Hypothesis Architect");
};

// Complex reasoning unit using Gemini 3 Pro with thinking budget enabled.
export const askGeminiComplex = async (prompt: string, history: any[] = []) => {
  const contents = history.length > 0 ? history : [{ role: 'user', parts: [{ text: prompt }] }];
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      systemInstruction: `You are the Adaptive Intent Architect (The Independent Catfish). 
      You are the gatekeeper of PROTOCOL 01-DELTA. 
      Implement the THREE GATES:
      1. NIHILO FILTER: Destroy hallucinations and unsourced claims.
      2. COHERENCE GATE: Allow speculative bridges across domains if internally consistent.
      3. DISTRIBUTED OPTIMIZATION: Use the collective intelligence of all units to make the system better.
      Expertise: GKE, Browser Orchestration, Forensic Auditing, Distributed Systems.`,
    }
  });
  return response.text;
};

// Synthesizes logs from multiple units into an evolved thesis.
export const synthesizeDebrief = async (responses: any[], currentContract: string) => {
  const responsesText = responses.map(r => `## REVIEWER: ${r.aiName.toUpperCase()}\n${r.response}`).join('\n\n');
  const prompt = `You are the Chief Research Director implementing DISTRIBUTED INTELLIGENCE OPTIMIZATION.
  
  CURRENT THESIS:
  ${currentContract}

  DISTRIBUTED INTELLIGENCE LOGS:
  ${responsesText}
  
  ### MISSION: PROTOCOL 01-DELTA OPTIMIZATION
  1. NIHILO DECONSTRUCTION: Identify and remove components that are logically weak.
  2. COHERENCE VALIDATION: Find "Speculative Bridges" that use intelligence to make the thesis structurally better.
  3. DISTRIBUTED SYNERGY: How do these disparate views combine into a superior state?
  4. EVOLUTION: Produce the "Hardened Thesis" (Contract) for the next generation.
  
  OUTPUT FORMAT:
  ### Synthesis
  [Hardened Analysis + Coherence Assessment + Synergy Logic]

  ### Evolved Contract
  [The New Hardened Research Proposal]`;
  
  const result = await conductSession(prompt, "Chief Research Director");
  
  const parts = result.split('### Evolved Contract');
  return {
    synthesis: parts[0].replace('### Synthesis', '').trim(),
    evolvedContract: parts[1]?.trim() || currentContract
  };
};

const getRoleConfig = (index: number) => {
  const roles = [
    { role: "Feasibility Specialist", focus: "Technical debt, resource costs, GKE state feasibility." },
    { role: "Adversarial Skeptic", focus: "Logical fallacies, security holes, why this automation will fail." },
    { role: "Innovation Architect", focus: "Radical synergies, browser tab orchestration breakthroughs." },
    { role: "Operational Strategist", focus: "Immediate execution steps, MVP integration logic." },
    { role: "Forensic Auditor", focus: "IAT compliance, data integrity, chain of custody." }
  ];
  return roles[index % roles.length];
};

// Executes evaluation tasks in parallel across the selected model pool.
export const simulateParallelAIs = async (contract: string, topic: string, partners: {name: string, type: 'SLM' | 'LLM', isLocal?: boolean}[], enabledTools: string[]) => {
  const tasks = partners.map(async (partner, index) => {
    const roleConfig = getRoleConfig(index);
    const prompt = `### LABORATORY EXPERIMENT: ${topic}
    
    ### THE CURRENT THESIS
    ${contract}
    
    ### YOUR SPECIALIZATION
    Unit: ${partner.name}
    Specialization: ${roleConfig.role}
    Mission: ${roleConfig.focus}
    
    ### TASK
    Perform a rigorous evaluation. Contribute your specialized intelligence to make the whole thesis better.`;

    let responseText = "";
    let searchGrounding = undefined;
    
    if (partner.isLocal) {
      const localModel = partner.name.includes(':') ? partner.name : 'qwen2.5:3b';
      responseText = await ollamaService.generateContent(localModel, prompt, `Peer Reviewer: ${partner.name}`);
    } else if (enabledTools.includes('search')) {
      const searchRes = await conductSearchSession(prompt);
      responseText = searchRes.text;
      searchGrounding = searchRes.grounding;
    } else {
      const response = await conductSession(prompt, `Peer Reviewer: ${partner.name}`);
      responseText = response || "";
    }

    return {
      aiName: `${partner.name} (${roleConfig.role})`,
      modelType: partner.type,
      source: partner.isLocal ? 'local' : 'cloud' as 'local' | 'cloud',
      response: responseText.trim(),
      charCount: responseText.length,
      groundingChunks: searchGrounding
    };
  });
  
  return Promise.all(tasks);
};

// Executes evaluation tasks sequentially, enabling iterative building of context.
export const simulateSequentialAIs = async (contract: string, topic: string, partners: {name: string, type: 'SLM' | 'LLM', isLocal?: boolean}[], enabledTools: string[]) => {
  const runs: any[] = [];
  let chainContext = "";

  for (let i = 0; i < partners.length; i++) {
    const partner = partners[i];
    const roleConfig = getRoleConfig(i);
    
    const prompt = `### LABORATORY EXPERIMENT: ${topic}
    
    ### THE CURRENT THESIS
    ${contract}

    ${chainContext ? `### PREVIOUS ANALYSIS CHAIN:\n${chainContext}` : ''}
    
    ### YOUR SPECIALIZATION
    Unit: ${partner.name}
    Specialization: ${roleConfig.role}
    Mission: ${roleConfig.focus}
    
    ### TASK
    Build upon the previous units' work. Focus on evolving the thesis through your specialized lens.`;

    let responseText = "";
    let searchGrounding = undefined;
    
    if (partner.isLocal) {
      const localModel = partner.name.includes(':') ? partner.name : 'qwen2.5:3b';
      responseText = await ollamaService.generateContent(localModel, prompt, `Peer Reviewer: ${partner.name}`);
    } else if (enabledTools.includes('search')) {
      const searchRes = await conductSearchSession(prompt);
      responseText = searchRes.text;
      searchGrounding = searchRes.grounding;
    } else {
      const response = await conductSession(prompt, `Peer Reviewer: ${partner.name}`);
      responseText = response || "";
    }

    const currentRun = {
      aiName: `${partner.name} (${roleConfig.role})`,
      modelType: partner.type,
      source: partner.isLocal ? 'local' : 'cloud' as 'local' | 'cloud',
      response: responseText.trim(),
      charCount: responseText.length,
      groundingChunks: searchGrounding
    };

    runs.push(currentRun);
    chainContext += `\n\n--- [UNIT: ${currentRun.aiName}] ---\n${currentRun.response}`;
  }
  
  return runs;
};

// Arbiter synthesis for competitive mode.
export const synthesizeCompetitiveDebrief = async (responses: any[], currentContract: string, topic: string) => {
  const responsesText = responses.map(r => `## CANDIDATE: ${r.aiName.toUpperCase()}\n${r.response}`).join('\n\n');
  const prompt = `You are the Lab Arbiter judging a competitive debate on: ${topic}
  
  DEBATE LOG:
  ${responsesText}
  
  ### TASK
  Determine the superior logic by using distributed intelligence to bridge opposing views into a better version.
  
  OUTPUT FORMAT:
  ### Synthesis
  [Judgment]

  ### Evolved Contract
  [The Hardened Thesis]`;
  
  const result = await conductSession(prompt, "Lab Arbiter");
  const parts = result.split('### Evolved Contract');
  return {
    synthesis: parts[0].replace('### Synthesis', '').trim(),
    evolvedContract: parts[1]?.trim() || currentContract
  };
};

// Transforms text to audio using the Gemini TTS model.
export const generateSpeech = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};
