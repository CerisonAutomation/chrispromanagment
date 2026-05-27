import { useState, useEffect, memo } from "react";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  block: { data?: Record<string, unknown> } | null;
  onUpdate: (key: string, value: unknown) => void;
}

export const JSONEditor = memo(({ block, onUpdate }: Props) => {
  const [draft, setDraft] = useState("");
  const [valid, setValid] = useState(true);

  useEffect(() => {
    if (block) {
setDraft(JSON.stringify(block.data, null, 2));
}
  }, [block]);

  const handleChange = (val: string) => {
    setDraft(val);
    try {
 JSON.parse(val); setValid(true); 
} catch {
 setValid(false); 
}
  };

  const applyChanges = () => {
    if (!valid) {
return;
}
    try {
      const parsed = JSON.parse(draft);
      Object.keys(parsed).forEach(key => onUpdate(key, parsed[key]));
      toast.success("JSON changes applied");
    } catch {
      toast.error("Invalid JSON");
    }
  };

  const dirty = block && draft !== JSON.stringify(block.data, null, 2);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-[#1e1e22]">
        <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium">Block JSON</span>
        <span className={`text-[10px] font-medium ${valid ? "text-green-500" : "text-red-400"}`}>{valid ? "Valid" : "Invalid"}</span>
      </div>
      <textarea
        value={draft}
        onChange={e => handleChange(e.target.value)}
        spellCheck={false}
        className={`flex-1 font-mono text-[10px] leading-relaxed bg-[#08080a] p-3 resize-none focus:outline-none ${valid ? "text-[#f0ede8]" : "text-red-300"}`}
      />
      <div className="p-3 border-t border-[#1e1e22] flex gap-2">
        <Button variant="outline" onClick={() => setDraft(JSON.stringify(block?.data, null, 2))} disabled={!dirty} className="flex-1 h-8 text-xs border-[#2a2a2e] text-[#6a6a6e]">
          <RotateCcw className="w-3 h-3 mr-1" />Reset
        </Button>
        <Button onClick={applyChanges} disabled={!valid || !dirty} className="flex-1 h-8 text-xs bg-[#C9A84C] text-[#0a0a0b]">
          <Check className="w-3 h-3 mr-1" />Apply
        </Button>
      </div>
    </div>
  );
});
