// /legal/privacy — LoopGen Privacy Policy
import LegalLayout, { Section, H2, H3, P, Ul, Li, Callout, DataTable } from "./LegalLayout.jsx";

const SECTIONS = [
  { id: "framework",  label: "Compliance Framework" },
  { id: "collected",  label: "Data Collected" },
  { id: "use",        label: "How We Use Data" },
  { id: "sharing",    label: "Data Sharing" },
  { id: "marketing",  label: "Marketing Opt-In (APP 7)" },
  { id: "cookies",    label: "Cookies" },
  { id: "security",   label: "Data Security" },
  { id: "retention",  label: "Data Retention" },
  { id: "breach",     label: "Data Breach Response" },
  { id: "rights",     label: "Your Rights" },
  { id: "officer",    label: "Privacy Officer" },
];

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      pageId="privacy"
      title="Privacy Policy"
      badge="Privacy Act 1988 (Cth) compliant"
      sections={SECTIONS}
    >
      <Callout title="Our Commitment" type="green">
        <p>LoopGen complies with the Privacy Act 1988 (Cth) and all 13 Australian Privacy Principles (APPs). We are committed to transparent, lawful handling of your personal information. We do not sell your data to third parties under any circumstances.</p>
      </Callout>

      <Section id="framework">
        <H2>1. Compliance Framework</H2>
        <P>LoopGen is operated by <strong>NexaraX Pty Ltd</strong> (ACN: 696 134 620 / ABN: 43 696 134 620), 2 Patricia Road, Blackburn VIC 3130, Australia ("LoopGen", "we", "us", "our").</P>
        <P>This Privacy Policy applies to all users of the LoopGen platform, including buyers, sellers, and visitors. It is prepared in accordance with:</P>
        <Ul>
          <Li>Privacy Act 1988 (Cth)</Li>
          <Li>All 13 Australian Privacy Principles (APPs)</Li>
          <Li>Notifiable Data Breaches (NDB) scheme</Li>
        </Ul>
        <P>By using LoopGen, you consent to the collection and use of your personal information as described in this Policy. You must actively accept this Policy at registration via our clickwrap consent process.</P>
      </Section>

      <Section id="collected">
        <H2>2. Data Collected</H2>
        <DataTable
          headers={["Category", "Information Collected"]}
          rows={[
            ["Identity", "Name, username, profile photo, date of birth"],
            ["Contact", "Email address, phone number, suburb or city"],
            ["Device & Technical", "IP address, browser type, OS, device identifiers"],
            ["Usage", "Pages visited, search queries, listings viewed, session duration"],
            ["Listing Content", "Item descriptions, photographs, and pricing you post"],
            ["Communications", "In-app messages, support tickets, reviews you submit"],
            ["Verification", "Email confirmation; payment method details (via payment processor only)"],
          ]}
        />
        <P>We collect only information that is necessary for the operation of the platform, consistent with APP 3 (collection of solicited personal information).</P>
      </Section>

      <Section id="use">
        <H2>3. How We Use Your Data</H2>
        <Ul>
          <Li>Operating, maintaining, and improving the LoopGen platform</Li>
          <Li>Verifying user identity and eligibility for the platform</Li>
          <Li>Detecting fraud, scam activity, and prohibited listings</Li>
          <Li>Responding to support enquiries and facilitating dispute resolution</Li>
          <Li>Complying with Australian legal and regulatory obligations</Li>
          <Li>Sending platform notifications (order updates, policy changes)</Li>
          <Li>Marketing communications — only with your separate, explicit opt-in consent (see Section 5)</Li>
          <Li>Anonymised aggregated analytics and internal AI moderation improvement — no personally identifiable information is used for AI training without explicit consent</Li>
        </Ul>
      </Section>

      <Section id="sharing">
        <H2>4. Data Sharing</H2>
        <P>LoopGen does not sell, rent, or trade your personal information. We share data only in the following circumstances:</P>
        <DataTable
          headers={["Recipient", "Basis for Sharing"]}
          rows={[
            ["Service providers", "Hosting, email, analytics — under confidentiality obligations and Data Processing Agreements"],
            ["Payment processors", "For payment method verification only — governed by their own PCI-DSS compliance"],
            ["Other users", "Minimum necessary info for a transaction (e.g., suburb for local pickup)"],
            ["Law enforcement", "Only upon a valid court order, warrant, or emergency disclosure request"],
            ["Business successors", "In event of acquisition or merger — 30 days' prior user notice required"],
          ]}
        />
        <H3>International Transfers (APP 8)</H3>
        <P>Some service providers are located outside Australia. Before any overseas transfer, LoopGen ensures the recipient provides equivalent privacy protections via contractual Data Processing Agreements.</P>
      </Section>

      <Section id="marketing">
        <H2>5. Marketing Opt-In — APP 7 Compliance</H2>
        <Callout title="Your Marketing Consent" type="green">
          <p>Marketing communications require your separate, explicit opt-in. You can withdraw consent at any time via Account Settings → Notifications → Email Preferences, or by clicking Unsubscribe in any marketing email. Declining this consent does not affect your platform access.</p>
        </Callout>
        <P>At registration, you will see:</P>
        <Ul>
          <Li>☐ (Optional) I consent to receiving promotional emails, product updates, and offers from LoopGen</Li>
        </Ul>
        <P>LoopGen will not use your personal information for direct marketing without this consent, consistent with APP 7.</P>
      </Section>

      <Section id="cookies">
        <H2>6. Cookies</H2>
        <P>LoopGen uses cookies as described in our <a href="/legal/cookies">Cookie Policy</a>. Essential cookies are required for platform operation. Analytics and marketing cookies are only activated with your consent at the cookie banner.</P>
      </Section>

      <Section id="security">
        <H2>7. Data Security</H2>
        <P>LoopGen implements the following technical and organisational security measures (APP 11):</P>
        <Ul>
          <Li>TLS/SSL encryption for all data in transit</Li>
          <Li>Encryption at rest for sensitive personal data</Li>
          <Li>Role-based access controls — staff access personal data on a need-to-know basis only</Li>
          <Li>Regular security assessments and penetration testing</Li>
          <Li>Incident response procedures for data breaches</Li>
        </Ul>
      </Section>

      <Section id="retention">
        <H2>8. Data Retention</H2>
        <P>We retain personal information while your account is active and for the period required by law. For example, financial records are retained for 7 years under the Corporations Act 2001. Upon account closure, personal data is deleted or de-identified within a commercially reasonable timeframe, subject to legal retention obligations.</P>
      </Section>

      <Section id="breach">
        <H2>9. Data Breach Response</H2>
        <Callout title="Notifiable Data Breach Policy" type="blue">
          <p>In the event of a breach likely to result in serious harm, LoopGen will: (1) contain the breach immediately; (2) assess nature and scope within 30 days; (3) notify the OAIC if the serious harm threshold is met; (4) notify affected individuals as soon as practicable; (5) remediate the root cause within 60 days.</p>
        </Callout>
        <P>Contact: <a href="mailto:privacy@loopgen.app">privacy@loopgen.app</a> · OAIC: <a href="https://oaic.gov.au" target="_blank" rel="noreferrer">oaic.gov.au</a> · 1300 363 992</P>
      </Section>

      <Section id="rights">
        <H2>10. Your Rights</H2>
        <DataTable
          headers={["Right (APP)", "How to Exercise"]}
          rows={[
            ["Access (APP 12)", "Account Settings → Privacy → Download my data"],
            ["Correction (APP 13)", "Account Settings → Edit Profile"],
            ["Deletion", "Account Settings → Privacy → Delete my account"],
            ["Opt-out of marketing", "Account Settings → Notifications → Email Preferences"],
            ["Complaint", "privacy@loopgen.app or OAIC at oaic.gov.au | 1300 363 992"],
          ]}
        />
        <P>All requests are fulfilled within 30 days as required by the APPs.</P>
      </Section>

      <Section id="officer">
        <H2>11. Privacy Officer</H2>
        <P>LoopGen has designated a Privacy Officer responsible for APP compliance, handling privacy enquiries and complaints, and overseeing the data breach response process.</P>
        <P><strong>Privacy Officer:</strong> <a href="mailto:privacy@loopgen.app">privacy@loopgen.app</a></P>
        <P>If you are not satisfied with our response, you may lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at <a href="https://oaic.gov.au" target="_blank" rel="noreferrer">oaic.gov.au</a>.</P>
      </Section>
    </LegalLayout>
  );
}
