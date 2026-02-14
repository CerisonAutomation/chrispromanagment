import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

interface FloatingCTAProps {
  onOpenWizard: () => void;
}

export default function FloatingCTA({ onOpenWizard }: FloatingCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 right-6 z-40 flex flex-col gap-3"
        >
          <button
            onClick={onOpenWizard}
            className="px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-full shadow-[var(--shadow-gold)] hover:bg-gold-light transition-all hover:scale-105"
          >
            Free Assessment
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="self-end p-2.5 rounded-full border border-border bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
