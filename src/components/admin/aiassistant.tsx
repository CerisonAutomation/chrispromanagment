import { useState, memo } from "react";
import { Sparkles, Wand2, Loader2, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Props {
  block: { type: string; data?: Record<string, unknown> } | null;
  onApply: (prompt: string) => void;
  isGenerating: boolean;
}

const QUICK_PROMPTS = ["Shorter", "More Luxury", "Action Words"];

export const AIAssistant = memo(({ block, onApply, isGenerating }: Props) => {
  const [prompt, setPrompt] = useState("");
  const [expanded, setExpanded] = useState(false);

  const runAI = () => {
    if (!prompt.trim() || !block) return;
    onApply(prompt);
    setPrompt("");
  };

  return (
    <div className="border-b border-[#1e1e22]">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 text-sm font-medium text-[#f0ede8] hover:text-[#C9A84C] transition-colors">
        <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#C9A84C]" />AI Assistant</span>
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="e.g. Make the headline more urgent and action-oriented. Keep the luxurious tone."
            className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] text-xs min-h-[80px] resize-none focus:border-[#C9A84C]/50"
          />
          <div className="grid grid-cols-3 gap-2">
            {QUICK_PROMPTS.map(q => (
              <button key={q} onClick={() => setPrompt(p => p + (p ? ". " : "") + q)} className="px-2 py-1.5 text-[9px] bg-[#0e0e10] border border-[#1e1e22] rounded text-[#6a6a6e] hover:text-[#C9A84C] hover:border-[#C9A84C]/30">
                {q}
              </button>
            ))}
          </div>
          <Button onClick={runAI} disabled={isGenerating || !prompt.trim()} className="w-full bg-[#C9A84C] hover:bg-[#D4B85C] text-[#0a0a0b] h-9 text-xs font-semibold">
            {isGenerating ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Generating...</> : <><Wand2 className="w-3.5 h-3.5 mr-2" />Generate Draft</>}
          </Button>
        </div>
      )}
    </div>
  );
});
