import Link from 'next/link';
import { NextPage } from "next";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - VentureStrat',
  description: 'VentureStrat Terms of Service - Learn about the terms and conditions for using our fundraising platform.',
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
    url: 'https://www.venturestrat.ai/terms-and-conditions',
    siteName: 'VentureStrat',
    title: 'Terms of Service - VentureStrat',
    description: 'VentureStrat Terms of Service - Learn about the terms and conditions for using our fundraising platform.',
  },
  alternates: {
    canonical: 'https://www.venturestrat.ai/terms-and-conditions',
  },
};

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
      <p className="mb-6">
        Please read these Terms of Service (&quot;Terms&quot;) carefully before using our Platform. This is a legally binding agreement between you (&quot;User&quot; or &quot;you&quot;) and VentureStrat (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), the owner and operator of the fundraising platform (the &quot;Platform&quot; or &quot;Service&quot;). VentureStrat is a company registered in the United Arab Emirates, and these Terms are governed by UAE laws as described in Section 12 below.
      </p>
      <p className="mb-6">
        By accessing or using our Platform, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use the Service.
      </p>
      <p className="mb-6">
        These Terms apply to the initial fundraising module of our Platform. As we introduce new features or modules (such as task management or legal tools), additional terms may supplement or modify these Terms for those specific services. We will notify you of any such additions.
      </p>

      <h2 className="text-2xl font-semibold mb-4">1. Use of the Service</h2>
      <h3 className="text-xl font-semibold mb-4">1.1. Allowed and Intended Use</h3>
      <p className="mb-4">
        Our Platform provides a curated database of potential investors and tools to manage your outreach to them. You may use the Service to browse investor profiles, shortlist and track your interactions with investors, and draft or send communications (including AI-assisted email drafts) to those investors. The Platform is intended for use by startup founders, entrepreneurs, or their authorized team members to streamline fundraising efforts. You agree to use the Service only for its intended purposes and in compliance with all applicable laws and regulations.
      </p>

      <h3 className="text-xl font-semibold mb-4">1.2. Prohibited Conduct</h3>
      <p className="mb-4">You are prohibited from engaging in any misuse of the Platform. Specifically, when using our Service, you agree NOT to:</p>
      <ul className="list-disc pl-6 mb-6">
        <li><strong>Violate Laws or Rights:</strong> Use the Service in any way that violates any applicable laws or regulations, or infringes the rights of any individual or entity (including intellectual property rights and privacy rights). This includes refraining from using the Platform to send unlawful, defamatory, or otherwise illegal communications.</li>
        <li><strong>Unauthorized Access or Disruption:</strong> Attempt to gain unauthorized access to the Service or another user&apos;s account, or interfere with or disrupt the integrity or performance of the Platform. This means no hacking, DDoS attacks, introducing malware, or exploiting vulnerabilities. You must not probe or breach our security measures.</li>
        <li><strong>Automated Scraping or Extraction:</strong> Use bots, crawlers, scrapers, or any automated means to retrieve, index, &quot;scrape,&quot; data mine or otherwise gather content or information from the Platform without our prior written permission. The database of investors and other content on our site is proprietary; bulk downloading or copying this information for external use is forbidden.</li>
        <li><strong>Spam or Harassment:</strong> Use the Service to transmit any unsolicited or unauthorized advertising, promotional materials, junk mail, spam, chain letters, or pyramid schemes. When contacting investors through our Platform, you must ensure your communications are personalized and relevant – not part of a mass spam campaign. Also, you agree not to harass, threaten, or abuse anyone via the Platform (this includes refraining from sending obscene or offensive messages to investors or our staff).</li>
        <li><strong>Reverse Engineering:</strong> Copy, modify, create derivative works of, decompile, or reverse engineer any part of the Service. You will not attempt to extract the source code or underlying ideas or algorithms of the Platform.</li>
        <li><strong>Reselling or Misusing Content:</strong> Sell, rent, sublicense, or redistribute our Service or content provided within it to any third party. For example, you are not allowed to take the investor data obtained through our Platform and republish or commercialize it elsewhere. The access to investor information is for your personal or internal business use in fundraising, and not for building a competing database or service.</li>
        <li><strong>Competing Services:</strong> Use the Service to build or enhance a competing product or service. You must not misuse any information from the Platform to directly or indirectly compete with us.</li>
        <li><strong>Malicious Activity:</strong> Upload or transmit any viruses, worms, or harmful code, or do anything that could disable, overburden, or impair the proper working of the Platform (such as a denial-of-service attack).</li>
        <li><strong>Impersonation and False Information:</strong> Misrepresent your affiliation with any person or entity, or impersonate another person while using the Service. Additionally, you must not provide false or misleading information in your account or communications.</li>
        <li><strong>Other Prohibited Uses:</strong> Engage in any other activity that we deem contrary to the spirit of the Platform. If you are unsure whether something is allowed, please ask us first.</li>
      </ul>
      <p className="mb-4">Violation of the above acceptable use rules may result in immediate termination or suspension of your account, at our discretion, and could also expose you to legal liability.</p>

      <h2 className="text-2xl font-semibold mb-4">2. Accounts and Registration</h2>
      <h3 className="text-xl font-semibold mb-4">2.1. Account Creation</h3>
      <p className="mb-4">
        To access most features of our Platform, you need to register for an account. When creating an account, you agree to provide accurate, current, and complete information about yourself and/or your company as prompted by the registration forms. This includes providing your real name (or VentureStrat), a valid email address, and any other required details during onboarding (such as location and sector). You must update your account information promptly if it changes, so that our records remain accurate.
      </p>

      <h3 className="text-xl font-semibold mb-4">2.2. Account Security</h3>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your account login credentials, especially your password. Do not share your password with others. You agree to notify us immediately at [support email] if you suspect any unauthorized access to or use of your account. We are not liable for any loss or damage arising from your failure to secure your account. You acknowledge that you are responsible for all activities that occur under your account, whether or not you know about them.
      </p>

      <h3 className="text-xl font-semibold mb-4">2.3. Single Account; Authorized Users</h3>
      <p className="mb-4">
        You should create only one account for yourself (or one account per authorized team member if using individual logins). If you are an organization, you may have multiple users under your organization&apos;s plan (if our subscription supports that), but each user should have their own credentials. You shall not allow others to use your credentials, and you cannot transfer your account to someone else without our consent.
      </p>

      <h3 className="text-xl font-semibold mb-4">2.4. Our Right to Refuse or Terminate</h3>
      <p className="mb-4">
        We reserve the right to suspend or terminate accounts that provide false information, violate these Terms, or for other reasons in our sole discretion (for example, prolonged inactivity, non-payment, or misuse of the service). We may also reclaim usernames if we deem it necessary (such as if a username infringes a trademark or is impersonating someone).
      </p>

      <h2 className="text-2xl font-semibold mb-4">3. Subscription and Fees</h2>
      <h3 className="text-xl font-semibold mb-4">3.1. Subscription Plans</h3>
      <p className="mb-4">
        Access to the Platform&apos;s core features (investor database, shortlisting, email drafting, etc.) is provided on a paid subscription basis. When you sign up, you will choose a subscription plan (e.g., monthly or annual access) and provide payment information through our payment processor, Stripe. All fees and details of the plans (such as price, duration, and included features) will be presented to you at the time of purchase. By subscribing, you agree to pay the applicable subscription fees and any taxes in accordance with the selected plan.
      </p>

      <h3 className="text-xl font-semibold mb-4">3.2. Payment Processing</h3>
      <p className="mb-4">
        Payments are handled securely by Stripe. By entering your payment details, you authorize us and Stripe to charge the subscription fee to your provided payment method at the start of each billing cycle (and, for renewals, at the start of each renewal term. If you have provided credit card details, note that we do not store your full credit card number on our servers – it&apos;s stored and processed by Stripe in compliance with PCI-DSS standards. You must ensure that your billing information is accurate and up-to-date at all times.
      </p>

      <h3 className="text-xl font-semibold mb-4">3.3. Auto-Renewal</h3>
      <p className="mb-4">
        Subscriptions automatically renew at the end of each billing period (e.g., monthly subscriptions renew each month, annual renew each year) by default, unless you cancel before the next renewal date. We will bill your payment method at the renewal unless you have canceled. We may send a reminder or notification before renewal, especially for longer billing periods, but it is ultimately your responsibility to know when your subscription renews. If you do not wish to renew, you must cancel the subscription in your account settings or by contacting us prior to the renewal date.
      </p>

      <h3 className="text-xl font-semibold mb-4">3.4. Failed Payments</h3>
      <p className="mb-4">
        If a payment fails (e.g., due to an expired card or insufficient funds), we will attempt to notify you and retry the charge. If payment is not received within a certain grace period, we may suspend or restrict your account until payment is resolved. You agree to promptly update your payment information if it changes to avoid interruption of service. We reserve the right to terminate your subscription if payment remains delinquent for an extended period.
      </p>

      <h3 className="text-xl font-semibold mb-4">3.5. Cancellation</h3>
      <p className="mb-4">
        You may cancel your subscription at any time. You can do so through your account settings or by reaching out to our support team for assistance. If you cancel, you will continue to have access to the paid features until the end of your current billing period (unless we decide to grant a refund at our discretion or as required by law). After that, your account may revert to a free/basic tier (if available) or be deactivated. Please note that canceling stops future billing but does not automatically refund the current period.
      </p>

      <h3 className="text-xl font-semibold mb-4">3.6. Refunds</h3>
      <p className="mb-4">
        Subscription fees (and any one-time fees) are generally non-refundable. We do not provide refunds or credits for partial subscription periods, unused time, or unused features, except where required by law or at our sole discretion. For example, if you cancel mid-month, your subscription remains active until period&apos;s end, but you won&apos;t receive a pro-rated refund for the remaining days. In the event of a serious defect or issue caused by us that prevents you from using the service for a prolonged time, contact us and we will review refund requests on a case-by-case basis. If you believe a charge was made in error, please contact us promptly.
      </p>

      <h3 className="text-xl font-semibold mb-4">3.7. Changes in Fees</h3>
      <p className="mb-4">
        Our pricing and subscription plans may change over time. We reserve the right to modify the subscription fees or introduce new charges with prior notice to you. Any fee change will be effective at the start of the next billing cycle after the change is implemented. We will notify you via email or via the Platform at least [30 days] in advance of any increase in fees for your plan. If you do not agree to the new fees, you may cancel your subscription before the new fees take effect; continuing to use the Service after the fee change constitutes your agreement to pay the updated amount.
      </p>

      <h2 className="text-2xl font-semibold mb-4">4. Services and Features</h2>
      <h3 className="text-xl font-semibold mb-4">4.1. Fundraising Module</h3>
      <p className="mb-4">
        The current Service primarily consists of our Fundraising Module, which includes: a searchable list of investors (with profiles including details like name, firm, investment preferences, etc.), tools to shortlist investors you are interested in, the ability to track statuses (e.g., &quot;Interested&quot;, &quot;Contacted&quot;, &quot;Pitched&quot;, &quot;Not Interested&quot;) for each investor, and an AI-assisted email drafting feature to help you compose outreach emails. We endeavor to keep investor information up-to-date and accurate, but we do not guarantee that all data (e.g., an investor&apos;s contact info or investment focus) is current or error-free. Investor profiles may be sourced from publicly available information and our own research; if you notice any inaccuracies, please inform us.
      </p>

      <h3 className="text-xl font-semibold mb-4">4.2. AI-Generated Content</h3>
      <p className="mb-4">One key feature of the Platform is the use of artificial intelligence to help draft emails or other communications to investors. Please note the following regarding AI-generated content:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>The AI feature may take the input you provide (such as a brief about your company or what you want to convey to the investor) and generate a suggested email text. While we aim for the AI to produce high-quality, relevant drafts, these outputs are generated by algorithms and may occasionally contain errors or inappropriate suggestions. You are solely responsible for reviewing and editing any AI-generated content before you use or send it. You should ensure the final message is accurate and suitable for your purposes and aligns with any legal or ethical standards.</li>
        <li>We provide the AI tool to assist you, but we do not guarantee the correctness, completeness, or suitability of AI-generated emails. For instance, the AI might inadvertently produce a statement that is factually incorrect about your company or an investor. You must carefully review and verify the content.</li>
        <li><strong>No Endorsement:</strong> An AI-suggested email or text is not an endorsement by us of any particular wording or idea. We are not communicating to the investor on your behalf; rather, you are, using a tool we provide. The content of communications that you send is considered &quot;Your Content&quot; (as defined below), even if it was initially suggested by AI.</li>
        <li><strong>Liability Waiver:</strong> To the maximum extent permitted by law, we will not be liable for any consequences arising from the use of AI-generated content. This includes any claims of misinformation, misrepresentation, or damages resulting from content that you sent to a third party that was drafted using our AI feature. By using the AI drafting tool, you agree that you understand these risks and accept responsibility for how you utilize the AI outputs.</li>
        <li><strong>Feedback:</strong> If you encounter AI outputs that are offensive, irrelevant, or problematic, we encourage you to provide feedback so we can improve the system. We may review AI interactions for the purpose of improving our algorithms, as described in our Privacy Policy, but we maintain confidentiality of your data as per our Privacy Policy and do not use your inputs to train public AI models without permission.</li>
      </ul>

      <h3 className="text-xl font-semibold mb-4">4.3. Communications via the Platform</h3>
      <p className="mb-4">
        The Platform may facilitate sending emails or other messages to investors directly. When you choose to send an email through our system (for example, after drafting an email, clicking &quot;Send&quot;), the message will be sent to the recipient investor via our email service (SendGrid). While we make technical efforts to deliver your communications promptly, we do not guarantee that any investor will receive, read, or respond to your message. We are not responsible if an investor&apos;s email address is incorrect or outdated, if their email server blocks or filters the message, or if they simply choose not to respond.
      </p>

      <h3 className="text-xl font-semibold mb-4">4.4. No Financial Advice or Broker Services</h3>
      <p className="mb-4">
        Our Platform is a tool to help you in your fundraising process by organizing information and communications. We are not an investment advisor, broker-dealer, or intermediary. Nothing on our Service constitutes investment advice or an offer to invest. We do not recommend specific investors or guarantee that you will secure funding. Any decisions regarding which investors to approach or how to engage with them are solely yours. You should conduct your own due diligence and consider seeking professional advice where appropriate. The Company does not partake in any negotiations or transactions between you and any investor; those are outside the scope of our Service.
      </p>

      <h3 className="text-xl font-semibold mb-4">4.5. Future Modules</h3>
      <p className="mb-4">
        As our Platform grows, we may introduce new modules (such as a Task Management tool to help manage project tasks, or a Legal module for handling documents or cap table information). These features might have additional terms or guidelines which we will present to you at that time. Using any new module will signify your agreement to any module-specific terms, which will supplement these Terms. If any new module involves fees separate from the main subscription, we will clearly communicate that. Keep in mind that new modules might still be in beta upon release; we appreciate your understanding and feedback as we expand our services.
      </p>

      <h2 className="text-2xl font-semibold mb-4">5. User Content and Data</h2>
      <h3 className="text-xl font-semibold mb-4">5.1. Your Content</h3>
      <p className="mb-4">
        In the course of using the Platform, you may input or upload content, such as your personal and company details, notes or status updates about your interactions with investors, and the content of emails or messages you draft (collectively, &quot;User Content&quot;). You retain all intellectual property rights in your User Content. We do not claim ownership over the information or material you provide. However, by using the Service and submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, host, copy, process, transmit, and display your User Content solely for the purpose of operating and improving the Service. This license enables us, for example, to save your data on our servers, back it up, display it to you, and format it as needed for the interface. We will not use your User Content for any purposes outside the scope of providing the Service without your consent.
      </p>

      <h3 className="text-xl font-semibold mb-4">5.2. Responsibility for User Content</h3>
      <p className="mb-4">
        You are solely responsible for the User Content you provide or actions you take on the Platform. By inputting any content, you represent and warrant that: (a) you have the necessary rights, licenses, or permissions to submit the content to the Platform and to grant us the above license; and (b) your content (and our use of it in accordance with these Terms) will not infringe or violate the rights of any third party, including intellectual property rights, privacy rights, or any other legal rights. You also agree that your User Content will not contain anything unlawful, defamatory, obscene, threatening, or otherwise harmful (for instance, when drafting emails through our Platform, you will not include content that is harassing or discriminatory).
      </p>

      <h3 className="text-xl font-semibold mb-4">5.3. Review and Monitoring</h3>
      <p className="mb-4">
        We generally do not pre-screen or actively monitor User Content. However, we reserve the right (but not the obligation) to review, screen, and delete or remove any User Content at any time and for any reason, including if we believe it violates these Terms or applicable law. For example, if a user uploads a list of investor emails that was harvested unethically, or writes notes that include hate speech, we may act to remove such content. We also may remove content upon an investor&apos;s request if, say, an investor&apos;s profile includes personal data they want removed and it&apos;s not publicly available information.
      </p>

      <h3 className="text-xl font-semibold mb-4">5.4. Data Privacy</h3>
      <p className="mb-4">
        Our Privacy Policy describes how we handle the personal data you provide to us. By using the Service, you acknowledge that you have read our Privacy Policy. In particular, you agree that we can process your personal information and User Content in accordance with our Privacy Policy (for example, storing it on our cloud servers, sharing it with our email service to send your communications, etc.). If you include personal data of others in the Platform (such as an investor&apos;s name or email address, which is inherently part of the Platform&apos;s purpose), you represent that you have a lawful basis to use that data. You should not upload personal data of others that is highly sensitive (e.g., social security numbers, health information) into our Platform, as it is not designed for that type of data.
      </p>

      <h3 className="text-xl font-semibold mb-4">5.5. Feedback</h3>
      <p className="mb-4">
        If you provide us with any suggestions, ideas, or feedback about the Service (&quot;Feedback&quot;), you agree that we can use and share such Feedback for any purpose without compensating you. Any Feedback you submit is entirely voluntary, and we are free to implement or not implement it at our discretion.
      </p>

      <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property Rights</h2>
      <h3 className="text-xl font-semibold mb-4">6.1. Our Content and Ownership</h3>
      <p className="mb-4">
        The Platform, including all content, information, software, text, displays, images, video, and audio, and the design, selection and arrangement thereof, are owned by VentureStrat or its licensors and are protected by intellectual property laws (such as copyright, database rights, and trademark laws). This includes our compilation of investor data, the user interface design, and any proprietary algorithms (including our AI models or code).
      </p>
      <p className="mb-4">
        All rights, title, and interest in and to the Service and its content remain with us. You are granted a limited, revocable, non-transferable license to access and use the Service and its content for your personal or internal business use in accordance with these Terms. Except for this limited license, we do not grant you any rights or licenses under any intellectual property rights. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, or transmit any of the material on our Service except as permitted by these Terms or with our prior written permission.
      </p>
      <p className="mb-4">
        For example, you are welcome to use information you glean from the Platform (like an investor&apos;s name and email) to contact that investor for your fundraising— that&apos;s the intended use. But you cannot export or scrape all investor data to create a public directory, and you cannot share our entire list or large portions of it with a third party. Also, our logos, branding, and name are our trademarks; you may not use them without permission.
      </p>

      <h3 className="text-xl font-semibold mb-4">6.2. Trademarks</h3>
      <p className="mb-4">
        &quot;VentureStrat&quot; and our logos, slogans, or designs are trademarks/service marks owned by us. Other names or logos on the Platform (for example, names of investor firms or company logos in investor profiles) may be trademarks of their respective owners. You are not granted any rights to use any trademarks on the Service without the owner&apos;s permission.
      </p>

      <h3 className="text-xl font-semibold mb-4">6.3. Open Source and Third-Party Components</h3>
      <p className="mb-4">
        The Platform may include or rely on certain open-source software or third-party libraries. Each of those components may be subject to its own license terms. By using the Service, you agree to comply with such terms to the extent they are applicable to you. Nothing in these Terms limits your rights under, or grants you rights that supersede, the license terms of any applicable open-source software.
      </p>

      <h3 className="text-xl font-semibold mb-4">6.4. Prevention of Unauthorized Use</h3>
      <p className="mb-4">
        We reserve the right to employ technological measures to prevent unauthorized or prohibited uses of the Platform. For example, we may monitor usage patterns for signs of scraping or excessive downloads and may restrict or throttle accounts that exhibit such patterns. We may also watermark data or employ other methods to trace misuse. Attempting to circumvent these measures is itself a violation of these Terms.
      </p>

      <h2 className="text-2xl font-semibold mb-4">7. Third-Party Links and Services</h2>
      <p className="mb-4">
        The Platform may contain links or integrations to third-party websites or services that are not owned or controlled by us. For example, investor profiles may include links to an investor&apos;s LinkedIn page or personal website; or we may provide a link to Stripe&apos;s checkout or other external pages for payment. We might also, in the future, integrate certain third-party tools (like calendar scheduling services or document signing services) for your convenience.
      </p>
      <p className="mb-4">
        Please note: We do not have control over third-party sites or services. These Terms and our Privacy Policy do not apply to your activities on those third-party platforms. We are not responsible for the content, policies, or practices of any third-party websites or services. If you choose to click a link to a third-party site or use an integrated third-party service, you do so at your own risk, and you should review the terms and policies of those third parties.
      </p>
      <p className="mb-4">
        We do not endorse or assume any responsibility for any third-party offerings that may be advertised or linked through our Platform. If you have any issues or disputes arising from interactions with a third party (such as an external scheduling app), you agree that you will address such issues with that third party directly, and not hold VentureStrat liable for them.
      </p>

      <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
      <p className="mb-4">
        The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. To the fullest extent permitted under applicable law, the Company disclaims all warranties of any kind, whether express, implied, or statutory, regarding the Service and any results to be obtained from using the Service. This includes, but is not limited to:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Implied Warranties:</strong> We do not make any implied warranty of merchantability, fitness for a particular purpose, title, or non-infringement. In other words, we do not guarantee that the Service will meet your specific needs, or that it will operate free of intellectual property violations.</li>
        <li><strong>No Guarantee of Outcomes:</strong> We make no guarantee that you will achieve any particular results by using the Platform. For example, we cannot assure that you will successfully raise funds, secure meetings with investors, or receive responses to emails drafted or sent via the Platform. Any success in fundraising depends on many factors outside our control.</li>
        <li><strong>Service Availability:</strong> While we aim for high availability, we do not warrant that the Platform will be uninterrupted, timely, secure, or error-free. There may be occasional outages, delays, or errors, and we do not provide a warranty against such occurrences. We will try to fix issues that arise, but the Service&apos;s uptime is not guaranteed.</li>
        <li><strong>Accuracy of Data:</strong> We do not warrant that any content (including investor information) provided on the Platform is complete, accurate, or up-to-date. The investor database is compiled from various sources and may have inaccuracies. Use it as a starting point, but you may need to verify certain info through your own research.</li>
        <li><strong>AI Outputs:</strong> We specifically disclaim any warranty regarding the accuracy or appropriateness of AI-generated content. The AI suggestions are provided for convenience &quot;as is&quot; and you use them at your own risk, as described in Section 4.2.</li>
        <li><strong>Security:</strong> We strive to keep our Service secure, but we do not warrant that the Platform will be free from viruses, malware, or other harmful components. You are responsible for using up-to-date antivirus software on your devices.</li>
        <li><strong>No Duty to Update:</strong> We have no obligation to update or correct information on the Platform, though we may do so at our discretion.</li>
      </ul>
      <p className="mb-4">
        Your use of the Service is at your own risk. You acknowledge that the internet and data storage may have inherent risks, and we are not responsible for any data loss or any damage to your computer system or device that results from use of the Service or download of any material.
      </p>
      <p className="mb-4">
        Some jurisdictions do not allow the exclusion of certain warranties, so some of the above disclaimers may not fully apply to you. In such cases, our warranties are limited to the minimum extent permitted by applicable law.
      </p>

      <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
      <p className="mb-4">
        To the fullest extent permitted by law, VentureStrat and its affiliates, officers, employees, agents, partners, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages whatsoever, including but not limited to damages for loss of profits, loss of data, loss of goodwill, business interruption, or other intangible losses, arising out of or related to your use of (or inability to use) the Service. This limitation applies whether the claim is based on warranty, contract, tort (including negligence), or any other legal theory, and even if we have been advised of the possibility of such damages.
      </p>
      <p className="mb-4">
        Specifically, and without limiting the foregoing, VentureStrat will not be liable for:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Any action or decision you take based on information obtained through the Platform (such as choosing to contact a certain investor or rely on an AI-drafted message).</li>
        <li>The outcome of any communication or meeting with any investor or potential investor, even if arranged through our Platform.</li>
        <li>Any unauthorized access to or use of our servers and/or any personal information stored therein, unless directly caused by our gross negligence or willful misconduct.</li>
        <li>Any downtime or service interruptions, or any bugs, errors, or inaccuracies in the Service.</li>
        <li>Any content of messages or materials provided by other users or third parties (for example, if an investor provides information that is incorrect, or if another user somehow contacts you through our Platform inappropriately).</li>
      </ul>
      <p className="mb-4">
        In no event shall our total cumulative liability for all claims arising under or relating to these Terms and the use of the Service exceed the amount you have paid to us in subscription fees in the twelve (12) months immediately preceding the event giving rise to the liability. If you have not paid us any fees (for example, if you are on a free trial or free tier), our total liability shall not exceed USD $100 (or equivalent in local currency).
      </p>
      <p className="mb-4">
        Some jurisdictions do not allow the exclusion or limitation of liability for incidental or consequential damages, so certain limitations above may not apply to you. In such cases, our liability will be limited to the maximum extent permitted by law.
      </p>

      <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
      <p className="mb-4">
        You agree to indemnify, defend, and hold harmless VentureStrat and its affiliates, officers, directors, agents, partners, and employees from and against any and all third-party claims, liabilities, damages, losses, or expenses (including reasonable attorneys&apos; fees and costs) that arise out of or are related to: (a) your use of the Service, (b) your violation of these Terms, (c) your violation of any applicable law or regulation, or (d) your infringement of any rights of another (including any investor or other user).
      </p>
      <p className="mb-4">
        For example, if you use the Platform to send an email that defames someone, or if you harvest data in violation of these Terms and someone sues us because of it, you agree to cover all costs and damages we incur as a result of your action. Or if you improperly upload a third party&apos;s sensitive data and there&apos;s a claim, you will indemnify us.
      </p>
      <p className="mb-4">
        We reserve the right to handle our legal defense as we see fit, including choosing our counsel, in any indemnified matter. In such case, you agree to cooperate with us and provide any assistance or information we reasonably request.
      </p>

      <h2 className="text-2xl font-semibold mb-4">11. Term and Termination</h2>
      <h3 className="text-xl font-semibold mb-4">11.1. Term</h3>
      <p className="mb-4">
        These Terms are effective on you from the moment you first accept them (for instance, by creating an account or otherwise using the Platform) and will continue until terminated by either you or us as described below.
      </p>

      <h3 className="text-xl font-semibold mb-4">11.2. Your Right to Terminate</h3>
      <p className="mb-4">
        You may terminate this agreement at any time by canceling your subscription (as described in Section 3.5) and discontinuing all use of the Service. If you wish to permanently delete your account, you can do so through the account settings (if available) or by contacting us. Termination will not entitle you to any refund of prepaid fees, except at our discretion or where required by law.
      </p>

      <h3 className="text-xl font-semibold mb-4">11.3. Our Right to Terminate or Suspend</h3>
      <p className="mb-4">
        We may suspend or terminate your access to the Service (or any part thereof) for any reason, including if we believe: (a) you have violated these Terms or any applicable law; (b) you create risk or possible legal exposure for us; (c) our provision of the Services to you is no longer commercially viable; or (d) we have decided to discontinue the Service (whether entirely or in a particular jurisdiction). In most cases, we will make a reasonable effort to notify you (e.g., via the email associated with your account) of the termination or suspension, unless we are legally prohibited from doing so or the circumstances make it impracticable.
      </p>

      <h3 className="text-xl font-semibold mb-4">11.4. Effect of Termination</h3>
      <p className="mb-4">
        Upon any termination of these Terms (whether by you or us), your right to use the Service will immediately cease, and we may delete or deactivate your account. You will no longer have access to your data through the Platform, so you should export any data you need before terminating your account. We are not obligated to maintain or provide any of your User Content after termination, except as required by law. However, our rights to any Feedback you provided shall survive.
      </p>
      <p className="mb-4">
        Any provisions of these Terms that by their nature should survive termination (such as indemnities, limitations of liability, dispute resolution, and governing law) will survive termination.
      </p>

      <h2 className="text-2xl font-semibold mb-4">12. Governing Law and Dispute Resolution</h2>
      <p className="mb-4">
        These Terms and any dispute arising out of or related to them or the Service will be governed by and construed in accordance with the laws of the United Arab Emirates, without regard to its conflict of law principles. However, if you are using the Service as a consumer in a jurisdiction that requires application of that jurisdiction&apos;s consumer protection laws (e.g., because UAE law is deemed not to deprive you of mandatory consumer protections in your country), then that portion of the governing law clause may not apply.
      </p>

      <h3 className="text-xl font-semibold mb-4">12.1. Jurisdiction</h3>
      <p className="mb-4">
        You agree that any dispute or claim arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of the United Arab Emirates, specifically the courts located in Dubai, except where prohibited by applicable law. You waive any objections to the exercise of jurisdiction over you by such courts and to venue in such courts.
      </p>

      <h3 className="text-xl font-semibold mb-4">12.2. Dispute Resolution and Informal Resolution</h3>
      <p className="mb-4">
        Before filing any claim against us, you agree to first try to resolve the dispute informally by contacting us at ibrahim@venturestrat.co. We will try in good faith to negotiate a resolution. If a dispute cannot be resolved informally within 30 days of the first notification, then either party may proceed to seek formal legal remedy.
      </p>

      <h3 className="text-xl font-semibold mb-4">12.3. Injunctive Relief</h3>
      <p className="mb-4">
        Notwithstanding the above, either party may seek injunctive or equitable relief (a court order) in any jurisdiction to protect its intellectual property or confidential information.
      </p>

      <h2 className="text-2xl font-semibold mb-4">13. Changes to These Terms</h2>
      <p className="mb-4">
        We may update or modify these Terms from time to time. If we make material changes, we will notify you through appropriate means – for example, by posting the updated Terms on our website and updating the &quot;Effective Date&quot; at the top, and/or by sending you an email notification. It is your responsibility to review these Terms periodically, especially when we notify you of changes.
      </p>
      <p className="mb-4">
        By continuing to use the Service after any revised Terms become effective, you agree to be bound by the updated Terms. If you do not agree to the new terms, you must stop using the Service and, if applicable, cancel your subscription.
      </p>
      <p className="mb-4">
        For any change that requires user consent by law (for instance, possibly changes to dispute resolution provisions in certain jurisdictions), we will ensure to obtain such consent in accordance with legal requirements.
      </p>

      <h2 className="text-2xl font-semibold mb-4">14. Miscellaneous</h2>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Entire Agreement:</strong> These Terms (along with any additional terms we provide for specific services or features, and our Privacy Policy) constitute the entire agreement between you and VentureStrat regarding the Service, and supersede all prior agreements, understandings, or representations (whether written or oral) relating to its subject matter.</li>
        <li><strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms shall not be considered a waiver of those rights. Any waiver must be in writing and signed by an authorized representative of VentureStrat.</li>
        <li><strong>Severability:</strong> If any provision of these Terms is held to be invalid or unenforceable by a court of competent jurisdiction, such provision will be enforced to the maximum extent permissible and the remaining provisions of these Terms will remain in full force and effect.</li>
        <li><strong>Assignment:</strong> You may not assign or transfer these Terms (or any of your rights or obligations hereunder) without our prior written consent. We may freely assign or transfer these Terms to an affiliate or as part of a merger, acquisition, sale of assets, or by operation of law. These Terms will bind and inure to the benefit of the parties, their successors, and permitted assigns.</li>
        <li><strong>No Third-Party Beneficiaries:</strong> These Terms do not confer any rights or remedies on any person other than you and VentureStrat (and our affiliates, which are protected by provisions such as indemnification and liability limits). Investors or other third parties do not have any rights under these Terms with respect to your use of the Platform.</li>
        <li><strong>Relationship of Parties:</strong> You and the Company are independent contractors. These Terms do not create any agency, partnership, joint venture, or employment relationship between the parties. You have no authority to bind the Company in any respect.</li>
        <li><strong>Notices:</strong> We may provide notices or communications to you through email, via the Platform, or by other reasonable means. You shall ensure your account email is current and you check it. Official legal notices to us should be sent to the contact address provided below.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
      <p className="mb-4">
        If you have any questions about these Terms, or wish to contact us for any reason, please reach out to us at:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li><strong>Company:</strong> VentureStrat</li>
        <li><strong>Contact Email:</strong> <a href="mailto:ibrahim@venturestrat.co" className="text-blue-600">ibrahim@venturestrat.co</a></li>
        <li><strong>Contact Address:</strong> Al Thanyah Road, UAE</li>
      </ul>
      <p className="mb-4">
        We value our users and are here to help. For any issues regarding the Service, feel free to contact our support team. For legal inquiries or notices, please contact through the provided email or address.
      </p>
      <p className="mb-4">
        By using our Platform, you acknowledge that you have read, understood, and agree to these Terms of Service. Thank you for using our service to aid your fundraising journey!
      </p>

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

export default TermsOfService;
