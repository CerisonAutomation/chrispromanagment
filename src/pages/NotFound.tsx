import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-hero text-center">
      <div>
        <div className="font-display text-7xl">404</div>
        <p className="mt-3 text-muted-foreground">That page wandered off.</p>
        <Button asChild variant="gold" className="mt-6"><Link to="/">Take me home</Link></Button>
      </div>
    </div>
  );
}
