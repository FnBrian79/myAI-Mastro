
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ollamaService } from "./ollama";

// Always use process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const conductSession = async (prompt: string, role: string = "Chief Research Director") => {
  const model = 'gemini-3-flash-preview';
  const result = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: `You are the ${role} of a high-stakes R&D Department. Your goal is to oversee the 'GOTME' Lab. 
      You treat every idea as an experimental hypothesis that must be hardened through feasibility analysis and destructive logic. 
      You value truth over consensus. If an idea is unfeasible, say so clearly.`,
    },
  });
  return result.text;
};

export const askGeminiComplex = async (prompt: string, history: any[] = []) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: history.length > 0 ? history : prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      systemInstruction: "You are the Senior Strategic Advisor for the R&D Lab. You use deep reasoning to evaluate complex research proposals and suggest architectural pivots.",
    }
  });
  return response.text;
};

export const askGeminiFast = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: prompt,
  });
  return response.text;
};

export const conductSearchSession = async (prompt: string) => {
   const response = await ai.models.generateContent({
     model: "gemini-3-flash-preview",
     contents: prompt,
     config: {
       tools: [{googleSearch: {}}],
     },
  });
  return {
    text: response.text,
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

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

export const refineContract = async (topic: string, context: string) => {
  const prompt = `Lab Architect: Review and improve this Research Proposal:
  
  RESEARCH IDEA: ${topic}
  PROPOSED PARAMETERS: ${context}
  
  Provide a more rigorous, scientifically challenging, and constraint-heavy version of this proposal. Ensure it is formatted to be stress-tested for feasibility and optimization potential.`;
  
  const result = await conductSession(prompt, "Thesis Architect");
  return result;
};

export const simulateParallelAIs = async (contract: string, topic: string, partners: {name: string, type: 'SLM' | 'LLM', isLocal?: boolean}[], enabledTools: string[]) => {
  // Define specialized R&D roles for the sub-agents
  const roles = [
    { role: "Feasibility Specialist", focus: "Can we build this? Identify technical debt, resource costs, and physical/digital limitations." },
    { role: "Adversarial Skeptic", focus: "Why will this fail? Find the logical fallacies, security holes, and structural weaknesses. Attack the hypothesis." },
    { role: "Innovation Architect", focus: "How can we make this 10x better? Look for radical synergies, untapped tech, or paradigm shifts." },
    { role: "Operational Strategist", focus: "What are the immediate execution steps? Focus on integration and MVP deployment." },
    { role: "Ethics & Risk Unit", focus: "What are the hidden dangers? Regulatory hurdles, human impact, and long-term consequences." }
  ];

  const tasks = partners.map(async (partner, index) => {
    const roleConfig = roles[index % roles.length];
    
    const intensityNote = partner.type === 'SLM' 
      ? "You are a specialized SLM unit. Focus on hyper-concise logic and atomic failure points." 
      : "You are a broad LLM unit. Focus on systemic risk, creative breakthroughs, and paradigm shifts.";

    const toolNote = enabledTools.length > 0 
      ? `Experimental tools enabled: ${enabledTools.join(', ')}. Use [TOOL_USE: toolName | action | result] for interactions.`
      : "No external tools available for this trial.";

    const prompt = `### LABORATORY EXPERIMENT: ${topic}
    
    ### THE CURRENT THESIS (RESEARCH PROPOSAL)
    ${contract}
    
    ### YOUR ASSIGNED SPECIALIZATION
    Unit: ${partner.name}
    Specialization: ${roleConfig.role}
    Mission: ${roleConfig.focus}
    ${intensityNote}
    ${toolNote}
    
    ### TASK: PEER REVIEW & DECONSTRUCTION
    Perform a rigorous evaluation of the 'CURRENT THESIS'. 
    DO NOT provide generic praise. 
    Identify specifically where the feasibility is low, where the logic breaks, or where a 10x improvement is hidden. 
    Your report should be brutal, honest, and high-signal. Focus on FEASIBILITY and WAYS TO IMPROVE.`;

    let responseText = "";
    let searchGrounding = undefined;
    
    if (partner.isLocal) {
      const localModel = partner.name.includes(':') ? partner.name : 'qwen2.5:3b';
      responseText = await ollamaService.generateContent(localModel, prompt, `Peer Reviewer: ${partner.name} (${roleConfig.role})`);
    } else if (enabledTools.includes('search')) {
      const searchRes = await conductSearchSession(prompt);
      responseText = searchRes.text;
      searchGrounding = searchRes.grounding;
    } else {
      const response = await conductSession(prompt, `Peer Reviewer: ${partner.name} (${roleConfig.role})`);
      responseText = response || "";
    }

    const toolCalls: any[] = [];
    const toolRegex = /\[TOOL_USE:\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^\]]+)\]/g;
    let match;
    while ((match = toolRegex.exec(responseText)) !== null) {
      toolCalls.push({
        toolName: match[1].trim(),
        action: match[2].trim(),
        result: match[3].trim()
      });
    }

    return {
      aiName: `${partner.name} (${roleConfig.role})`,
      modelType: partner.type,
      source: partner.isLocal ? 'local' : 'cloud' as 'local' | 'cloud',
      response: responseText.replace(toolRegex, '').trim(),
      charCount: responseText.length,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      groundingChunks: searchGrounding
    };
  });
  
  return Promise.all(tasks);
};

export const synthesizeDebrief = async (responses: any[], currentContract: string, previousSynthesis: string = "") => {
  const responsesText = responses.map(r => `## REVIEWER: ${r.aiName.toUpperCase()}\n${r.response}`).join('\n\n');
  const prompt = `You are the Chief Research Director.
  
  CURRENT THESIS:
  ${currentContract}

  LAB RESULTS (CRITICAL REVIEWS):
  ${responsesText}
  
  ### MISSION: STRATEGIC SYNTHESIS
  1. FEASIBILITY ANALYSIS: Assign a Feasibility Score (0-100%) and justify it based on sub-agent feedback.
  2. BREAKTHROUGH DISCOVERY: What was the single most valuable improvement or "Better Way" suggested?
  3. OPTIMIZATION PATHWAY: Synthesize the findings into a clear, hardened strategy for the next generation.
  4. EVOLVE THE THESIS: Rewrite the Proposal (Contract) to include the breakthroughs and solve the feasibility gaps identified.
  
  OUTPUT FORMAT:
  ### Synthesis
  **FEASIBILITY SCORE:** [0-100]%
  
  **Analysis:** [Summary of breakthroughs and surviving logic]

  ### Evolved Contract
  [The New Hardened Research Proposal for the next generation]`;
  
  const result = await conductSession(prompt, "Chief Research Director");
  
  const parts = result.split('### Evolved Contract');
  return {
    synthesis: parts[0].replace('### Synthesis', '').trim(),
    evolvedContract: parts[1]?.trim() || currentContract
  };
};

export const synthesizeCompetitiveDebrief = async (responses: any[], currentContract: string, topic: string) => {
  const responsesText = responses.map(r => `## CANDIDATE: ${r.aiName.toUpperCase()}\n${r.response}`).join('\n\n');
  const prompt = `You are the R&D Lab Arbiter judging a competitive debate on: ${topic}
  
  CURRENT LABORATORY THESIS:
  ${currentContract}

  DEBATE LOG:
  ${responsesText}
  
  ### TASK
  1. Determine which sub-agent successfully 'decapitated' the current thesis with better logic.
  2. Select the superior logical strands based on feasibility and 10x improvement potential.
  3. REWRITE THE THESIS: Update the parameters for the next generation to reflect the winner's dominance.
  
  OUTPUT FORMAT:
  ### Synthesis
  [Judgment summary and feasibility notes]

  ### Evolved Contract
  [The Hardened Thesis for the next generation]`;
  
  const result = await conductSession(prompt, "Lab Arbiter");
  const parts = result.split('### Evolved Contract');
  return {
    synthesis: parts[0].replace('### Synthesis', '').trim(),
    evolvedContract: parts[1]?.trim() || currentContract
  };
};
