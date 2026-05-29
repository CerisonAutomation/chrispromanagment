import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";

export default function NotFound() {
  return (
    <PageShell>
      <div className="grid min-h-[80vh] place-items-center text-center">
        <div className="animate-slide-up">
          <div className="font-display text-8xl text-gold/30">404</div>
          <p className="mt-4 font-display text-2xl">That page wandered off.</p>
          <p className="mt-2 text-muted-foreground">It might have checked out early.</p>
          <Button asChild variant="gold" className="mt-8">
            <Link to="/">Take me home</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
