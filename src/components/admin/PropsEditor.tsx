import { memo } from "react";
import { Layout, Sparkles, Plus, Trash2, MousePointer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SCHEMAS } from "@/lib/blocks";

interface Props {
  block: { type: string; data?: Record<string, unknown> } | null;
  onUpdate: (key: string, value: unknown) => void;
  onAI: (key: string, label: string) => void;
  isGenerating: boolean;
}

export const PropsEditor = memo(({ block, onUpdate, onAI, isGenerating }: Props) => {
  const schema = SCHEMAS[block?.type];

  if (!block) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#5a5a5e] text-xs p-6">
        <MousePointer className="w-10 h-10 mb-4 opacity-30" />
        <p className="text-center">Click a block on the canvas to edit its content</p>
      </div>
    );
  }

  const renderField = (key: string, f: any, val: unknown) => {
    const common = "h-9 text-xs bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] focus:border-[#C9A84C]/50";
    if (f.type === "array") {
      const items = val || [];
      return (
        <div key={key} className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium">{f.label}</span>
            <button onClick={() => onUpdate(key, [...items, {}])} className="p-1 text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map((item: any, i: number) => (
              <div key={i} className="p-2 bg-[#08080a] border border-[#1e1e22] rounded">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] text-[#4a4a4e] font-medium">#{i + 1}</span>
                  <button onClick={() => onUpdate(key, items.filter((_, idx) => idx !== i))} className="p-0.5 text-red-400/60 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                </div>
                {(f.itemFields || Object.keys(item)).map((sf: string) => (
                  <div key={sf} className="mb-1">
                    <p className="text-[9px] text-[#4a4a4e] mb-0.5">{sf}</p>
                    <Input
                      value={(item[sf] || "").toString()}
                      onChange={e => {
                        const n = [...items];
                        n[i] = { ...n[i], [sf]: e.target.value };
                        onUpdate(key, n);
                      }}
                      className={`${common} h-7 text-[10px]`}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div key={key} className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium">{f.label}</span>
          {f.ai && <button onClick={() => onAI(key, f.label)} disabled={isGenerating} className="p-1 text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors"><Sparkles className="w-3 h-3" /></button>}
        </div>
        {f.type === "textarea" ? (
          <Textarea value={(val || "").toString()} onChange={e => onUpdate(key, e.target.value)} className={`${common} min-h-[70px] resize-none`} />
        ) : f.type === "select" ? (
          <select value={(val || f.options?.[0]) as string} onChange={e => onUpdate(key, e.target.value)} className={`${common} w-full rounded-md px-3`}>
            {(f.options || []).map((o: string) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : f.type === "number" ? (
          <Input type="number" value={val as number || 0} onChange={e => onUpdate(key, parseInt(e.target.value) || 0)} className={common} />
        ) : f.type === "boolean" ? (
          <input type="checkbox" checked={!!val} onChange={e => onUpdate(key, e.target.checked)} className="w-5 h-5 accent-[#C9A84C]" />
        ) : (
          <Input value={(val || "").toString()} onChange={e => onUpdate(key, e.target.value)} className={common} />
        )}
      </div>
    );
  };

  if (schema) {
    const Icon = schema.icon || Layout;
    return (
      <div>
        <div className="flex items-center gap-3 p-4 border-b border-[#1e1e22]">
          <div className="w-9 h-9 rounded bg-[#C9A84C]/15 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-[#C9A84C]" /></div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-[#f0ede8] block truncate">{schema.label}</span>
            <span className="text-[9px] text-[#4a4a4e]">{block.type}</span>
          </div>
          <button onClick={() => onAI("_all", "all")} disabled={isGenerating} className="px-2.5 py-1.5 text-[9px] bg-[#C9A84C]/10 text-[#C9A84C] rounded hover:bg-[#C9A84C]/20 font-medium flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3" />{isGenerating ? "..." : "AI All"}
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
          {Object.entries(schema.fields).map(([k, f]) => renderField(k, f, block.data?.[k]))}
        </div>
      </div>
    );
  }

  const blockData = block.data || {};
  const blockTypeLabel = block.type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const renderSmartField = (key: string, val: unknown) => {
    const common = "h-9 text-xs bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] focus:border-[#C9A84C]/50";
    if (Array.isArray(val)) {
      return (
        <div key={key} className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium">{key}</span>
            <button onClick={() => onUpdate(key, [...val, {}])} className="p-1 text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {val.map((item: unknown, i: number) => (
              <div key={i} className="p-2 bg-[#08080a] border border-[#1e1e22] rounded">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] text-[#4a4a4e]">#{i + 1}</span>
                  <button onClick={() => onUpdate(key, val.filter((_, idx) => idx !== i))} className="p-0.5 text-red-400/60 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                </div>
                {typeof item === "object" ? Object.entries(item as Record<string, unknown>).map(([sf, sv]) => (
                  <div key={sf} className="mb-1">
                    <p className="text-[9px] text-[#4a4a4e] mb-0.5">{sf}</p>
                    <Input
                      value={(sv || "").toString()}
                      onChange={e => {
                        const n = [...val];
                        n[i] = { ...(n[i] as object), [sf]: e.target.value };
                        onUpdate(key, n);
                      }}
                      className={`${common} h-7 text-[10px]`}
                    />
                  </div>
                )) : (
                  <Input
                    value={(item || "").toString()}
                    onChange={e => {
                      const n = [...val];
                      n[i] = e.target.value;
                      onUpdate(key, n);
                    }}
                    className={`${common} h-7 text-[10px]`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (typeof val === "boolean") {
      return (
        <div key={key} className="flex items-center gap-3 mb-3">
          <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium flex-1">{key}</span>
          <input type="checkbox" checked={!!val} onChange={e => onUpdate(key, e.target.checked)} className="w-4 h-4 accent-[#C9A84C]" />
        </div>
      );
    }
    if (typeof val === "number") {
      return (
        <div key={key} className="mb-3">
          <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium block mb-1">{key}</span>
          <Input type="number" value={val as number} onChange={e => onUpdate(key, parseInt(e.target.value) || 0)} className={common} />
        </div>
      );
    }
    const isLong = String(val).length > 80;
    return (
      <div key={key} className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium">{key}</span>
          <button onClick={() => onAI(key, key)} disabled={isGenerating} className="p-1 text-[#C9A84C]/40 hover:text-[#C9A84C] transition-colors" title="AI generate">
            <Sparkles className="w-3 h-3" />
          </button>
        </div>
        {isLong ? (
          <Textarea value={(val || "").toString()} onChange={e => onUpdate(key, e.target.value)} className={`${common} min-h-[60px] resize-none h-auto`} />
        ) : (
          <Input value={(val || "").toString()} onChange={e => onUpdate(key, e.target.value)} className={common} />
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-3 p-4 border-b border-[#1e1e22]">
        <div className="w-9 h-9 rounded bg-[#C9A84C]/15 flex items-center justify-center">
          <Layout className="w-5 h-5 text-[#C9A84C]" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-[#f0ede8] block truncate">{blockTypeLabel}</span>
          <span className="text-[9px] text-[#4a4a4e]">{block.type}</span>
        </div>
        <button onClick={() => onAI("_all", "all")} disabled={isGenerating} className="px-2.5 py-1.5 text-[9px] bg-[#C9A84C]/10 text-[#C9A84C] rounded hover:bg-[#C9A84C]/20 font-medium flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3" />{isGenerating ? "..." : "AI All"}
        </button>
      </div>
      <div className="p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
        <p className="text-[9px] text-[#4a4a4e] mb-4 uppercase tracking-wider">Block fields (click text on canvas to edit inline)</p>
        {Object.entries(blockData).map(([k, v]) => renderSmartField(k, v))}
        {Object.keys(blockData).length === 0 && (
          <p className="text-[#5a5a5e] text-xs text-center py-4">No editable fields. Edit content by clicking directly on the canvas.</p>
        )}
      </div>
    </div>
  );
});
