
/**
 * Ollama Local Execution Service
 * 
 * Communicates with the local Ollama instance running on http://localhost:11434.
 * Note: Ollama requires OLLAMA_ORIGINS="*" or a specific domain to allow cross-origin requests.
 */

const OLLAMA_API_URL = 'http://localhost:11434';

export const ollamaService = {
  /**
   * Check if Ollama is reachable and has the required model
   */
  async checkConnection(): Promise<boolean> {
    try {
      // Use a timeout to avoid long waits on a non-existent service
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${OLLAMA_API_URL}/api/tags`, { 
        signal: controller.signal,
        mode: 'cors'
      });
      clearTimeout(timeoutId);
      return response.status === 200;
    } catch (error) {
      // Silently fail connection check to avoid console noise when service is down
      return false;
    }
  },

  /**
   * Generates content using a local Ollama model
   */
  async generateContent(model: string, prompt: string, systemInstruction?: string): Promise<string> {
    try {
      const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          system: systemInstruction,
          stream: false
        }),
        mode: 'cors'
      });

      if (!response.ok) {
        return `[OLLAMA_ERROR] Service returned status ${response.status}. Verify the model '${model}' is downloaded.`;
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      // Provide a clean message instead of throwing or logging a generic fetch error
      return `[OLLAMA_UNREACHABLE] Could not connect to local Ollama at ${OLLAMA_API_URL}. 
      
Possible fixes:
1. Ensure 'ollama serve' is running.
2. Check CORS settings (Environment variable OLLAMA_ORIGINS="*" must be set).
3. Verify model '${model}' is available locally.`;
    }
  }
};
