import ConciergeChat from '@/components/concierge/ConciergeChat';
import { Sparkles } from 'lucide-react';

export default function ConciergePage() {
  return (
    <div className="min-h-screen bg-[#0F0F10] p-6 flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#F5F5F0] flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#C9A84C]" />
          AI Concierge
        </h1>
        <p className="text-sm text-[#71717A] mt-1">Intelligent guest assistance powered by AI</p>
      </div>
      <div className="flex-1 bg-[#161618] border border-white/10 rounded-lg overflow-hidden min-h-[600px]">
        <ConciergeChat />
      </div>
    </div>
  );
}
