import { useState, useEffect } from "react";
import { X, Send, Loader2, Phone, Mail, MessageCircle, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useModal } from "@/context/ModalContext";
import { useCMS } from "@/context/CMSContext";
import { useBlock } from "@/hooks/useBlock";
import { toast } from "sonner";
import axios from "axios";
import { gmail } from "@/lib/gmail";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Quick contact options (fallback — editable via contactModal block)
const FALLBACK_SUBJECTS = [
  "Booking Inquiry",
  "Property Question",
  "Availability Check",
  "Special Request",
  "Other",
];

export const ContactModal = () => {
  const { contactModalOpen, closeContactModal, contactPreFill } = useModal();
  const { cms } = useCMS();
  const { content: copy } = useBlock("contactModal");
  const QUICK_SUBJECTS = Array.isArray(copy?.subjects) && copy.subjects.length
    ? copy.subjects.map((s) => (typeof s === "string" ? s : s?.label)).filter(Boolean)
    : FALLBACK_SUBJECTS;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [form, setForm] = useState({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const subject = form.subject || "General Inquiry";
      // 1. Log the inquiry (CMS sync log, non-blocking)
      axios.post(`${API}/contact`, {
        name: form.name, email: form.email, phone: form.phone, subject, message: form.message,
      }).catch(() => {});

      // 2. Send the actual email to the admin inbox via Gmail
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
    } catch (error) {
      toast.error(error?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    closeContactModal();
    setTimeout(() => {
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setIsSuccess(false);
    }, 300);
  };

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
                href={`tel:${cms.contact.phone}`}
                className="flex items-center gap-2 px-4 py-2 bg-[#161618] border border-white/10 hover:border-[#D4AF37]/30 transition-colors text-sm text-[#A1A1AA] hover:text-[#D4AF37]"
                data-testid="contact-call-btn"
              >
                <Phone className="w-4 h-4" />
                Call
              </a>
              <a
                href={`https://wa.me/${cms.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#161618] border border-white/10 hover:border-[#D4AF37]/30 transition-colors text-sm text-[#A1A1AA] hover:text-[#D4AF37]"
                data-testid="contact-whatsapp-btn"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href={`mailto:${cms.contact.email}`}
                className="flex items-center gap-2 px-4 py-2 bg-[#161618] border border-white/10 hover:border-[#D4AF37]/30 transition-colors text-sm text-[#A1A1AA] hover:text-[#D4AF37]"
                data-testid="contact-email-btn"
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
                  {QUICK_SUBJECTS.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => setForm({ ...form, subject })}
                      className={`px-3 py-1.5 text-sm border transition-colors ${
                        form.subject === subject
                          ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10"
                          : "border-white/10 text-[#A1A1AA] hover:border-white/30"
                      }`}
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
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
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
};
