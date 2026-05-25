import { memo, useState, useEffect, useCallback } from "react";
import { X, Send, Loader2, Phone, Mail, MessageCircle, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useModal } from "@/context/modal-context";
import { useCMS } from "@/context/cmscontext";
import { useBlock } from "@/hooks/useBlock";
import { toast } from "sonner";
import axios from "axios";
import { gmail } from "@/lib/gmail";
import { cn } from '@/lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const FALLBACK_SUBJECTS = [
  "Booking Inquiry",
  "Property Question",
  "Availability Check",
  "Special Request",
  "Other",
];

interface ContactModalProps {}

/**
 * ContactModal - Modal for users to send inquiries via form, phone, WhatsApp, or email
 * @param props - Component props
 * @returns React component
 */
export const ContactModal = memo(function ContactModal() {
  const { contactModalOpen, closeContactModal, contactPreFill } = useModal();
  const { cms } = useCMS();
  const { content: copy } = useBlock("contactModal");
  
  const QUICK_SUBJECTS = Array.isArray(copy?.subjects) && copy.subjects.length
    ? copy.subjects.map((s: string | { label: string }) => (typeof s === "string" ? s : s?.label)).filter(Boolean)
    : FALLBACK_SUBJECTS;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  // Pre-fill form when modal opens
  useEffect(() => {
    if (contactModalOpen && contactPreFill) {
      setForm(prev => ({ ...prev, ...contactPreFill }));
      setIsSuccess(false);
    }
  }, [contactModalOpen, contactPreFill]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const subject = form.subject || "General Inquiry";
      // Log inquiry (non-blocking)
      axios.post(`${API}/contact`, {
        name: form.name, email: form.email, phone: form.phone, subject, message: form.message,
      }).catch(() => {});

      // Send email via Gmail
      const adminTo = cms?.contact?.email || "info@example.com";
      const body = [
        `New website inquiry — ${subject}`,
        ``,
        `From: ${form.name} <${form.email}>`,
        form.phone ? `Phone: ${form.phone}` : null,
        ``,
        `Message:`,
        form.message,
      ].filter(Boolean).join("\n");

      await gmail.send({
        to: adminTo,
        subject: `[Website] ${subject} — ${form.name}`,
        text: body,
        replyTo: form.email,
      });

      setIsSuccess(true);
      toast.success("Message sent successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [form, cms?.contact?.email, API]);

  const handleClose = useCallback(() => {
    closeContactModal();
    setTimeout(() => {
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setIsSuccess(false);
    }, 300);
  }, [closeContactModal]);

  const handleFormChange = useCallback((field: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <Dialog open={contactModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0F0F10] border-white/10 max-w-lg p-0 overflow-hidden">
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-3">
              {copy?.successTitle || "Message Sent!"}
            </h3>
            <p className="text-[#A1A1AA] mb-6">
              {copy?.successBody || "Thank you for reaching out. We'll get back to you within 24 hours."}
            </p>
            <Button
              onClick={handleClose}
              className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none"
              aria-label="Close modal"
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="font-['Playfair_Display'] text-2xl text-[#F5F5F0]">
                {copy?.title || "Get in Touch"}
              </DialogTitle>
              <p className="text-[#A1A1AA] text-sm mt-2">
                {copy?.subtitle || "We typically respond within a few hours"}
              </p>
            </DialogHeader>

            {/* Quick Contact Options */}
            <div className="px-6 py-4 flex gap-3 border-b border-white/5">
              <a
                href={`tel:${cms.contact?.phone}`}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bg-[#161618] border border-white/10 hover:border-[#D4AF37]/30 transition-colors text-sm text-[#A1A1AA] hover:text-[#D4AF37]"
                )}
                data-testid="contact-call-btn"
                aria-label="Call us"
              >
                <Phone className="w-4 h-4" />
                Call
              </a>
              <a
                href={`https://wa.me/${cms.contact?.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bg-[#161618] border border-white/10 hover:border-[#D4AF37]/30 transition-colors text-sm text-[#A1A1AA] hover:text-[#D4AF37]"
                )}
                data-testid="contact-whatsapp-btn"
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href={`mailto:${cms.contact?.email}`}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bg-[#161618] border border-white/10 hover:border-[#D4AF37]/30 transition-colors text-sm text-[#A1A1AA] hover:text-[#D4AF37]"
                )}
                data-testid="contact-email-btn"
                aria-label="Email us"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Quick Subject Selection */}
              <div>
                <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 block">
                  What's this about?
                </label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SUBJECTS.map((subject: string) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => handleFormChange("subject", subject)}
                      className={cn(
                        "px-3 py-1.5 text-sm border transition-colors",
                        form.subject === subject
                          ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10"
                          : "border-white/10 text-[#A1A1AA] hover:border-white/30"
                      )}
                      aria-label={`Select subject: ${subject}`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 block">
                    Name *
                  </label>
                  <Input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    required
                    placeholder="Your name"
                    className="bg-[#161618] border-white/10 rounded-none text-[#F5F5F0] focus-visible:ring-[#D4AF37]"
                    data-testid="contact-modal-name"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 block">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    placeholder="+356..."
                    className="bg-[#161618] border-white/10 rounded-none text-[#F5F5F0] focus-visible:ring-[#D4AF37]"
                    data-testid="contact-modal-phone"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 block">
                  Email *
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="bg-[#161618] border-white/10 rounded-none text-[#F5F5F0] focus-visible:ring-[#D4AF37]"
                  data-testid="contact-modal-email"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 block">
                  Message *
                </label>
                <Textarea
                  value={form.message}
                  onChange={(e) => handleFormChange("message", e.target.value)}
                  required
                  rows={3}
                  placeholder="How can we help?"
                  className="bg-[#161618] border-white/10 rounded-none text-[#F5F5F0] focus-visible:ring-[#D4AF37] resize-none"
                  data-testid="contact-modal-message"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase tracking-widest py-4 font-semibold"
                data-testid="contact-modal-submit"
                aria-label="Send message"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {copy?.submitLabel || "Send Message"}
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
});

export default ContactModal;
