import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password required"),
});
const signUpSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  displayName: z.string().trim().max(80).optional(),
});
const resetSchema = z.object({ email: z.string().trim().email("Enter a valid email") });

type Mode = "signin" | "signup" | "reset";

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/admin", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "reset") {
        const parsed = resetSchema.safeParse({ email });
        if (!parsed.success) { toast.error(parsed.error.issues[0].message); setBusy(false); return; }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=update`,
        });
        if (error) throw error;
        toast.success("Password reset link sent — check your email.");
        setMode("signin");
        return;
      }

      if (mode === "signup") {
        const parsed = signUpSchema.safeParse({ email, password, displayName });
        if (!parsed.success) { toast.error(parsed.error.issues[0].message); setBusy(false); return; }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
        return;
      }

      // signin
      const parsed = signInSchema.safeParse({ email, password });
      if (!parsed.success) { toast.error(parsed.error.issues[0].message); setBusy(false); return; }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back");
      navigate("/admin", { replace: true });
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Authentication failed";
      if (msg.toLowerCase().includes("already")) {
        toast.error("That email is already registered — try signing in.");
      } else if (msg.toLowerCase().includes("invalid")) {
        toast.error("Incorrect email or password.");
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<Mode, string> = {
    signin: "Welcome Back",
    signup: "Create Account",
    reset: "Reset Password",
  };

  const subtitles: Record<Mode, string> = {
    signin: "Sign in to access your admin dashboard.",
    signup: "Admin access is granted after role assignment.",
    reset: "We'll send a reset link to your email.",
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0b] flex">
      {/* Left decorative panel — hidden on small screens */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504016798967-59a258a5b184?w=1200&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0b]/80 via-[#0a0a0b]/60 to-[#0a0a0b]/90" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-3 group">
            <ArrowLeft className="w-4 h-4 text-[#D4AF37] group-hover:-translate-x-1 transition-transform" />
            <span className="text-[#A1A1AA] text-sm group-hover:text-[#D4AF37] transition-colors">Back to site</span>
          </Link>
          <div>
            <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] mb-4">Christiano Property Management</p>
            <h2 className="font-['Playfair_Display'] text-4xl text-[#F5F5F0] leading-tight mb-4">
              Malta's Premier<br />Luxury Rentals
            </h2>
            <p className="text-[#A1A1AA] text-sm leading-relaxed max-w-xs">
              Manage your portfolio with full visibility over bookings, revenue, and guest satisfaction from one elegant dashboard.
            </p>
          </div>
          <p className="text-[#3a3a3e] text-xs">© 2025 Christiano Property Management</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile back link */}
          <Link to="/" className="lg:hidden flex items-center gap-2 text-[#A1A1AA] text-sm mb-8 hover:text-[#D4AF37] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </Link>

          <div className="mb-8">
            <div className="w-12 h-1 bg-[#D4AF37] mb-6" />
            <h1 className="font-['Playfair_Display'] text-3xl text-[#F5F5F0] mb-2">{titles[mode]}</h1>
            <p className="text-[#A1A1AA] text-sm">{subtitles[mode]}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <Label className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-2 block">Display Name</Label>
                <Input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  autoComplete="name"
                  placeholder="Your name"
                  className="bg-[#111215] border-white/10 text-[#F5F5F0] rounded-none h-12 focus:border-[#D4AF37] focus:ring-0 placeholder:text-[#3a3a3e]"
                />
              </div>
            )}

            <div>
              <Label className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-2 block">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="bg-[#111215] border-white/10 text-[#F5F5F0] rounded-none h-12 focus:border-[#D4AF37] focus:ring-0 placeholder:text-[#3a3a3e]"
              />
            </div>

            {mode !== "reset" && (
              <div>
                <Label className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-2 block">Password</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    required
                    placeholder={mode === "signup" ? "Min. 8 characters" : "Your password"}
                    className="bg-[#111215] border-white/10 text-[#F5F5F0] rounded-none h-12 focus:border-[#D4AF37] focus:ring-0 placeholder:text-[#3a3a3e] pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5a5e] hover:text-[#A1A1AA]"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => setMode("reset")}
                    className="text-xs text-[#5a5a5e] hover:text-[#D4AF37] mt-2 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-[#D4AF37] hover:bg-[#E5C158] text-[#0a0a0b] h-12 font-semibold rounded-none uppercase tracking-widest text-xs"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center space-y-2">
            {mode === "signin" && (
              <button
                onClick={() => setMode("signup")}
                className="text-xs text-[#5a5a5e] hover:text-[#D4AF37] transition-colors"
              >
                Need an account? <span className="text-[#A1A1AA]">Sign up</span>
              </button>
            )}
            {mode === "signup" && (
              <button
                onClick={() => setMode("signin")}
                className="text-xs text-[#5a5a5e] hover:text-[#D4AF37] transition-colors"
              >
                Already have an account? <span className="text-[#A1A1AA]">Sign in</span>
              </button>
            )}
            {mode === "reset" && (
              <button
                onClick={() => setMode("signin")}
                className="text-xs text-[#5a5a5e] hover:text-[#D4AF37] transition-colors"
              >
                Back to <span className="text-[#A1A1AA]">sign in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
