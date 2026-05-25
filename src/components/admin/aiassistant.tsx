import { useState, useRef } from "react";
import { 
  Sparkles, Send, Wand2, RefreshCw, Copy, Check,
  FileText, Image, Palette, MessageSquare, Lightbulb,
  Zap, Brain, PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

// AI Action presets
const AI_PRESETS = [
  {
    category: "Content Generation",
    actions: [
      { 
        id: "headline", 
        icon: PenTool, 
        label: "Generate Headlines", 
        prompt: "Generate 5 compelling headlines for a luxury property management company in Malta",
        color: "#D4AF37"
      },
      { 
        id: "description", 
        icon: FileText, 
        label: "Property Description", 
        prompt: "Write a luxury property description for a vacation rental",
        color: "#3B82F6"
      },
      { 
        id: "tagline", 
        icon: Lightbulb, 
        label: "Brand Taglines", 
        prompt: "Generate 5 taglines for a premium vacation rental brand in Malta",
        color: "#10B981"
      },
      { 
        id: "testimonial", 
        icon: MessageSquare, 
        label: "Testimonial Template", 
        prompt: "Generate a realistic 5-star guest testimonial for a luxury Malta vacation rental",
        color: "#8B5CF6"
      },
    ],
  },
  {
    category: "SEO & Marketing",
    actions: [
      { 
        id: "meta", 
        icon: Zap, 
        label: "SEO Meta Tags", 
        prompt: "Generate SEO-optimized title and description for a Malta vacation rental website",
        color: "#F59E0B"
      },
      { 
        id: "keywords", 
        icon: Brain, 
        label: "Keyword Research", 
        prompt: "List 20 high-intent keywords for Malta vacation rentals and property management",
        color: "#EC4899"
      },
    ],
  },
];

export const AIAssistant = ({ cms, updateSection, setHasUnsavedChanges }) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState("");
  const [conversation, setConversation] = useState([]);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const generateContent = async (customPrompt = null) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setIsGenerating(true);
    setConversation(prev => [...prev, { role: "user", content: finalPrompt }]);

    try {
      const res = await fetch(`${API}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: finalPrompt,
          context: {
            brand: cms.brand?.name,
            industry: "vacation rental property management",
            location: "Malta",
          }
        }),
      });

      const data = await res.json();
      
      if (data.content) {
        setResponse(data.content);
        setConversation(prev => [...prev, { role: "assistant", content: data.content }]);
      } else if (data.error) {
        toast.error(data.error);
        setConversation(prev => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
      }
    } catch (error) {
      toast.error("AI generation failed. Please try again.");
      setConversation(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsGenerating(false);
      setPrompt("");
    }
  };

  const handlePresetClick = (preset) => {
    setPrompt(preset.prompt);
    generateContent(preset.prompt);
  };

  const copyToClipboard = async () => {
    if (!response) return;
    await navigator.clipboard.writeText(response);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const applyToSection = (sectionKey, field) => {
    if (!response) return;
    // This would apply the AI-generated content to a CMS section
    toast.success(`Applied to ${sectionKey}.${field}`);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F59E0B] flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-[#0F0F10]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F0]">AI Content Assistant</h1>
          <p className="text-sm text-[#71717A]">Generate content, headlines, and copy with AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preset Actions */}
        <div className="lg:col-span-1 space-y-4">
          <p className="text-xs uppercase tracking-widest text-[#71717A]">Quick Actions</p>
          {AI_PRESETS.map(category => (
            <div key={category.category} className="space-y-2">
              <p className="text-sm text-[#A1A1AA]">{category.category}</p>
              {category.actions.map(action => (
                <button
                  key={action.id}
                  onClick={() => handlePresetClick(action)}
                  disabled={isGenerating}
                  className="w-full flex items-center gap-3 p-3 bg-[#0F0F10] border border-white/10 rounded-lg hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all text-left disabled:opacity-50"
                >
                  <div 
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${action.color}20` }}
                  >
                    <action.icon className="w-4 h-4" style={{ color: action.color }} />
                  </div>
                  <span className="text-sm text-[#F5F5F0]">{action.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2 flex flex-col h-[600px]">
          {/* Conversation */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-[#0a0a0b] border border-white/10 rounded-t-lg">
            {conversation.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-[#D4AF37] mx-auto mb-3 opacity-50" />
                  <p className="text-[#A1A1AA]">Ask me to generate content</p>
                  <p className="text-sm text-[#71717A]">Or use a quick action from the sidebar</p>
                </div>
              </div>
            ) : (
              conversation.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      msg.role === "user"
                        ? "bg-[#D4AF37] text-[#0F0F10]"
                        : "bg-[#161618] text-[#F5F5F0] border border-white/10"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-[#161618] text-[#F5F5F0] border border-white/10 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                    <span className="text-sm text-[#A1A1AA]">Generating...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Response Actions */}
          {response && (
            <div className="flex items-center gap-2 p-2 bg-[#0F0F10] border-x border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="text-[#A1A1AA] hover:text-[#F5F5F0]"
              >
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyToSection("hero", "headline")}
                className="text-[#A1A1AA] hover:text-[#F5F5F0]"
              >
                Apply to Hero
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyToSection("about", "title")}
                className="text-[#A1A1AA] hover:text-[#F5F5F0]"
              >
                Apply to About
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 p-4 bg-[#0F0F10] border border-white/10 rounded-b-lg">
            <Input
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && generateContent()}
              placeholder="Ask AI to generate content..."
              className="flex-1 bg-[#0a0a0b] border-white/10 text-[#F5F5F0]"
              disabled={isGenerating}
            />
            <Button
              onClick={() => generateContent()}
              disabled={isGenerating || !prompt.trim()}
              className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158]"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
