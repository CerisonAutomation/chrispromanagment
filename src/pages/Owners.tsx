import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function Owners() {
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("owner_inquiries").insert({
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      phone: String(fd.get("phone") || ""),
      property_type: String(fd.get("property_type") || ""),
      location: String(fd.get("location") || ""),
      bedrooms: String(fd.get("bedrooms") || ""),
      additional_info: String(fd.get("info") || ""),
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Thanks — we'll be in touch within 24h");
    e.currentTarget.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container flex items-center justify-between py-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/"><ArrowLeft className="h-4 w-4" /> Home</Link>
        </Button>
        <div className="font-display text-lg">Owners</div>
        <div className="w-20" />
      </header>

      <section className="container grid items-start gap-12 py-10 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl md:text-6xl">List your property.<br/><span className="bg-gradient-gold bg-clip-text text-transparent">Keep your sanity.</span></h1>
          <p className="mt-6 max-w-lg text-muted-foreground">
            We handle Guesty sync, pricing, guest comms, cleaning, maintenance, owner statements — all of it.
            You get a real person on WhatsApp and monthly statements that actually balance.
          </p>
          <ul className="mt-10 space-y-3 text-sm">
            {[
              "Multi-channel listing across Airbnb, Booking.com, direct",
              "Dynamic pricing with real Malta market data",
              "24/7 guest concierge in EN / MT / IT",
              "Transparent monthly statements + tax-ready exports",
            ].map((t) => (
              <li key={t} className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold" />{t}</li>
            ))}
          </ul>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request a callback</CardTitle>
            <CardDescription>Tell us about your property. No spam, ever.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Name</Label><Input name="name" required /></div>
                <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" required /></div>
                <div className="space-y-2"><Label>Phone</Label><Input name="phone" /></div>
                <div className="space-y-2"><Label>Location</Label><Input name="location" placeholder="Sliema, St Julian's…" /></div>
                <div className="space-y-2"><Label>Property type</Label><Input name="property_type" placeholder="Penthouse, villa…" /></div>
                <div className="space-y-2"><Label>Bedrooms</Label><Input name="bedrooms" type="number" min={0} /></div>
              </div>
              <div className="space-y-2">
                <Label>Anything else?</Label>
                <textarea name="info" rows={3} className="w-full rounded-md border border-input bg-muted/40 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <Button type="submit" variant="gold" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send inquiry"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
