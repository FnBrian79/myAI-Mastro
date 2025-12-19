
import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';

const SCRIPT_CONTENT = `import os
import asyncio
import json
import google.generativeai as genai

# --- CONFIGURATION ---
API_KEY = os.environ.get("API_KEY")
if not API_KEY:
    print("CRITICAL: Set API_KEY env var.")
    exit(1)

genai.configure(api_key=API_KEY)
conductor = genai.GenerativeModel('gemini-3-flash-preview')

async def call_ai(prompt, system_instruction=""):
    response = await conductor.generate_content_async(
        contents=prompt,
        generation_config={"response_mime_type": "text/plain"},
        # Note: for specific roles, we wrap in system_instruction
    )
    return response.text

async def run_iteration(round_num, topic, contract_context):
    print(f"--- GENERATION {round_num} ---")
    print(f"Active Contract: {contract_context[:50]}...")
    
    # Phase: Parallel Breeding
    agents = ["Analyst", "Critique", "Visionary"]
    tasks = [call_ai(f"CONTRACT: {contract_context}\\nTOPIC: {topic}\\nROLE: {role}") for role in agents]
    responses = await asyncio.gather(*tasks)
    
    # Phase: Evolutionary Synthesis
    synthesis_prompt = f"""
    SUB-AGENT DATA: {responses}
    CURRENT CONTRACT: {contract_context}
    TASK: Synthesize gains AND EVOLVE THE CONTRACT for Round {round_num + 1}.
    Format:
    ### Synthesis
    ...
    ### Evolved Contract
    ...
    """
    evolution_res = await call_ai(synthesis_prompt)
    return evolution_res

async def main():
    topic = "Automated GKE Security Patching"
    contract = "Adhere to NIST guidelines. Prioritize zero-downtime."
    
    for i in range(1, 4):
        res = await run_iteration(i, topic, contract)
        # Parse for next round
        if "### Evolved Contract" in res:
            contract = res.split("### Evolved Contract")[1].strip()
        print(f"Evolution complete. Contract strengthened for next generation.")

if __name__ == "__main__":
    asyncio.run(main())`;

const AutomationView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SCRIPT_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Evolutionary Automation</h2>
          <p className="text-slate-500 text-sm">Deploy a Python worker that handles iterative contract refinement.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Script'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
          <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
              </div>
              <span className="ml-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">evolution_worker.py</span>
            </div>
            <Terminal size={14} className="text-slate-500" />
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-indigo-300 font-mono text-xs leading-relaxed">
              <code>{SCRIPT_CONTENT}</code>
            </pre>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Cpu size={18} className="text-indigo-600" />
              Worker Blueprint
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Iterative Evolution</div>
                <p className="text-xs text-slate-500">The script automatically feeds the synthesized "Evolved Contract" into the next cycle.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Parallelism</div>
                <p className="text-xs text-slate-500">Uses asyncio to ensure all generation tasks fire simultaneously.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationView;
