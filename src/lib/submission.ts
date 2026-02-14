export interface WizardData {
  status: "" | "not_listed" | "already_listed" | "switching";
  listingUrl?: string;
  currentManager?: string;
  locality: string;
  propertyType: string;
  bedrooms: string;
  sleeps: string;
  timeline: string;
  goal: string;
  handsOff: boolean;
  licenceReady: boolean;
  upgradeBudget: string;
  name: string;
  email: string;
  phone: string;
  preferredContact: string;
  consent: boolean;
}

export const INITIAL_WIZARD_DATA: WizardData = {
  status: "",
  locality: "",
  propertyType: "",
  bedrooms: "",
  sleeps: "",
  timeline: "",
  goal: "",
  handsOff: false,
  licenceReady: false,
  upgradeBudget: "",
  name: "",
  email: "",
  phone: "",
  preferredContact: "whatsapp",
  consent: false,
};

const DRAFT_KEY = "cv_wizard_draft";

export function saveDraft(data: WizardData) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch {}
}

export function loadDraft(): WizardData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}

export function computeTier(data: WizardData): string {
  if (data.timeline === "asap" && data.handsOff) return "A";
  if (data.timeline === "exploring") return "C";
  return "B";
}

export function computePlan(data: WizardData): string {
  return data.handsOff ? "Complete" : "Essentials";
}

export async function submitLead(data: WizardData): Promise<void> {
  console.log("Lead submitted:", data);
  // In production, this would POST to an API or Google Sheets
}
