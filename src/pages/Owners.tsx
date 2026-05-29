import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/shared/PageShell";
import { SubPageHeader } from "@/components/shared/SubPageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useCmsContent } from "@/hooks/use-cms-content";

interface HeroCms   { headline: string; headline_accent: string; body: string }
interface BulletCms { items: string[] }
interface FormCms   { title: string; description: string; submit_cta: string }
interface WhyItem   { title: string; body: string }
interface WhyCms    { headline: string; items: WhyItem[] }

const HERO_DEF:    HeroCms   = { headline: "List your property.", headline_accent: "Keep your sanity.", body: "We handle Guesty sync, pricing, guest comms, cleaning, maintenance, owner statements — all of it. You get a real person on WhatsApp and monthly statements that actually balance." };
const BULLETS_DEF: BulletCms = { items: ["Multi-channel listing across Airbnb, Booking.com, direct", "Dynamic pricing with real Malta market data", "24/7 guest concierge in EN / MT / IT", "Transparent monthly statements + tax-ready exports"] };
const FORM_DEF:    FormCms   = { title: "Request a callback", description: "Tell us about your property. No spam, ever.", submit_cta: "Send enquiry" };
const WHY_DEF:     WhyCms    = { headline: "Why owners choose Christiano", items: [{ title: "You keep control", body: "Block dates, set minimum stays, review guest profiles — all from a clean owner dashboard." }, { title: "Transparent financials", body: "Monthly PDF statements, real-time payout tracker, and VAT-ready exports. No surprises." }, { title: "Full-service management", body: "Linen, cleaning, maintenance, key-hand, concierge — we cover the whole guest lifecycle." }] };

const FIELD_ROW = "grid gap-4 sm:grid-cols-2";
const FIELD     = "space-y-2";

export default function Owners() {
  const [submitting, setSubmitting] = useState(false);
  const { get } = useCmsContent();
  const hero    = get<HeroCms>("owners__hero", HERO_DEF);
  const bullets = get<BulletCms>("owners__bullets", BULLETS_DEF);
  const form    = get<FormCms>("owners__form_header", FORM_DEF);
  const why     = get<WhyCms>("owners__why_us", WHY_DEF);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("owner_inquiries").insert({
      name: String(fd.get("name")), email: String(fd.get("email")),
      phone: String(fd.get("phone") || ""), property_type: String(fd.get("property_type") || ""),
      location: String(fd.get("location") || ""), bedrooms: String(fd.get("bedrooms") || ""),
      additional_info: String(fd.get("info") || ""),
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Thanks — we'll be in touch within 24h");
    e.currentTarget.reset();
  };

  return (
    <PageShell nav={false}>
      <SubPageHeader backTo="/" backLabel="Home" title="Owners" />

      <section className="container grid items-start gap-12 pb-16 pt-4 lg:grid-cols-2">
        {/* Left */}
        <div>
          <h1 className="text-4xl md:text-6xl text-balance">
            {hero.headline}<br />
            <span className="bg-gradient-gold bg-clip-text text-transparent">{hero.headline_accent}</span>
          </h1>
          <p className="mt-6 max-w-lg text-muted-foreground text-pretty">{hero.body}</p>
          <ul className="mt-10 space-y-3 text-sm" aria-label="Benefits">
            {bullets.items.map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form */}
        <Card>
          <CardHeader>
            <CardTitle>{form.title}</CardTitle>
            <CardDescription>{form.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className={FIELD_ROW}>
                <div className={FIELD}><Label>Name *</Label><Input name="name" required autoComplete="name" /></div>
                <div className={FIELD}><Label>Email *</Label><Input name="email" type="email" required autoComplete="email" /></div>
                <div className={FIELD}><Label>Phone</Label><Input name="phone" type="tel" autoComplete="tel" /></div>
                <div className={FIELD}><Label>Location</Label><Input name="location" placeholder="Sliema, St Julian's…" /></div>
                <div className={FIELD}><Label>Property type</Label><Input name="property_type" placeholder="Penthouse, villa…" /></div>
                <div className={FIELD}><Label>Bedrooms</Label><Input name="bedrooms" type="number" min={0} /></div>
              </div>
              <div className={FIELD}>
                <Label htmlFor="owners-info">Anything else?</Label>
                <textarea id="owners-info" name="info" rows={3} className="w-full rounded-md border border-input bg-muted/40 px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
              </div>
              <Button type="submit" variant="gold" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : form.submit_cta}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Why us */}
      <section className="container pb-24">
        <h2 className="mb-8 text-2xl md:text-3xl">{why.headline}</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {why.items.map((item) => (
            <div key={item.title} className="glass rounded-xl p-6">
              <CheckCircle2 className="mb-3 h-5 w-5 text-gold" aria-hidden />
              <div className="font-medium">{item.title}</div>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
