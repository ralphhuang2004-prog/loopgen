import LegalLayout, { Section, H2, H3, P, Ul, Li, Callout, DataTable } from "./LegalLayout.jsx";

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      badge="Privacy Policy · Australia"
    >
      <Callout title="Our Commitment" type="green">
        <p>LoopGen is committed to handling your personal information transparently and in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs). We do not sell your personal information to third parties.</p>
      </Callout>

      <Section id="framework">
        <H2>1. About This Policy</H2>
        <P>LoopGen is operated by <strong>NexaraX Pty Ltd</strong> (ACN: 696 134 620 / ABN: 43 696 134 620) ("LoopGen", "we", "us", "our").</P>
        <P>This Privacy Policy applies to all users of the LoopGen platform, including buyers, sellers, and visitors. It explains what personal information we collect, how we use it, and your rights in relation to it.</P>
        <P>This Policy explains how LoopGen collects, holds, uses and discloses personal information when you use the Platform. You are asked to accept this Policy when creating an account.</P>
      </Section>

      <Section id="collected">
        <H2>2. Information We Collect</H2>
        <P>We collect information you provide directly to us, and information generated through your use of the Platform.</P>
        <H3>Information you provide</H3>
        <Ul>
          <Li><strong>Account information:</strong> your email address, username, and profile photo (if uploaded).</Li>
          <Li><strong>Listing content:</strong> item title, description, price, condition, location (suburb or postcode), category, and photographs you post.</Li>
          <Li><strong>Communications:</strong> messages you send to other users through the Platform.</Li>
          <Li><strong>Reports:</strong> information you submit when reporting a listing.</Li>
        </Ul>
        <H3>Information collected automatically</H3>
        <P>When you use the Platform, our hosting and infrastructure providers may automatically collect certain technical information, including IP address, browser type, operating system, and usage data. This information is processed by our service providers in the course of operating the Platform.</P>
      </Section>

      <Section id="use">
        <H2>3. How We Use Your Information</H2>
        <Ul>
          <Li>Operating, maintaining, and improving the LoopGen platform.</Li>
          <Li>Enabling you to create and manage listings.</Li>
          <Li>Enabling messaging between users about listings.</Li>
          <Li>Responding to support enquiries and reports of misconduct.</Li>
          <Li>Authenticating users and helping secure user accounts.</Li>
          <Li>Complying with our legal and regulatory obligations.</Li>
          <Li>Sending platform notifications related to your account or listings, where supported.</Li>
        </Ul>
      </Section>

      <Section id="sharing">
        <H2>4. Disclosure of Your Information</H2>
        <P>LoopGen does not sell, rent, or trade your personal information. We may share information in the following circumstances:</P>
        <DataTable
          headers={["Recipient", "Basis"]}
          rows={[
            ["Service providers", "Hosting, authentication, database, storage, and communications providers who assist us in operating the Platform, under appropriate confidentiality obligations."],
            ["Other users", "Minimum information necessary for a transaction (for example, your suburb as part of a listing)."],
            ["Law enforcement or regulators", "Where required or permitted by law, including in response to a lawful request or to protect the rights, property, or safety of LoopGen, its users, or the public."],
            ["Business successors", "In the event of a merger, acquisition, or sale of assets, subject to reasonable prior notice to affected users where practicable."],
          ]}
        />
        <H3>Overseas disclosure</H3>
        <P>Some of our service providers may process or store personal information outside Australia. Where applicable, we take reasonable steps in accordance with Australian privacy law when disclosing personal information to overseas recipients.</P>
      </Section>

      <Section id="storage">
        <H2>5. Storage and Security</H2>
        <P>We take reasonable technical and organisational measures designed to protect personal information from misuse, interference, loss, and unauthorised access, modification, or disclosure.</P>
        <P>Your account is protected by password authentication. You are responsible for keeping your account credentials confidential.</P>
        <P>No system can guarantee complete security. If you believe your account has been compromised, please contact us immediately.</P>
      </Section>

      <Section id="retention">
        <H2>6. Data Retention</H2>
        <P>We retain personal information for as long as your account is active or as reasonably necessary to provide the Platform, comply with legal obligations, resolve disputes, and enforce our agreements.</P>
        <P>If you wish to request deletion of your account and associated data, please contact us at <a href="mailto:support@loopgen.com.au" style={{ color: "#1a6b3a" }}>support@loopgen.com.au</a>. Requests will be considered subject to applicable legal and operational retention requirements.</P>
      </Section>

      <Section id="breach">
        <H2>7. Data Breach Response</H2>
        <P>If we become aware of a data breach that is likely to result in serious harm to affected individuals, we will take prompt steps to contain the breach, assess its nature and scope, and notify the Office of the Australian Information Commissioner (OAIC) and affected individuals as required under the Notifiable Data Breaches scheme.</P>
        <P>To report a suspected security issue: <a href="mailto:support@loopgen.com.au" style={{ color: "#1a6b3a" }}>support@loopgen.com.au</a></P>
      </Section>

      <Section id="cookies">
        <H2>8. Cookies and Local Storage</H2>
        <P>LoopGen uses browser local storage to maintain your login session and preserve certain in-app preferences (such as message read state) between sessions. This is necessary for the Platform to function correctly.</P>
        <P>We do not currently use third-party advertising or analytics cookies.</P>
      </Section>

      <Section id="rights">
        <H2>9. Your Rights</H2>
        <P>Under the Privacy Act 1988 (Cth) and the APPs, you have the right to:</P>
        <Ul>
          <Li><strong>Access</strong> personal information we hold about you.</Li>
          <Li><strong>Request correction</strong> of inaccurate or out-of-date information.</Li>
          <Li><strong>Request deletion</strong> of your account and personal data, subject to legal and operational retention requirements.</Li>
          <Li><strong>Make a privacy complaint</strong> if you believe we have not handled your information appropriately.</Li>
        </Ul>
        <P>To exercise any of these rights, contact us at <a href="mailto:support@loopgen.com.au" style={{ color: "#1a6b3a" }}>support@loopgen.com.au</a>. We will respond within a reasonable time.</P>
      </Section>

      <Section id="contact">
        <H2>10. Privacy Contact</H2>
        <P>For privacy-related enquiries, requests, or complaints:</P>
        <P><strong>Email:</strong> <a href="mailto:support@loopgen.com.au" style={{ color: "#1a6b3a" }}>support@loopgen.com.au</a></P>
        <P><strong>Operator:</strong> NexaraX Pty Ltd, ACN 696 134 620 / ABN 43 696 134 620</P>
      </Section>
    </LegalLayout>
  );
}
