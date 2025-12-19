
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
      You value truth over consensus.`,
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
  
  Provide a more rigorous, scientifically challenging, and constraint-heavy version of this proposal. Ensure it is formatted to be stress-tested.`;
  
  const result = await conductSession(prompt, "Thesis Architect");
  return result;
};

export const simulateParallelAIs = async (contract: string, topic: string, partners: {name: string, type: 'SLM' | 'LLM', isLocal?: boolean}[], enabledTools: string[]) => {
  // Define specialized R&D roles for the sub-agents
  const roles = [
    { role: "Feasibility Specialist", focus: "Can we build this? What are the technical bottlenecks and resource requirements?" },
    { role: "Adversarial Skeptic", focus: "Why will this fail? Find the logical fallacies, security holes, and structural weaknesses." },
    { role: "Innovation Architect", focus: "How can we make this 10x better? What are the untapped synergies or radical improvements?" },
    { role: "Operational Strategist", focus: "What are the immediate next steps? How does this integrate with existing systems?" },
    { role: "Ethics & Compliance Unit", focus: "What are the hidden risks? Are there governing constraints being ignored?" }
  ];

  const tasks = partners.map(async (partner, index) => {
    const roleConfig = roles[index % roles.length];
    
    const intensityNote = partner.type === 'SLM' 
      ? "You are a specialized SLM unit. Focus on hyper-concise logic and atomic failure points." 
      : "You are a broad LLM unit. Focus on systemic risk, creative breakthroughs, and paradigm shifts.";

    const toolNote = enabledTools.length > 0 
      ? `Experimental tools enabled: ${enabledTools.join(', ')}. Use [TOOL_USE: toolName | action | result] if needed.`
      : "No external tools available.";

    const prompt = `### EXPERIMENT: ${topic}
    
    ### THE CURRENT THESIS (RESEARCH PROPOSAL)
    ${contract}
    
    ### YOUR LABORATORY ROLE
    Unit Identity: ${partner.name}
    Assigned Specialization: ${roleConfig.role}
    Mission Focus: ${roleConfig.focus}
    ${intensityNote}
    ${toolNote}
    
    ### TASK: PEER REVIEW & DECONSTRUCTION
    Perform a rigorous evaluation of the 'CURRENT THESIS'. 
    DO NOT provide generic praise. 
    Identify specifically where the feasibility is low, where the logic breaks, or where a 10x improvement is hidden. 
    Your report should be brutal, honest, and high-signal.`;

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
  1. FEASIBILITY SCORE (0-100): Based on the sub-agent reports, how viable is this current thesis?
  2. BREAKTHROUGH DISCOVERY: What was the single most valuable improvement suggested by the reviewers?
  3. OPTIMIZATION PATHWAY: Synthesize the findings into a clear, hardened strategy.
  4. EVOLVE THE THESIS: Rewrite the Research Proposal (Contract) to include the breakthroughs and solve the feasibility gaps identified.
  
  OUTPUT FORMAT:
  ### Synthesis
  [Executive Summary of the Feasibility and Optimization Pathways]

  ### Evolved Contract
  [The New Hardened Research Proposal for the next generation]`;
  
  const result = await conductSession(prompt, "Chief Research Director");
  
  const parts = result.split('### Evolved Contract');
  return {
    synthesis: parts[0].replace('### Synthesis', '').trim(),
    evolvedContract: parts[1]?.trim() || currentContract
  };
};
