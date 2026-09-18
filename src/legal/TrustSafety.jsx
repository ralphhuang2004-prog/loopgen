import LegalLayout, { Section, H2, H3, P, Ul, Li, Callout } from "./LegalLayout.jsx";

export default function TrustSafety() {
  return (
    <LegalLayout
      title="Trust & Safety"
      badge="LoopGen Marketplace Guidelines"
    >
      <Callout title="About This Document" type="green">
        <p>LoopGen is a peer-to-peer marketplace that connects buyers and sellers. We do not process payments, hold funds, or guarantee transactions. This page explains the standards we expect from our community and how to stay safe when buying and selling.</p>
      </Callout>

      <Section id="marketplace">
        <H2>1. How LoopGen Works</H2>
        <P>LoopGen facilitates connections between buyers and sellers. All transactions — including payment, handover, and dispute resolution — are conducted directly between users. LoopGen is not a party to these transactions.</P>
        <P>LoopGen does not:</P>
        <Ul>
          <Li>process or hold payments on behalf of users;</Li>
          <Li>guarantee the authenticity, quality, or condition of any listing;</Li>
          <Li>verify the identity of every user;</Li>
          <Li>guarantee that a transaction will be completed.</Li>
        </Ul>
        <P>Users are responsible for assessing listings, counterparties, and transaction arrangements before proceeding.</P>
      </Section>

      <Section id="staying-safe">
        <H2>2. Staying Safe</H2>
        <H3>Meeting in person</H3>
        <Ul>
          <Li>Where possible, meet in a safe public location — such as a shopping centre, café, or police station front area.</Li>
          <Li>Let someone you trust know where you are going and who you are meeting.</Li>
          <Li>If collection from a private address is necessary, take appropriate precautions and consider having another person present.</Li>
        </Ul>
        <H3>Payments</H3>
        <Ul>
          <Li>Never pay for an item before you have inspected it in person.</Li>
          <Li>Be cautious of requests to pay by bank transfer or digital gift card before meeting — these are common scam tactics.</Li>
          <Li>If you suspect payment fraud, contact your bank promptly.</Li>
        </Ul>
        <H3>Communications</H3>
        <Ul>
          <Li>Keep communications within the LoopGen platform where possible.</Li>
          <Li>Be cautious of links sent by other users, particularly shortened URLs or unfamiliar domains.</Li>
          <Li>Never share your LoopGen password, bank details, or government ID documents with other users.</Li>
        </Ul>
        <H3>General</H3>
        <Ul>
          <Li>Trust your instincts. If something feels wrong, do not proceed.</Li>
          <Li>If you are in immediate danger, contact emergency services (000 in Australia).</Li>
        </Ul>
      </Section>

      <Section id="prohibited">
        <H2>3. Prohibited Conduct</H2>
        <P>The following are prohibited on LoopGen:</P>
        <Ul>
          <Li>Fraudulent, deceptive, or misleading listings or communications.</Li>
          <Li>Listing counterfeit, stolen, or illegal goods.</Li>
          <Li>Impersonating another user or person.</Li>
          <Li>Harassment, abuse, threats, or discriminatory conduct.</Li>
          <Li>Scam activity of any kind, including advance-fee fraud, fake payment confirmations, and phishing.</Li>
          <Li>Interference with the Platform's operation or security.</Li>
        </Ul>
        <P>Violations may result in listing removal, account restriction, or termination. LoopGen may preserve relevant information and cooperate with law enforcement where required or permitted by law.</P>
      </Section>

      <Section id="reporting">
        <H2>4. Reporting Concerns</H2>
        <P>If you encounter a listing or user you believe violates these guidelines, you can report it directly from the listing page within the app.</P>
        <P>You can also contact us at <a href="mailto:support@loopgen.com.au" style={{ color: "#1a6b3a" }}>support@loopgen.com.au</a>.</P>
        <P>We aim to review reports as reasonably practicable, taking into account their nature and seriousness. We do not guarantee that every report will result in action or that the Platform is continuously monitored.</P>
      </Section>

      <Section id="moderation">
        <H2>5. Moderation and Enforcement</H2>
        <P>LoopGen may, at its discretion:</P>
        <Ul>
          <Li>remove or restrict listings that breach our Terms or these guidelines;</Li>
          <Li>issue warnings to users;</Li>
          <Li>restrict or suspend accounts;</Li>
          <Li>terminate accounts where serious or repeated breaches occur;</Li>
          <Li>preserve information where reasonably necessary for legal or operational purposes;</Li>
          <Li>cooperate with law enforcement where required or permitted by law.</Li>
        </Ul>
        <P>Moderation decisions are made at LoopGen's reasonable discretion. LoopGen is not obligated to take action in response to every report.</P>
      </Section>

      <Section id="contact">
        <H2>6. Contact</H2>
        <P>For safety concerns or to report a serious incident:</P>
        <P><a href="mailto:support@loopgen.com.au" style={{ color: "#1a6b3a" }}>support@loopgen.com.au</a></P>
        <P style={{ fontSize: 12, color: "#6b7280" }}>If there is an immediate risk to personal safety, contact emergency services.</P>
      </Section>
    </LegalLayout>
  );
}
