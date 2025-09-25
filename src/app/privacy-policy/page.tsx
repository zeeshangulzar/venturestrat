import Link from 'next/link';
import { NextPage } from "next";

const PrivacyPolicy: NextPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
              href="/"
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
          >
              ← Back
          </Link>
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-6">
        <strong>Effective Date:</strong> Thursday, September 25, 2025
      </p>

      <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
      <p className="mb-4">
        Welcome to our fundraising platform (“Platform”, “Service”). This Privacy Policy explains how we, as a company registered in the United Arab Emirates (“we”, “us”, or “our”), collect, use, disclose, and protect your personal information. By using our Service, you agree to the collection and use of information as described in this policy. We are committed to protecting your privacy and handling your personal data transparently and securely.
      </p>

      <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
      <p className="mb-4">
        We collect various types of information from you during account creation, onboarding, and use of our Platform:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li>Personal Identification Information: Name, email address, phone number, and password (for account registration and login).</li>
        <li>Profile and Company Information: Details you provide during onboarding such as your location, VentureStrat, industry/sector, company size, and any preferences. This helps us tailor the investor listings to your needs.</li>
        <li>Payment Information: If you subscribe to our Service, we collect billing details (such as your name, billing address) but not your full credit card numbers. Payment transactions are handled by our third-party payment processor, Stripe. Your credit card information is transmitted directly to Stripe via secure channels and is not stored on our servers.</li>
        <li>Usage Data: Information about how you use the Platform, e.g., the investors you view or shortlist, status updates you assign, and when you use features like AI email drafting. We may log activities and interactions (such as page visits, button clicks, and timestamps) to improve the Service and support debugging.</li>
        <li>Communication Data: If you draft or send communications through our Platform (for example, AI-generated emails to investors), we may process the content of those messages and the recipient details. We also collect any feedback or correspondence you send to us (such as support inquiries).</li>
        <li>Cookies and Tracking Technologies: We use cookies or similar technologies to provide essential functionality (like keeping you logged in) and to analyze usage of our Service. For instance, when you visit our site, we might collect technical data such as your IP address, browser type, and operating system for security and analytics. You can manage cookie preferences in your browser settings; however, core features may require cookies to function.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Providing and Improving the Service: To operate the Platform and personalize your experience.</li>
        <li>Account Management: To create and maintain your user account, authenticate you upon login, and communicate important account-related information (like subscription status or security alerts).</li>
        <li>Subscription Processing: To process subscription payments and manage billing (through Stripe), and to track your subscription status (active, canceled, etc.).</li>
        <li>Communication Features: To enable you to draft and send emails to investors. If you use our AI email drafting tool, the content you input may be processed by our AI algorithms to generate suggested email text.</li>
        <li>Email Delivery: To send emails on your behalf or system-generated emails (e.g., welcome emails, investor outreach messages, notifications).</li>
        <li>Customer Support: To respond to your inquiries, troubleshoot issues, and provide customer support.</li>
        <li>Service Announcements and Updates: To inform you of important updates, changes to terms, or new features/modules.</li>
        <li>Marketing (with Consent): If you explicitly agree, we may send newsletters or promotional communications about our services. You can opt out at any time.</li>
        <li>Legal Compliance and Protection: To comply with applicable laws and regulations, and to enforce our Terms of Service.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">4. How We Share and Disclose Information</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Service Providers: We share data with trusted third-party providers whom we use to operate and support our Platform, only to the extent necessary for their services.</li>
        <li>Business Transfers: If we undergo a business transition such as a merger, acquisition by another company, or sale of all or part of our assets, your personal data may be transferred as part of that transaction.</li>
        <li>Legal Obligations: We may disclose your information if required to do so by UAE law or other applicable laws, or in response to valid legal requests.</li>
        <li>Protection of Rights and Safety: We may share information when we believe it’s necessary to enforce our Terms of Service or to protect our rights, privacy, safety, or property.</li>
        <li>With Your Consent: In cases where you explicitly authorize it, we may share your information as you direct.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Encryption: All data transmission between your browser and our Platform is secured via HTTPS encryption.</li>
        <li>Access Controls: We limit access to personal data to authorized personnel.</li>
        <li>Secure Hosting: Our Platform runs on reputable cloud infrastructure (Render and AWS).</li>
        <li>Payment Security: All payment transactions are processed via Stripe, a PCI-DSS certified service.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Account Information: Data like your profile, investor shortlists, and communications are kept for the duration of your account’s life.</li>
        <li>Subscription and Transaction Data: We keep payment and transaction records as long as needed for financial reporting and compliance.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Access and Portability: You have the right to request a copy of the personal data we hold about you.</li>
        <li>Rectification: Correct or update your information if inaccurate or outdated.</li>
        <li>Erasure: Request that we delete your personal data under certain circumstances.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">8. Cross-Border Data Transfers</h2>
      <p className="mb-4">
        Our primary operations are based in the UAE, but personal data may be transferred to, stored in, and processed in other countries, such as the United States.
      </p>

      <h2 className="text-2xl font-semibold mb-4">9. Children’s Privacy</h2>
      <p className="mb-4">
        Our Service is not intended for individuals under the age of 18. If we learn that we have inadvertently collected personal information from a child under 18, we will take steps to delete such information.
      </p>

      <h2 className="text-2xl font-semibold mb-4">10. Future Features and Modules</h2>
      <p className="mb-4">We may introduce new modules in the future, and we will update this policy to reflect any changes in data practices.</p>

      <h2 className="text-2xl font-semibold mb-4">11. Updates to This Privacy Policy</h2>
      <p className="mb-4">
        We may modify this Privacy Policy from time to time. You will be notified of any significant changes.
      </p>

      <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
      <p className="mb-4">
        If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li>Email: <a href="mailto:ibrahim@venturestrat.co" className="text-blue-600">ibrahim@venturestrat.co</a></li>
        <li>Address: Al Thanyad Road, Dubai, United Arab Emirates.</li>
        <li>Contact Form: You may also reach out through the contact form on our website.</li>
      </ul>

      <p className="text-sm text-[#FFFFFF]">
        <span className="font-semibold">
          <Link href="/terms-and-conditions">
            <a className="hover:underline">Terms of Service</a>
          </Link>
        </span>{" "}
        and{" "}
        <span className="font-semibold">
          <Link href="/privacy-policy">
            <a className="hover:underline">Privacy Policy</a>
          </Link>
        </span>.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
