import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Mail, Zap } from "lucide-react";
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
const magicSchema = z.object({ email: z.string().trim().email("Enter a valid email") });

type Mode = "signin" | "signup" | "reset" | "magic";

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

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
      if (mode === "magic") {
        const parsed = magicSchema.safeParse({ email });
        if (!parsed.success) { toast.error(parsed.error.issues[0].message); setBusy(false); return; }
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        setMagicSent(true);
        toast.success("Magic link sent — check your inbox.");
        return;
      }

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

  const switchMode = (m: Mode) => {
    setMode(m);
    setMagicSent(false);
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0b] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504016798967-59a258a5b184?w=1200&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0b]/85 via-[#0a0a0b]/65 to-[#0a0a0b]/92" />
        <div className="relative z-10 flex flex-col justify-between p-12 h-full">
          {/* Studio Pro logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#D4AF37] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" fill="#0a0a0b" stroke="#0a0a0b" strokeWidth="0.5" />
                <path d="M12 6L16 8.5V13.5L12 16L8 13.5V8.5L12 6Z" fill="#D4AF37" />
              </svg>
            </div>
            <div>
              <p className="text-[#F5F5F0] text-sm font-semibold tracking-wide">Studio Pro</p>
              <p className="text-[#71717A] text-[10px] uppercase tracking-[0.2em]">Admin Console</p>
            </div>
          </div>

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
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#0a0a0b]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-[#D4AF37] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" fill="#0a0a0b" />
                <path d="M12 6L16 8.5V13.5L12 16L8 13.5V8.5L12 6Z" fill="#D4AF37" />
              </svg>
            </div>
            <div>
              <p className="text-[#F5F5F0] text-sm font-semibold">Studio Pro</p>
              <p className="text-[#71717A] text-[10px] uppercase tracking-widest">Admin Console</p>
            </div>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-0 mb-8 border border-white/10">
            {([["signin", "Sign In"], ["magic", "Magic Link"], ["signup", "Register"]] as const).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-xs uppercase tracking-widest transition-colors ${
                  mode === m
                    ? "bg-[#D4AF37] text-[#0a0a0b] font-semibold"
                    : "text-[#71717A] hover:text-[#A1A1AA]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-7">
            <div className="w-10 h-0.5 bg-[#D4AF37] mb-5" />
            {mode === "signin" && <h1 className="font-['Playfair_Display'] text-3xl text-[#F5F5F0] mb-1">Welcome Back</h1>}
            {mode === "signup" && <h1 className="font-['Playfair_Display'] text-3xl text-[#F5F5F0] mb-1">Create Account</h1>}
            {mode === "reset" && <h1 className="font-['Playfair_Display'] text-3xl text-[#F5F5F0] mb-1">Reset Password</h1>}
            {mode === "magic" && <h1 className="font-['Playfair_Display'] text-3xl text-[#F5F5F0] mb-1">Passwordless Sign In</h1>}
            <p className="text-[#71717A] text-sm">
              {mode === "signin" && "Sign in to access Studio Pro."}
              {mode === "signup" && "Admin access granted after role assignment."}
              {mode === "reset" && "We'll send a reset link to your email."}
              {mode === "magic" && "Receive a one-click login link via email."}
            </p>
          </div>

          {/* Magic link sent state */}
          {mode === "magic" && magicSent ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <p className="text-[#F5F5F0] font-medium">Check your inbox</p>
              <p className="text-[#71717A] text-sm">A magic link was sent to <span className="text-[#A1A1AA]">{email}</span>. Click it to sign in instantly.</p>
              <button
                type="button"
                onClick={() => { setMagicSent(false); setEmail(""); }}
                className="text-xs text-[#5a5a5e] hover:text-[#D4AF37] transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5" autoComplete="on">
              {mode === "signup" && (
                <div>
                  <Label className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-2 block">Display Name</Label>
                  <Input
                    name="name"
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
                  name="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  required
                  placeholder="you@example.com"
                  className="bg-[#111215] border-white/10 text-[#F5F5F0] rounded-none h-12 focus:border-[#D4AF37] focus:ring-0 placeholder:text-[#3a3a3e]"
                />
              </div>

              {(mode === "signin" || mode === "signup") && (
                <div>
                  <Label className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-2 block">Password</Label>
                  <div className="relative">
                    <Input
                      name="password"
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
                    <div className="flex items-center justify-between mt-2">
                      <button
                        type="button"
                        onClick={() => switchMode("reset")}
                        className="text-xs text-[#5a5a5e] hover:text-[#D4AF37] transition-colors"
                      >
                        Forgot password?
                      </button>
                      <button
                        type="button"
                        onClick={() => switchMode("magic")}
                        className="text-xs text-[#5a5a5e] hover:text-[#D4AF37] transition-colors flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" /> Use magic link
                      </button>
                    </div>
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
                ) : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : mode === "magic" ? "Send Magic Link" : "Send Reset Link"}
              </Button>
            </form>
          )}

          {/* Bottom nav */}
          {!magicSent && (
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              {mode === "reset" && (
                <button onClick={() => switchMode("signin")} className="text-xs text-[#5a5a5e] hover:text-[#D4AF37] transition-colors">
                  Back to <span className="text-[#A1A1AA]">sign in</span>
                </button>
              )}
              {mode === "signup" && (
                <button onClick={() => switchMode("signin")} className="text-xs text-[#5a5a5e] hover:text-[#D4AF37] transition-colors">
                  Already have an account? <span className="text-[#A1A1AA]">Sign in</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
