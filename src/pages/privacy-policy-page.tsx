import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-20">
      <Helmet>
        <title>Privacy Policy | Christiano Property Management</title>
        <meta name="description" content="Privacy Policy for Christiano Property Management — how we collect, use, and protect your data." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#C9A84C] mb-3">Legal</p>
          <h1 className="font-['Playfair_Display'] text-4xl text-[#F5F5F0] mb-4">Privacy Policy</h1>
          <p className="text-[#71717A] text-sm">Last updated: 1 January 2025 · Effective under GDPR / Maltese Data Protection Act (Cap. 586)</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-[#A1A1AA] text-sm leading-relaxed">
          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">1. Who We Are</h2>
            <p>
              Christiano Property Management Limited ("we", "us", "our") is registered in Malta and operates from
              The Fives - Unit A7, Triq Charles Sciberras, San Ġiljan, Malta. We are the data controller for all
              personal data collected via this website and our booking platform.
            </p>
            <p className="mt-2">
              Contact our data protection point of contact: <a href="mailto:info@christianopropertymanagement.com" className="text-[#C9A84C] hover:underline">info@christianopropertymanagement.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">2. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-[#F5F5F0]">Identity data</strong> — name, email address, phone number</li>
              <li><strong className="text-[#F5F5F0]">Booking data</strong> — check-in/out dates, guest count, property selected, payment confirmation reference</li>
              <li><strong className="text-[#F5F5F0]">Usage data</strong> — pages visited, device type, browser, IP address (anonymised after 90 days)</li>
              <li><strong className="text-[#F5F5F0]">Communication data</strong> — messages sent via our contact form or chat</li>
            </ul>
            <p className="mt-3">We do <strong className="text-[#F5F5F0]">not</strong> store full payment card numbers. Payments are processed by Stripe, Inc. under their own privacy policy.</p>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">3. Legal Basis for Processing</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-[#F5F5F0]">Contract</strong> — processing necessary to fulfil a booking</li>
              <li><strong className="text-[#F5F5F0]">Legitimate interests</strong> — fraud prevention, site security, analytics</li>
              <li><strong className="text-[#F5F5F0]">Consent</strong> — marketing emails (you may withdraw at any time)</li>
              <li><strong className="text-[#F5F5F0]">Legal obligation</strong> — tax records, tourist tax reporting to the Maltese authorities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">4. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Processing and managing your accommodation booking</li>
              <li>Sending booking confirmations and pre-arrival information</li>
              <li>Responding to enquiries submitted via our contact form</li>
              <li>Complying with Maltese eco-tax and tourist tax obligations</li>
              <li>Improving our website and services through aggregated analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">5. Data Sharing</h2>
            <p>We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong className="text-[#F5F5F0]">Guesty Inc.</strong> — our property management system (booking data)</li>
              <li><strong className="text-[#F5F5F0]">Stripe, Inc.</strong> — payment processor</li>
              <li><strong className="text-[#F5F5F0]">Supabase Inc.</strong> — cloud database infrastructure (EU region)</li>
              <li><strong className="text-[#F5F5F0]">Maltese authorities</strong> — as required by law (e.g. tourist tax)</li>
            </ul>
            <p className="mt-2">We do not sell personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">6. Data Retention</h2>
            <p>Booking records are retained for 7 years to comply with Maltese tax law. Contact enquiries not resulting in a booking are deleted after 2 years. Marketing consent records are kept until you withdraw consent.</p>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">7. Your Rights (GDPR)</h2>
            <p>You have the right to: access your data, rectify inaccurate data, erasure ("right to be forgotten"), restrict or object to processing, and data portability. To exercise any right, email us at <a href="mailto:info@christianopropertymanagement.com" className="text-[#C9A84C] hover:underline">info@christianopropertymanagement.com</a>. We will respond within 30 days. You may also lodge a complaint with the <a href="https://idpc.org.mt" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:underline">Information and Data Protection Commissioner (Malta)</a>.</p>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">8. Cookies</h2>
            <p>We use strictly necessary cookies for session management and analytics cookies (anonymised) to understand site usage. No advertising cookies are used. You may disable analytics cookies in your browser settings.</p>
          </section>

          <section>
            <h2 className="text-[#F5F5F0] text-xl font-semibold mb-3">9. Changes to This Policy</h2>
            <p>We may update this policy periodically. Material changes will be communicated by updating the "last updated" date above. Continued use of our site after changes constitutes acceptance.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex gap-4 text-sm">
          <Link to="/" className="text-[#C9A84C] hover:underline">← Home</Link>
          <Link to="/terms" className="text-[#A1A1AA] hover:text-[#C9A84C]">Terms & Conditions →</Link>
        </div>
      </div>
    </div>
  );
}
