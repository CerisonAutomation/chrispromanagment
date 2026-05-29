import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubPageHeaderProps {
  backTo: string;
  backLabel?: string;
  title: string;
}

export function SubPageHeader({ backTo, backLabel = "Back", title }: SubPageHeaderProps) {
  return (
    <header className="container flex items-center justify-between py-5">
      <Button asChild variant="ghost" size="sm" className="gap-1.5">
        <Link to={backTo}>
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </Button>
      <div className="font-display text-lg">{title}</div>
      {/* Spacer to balance header */}
      <div className="w-24" aria-hidden />
    </header>
  );
}
