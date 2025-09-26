import Link from 'next/link';
import { NextPage } from "next";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - VentureStrat',
  description: 'VentureStrat Privacy Policy - Learn how we collect, use, and protect your personal information on our fundraising platform.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.venturestrat.ai/privacy-policy',
    siteName: 'VentureStrat',
    title: 'Privacy Policy - VentureStrat',
    description: 'VentureStrat Privacy Policy - Learn how we collect, use, and protect your personal information.',
  },
  alternates: {
    canonical: 'https://www.venturestrat.ai/privacy-policy',
  },
};

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
        Welcome to our fundraising platform (&quot;Platform&quot;, &quot;Service&quot;). This Privacy Policy explains how we, as a company registered in the United Arab Emirates (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), collect, use, disclose, and protect your personal information. By using our Service, you agree to the collection and use of information as described in this policy. We are committed to protecting your privacy and handling your personal data transparently and securely.
      </p>

      <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
      <p className="mb-4">
        We collect various types of information from you during account creation, onboarding, and use of our Platform:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li><strong>Personal Identification Information:</strong> Name, email address, phone number, and password (for account registration and login).</li>
        <li><strong>Profile and Company Information:</strong> Details you provide during onboarding such as your location, VentureStrat, industry/sector, company size, and any preferences. This helps us tailor the investor listings to your needs.</li>
        <li><strong>Payment Information:</strong> If you subscribe to our Service, we collect billing details (such as your name, billing address) but not your full credit card numbers. Payment transactions are handled by our third-party payment processor, Stripe. Your credit card information is transmitted directly to Stripe via secure channels and is not stored on our servers. (Stripe&apos;s services are PCI-DSS compliant to ensure payment security.)</li>
        <li><strong>Usage Data:</strong> Information about how you use the Platform, e.g. the investors you view or shortlist, status updates you assign, and when you use features like AI email drafting. We may log activities and interactions (such as page visits, button clicks, and timestamps) to improve the Service and support debugging.</li>
        <li><strong>Communication Data:</strong> If you draft or send communications through our Platform (for example, AI-generated emails to investors), we may process the content of those messages and the recipient details. We also collect any feedback or correspondence you send to us (such as support inquiries).</li>
        <li><strong>Cookies and Tracking Technologies:</strong> We use cookies or similar technologies to provide essential functionality (like keeping you logged in) and to analyze usage of our Service. For instance, when you visit our site, we might collect technical data such as your IP address, browser type, and operating system for security and analytics. You can manage cookie preferences in your browser settings; however, core features may require cookies to function.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
      <p className="mb-4">We use the collected information for the following purposes:</p>
      <ul className="list-disc pl-6 mb-6">
        <li><strong>Providing and Improving the Service:</strong> To operate the Platform and personalize your experience. For example, using your profile details to filter investor listings relevant to your location or sector, and remembering your settings and shortlists.</li>
        <li><strong>Account Management:</strong> To create and maintain your user account, authenticate you upon login, and communicate important account-related information (like subscription status or security alerts).</li>
        <li><strong>Subscription Processing:</strong> To process subscription payments and manage billing (through Stripe), and to track your subscription status (active, canceled, etc.).</li>
        <li><strong>Communication Features:</strong> To enable you to draft and send emails to investors. If you use our AI email drafting tool, the content you input may be processed by our AI algorithms to generate suggested email text. We use your data here solely to assist with your communication, and we do not use these inputs to train our AI beyond providing you the service (any third-party AI providers we use are contractually prevented from using your data for their own purposes).</li>
        <li><strong>Email Delivery:</strong> To send emails on your behalf or system-generated emails (e.g. welcome emails, investor outreach messages, notifications). We use SendGrid as our email delivery service provider. This means SendGrid will process the recipient&apos;s email address and message content in order to deliver the email. Such communications may include investor outreach emails that you initiate, as well as transactional emails like password resets or receipts.</li>
        <li><strong>Customer Support:</strong> To respond to your inquiries, troubleshoot issues, and provide customer support.</li>
        <li><strong>Service Announcements and Updates:</strong> To inform you of important updates, changes to terms, or new features/modules (for example, if we launch new modules like a task manager or legal tools in the future). We may send these communications via email or through the Platform.</li>
        <li><strong>Marketing (with Consent):</strong> If you explicitly agree, we may send newsletters or promotional communications about our services. You can opt out at any time. (We currently focus on service-related communications and do not send marketing emails without consent.)</li>
        <li><strong>Legal Compliance and Protection:</strong> To comply with applicable laws and regulations, and to enforce our Terms of Service. We may use your information to prevent fraud, resolve disputes, or protect the rights and safety of our users, our company, or others.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">4. How We Share and Disclose Information</h2>
      <p className="mb-4">We do not sell your personal data to any third parties. We only share your information in the following circumstances:</p>
      <ul className="list-disc pl-6 mb-6">
        <li><strong>Service Providers:</strong> We share data with trusted third-party providers whom we use to operate and support our Platform, only to the extent necessary for their services. These include:
          <ul className="list-disc pl-6 mt-2">
            <li><strong>Payment Processing – Stripe:</strong> We use Stripe to handle subscription payments. Stripe will process your payment information (e.g., credit card number, billing name, email) for payment transactions. Stripe may store your payment details (such as card tokens) and your contact information to manage billing and send receipts or payment notifications. We do not store your sensitive payment card details on our servers – this is handled by Stripe.</li>
            <li><strong>Email Delivery – SendGrid:</strong> We use SendGrid (a service by Twilio) to send emails from our Platform. This means if the Platform sends an email (for example, an investor outreach email you&apos;ve drafted or a system alert), SendGrid will process the recipient&apos;s email address and content to deliver it. SendGrid may also log information about sent emails (such as recipient, timestamp, and possibly email content or metadata) to ensure deliverability and system integrity.</li>
            <li><strong>Cloud Hosting and Storage – Render & AWS:</strong> Our Platform and database are hosted on secure cloud servers provided by services like Render and Amazon Web Services (AWS). Personal data (including your profile info, investor shortlist, and other data you input) is stored and processed on these servers.</li>
            <li><strong>AI Service Providers:</strong> Currently, our AI email drafting runs on our own models and does not involve sending personal data to external AI APIs. If in the future we integrate a third-party AI provider to enhance this feature, we will update this policy and ensure any such provider is bound by strict privacy safeguards.</li>
            <li><strong>Analytics Tools:</strong> At launch, we have limited analytics. We may use inbuilt server logs or simple analytics to understand usage. If we later adopt analytics services (e.g., Google Analytics), we will update this policy and obtain any necessary consent for cookies or tracking.</li>
          </ul>
          We contractually require all our service providers to protect your data and use it only for the purposes we specify.
        </li>
        <li><strong>Business Transfers:</strong> If we undergo a business transition such as a merger, acquisition by another company, or sale of all or part of our assets, your personal data may be transferred as part of that transaction.</li>
        <li><strong>Legal Obligations:</strong> We may disclose your information if required to do so by UAE law or other applicable laws, or in response to valid legal requests (e.g., court orders, government regulations).</li>
        <li><strong>Protection of Rights and Safety:</strong> We may share information when we believe it&apos;s necessary to enforce our Terms of Service, to protect our rights, privacy, safety, or property, and/or that of you or others.</li>
        <li><strong>With Your Consent:</strong> In cases where you explicitly authorize it, we may share your information as you direct.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
      <p className="mb-4">We prioritize the security of your personal data. We implement technical and organizational measures in line with industry best practices and UAE law to protect your information from unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
      <ul className="list-disc pl-6 mb-6">
        <li><strong>Encryption:</strong> All data transmission between your browser and our Platform is secured via HTTPS encryption. Additionally, our databases and storage utilize encryption at rest or other safeguards provided by our cloud hosts to protect data on the servers.</li>
        <li><strong>Access Controls:</strong> We limit access to personal data to authorized personnel who need it to operate or support the Service. Our team members and contractors are bound by confidentiality obligations.</li>
        <li><strong>Secure Hosting:</strong> Our Platform runs on reputable cloud infrastructure (Render and AWS) which maintains high security standards, including firewalls, network monitoring, and physical data center security.</li>
        <li><strong>Payment Security:</strong> All payment transactions are processed via Stripe. Stripe is a certified PCI-DSS compliant service, meaning it adheres to stringent security standards for handling payment information.</li>
        <li><strong>Monitoring and Testing:</strong> We monitor our systems for suspicious activity and periodically test our Platform&apos;s security (including vulnerability assessments) to proactively identify and fix potential issues.</li>
        <li><strong>Data Backups:</strong> We perform regular backups of the database to prevent data loss. Backups are encrypted and stored securely.</li>
      </ul>
      <p className="mb-4">Despite our efforts, no method of transmission or storage is 100% secure. Therefore, while we strive to protect your data, we cannot guarantee absolute security. In the unlikely event of a data breach that affects your personal data, we will notify you and the relevant authorities as required by law, and we will take immediate steps to mitigate the impact.</p>

      <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
      <p className="mb-4">We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Policy or as required by law. Specifically:</p>
      <ul className="list-disc pl-6 mb-6">
        <li><strong>Account Information:</strong> Data like your profile, investor shortlists, and communications are kept for the duration of your account&apos;s life. If you delete your account or subscription expires, we will either delete or anonymize your personal data within a reasonable time after account deletion, unless we are required to retain it longer for legal reasons.</li>
        <li><strong>Subscription and Transaction Data:</strong> We keep payment and transaction records as long as needed for financial reporting and compliance (typically, financial records might be kept for a minimum number of years as required by law).</li>
        <li><strong>Communications:</strong> Copies of business communications (support emails, etc.) may be retained for a period for quality assurance and legal compliance. Emails sent through the Platform via SendGrid might be logged by our system and SendGrid; these logs are generally retained for a limited time per SendGrid&apos;s policy.</li>
        <li><strong>Usage Logs:</strong> Basic server logs and analytics data are retained for internal analysis. If stored, such logs are generally kept for a short period unless needed for security investigations.</li>
        <li><strong>Future Modules Data:</strong> If we introduce new modules (e.g., a task manager or legal document module in the future) and you choose to use them, data from those modules will have their own retention practices which we will clarify at launch.</li>
      </ul>
      <p className="mb-4">When we no longer have a legitimate need to retain your personal data, we will securely dispose of it or anonymize it.</p>

      <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
      <p className="mb-4">You have rights regarding your personal data and how it is handled. We strive to honor the rights afforded to you under applicable data protection laws (including the UAE Personal Data Protection Law and other global standards). These rights may include:</p>
      <ul className="list-disc pl-6 mb-6">
        <li><strong>Access and Portability:</strong> You have the right to request a copy of the personal data we hold about you. We can provide you with a summary of your data, and in certain cases, you may have the right to receive that data in a commonly used electronic format.</li>
        <li><strong>Rectification (Correction):</strong> If any of your information is inaccurate or outdated, you have the right to correct or update it. You can edit certain profile information directly in your account settings, or contact us to make corrections.</li>
        <li><strong>Erasure:</strong> You may request that we delete your personal data under certain circumstances – for example, if the data is no longer necessary for the purpose it was collected, or if you withdraw consent.</li>
        <li><strong>Restriction of Processing:</strong> You can ask us to restrict or suspend processing of your data in certain situations, such as if you contest the data&apos;s accuracy or have objected to processing.</li>
        <li><strong>Objection to Processing:</strong> You have the right to object to certain types of processing, such as direct marketing.</li>
        <li><strong>Withdraw Consent:</strong> If we rely on your consent to process any personal data, you have the right to withdraw that consent at any time.</li>
        <li><strong>Data Portability:</strong> Where applicable, you may request to receive some of your data in a machine-readable format, or have us transmit it to another service provider, when technically feasible.</li>
        <li><strong>Non-Discrimination:</strong> We will not discriminate against you for exercising any of your data rights.</li>
      </ul>
      <p className="mb-4"><strong>How to Exercise Your Rights:</strong> You can typically exercise many of the above rights through the Profile or Settings section of your account. For any rights that require our assistance – such as obtaining a full report of your data or requesting deletion – please contact us at our support email. We may need to verify your identity before fulfilling certain requests, to ensure we don&apos;t disclose or delete data improperly. We will respond to your request within a reasonable timeframe and in accordance with applicable law.</p>

      <h2 className="text-2xl font-semibold mb-4">8. Cross-Border Data Transfers</h2>
      <p className="mb-4">Our primary operations are based in the UAE, but the nature of cloud services means personal data may be transferred to, stored in, and processed in other countries. Specifically, our servers (Render and AWS) may be located in data centers outside of the UAE – for example, in Europe or the United States. Likewise, third-party services like Stripe and SendGrid are U.S.-based companies, meaning information shared with them (payments or emails) will be transmitted to and processed in the United States.</p>
      <p className="mb-4">We understand the importance of safeguarding your personal data when it leaves your home jurisdiction. Whenever we transfer personal data out of the UAE or your country, we will ensure appropriate safeguards are in place as required by applicable law. These may include:</p>
      <ul className="list-disc pl-6 mb-6">
        <li><strong>Contractual Safeguards:</strong> We have agreements with our service providers that include standard data protection clauses or equivalent measures obligating them to protect your data.</li>
        <li><strong>Adequacy:</strong> We may rely on the fact that some countries have been deemed by regulators to provide an adequate level of data protection.</li>
        <li><strong>Your Consent:</strong> In certain cases, we might ask for your consent for cross-border transfers if no other legal transfer mechanism is available and if the law requires consent.</li>
      </ul>
      <p className="mb-4">By using our Platform, you acknowledge that your information may be transferred to our facilities and those third parties as described. However, we ensure that wherever your data is processed, this Privacy Policy and applicable laws protect your rights and data.</p>

      <h2 className="text-2xl font-semibold mb-4">9. Children&apos;s Privacy</h2>
      <p className="mb-4">Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from anyone under 18 years old. If you are under 18, please do not use the Platform or provide any personal data to us.</p>
      <p className="mb-4">In particular, the nature of our Platform (connecting startups with investors and managing fundraising activities) is geared towards businesses and professionals, not minors. If we learn that we have inadvertently collected personal information from a child under 18, we will take steps to delete such information as soon as possible. If you believe a minor has provided us with personal data, please contact us so we can investigate and remove the data.</p>

      <h2 className="text-2xl font-semibold mb-4">10. Future Features and Modules</h2>
      <p className="mb-4">As mentioned, currently our Platform offers the fundraising module. In the future, we plan to introduce additional modules such as a Task Manager (for project and task tracking) and Legal tools (for managing legal documents or cap tables, etc.). If you choose to use these future modules, they may involve new types of data collection (e.g., task details, project deadlines, legal document uploads) and different uses of your data. We want to reassure you that this Privacy Policy will be updated to reflect any such changes in data practices. We will notify you of any significant changes or new data uses when we launch new modules, and we will ensure we have appropriate consent or legal basis for any new processing of personal data. Rest assured, our commitment to data privacy and security will extend to all new features we offer.</p>

      <h2 className="text-2xl font-semibold mb-4">11. Updates to This Privacy Policy</h2>
      <p className="mb-4">We may modify this Privacy Policy from time to time to reflect changes in our business, legal obligations, or for other operational reasons. If we make material changes, we will notify you by email (sent to the address associated with your account) or by placing a prominent notice on our website, and we will update the &quot;Effective Date&quot; at the top of this Policy.</p>
      <p className="mb-4">It&apos;s important that you review any updates to understand our current privacy practices. Your continued use of the Platform after a policy change will signify your acceptance of the revised terms. However, if any changes materially affect how your personal data is processed, we will seek additional consent if required by law.</p>
      <p className="mb-4">We encourage you to periodically review this Privacy Policy for the latest information on our privacy practices.</p>

      <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
      <p className="mb-4">If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:</p>
      <ul className="list-disc pl-6 mb-6">
        <li><strong>Email:</strong> <a href="mailto:ibrahim@venturestrat.co" className="text-blue-600">ibrahim@venturestrat.co</a></li>
        <li><strong>Address:</strong> Al Thanyad Road, Dubai, United Arab Emirates.</li>
        <li><strong>Contact Form:</strong> You may also reach out through the contact form on our website.</li>
      </ul>
      <p className="mb-4">We will be happy to answer your questions and address any issues to the best of our ability. Your privacy is important to us, and we welcome your feedback.</p>

      <p className="text-sm text-gray-600">
        <span className="font-semibold">
          <Link href="/terms-and-conditions">
            <span className="hover:underline">Terms of Service</span>
          </Link>
        </span>{" "}
        and{" "}
        <span className="font-semibold">
          <Link href="/privacy-policy">
            <span className="hover:underline">Privacy Policy</span>
          </Link>
        </span>.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
