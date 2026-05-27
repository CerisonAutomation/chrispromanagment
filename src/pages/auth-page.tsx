// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/auth";
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
      if (session) {
navigate("/admin", { replace: true });
}
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
navigate("/admin", { replace: true });
}
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "magic") {
        const parsed = magicSchema.safeParse({ email });
        if (!parsed.success) {
 toast.error(parsed.error.issues[0].message); setBusy(false); return; 
}
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) {
throw error;
}
        setMagicSent(true);
        toast.success("Magic link sent — check your inbox.");
        return;
      }

      if (mode === "reset") {
        const parsed = resetSchema.safeParse({ email });
        if (!parsed.success) {
 toast.error(parsed.error.issues[0].message); setBusy(false); return; 
}
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=update`,
        });
        if (error) {
throw error;
}
        toast.success("Password reset link sent — check your email.");
        setMode("signin");
        return;
      }

      if (mode === "signup") {
        const parsed = signUpSchema.safeParse({ email, password, displayName });
        if (!parsed.success) {
 toast.error(parsed.error.issues[0].message); setBusy(false); return; 
}
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) {
throw error;
}
        toast.success("Check your email to confirm your account.");
        return;
      }

      // signin
      const parsed = signInSchema.safeParse({ email, password });
      if (!parsed.success) {
 toast.error(parsed.error.issues[0].message); setBusy(false); return; 
}
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
throw error;
}
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
          {/* Logo */}
          <div>
            <img
              src="https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/image-high-82icb0.png"
              alt="Christiano Property Management"
              className="h-14 w-auto object-contain"
              onError={e => { (e.target as HTMLImageElement).src = "https://customer-assets.emergentagent.com/job_malta-stays-direct/artifacts/ta7za4jp_cv_logo_no_bg_gold.png"; }}
            />
          </div>

          <div>
            <p className="text-[#C9A84C] text-xs uppercase tracking-[0.3em] mb-4">Christiano Property Management</p>
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
          <div className="lg:hidden mb-10">
            <img
              src="https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/image-high-82icb0.png"
              alt="Christiano Property Management"
              className="h-12 w-auto object-contain"
              onError={e => { (e.target as HTMLImageElement).src = "https://customer-assets.emergentagent.com/job_malta-stays-direct/artifacts/ta7za4jp_cv_logo_no_bg_gold.png"; }}
            />
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
                    ? "bg-[#C9A84C] text-[#0a0a0b] font-semibold"
                    : "text-[#71717A] hover:text-[#A1A1AA]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-7">
            <div className="w-10 h-0.5 bg-[#C9A84C] mb-5" />
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
              <div className="w-14 h-14 bg-[#C9A84C]/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-[#C9A84C]" />
              </div>
              <p className="text-[#F5F5F0] font-medium">Check your inbox</p>
              <p className="text-[#71717A] text-sm">A magic link was sent to <span className="text-[#A1A1AA]">{email}</span>. Click it to sign in instantly.</p>
              <button
                type="button"
                onClick={() => {
 setMagicSent(false); setEmail(""); 
}}
                className="text-xs text-[#5a5a5e] hover:text-[#C9A84C] transition-colors"
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
                    className="bg-[#111215] border-white/10 text-[#F5F5F0] rounded-none h-12 focus:border-[#C9A84C] focus:ring-0 placeholder:text-[#3a3a3e]"
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
                  className="bg-[#111215] border-white/10 text-[#F5F5F0] rounded-none h-12 focus:border-[#C9A84C] focus:ring-0 placeholder:text-[#3a3a3e]"
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
                      className="bg-[#111215] border-white/10 text-[#F5F5F0] rounded-none h-12 focus:border-[#C9A84C] focus:ring-0 placeholder:text-[#3a3a3e] pr-10"
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
                        className="text-xs text-[#5a5a5e] hover:text-[#C9A84C] transition-colors"
                      >
                        Forgot password?
                      </button>
                      <button
                        type="button"
                        onClick={() => switchMode("magic")}
                        className="text-xs text-[#5a5a5e] hover:text-[#C9A84C] transition-colors flex items-center gap-1"
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
                className="w-full bg-[#C9A84C] hover:bg-[#D4B85C] text-[#0a0a0b] h-12 font-semibold rounded-none uppercase tracking-widest text-xs"
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : mode === "magic" ? "Send Magic Link" : "Send Reset Link"}
              </Button>

              {(mode === "signin" || mode === "signup") && (
                <>
                  <div className="relative flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] uppercase tracking-widest text-[#3a3a3e]">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: "google",
                        options: { redirectTo: `${window.location.origin}/admin` },
                      });
                      if (error) { toast.error(error.message); setBusy(false); }
                    }}
                    className="w-full h-12 flex items-center justify-center gap-3 border border-white/10 hover:border-[#C9A84C]/40 text-[#A1A1AA] hover:text-[#F5F5F0] transition-all text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                </>
              )}
            </form>
          )}

          {/* Bottom nav */}
          {!magicSent && (
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              {mode === "reset" && (
                <button onClick={() => switchMode("signin")} className="text-xs text-[#5a5a5e] hover:text-[#C9A84C] transition-colors">
                  Back to <span className="text-[#A1A1AA]">sign in</span>
                </button>
              )}
              {mode === "signup" && (
                <button onClick={() => switchMode("signin")} className="text-xs text-[#5a5a5e] hover:text-[#C9A84C] transition-colors">
                  Already have an account? <span className="text-[#A1A1AA]">Sign in</span>
                </button>
              )}
            </div>
          )}

          {/* DEV BYPASS — development only, not visible in production */}
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => {
                useAuthStore.setState({
                  session: { user: { id: 'dev', email: 'dev@local' } } as never,
                  user: { id: 'dev', email: 'dev@local' } as never,
                  isAdmin: true,
                  isEditor: true,
                  isLoading: false,
                  roles: ['admin'],
                });
                navigate('/admin', { replace: true });
              }}
              className="mt-4 w-full py-2 text-[10px] uppercase tracking-widest text-[#3a3a3e] hover:text-[#C9A84C] border border-white/5 hover:border-[#C9A84C]/20 transition-all"
            >
              ⚡ Dev bypass
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
