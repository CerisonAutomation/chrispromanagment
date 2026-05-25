import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[#0F0F10] border-b border-white/10 h-16 flex items-center">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full flex items-center justify-between">
        <Link to="/" className="font-['Playfair_Display'] text-2xl text-[#D4AF37]">
          Christiano PM
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/properties" className="text-sm text-[#F5F5F0] hover:text-[#D4AF37] transition-colors">Properties</Link>
          <Link to="/property-owners" className="text-sm text-[#F5F5F0] hover:text-[#D4AF37] transition-colors">For Owners</Link>
          <Link to="/map" className="text-sm text-[#F5F5F0] hover:text-[#D4AF37] transition-colors">Map</Link>
          <Button asChild variant="ghost" className="text-[#F5F5F0] hover:text-[#D4AF37]">
            <Link to="/auth">Sign In</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
