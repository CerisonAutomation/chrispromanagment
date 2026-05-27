import { useState, memo } from "react";
import { ChevronDown, Layout } from "lucide-react";

interface BlockDef {
  id: string;
  label: string;
  desc: string;
}

interface Category {
  id: string;
  label: string;
  blocks: BlockDef[];
}

interface Props {
  cat: Category;
  onAdd: (type: string) => void;
}

export const BlockCategorySection = memo(({ cat, onAdd }: Props) => {
  const [open, setOpen] = useState(cat.id === "page" || cat.id === "content");

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-1.5 text-[8px] uppercase tracking-wider text-[#4a4a4e] font-medium hover:text-[#C9A84C] transition-colors"
      >
        <span>{cat.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-1 mb-1">
          {cat.blocks.map(({ type, label, desc }) => (
            <button
              key={type}
              onClick={() => onAdd(type)}
              title={desc}
              className="flex flex-col items-start gap-1 p-2 bg-[#0e0e10] border border-[#1a1a1e] rounded hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5 group text-left"
            >
              <Layout className="w-3.5 h-3.5 text-[#5a5a5e] group-hover:text-[#C9A84C]" />
              <span className="text-[8px] text-[#6a6a6e] group-hover:text-[#f0ede8] font-medium truncate w-full">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
