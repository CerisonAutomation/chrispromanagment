export function Footer() {
  return (
    <footer className="bg-[#0A0A0B] border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[#A1A1AA] text-sm">
            © {new Date().getFullYear()} Christiano Property Management. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="/privacy-policy" className="text-sm text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-sm text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">Terms of Service</a>
            <a href="/contact" className="text-sm text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
