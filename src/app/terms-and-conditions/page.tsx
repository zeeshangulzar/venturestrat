import Link from 'next/link';
import { NextPage } from "next";

const TermsOfService: NextPage = () => {
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
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-6">
        <strong>Effective Date:</strong> Thursday, September 25, 2025
      </p>

      <h2 className="text-2xl font-semibold mb-4">1. Use of the Service</h2>
      <h3 className="text-xl font-semibold mb-4">1.1 Allowed and Intended Use</h3>
      <p className="mb-4">
        Our Platform provides a curated database of potential investors and tools to manage your outreach to them. You may use the Service to browse investor profiles, shortlist and track your interactions with investors, and draft or send communications (including AI-assisted email drafts) to those investors. The Platform is intended for use by startup founders, entrepreneurs, or their authorized team members to streamline fundraising efforts. You agree to use the Service only for its intended purposes and in compliance with all applicable laws and regulations.
      </p>

      <h3 className="text-xl font-semibold mb-4">1.2 Prohibited Conduct</h3>
      <p className="mb-4">You are prohibited from engaging in any misuse of the Platform. Specifically, when using our Service, you agree NOT to:</p>
      <ul className="list-disc pl-6 mb-6">
        <li>Violate Laws or Rights: Use the Service in any way that violates any applicable laws or regulations, or infringes the rights of any individual or entity (including intellectual property rights and privacy rights).</li>
        <li>Unauthorized Access or Disruption: Attempt to gain unauthorized access to the Service or another user’s account, or interfere with or disrupt the integrity or performance of the Platform.</li>
        <li>Automated Scraping or Extraction: Use bots, crawlers, scrapers, or any automated means to retrieve, index, scrape, or gather content from the Platform without our prior written permission.</li>
        <li>Spam or Harassment: Use the Service to transmit unsolicited advertising or spam. When contacting investors, ensure communications are personalized and relevant.</li>
        <li>Reverse Engineering: Copy, modify, decompile, or reverse engineer any part of the Service.</li>
        <li>Reselling or Misusing Content: Sell, rent, sublicense, or redistribute our Service or content provided within it to any third party.</li>
        <li>Competing Services: Use the Service to build or enhance a competing product or service.</li>
        <li>Malicious Activity: Upload or transmit viruses, worms, or harmful code.</li>
        <li>Impersonation: Misrepresent your affiliation with any person or entity while using the Service.</li>
        <li>Other Prohibited Uses: Engage in activities that we deem contrary to the spirit of the Platform.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">2. Accounts and Registration</h2>
      <h3 className="text-xl font-semibold mb-4">2.1 Account Creation</h3>
      <p className="mb-4">
        To access most features of our Platform, you need to register for an account. You agree to provide accurate, current, and complete information about yourself and/or your company as prompted by the registration forms.
      </p>

      <h3 className="text-xl font-semibold mb-4">2.2 Account Security</h3>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your account login credentials. Do not share your password with others.
      </p>

      <h2 className="text-2xl font-semibold mb-4">3. Subscription and Fees</h2>
      <h3 className="text-xl font-semibold mb-4">3.1 Subscription Plans</h3>
      <p className="mb-4">
        Access to the Platform’s core features is provided on a paid subscription basis. By subscribing, you agree to pay the applicable subscription fees and any taxes in accordance with the selected plan.
      </p>

      <h3 className="text-xl font-semibold mb-4">3.2 Payment Processing</h3>
      <p className="mb-4">
        Payments are handled securely by Stripe. You authorize us and Stripe to charge the subscription fee to your provided payment method.
      </p>

      <h2 className="text-2xl font-semibold mb-4">4. Services and Features</h2>
      <h3 className="text-xl font-semibold mb-4">4.1 Fundraising Module</h3>
      <p className="mb-4">
        The Fundraising Module includes: a searchable list of investors, tools to shortlist and track your interactions with investors, and an AI-assisted email drafting feature to help you compose outreach emails.
      </p>

      <h3 className="text-xl font-semibold mb-4">4.2 AI-Generated Content</h3>
      <p className="mb-4">
        We provide an AI tool to help draft emails or other communications. However, you are solely responsible for reviewing and editing any AI-generated content before you use or send it.
      </p>

      <h3 className="text-xl font-semibold mb-4">4.3 Communications via the Platform</h3>
      <p className="mb-4">
        The Platform may facilitate sending emails or messages to investors directly. While we make efforts to deliver your communications promptly, we do not guarantee that any investor will receive, read, or respond to your message.
      </p>

      <h3 className="text-xl font-semibold mb-4">4.4 No Financial Advice</h3>
      <p className="mb-4">
        Our Platform is a tool for organizing information and communications, not investment advice. We do not recommend specific investors or guarantee that you will secure funding.
      </p>

      <h2 className="text-2xl font-semibold mb-4">5. User Content and Data</h2>
      <h3 className="text-xl font-semibold mb-4">5.1 Your Content</h3>
      <p className="mb-4">
        You retain all intellectual property rights in your content. By using the Service, you grant us a license to use, host, process, and display your content solely for the purpose of operating and improving the Service.
      </p>

      <h3 className="text-xl font-semibold mb-4">5.2 Responsibility for User Content</h3>
      <p className="mb-4">
        You are solely responsible for your User Content. You warrant that your content does not infringe or violate any third-party rights.
      </p>

      <h3 className="text-xl font-semibold mb-4">5.3 Review and Monitoring</h3>
      <p className="mb-4">
        We reserve the right to review and remove User Content if it violates these Terms or applicable law.
      </p>

      <h3 className="text-xl font-semibold mb-4">5.4 Data Privacy</h3>
      <p className="mb-4">
        Our Privacy Policy describes how we handle personal data. By using the Service, you consent to the collection and processing of your data.
      </p>

      <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property Rights</h2>
      <h3 className="text-xl font-semibold mb-4">6.1 Our Content and Ownership</h3>
      <p className="mb-4">
        The Platform, including all content, software, text, and designs, is owned by VentureStrat or its licensors and is protected by intellectual property laws.
      </p>

      <h3 className="text-xl font-semibold mb-4">6.2 Trademarks</h3>
      <p className="mb-4">
        Our logos, trademarks, and service marks are owned by us. You may not use them without our permission.
      </p>

      <h2 className="text-2xl font-semibold mb-4">7. Third-Party Links and Services</h2>
      <p className="mb-4">
        The Platform may contain links to third-party websites or services. We are not responsible for the content, policies, or practices of those third parties.
      </p>

      <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
      <p className="mb-4">
        The Service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;. We do not guarantee that the Platform will meet your needs, or that it will be uninterrupted or error-free.
      </p>
      <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
      <p className="mb-4">
        To the fullest extent permitted by law, we are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
      </p>

      <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
      <p className="mb-4">
        You agree to indemnify and hold harmless VentureStrat from any third-party claims arising from your use of the Service, or violation of these Terms.
      </p>

      <h2 className="text-2xl font-semibold mb-4">11. Term and Termination</h2>
      <p className="mb-4">
        These Terms are effective from the moment you accept them and will continue until terminated. Either you or we may terminate the agreement.
      </p>

      <h2 className="text-2xl font-semibold mb-4">12. Governing Law and Dispute Resolution</h2>
      <p className="mb-4">
        These Terms will be governed by the laws of the United Arab Emirates. Any disputes will be resolved in the courts of the UAE.
      </p>

      <h2 className="text-2xl font-semibold mb-4">13. Changes to These Terms</h2>
      <p className="mb-4">
        We may update or modify these Terms at any time. By continuing to use the Service after any revisions, you agree to the updated Terms.
      </p>

      <h2 className="text-2xl font-semibold mb-4">14. Miscellaneous</h2>
      <p className="mb-4">
        These Terms constitute the entire agreement between you and VentureStrat. If any provision is held to be unenforceable, the rest of the Terms will remain in effect.
      </p>

      <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
      <p className="mb-4">
        If you have any questions about these Terms, or wish to contact us for any reason, please reach out to us at
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li>Company: VentureStrat</li>
        <li>Email: <a href="mailto:ibrahim@venturestrat.co" className="text-blue-600">ibrahim@venturestrat.co</a></li>
        <li>Address: Al Thanyad Road, UAE</li>
      </ul>

      <p className="text-sm">
        We value our users and are here to help. For any issues regarding the Service, feel free to contact our support team. For legal inquiries or notices, please contact through the provided email or address.
      </p>
      <p className="text-sm">
        By using our Platform, you acknowledge that you have read, understood, and agree to these 
        <span className="font-semibold">
          <Link href="/terms-and-conditions">
            <span className="hover:underline">Terms of Service.</span>
          </Link>
        </span>{" "}
        Thank you for using our service to aid your fundraising journey.
      </p>
    </div>
  );
};

export default TermsOfService;
