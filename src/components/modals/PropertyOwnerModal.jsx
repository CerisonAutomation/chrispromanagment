import { useState, useEffect } from "react";
import { CheckCircle, Loader2, ArrowRight, ArrowLeft, Home, MapPin, Bed, Bath, Users, Calendar, Phone, Mail, Building } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useModal } from "@/context/ModalContext";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Penthouse",
  "Townhouse",
  "Studio",
  "Palazzo/Historic",
  "Other",
];

const LOCATIONS = [
  "St. Julian's",
  "Sliema",
  "Valletta",
  "St. Paul's Bay",
  "Mellieha",
  "Gozo",
  "Mdina/Rabat",
  "Other",
];

const SERVICES_INTERESTED = [
  { id: "fullManagement", label: "Full Property Management" },
  { id: "guestCommunication", label: "Guest Communication Only" },
  { id: "cleaning", label: "Cleaning & Turnover" },
  { id: "maintenance", label: "Maintenance & Repairs" },
  { id: "pricing", label: "Dynamic Pricing" },
  { id: "photography", label: "Professional Photography" },
  { id: "makeover", label: "Home Makeover" },
];

export const PropertyOwnerModal = () => {
  const { ownerModalOpen, closeOwnerModal, ownerModalStep, setOwnerModalStep, ownerPreFill } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    // Step 1: Property Info
    propertyType: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    maxGuests: "",
    // Step 2: Owner Info
    name: "",
    email: "",
    phone: "",
    // Step 3: Services & Details
    servicesInterested: [],
    currentlyListed: "",
    expectedRevenue: "",
    additionalInfo: "",
  });

  useEffect(() => {
    if (ownerModalOpen && ownerPreFill) {
      setForm(prev => ({ ...prev, ...ownerPreFill }));
      setIsSuccess(false);
    }
  }, [ownerModalOpen, ownerPreFill]);

  const handleServiceToggle = (serviceId) => {
    setForm(prev => ({
      ...prev,
      servicesInterested: prev.servicesInterested.includes(serviceId)
        ? prev.servicesInterested.filter(s => s !== serviceId)
        : [...prev.servicesInterested, serviceId]
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return form.propertyType && form.location;
      case 2:
        return form.name && form.email && form.phone;
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(ownerModalStep)) {
      setOwnerModalStep(ownerModalStep + 1);
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const prevStep = () => {
    setOwnerModalStep(Math.max(1, ownerModalStep - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await axios.post(`${API}/property-owner-inquiry`, {
        ...form,
        servicesInterested: form.servicesInterested.join(", "),
      });
      setIsSuccess(true);
      toast.success("Inquiry submitted! We'll be in touch soon.");
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    closeOwnerModal();
    setTimeout(() => {
      setForm({
        propertyType: "", location: "", bedrooms: "", bathrooms: "", maxGuests: "",
        name: "", email: "", phone: "",
        servicesInterested: [], currentlyListed: "", expectedRevenue: "", additionalInfo: "",
      });
      setIsSuccess(false);
    }, 300);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              ownerModalStep >= step
                ? "bg-[#D4AF37] text-[#0F0F10]"
                : "bg-[#27272A] text-[#A1A1AA]"
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`w-12 h-0.5 mx-1 ${
                ownerModalStep > step ? "bg-[#D4AF37]" : "bg-[#27272A]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={ownerModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0F0F10] border-white/10 max-w-xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-3">
              Inquiry Received!
            </h3>
            <p className="text-[#A1A1AA] mb-6">
              Thank you for your interest. We'll review your property details and contact you within 48 hours to discuss how we can help maximize your property's potential.
            </p>
            <Button
              onClick={handleClose}
              className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-['Playfair_Display'] text-2xl text-[#F5F5F0]">
                List Your Property
              </DialogTitle>
              <p className="text-[#A1A1AA] text-sm">
                {ownerModalStep === 1 && "Tell us about your property"}
                {ownerModalStep === 2 && "Your contact information"}
                {ownerModalStep === 3 && "Services you're interested in"}
              </p>
            </DialogHeader>

            {renderStepIndicator()}

            {/* Step 1: Property Info */}
            {ownerModalStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 block">
                      Property Type *
                    </label>
                    <Select value={form.propertyType} onValueChange={(v) => setForm({ ...form, propertyType: v })}>
                      <SelectTrigger className="bg-[#161618] border-white/10 rounded-none text-[#F5F5F0]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#161618] border-white/10">
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 block">
                      Location *
                    </label>
                    <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                      <SelectTrigger className="bg-[#161618] border-white/10 rounded-none text-[#F5F5F0]">
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#161618] border-white/10">
                        {LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 block">
                      <Bed className="w-3 h-3 inline mr-1" /> Bedrooms
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={form.bedrooms}
                      onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                      placeholder="0"
                      className="bg-[#161618] border-white/10 rounded-none text-[#F5F5F0]"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 block">
                      <Bath className="w-3 h-3 inline mr-1" /> Bathrooms
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={form.bathrooms}
                      onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                      placeholder="0"
                      className="bg-[#161618] border-white/10 rounded-none text-[#F5F5F0]"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 block">
                      <Users className="w-3 h-3 inline mr-1" /> Max Guests
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={form.maxGuests}
                      onChange={(e) => setForm({ ...form, maxGuests: e.target.value })}
                      placeholder="0"
                      className="bg-[#161618] border-white/10 rounded-none text-[#F5F5F0]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Owner Info */}
            {ownerModalStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 block">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className="bg-[#161618] border-white/10 rounded-none text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 block">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="bg-[#161618] border-white/10 rounded-none text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 block">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+356 7979 0202"
                    className="bg-[#161618] border-white/10 rounded-none text-[#F5F5F0]"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Services */}
            {ownerModalStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-3 block">
                    Services You're Interested In
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICES_INTERESTED.map((service) => (
                      <label
                        key={service.id}
                        className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                          form.servicesInterested.includes(service.id)
                            ? "border-[#D4AF37] bg-[#D4AF37]/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <Checkbox
                          checked={form.servicesInterested.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                          className="border-white/20 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                        />
                        <span className="text-sm text-[#F5F5F0]">{service.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 block">
                    Is your property currently listed?
                  </label>
                  <Select value={form.currentlyListed} onValueChange={(v) => setForm({ ...form, currentlyListed: v })}>
                    <SelectTrigger className="bg-[#161618] border-white/10 rounded-none text-[#F5F5F0]">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161618] border-white/10">
                      <SelectItem value="no">No, not yet</SelectItem>
                      <SelectItem value="airbnb">Yes, on Airbnb</SelectItem>
                      <SelectItem value="booking">Yes, on Booking.com</SelectItem>
                      <SelectItem value="multiple">Yes, on multiple platforms</SelectItem>
                      <SelectItem value="other">Yes, elsewhere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 block">
                    Additional Information
                  </label>
                  <Textarea
                    value={form.additionalInfo}
                    onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
                    placeholder="Any specific requirements or questions?"
                    rows={3}
                    className="bg-[#161618] border-white/10 rounded-none text-[#F5F5F0] resize-none"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              {ownerModalStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 border-white/10 text-[#F5F5F0] hover:bg-white/5 rounded-none"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {ownerModalStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Inquiry"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
