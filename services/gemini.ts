
import { GoogleGenAI } from "@google/genai";

// Always use process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const conductSession = async (prompt: string, role: string = "Conductor") => {
  const model = 'gemini-3-flash-preview';
  const result = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: `You are the ${role} in a GOTME (Governed Orchestrated Thought Machine Engine) session. Your goal is to provide high-signal, machine-consumable analysis.`,
    },
  });
  // Accessing text property directly as per @google/genai guidelines
  return result.text;
};

export const refineContract = async (topic: string, context: string) => {
  const prompt = `Review and improve this orchestration contract:
  
  TOPIC: ${topic}
  CONTEXT: ${context}
  
  Provide a more robust, clear, and challenging version of this contract for sub-agents to follow. Return ONLY the refined contract text.`;
  
  const result = await conductSession(prompt, "Contract Refiner");
  return result;
};

export const simulateParallelAIs = async (contract: string, topic: string, models: string[]) => {
  // To simulate parallel execution in one go, we can ask Gemini to generate 
  // distinct responses from multiple perspectives or run them as separate promises.
  // We'll run them as separate promises for "true" parallelism simulation.
  
  const tasks = models.map(async (modelName) => {
    const prompt = `Based on this context:
    ${contract}
    
    Topic: ${topic}
    
    You are acting as the model: ${modelName}. Provide your analysis, insights, and recommendations from your specific perspective. Be rigorous and machine-consumable.`;
    
    const response = await conductSession(prompt, `${modelName} Role`);
    return {
      aiName: modelName,
      response: response || "",
      charCount: (response || "").length
    };
  });
  
  return Promise.all(tasks);
};

export const synthesizeDebrief = async (responses: any[], previousSynthesis: string = "") => {
  const responsesText = responses.map(r => `## ${r.aiName.toUpperCase()}\n${r.response}`).join('\n\n');
  const prompt = `Here are the responses from multiple AIs:
  
  ${responsesText}
  
  ${previousSynthesis ? `PREVIOUS SYNTHESIS:\n${previousSynthesis}` : ''}
  
  Synthesize these perspectives into a unified, high-completeness document.
  1. Identify common themes.
  2. Highlight unique insights.
  3. Note contradictions or disagreements.
  4. Challenge the current consensus and suggest improvements for the next iteration.
  
  Provide the most comprehensive analysis possible.`;
  
  const result = await conductSession(prompt, "Synthesizer");
  return result;
};
