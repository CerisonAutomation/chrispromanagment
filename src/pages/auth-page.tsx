import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { z } from "zod";

const credSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(128),
  displayName: z.string().trim().max(80).optional(),
});

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  // Redirect already-authenticated users out of /auth
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/admin", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const parsed = credSchema.safeParse({ email, password, displayName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
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
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        navigate("/admin", { replace: true });
      }
    } catch (err) {
      const msg = err?.message || "Authentication failed";
      if (msg.toLowerCase().includes("already")) {
        toast.error("That email is already registered — try signing in instead.");
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#0a0a0b] px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-[#111318] border border-[#1e1e22] rounded-xl p-8 space-y-4"
      >
        <div className="text-center mb-2">
          <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#a08550] flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-[#0a0a0b]" />
          </div>
          <h1 className="text-xl font-bold text-[#f0ede8]">
            {mode === "signup" ? "Create Account" : "Sign In"}
          </h1>
          <p className="text-xs text-[#5a5a5e] mt-1">
            Admin & editor access only after role assignment.
          </p>
        </div>

        {mode === "signup" && (
          <div>
            <Label className="text-xs text-[#a1a1aa]">Display name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] mt-1"
            />
          </div>
        )}
        <div>
          <Label className="text-xs text-[#a1a1aa]">Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-[#a1a1aa]">Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={8}
            className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] mt-1"
          />
        </div>

        <Button
          type="submit"
          disabled={busy}
          className="w-full bg-[#D4AF37] hover:bg-[#E5C158] text-[#0a0a0b] h-11 font-semibold"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "signup" ? "Create Account" : "Sign In"}
        </Button>

        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="w-full text-xs text-[#7a7a7e] hover:text-[#D4AF37] mt-2"
        >
          {mode === "signup" ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </button>

        <Link to="/" className="block text-center text-[10px] text-[#3a3a3e] hover:text-[#5a5a5e] mt-4">
          ← Back to site
        </Link>
      </form>
    </div>
  );
}
