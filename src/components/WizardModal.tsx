import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Check, Shield, BarChart3, Clock, MapPin, Home, Phone } from "lucide-react";
import { MALTA_LOCALITIES, PROPERTY_TYPES, BEDROOM_OPTIONS, SLEEPS_OPTIONS } from "@/lib/malta-localities";
import {
  WizardData, INITIAL_WIZARD_DATA,
  computeTier, computePlan,
  submitLead, saveDraft, loadDraft, clearDraft,
} from "@/lib/submission";

interface WizardModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  { title: "About You", subtitle: "Tell us where you're starting", icon: Home },
  { title: "Your Property", subtitle: "Property details in Malta", icon: MapPin },
  { title: "Your Goals", subtitle: "What you're looking for", icon: BarChart3 },
  { title: "Get In Touch", subtitle: "How can we reach you?", icon: Phone },
];

const MALTA_REGIONS = [
  { label: "Northern", areas: ["Mellieħa", "Mġarr", "San Pawl il-Baħar", "Naxxar", "Mosta"] },
  { label: "Central", areas: ["Birkirkara", "Msida", "Gżira", "Ta' Xbiex", "San Ġwann", "Swieqi", "Iklin", "Balzan", "Lija", "Attard"] },
  { label: "St Julian's & Sliema", areas: ["San Ġiljan", "Sliema", "Pembroke"] },
  { label: "Valletta & Three Cities", areas: ["Valletta", "Floriana", "Birgu", "Bormla", "Isla", "Kalkara"] },
  { label: "South", areas: ["Marsaxlokk", "Marsaskala", "Żejtun", "Birżebbuġa"] },
  { label: "Gozo", areas: ["Għajnsielem", "Għarb", "Għasri", "Kerċem", "Munxar", "Nadur", "Qala", "San Lawrenz", "Sannat", "Xagħra", "Xewkija", "Żebbuġ (Gozo)", "Fontana"] },
];

export default function WizardModal({ open, onClose }: WizardModalProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(INITIAL_WIZARD_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [localitySearch, setLocalitySearch] = useState("");
  const [showLocalities, setShowLocalities] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const draft = loadDraft();
      if (draft) setData(draft);
      setSubmitted(false);
      setStep(0);
    }
  }, [open]);

  useEffect(() => { saveDraft(data); }, [data]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const update = useCallback((patch: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const filteredLocalities = localitySearch
    ? MALTA_LOCALITIES.filter((l) => l.toLowerCase().includes(localitySearch.toLowerCase()))
    : [];

  const canNext = (): boolean => {
    switch (step) {
      case 0: return !!data.status;
      case 1: return !!data.locality && !!data.propertyType && !!data.bedrooms;
      case 2: return !!data.timeline && !!data.goal;
      case 3: return !!data.name && !!data.email && !!data.phone && data.consent;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    await submitLead(data);
    clearDraft();
    setSubmitted(true);
  };

  if (!open) return null;

  const tier = computeTier(data);
  const plan = computePlan(data);
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/85 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          ref={modalRef}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto glass-surface rounded-t-2xl sm:rounded-2xl border border-border/50"
          role="dialog"
          aria-modal="true"
          aria-label="Property assessment wizard"
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-border/30 rounded-t-2xl overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Header */}
          <div className="sticky top-0 z-10 glass-surface border-b border-border/50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!submitted && (
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  {(() => {
                    const Icon = STEPS[step].icon;
                    return <Icon size={16} className="text-primary" />;
                  })()}
                </div>
              )}
              <div>
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  {submitted ? "Thank You!" : STEPS[step].title}
                </h2>
                {!submitted && (
                  <p className="text-xs text-muted-foreground">{STEPS[step].subtitle}</p>
                )}
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Step indicators */}
          {!submitted && (
            <div className="px-6 pt-4 flex items-center justify-between">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    i < step ? "bg-primary text-primary-foreground" :
                    i === step ? "bg-primary/20 text-primary border border-primary" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {i < step ? <Check size={12} /> : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px transition-colors ${i < step ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={submitted ? "success" : step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {submitted ? (
                  <SuccessScreen tier={tier} plan={plan} />
                ) : (
                  <>
                    {step === 0 && <Step0 data={data} update={update} />}
                    {step === 1 && (
                      <Step1
                        data={data}
                        update={update}
                        localitySearch={localitySearch}
                        setLocalitySearch={setLocalitySearch}
                        showLocalities={showLocalities}
                        setShowLocalities={setShowLocalities}
                        filteredLocalities={filteredLocalities}
                      />
                    )}
                    {step === 2 && <Step2 data={data} update={update} />}
                    {step === 3 && <Step3 data={data} update={update} />}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          {!submitted && (
            <div className="sticky bottom-0 glass-surface border-t border-border/50 px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {step === 3 ? "Final step" : `${3 - step} steps left`}
                </span>
                {step < 3 ? (
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canNext()}
                    className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canNext()}
                    className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Get My Assessment <Check size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Trust bar */}
          {!submitted && (
            <div className="px-6 pb-4 flex items-center gap-4 text-[0.65rem] text-muted-foreground">
              <span className="flex items-center gap-1"><Shield size={10} /> No markups</span>
              <span className="flex items-center gap-1"><BarChart3 size={10} /> Owner dashboard</span>
              <span className="flex items-center gap-1"><Clock size={10} /> 24hr reply</span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Step0({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  const options = [
    { value: "not_listed" as const, label: "I'm new to short-lets", desc: "I have a property in Malta I'd like to start renting", emoji: "🏠" },
    { value: "already_listed" as const, label: "Already on Airbnb/Booking", desc: "My property is live but I want better results", emoji: "📊" },
    { value: "switching" as const, label: "Switching manager", desc: "I'm looking for a better management partner", emoji: "🔄" },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-2">Where are you starting from?</p>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => update({ status: o.value })}
          className={`w-full text-left p-4 rounded-lg border transition-all flex items-start gap-3 ${
            data.status === o.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
          }`}
        >
          <span className="text-xl mt-0.5">{o.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-foreground">{o.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{o.desc}</p>
          </div>
        </button>
      ))}
      {data.status === "already_listed" && (
        <input
          type="url"
          placeholder="Paste your listing URL (optional)"
          value={data.listingUrl || ""}
          onChange={(e) => update({ listingUrl: e.target.value })}
          className="w-full px-4 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
      )}
      {data.status === "switching" && (
        <input
          type="text"
          placeholder="Current manager name (optional)"
          value={data.currentManager || ""}
          onChange={(e) => update({ currentManager: e.target.value })}
          className="w-full px-4 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
      )}
    </div>
  );
}

function Step1({
  data, update, localitySearch, setLocalitySearch, showLocalities, setShowLocalities, filteredLocalities
}: {
  data: WizardData; update: (p: Partial<WizardData>) => void;
  localitySearch: string; setLocalitySearch: (s: string) => void;
  showLocalities: boolean; setShowLocalities: (b: boolean) => void;
  filteredLocalities: string[];
}) {
  const MALTA_REGIONS_FLAT = [
    { label: "Northern", areas: ["Mellieħa", "Mġarr", "San Pawl il-Baħar", "Naxxar", "Mosta"] },
    { label: "Central", areas: ["Birkirkara", "Msida", "San Ġwann", "Swieqi", "Attard"] },
    { label: "St Julian's & Sliema", areas: ["San Ġiljan", "Sliema", "Pembroke", "Gżira", "Ta' Xbiex"] },
    { label: "Valletta & Harbour", areas: ["Valletta", "Floriana", "Birgu", "Bormla", "Isla"] },
    { label: "South", areas: ["Marsaxlokk", "Marsaskala", "Żejtun", "Birżebbuġa"] },
    { label: "Gozo", areas: ["Għajnsielem", "Nadur", "Xagħra", "San Lawrenz", "Qala"] },
  ];

  return (
    <div className="space-y-5">
      {/* Quick region picker */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          <MapPin size={12} className="inline mr-1" />Where is your property?
        </label>
        {!data.locality ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {MALTA_REGIONS_FLAT.map((r) => (
                <button
                  key={r.label}
                  onClick={() => {
                    setShowLocalities(true);
                    setLocalitySearch(r.areas[0].substring(0, 3));
                  }}
                  className="px-3 py-2 text-xs rounded-lg border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all text-left"
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Or search any locality..."
                value={localitySearch}
                onChange={(e) => { setLocalitySearch(e.target.value); setShowLocalities(true); }}
                onFocus={() => setShowLocalities(true)}
                className="w-full px-4 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              {showLocalities && filteredLocalities.length > 0 && (
                <div className="absolute z-20 top-full mt-1 w-full max-h-36 overflow-y-auto bg-card border border-border rounded-lg shadow-lg">
                  {filteredLocalities.slice(0, 12).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { update({ locality: loc }); setLocalitySearch(""); setShowLocalities(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="px-4 py-3 text-sm bg-primary/10 border border-primary/30 rounded-lg text-foreground flex-1">
              📍 {data.locality}
            </span>
            <button
              onClick={() => update({ locality: "" })}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Property Type</label>
        <div className="grid grid-cols-3 gap-2">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => update({ propertyType: t })}
              className={`px-3 py-2.5 text-xs rounded-lg border transition-all ${
                data.propertyType === t ? "border-primary bg-primary/5 text-foreground font-medium" : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Bedrooms</label>
          <div className="flex gap-1.5 flex-wrap">
            {BEDROOM_OPTIONS.map((b) => (
              <button
                key={b}
                onClick={() => update({ bedrooms: b })}
                className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                  data.bedrooms === b ? "border-primary bg-primary/5 text-foreground font-medium" : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Sleeps</label>
          <div className="flex gap-1.5 flex-wrap">
            {SLEEPS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => update({ sleeps: s })}
                className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                  data.sleeps === s ? "border-primary bg-primary/5 text-foreground font-medium" : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step2({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">When do you want to start?</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "asap", label: "ASAP", emoji: "🚀" },
            { value: "2-6weeks", label: "2–6 weeks", emoji: "📅" },
            { value: "2-3months", label: "2–3 months", emoji: "🗓️" },
            { value: "exploring", label: "Just exploring", emoji: "🔍" },
          ].map((o) => (
            <button
              key={o.value}
              onClick={() => update({ timeline: o.value })}
              className={`px-3 py-3 text-sm rounded-lg border transition-all flex items-center gap-2 ${
                data.timeline === o.value ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <span>{o.emoji}</span> {o.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">What's most important to you?</label>
        <div className="grid grid-cols-1 gap-2">
          {[
            { value: "max_income", label: "Maximise rental income", emoji: "💰" },
            { value: "hands_off", label: "Completely hands-off management", emoji: "🏖️" },
            { value: "direct_booking", label: "Build a direct booking channel", emoji: "🌐" },
            { value: "better_reviews", label: "Better guest reviews & ratings", emoji: "⭐" },
          ].map((o) => (
            <button
              key={o.value}
              onClick={() => update({ goal: o.value })}
              className={`px-4 py-3 text-sm text-left rounded-lg border transition-all flex items-center gap-3 ${
                data.goal === o.value ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <span>{o.emoji}</span> {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3 p-4 bg-secondary/50 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.handsOff} onChange={(e) => update({ handsOff: e.target.checked })} className="w-4 h-4 rounded border-border accent-primary" />
          <span className="text-sm text-foreground">I want fully hands-off management</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.licenceReady} onChange={(e) => update({ licenceReady: e.target.checked })} className="w-4 h-4 rounded border-border accent-primary" />
          <span className="text-sm text-foreground">I already have an MTA licence</span>
        </label>
      </div>
    </div>
  );
}

function Step3({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-1">
        We'll get back to you within 24 hours with a personalized assessment.
      </p>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full name *</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Your full name"
            autoComplete="name"
            className="w-full px-4 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email *</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="you@email.com"
            autoComplete="email"
            className="w-full px-4 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">WhatsApp / Phone *</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="+356 7900 0000"
            autoComplete="tel"
            className="w-full px-4 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Best way to reach you</label>
        <div className="flex gap-2">
          {[
            { value: "whatsapp", label: "WhatsApp", emoji: "💬" },
            { value: "email", label: "Email", emoji: "✉️" },
            { value: "phone", label: "Phone", emoji: "📞" },
          ].map((m) => (
            <button
              key={m.value}
              onClick={() => update({ preferredContact: m.value })}
              className={`flex-1 px-3 py-2.5 text-xs rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                data.preferredContact === m.value ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-start gap-3 cursor-pointer pt-2">
        <input
          type="checkbox"
          checked={data.consent}
          onChange={(e) => update({ consent: e.target.checked })}
          className="w-4 h-4 mt-0.5 rounded border-border accent-primary"
        />
        <span className="text-xs text-muted-foreground leading-relaxed">
          I agree to receive communications from Christiano Property Management. See our{" "}
          <a href="#" className="text-primary underline">Privacy Policy</a>.
        </span>
      </label>
    </div>
  );
}

function SuccessScreen({ tier, plan }: { tier: string; plan: string }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Check size={32} className="text-primary" />
      </div>
      <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">We'll be in touch shortly</h3>
      {tier === "A" && (
        <p className="text-sm text-primary font-medium mb-2">⚡ Priority response — you're a great fit</p>
      )}
      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
        Based on your details, we recommend our <strong className="text-foreground">{plan}</strong> plan. We'll reach out within 24 hours with a personalized assessment.
      </p>
      <a
        href="mailto:info@christianopm.com"
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
      >
        info@christianopm.com
      </a>
    </div>
  );
}
