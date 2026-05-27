import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-20">
      <Helmet>
        <title>Terms & Conditions | Christiano Property Management</title>
        <meta name="description" content="Terms and Conditions governing bookings and use of the Christiano Property Management website." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#C9A84C] mb-3">Legal</p>
          <h1 className="font-['Playfair_Display'] text-4xl text-[#F5F5F0] mb-4">Terms &amp; Conditions</h1>
          <p className="text-[#71717A] text-sm">Last updated: 1 January 2025 · Governed by the laws of Malta</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-[#A1A1AA] text-sm leading-relaxed">
          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">1. Parties</h2>
            <p>
              These Terms govern the relationship between you ("Guest" or "Visitor") and Christiano Property Management
              Limited ("Company"), registered in Malta, The Fives - Unit A7, Triq Charles Sciberras, San Ġiljan, Malta.
            </p>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">2. Bookings and Reservations</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>A booking is confirmed only upon receipt of a confirmation email and payment.</li>
              <li>Prices are quoted in EUR and include VAT at the applicable Maltese rate (currently 7% on accommodation).</li>
              <li>The Maltese eco-tax (€0.50/adult/night) is collected separately and remitted to the Maltese authorities.</li>
              <li>Minimum stay requirements vary by property and season and are displayed at point of booking.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">3. Cancellation Policy</h2>
            <p>Each property may have a distinct cancellation policy displayed at the time of booking. In the absence of a specific policy:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Cancellations more than 14 days before check-in: full refund less a €30 processing fee.</li>
              <li>Cancellations 7–14 days before check-in: 50% refund.</li>
              <li>Cancellations fewer than 7 days before check-in: no refund.</li>
            </ul>
            <p className="mt-2">All refunds are processed to the original payment method within 10 business days.</p>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">4. Guest Obligations</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Guests must be at least 18 years of age to make a booking.</li>
              <li>The number of occupants must not exceed the maximum stated for the property.</li>
              <li>Guests must not use the property for commercial purposes, parties, or events without prior written consent.</li>
              <li>Pets are only permitted in explicitly pet-friendly properties.</li>
              <li>Guests are responsible for any damage caused during their stay beyond normal wear and tear.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">5. Check-in / Check-out</h2>
            <p>Standard check-in is from 15:00 and check-out by 11:00 Malta time (CET/CEST). Early check-in or late check-out may be arranged subject to availability and an additional fee. Exact access instructions are provided in the pre-arrival email.</p>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">6. Liability</h2>
            <p>The Company's liability for any claim arising from a booking shall not exceed the total amount paid for that booking. The Company is not liable for force majeure events, including but not limited to natural disasters, strikes, or government-imposed travel restrictions.</p>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">7. Intellectual Property</h2>
            <p>All content on this website — including text, images, logos, and software — is the property of Christiano Property Management Limited or its licensors. Reproduction without written consent is prohibited.</p>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">8. Governing Law &amp; Disputes</h2>
            <p>These Terms are governed by the laws of Malta. Any dispute shall be subject to the exclusive jurisdiction of the Maltese courts. For consumer disputes, you may also use the EU Online Dispute Resolution platform at <a href="https://ec.europa.eu/odr" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:underline">ec.europa.eu/odr</a>.</p>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">9. Amendments</h2>
            <p>We reserve the right to update these Terms at any time. Bookings made before an amendment remain governed by the Terms in force at the time of booking.</p>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">10. Contact</h2>
            <p>
              For any questions regarding these Terms contact us at <a href="mailto:info@christianopropertymanagement.com" className="text-[#C9A84C] hover:underline">info@christianopropertymanagement.com</a> or call <a href="tel:+35679790202" className="text-[#C9A84C] hover:underline">+356 7979 0202</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex gap-4 text-sm">
          <Link to="/" className="text-[#C9A84C] hover:underline">← Home</Link>
          <Link to="/privacy-policy" className="text-[#A1A1AA] hover:text-[#C9A84C]">Privacy Policy →</Link>
        </div>
      </div>
    </div>
  );
}
