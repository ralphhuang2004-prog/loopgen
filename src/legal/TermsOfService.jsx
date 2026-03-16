// /legal/terms — LoopGen Terms of Service


const SECTIONS = [
  { id: "overview",     label: "Platform Overview" },
  { id: "eligibility",  label: "Eligibility" },
  { id: "accounts",     label: "User Accounts" },
  { id: "role",         label: "Marketplace Role" },
  { id: "listings",     label: "Listings" },
  { id: "payments",     label: "Payments" },
  { id: "fees",         label: "Fees" },
  { id: "conduct",      label: "Prohibited Conduct" },
  { id: "ip",           label: "Intellectual Property" },
  { id: "liability",    label: "Limitation of Liability" },
  { id: "acl",          label: "Australian Consumer Law" },
  { id: "governing",    label: "Governing Law" },
  { id: "international","label": "International Expansion" },
  { id: "contact",      label: "Contact" },
];

export default function TermsOfService() {
  return (
    <>
      <Callout title="Important Notice" type="amber">
        <p>By creating an account or using LoopGen, you agree to these Terms. LoopGen is a classified listing platform only — it is NOT a seller, agent, payment processor, or transaction guarantor. All transactions occur directly between buyers and sellers.</p>
      </Callout>

      <Section id="overview">
        <H2>1. Platform Overview</H2>
        <P>LoopGen is operated by NexaraX Pty Ltd (ACN: 696 134 620 / ABN: 43 696 134 620) ("LoopGen", "we", "us", "our"). Our registered office is 2 Patricia Road, Blackburn VIC 3130, Australia. We run an online classified marketplace that provides digital infrastructure enabling registered users to publish listings and connect for the purpose of buying, selling, and exchanging vintage items, fashion, retro electronics, collectibles, and other goods.</P>
        <P>LoopGen generates revenue exclusively through listing fees. We do not process payments between buyers and sellers, hold inventory, or participate in any transaction between users. The contract for any sale is formed solely between the buyer and seller — LoopGen is not a party to it.</P>
      </Section>

      <Section id="eligibility">
        <H2>2. Eligibility</H2>
        <H3>Age</H3>
        <P>You must be at least 18 years of age to register independently. Users aged 15–17 may access the platform only with verified parental or guardian consent.</P>
        <H3>Legal Capacity</H3>
        <P>You must have legal capacity under Australian law to enter a binding contract. By registering, you confirm you meet this requirement.</P>
        <H3>Registration & Clickwrap Acceptance</H3>
        <P>To complete registration, you must actively check all required boxes:</P>
        <Ul>
          <Li>✅ I have read and agree to LoopGen's Terms of Service</Li>
          <Li>✅ I have read and agree to LoopGen's Privacy Policy</Li>
          <Li>☐ (Optional) I consent to receiving marketing communications from LoopGen</Li>
        </Ul>
        <P>LoopGen logs the timestamp, IP address, and account identifier associated with each acceptance event.</P>
      </Section>

      <Section id="accounts">
        <H2>3. User Accounts</H2>
        <P>Register with accurate, complete, and current information. You are responsible for maintaining the confidentiality of your login credentials and all activity under your account. Notify us immediately at <a href="mailto:security@loopgen.app">security@loopgen.app</a> if you suspect unauthorised access.</P>
        <P>One active account per person is permitted. Creating multiple accounts to circumvent restrictions is prohibited and will result in permanent suspension of all associated accounts.</P>
      </Section>

      <Section id="role">
        <H2>4. Marketplace Role</H2>
        <Callout title="LoopGen is a technology platform only" type="blue">
          <p>LoopGen does NOT: sell goods, hold inventory, process payments, act as a commercial agent, guarantee transactions, or become party to any buyer–seller contract. We provide infrastructure only.</p>
        </Callout>
        <P>LoopGen explicitly and unconditionally does not:</P>
        <Ul>
          <Li>sell goods or services to end consumers</Li>
          <Li>process, hold, or transfer buyer payments for goods</Li>
          <Li>act as a reseller, commercial agent, or broker for any user</Li>
          <Li>guarantee the quality, legality, safety, or delivery of any item</Li>
          <Li>verify the authenticity of listed items (except as stated in Seller Verification Policy)</Li>
          <Li>become a party to any contract between a buyer and seller</Li>
        </Ul>
      </Section>

      <Section id="listings">
        <H2>5. Listings</H2>
        <H3>Requirements</H3>
        <P>All listings must accurately describe the item (including all known defects), use genuine photographs of the actual item, state a truthful price in AUD, comply with Australian law, and not appear in the Prohibited Items Policy.</P>
        <H3>Removal</H3>
        <P>LoopGen may remove any listing at its sole discretion without prior notice. Users may appeal removal decisions within 14 days at <a href="mailto:support@loopgen.app">support@loopgen.app</a>.</P>
        <H3>Accuracy</H3>
        <P>Sellers are solely responsible for listing accuracy. Misrepresentation may result in account penalties and exposure to ACL consumer guarantee claims from buyers.</P>
      </Section>

      <Section id="payments">
        <H2>6. Payments</H2>
        <Callout title="LoopGen does not process payments" type="amber">
          <p>All payments occur directly between buyers and sellers. LoopGen has no role in payment processing, holds no funds, and provides no payment guarantees. Buyers transact at their own risk.</p>
        </Callout>
        <P>LoopGen may introduce integrated payment processing, escrow services, or buyer protection programs at a future date. Any such expansion will be announced with at least 30 days' notice.</P>
      </Section>

      <Section id="fees">
        <H2>7. Fees</H2>
        <DataTable
          headers={["Fee Type", "Description"]}
          rows={[
            ["Listing Fee", "Charged when a listing is activated. Disclosed before submission."],
            ["Featured Listing", "Optional promotion to increase visibility. Separately priced."],
            ["Promoted Placement", "Optional category boost. Separately priced."],
          ]}
        />
        <P>All fees are in AUD, inclusive of GST where applicable. Listing fees are non-refundable once active, except where required by the Australian Consumer Law. Fee schedules are published at loopgen.app/fees.</P>
      </Section>

      <Section id="conduct">
        <H2>8. Prohibited Conduct</H2>
        <P>The following conduct is strictly prohibited:</P>
        <Ul>
          <Li>fraud, misrepresentation, or deceptive conduct in violation of the ACL</Li>
          <Li>impersonating another person, business, or LoopGen itself</Li>
          <Li>creating multiple accounts to circumvent bans or restrictions</Li>
          <Li>using automated tools or bots without written authorisation</Li>
          <Li>harassing, threatening, or intimidating other users</Li>
          <Li>soliciting off-platform payments in a manner designed to exploit buyers</Li>
          <Li>posting spam, duplicate, or fictitious listings</Li>
          <Li>uploading malware, viruses, or harmful code</Li>
          <Li>engaging in fake reviews or artificial Trust Score manipulation</Li>
          <Li>violating any applicable Australian law</Li>
        </Ul>
        <P>Violations may result in warnings, listing removal, temporary suspension, permanent account ban, and referral to law enforcement.</P>
      </Section>

      <Section id="ip">
        <H2>9. Intellectual Property</H2>
        <P>All intellectual property in LoopGen — software, design, branding, databases, documentation — is owned by NexaraX Pty Ltd and protected under Australian and international law.</P>
        <P>By posting content, you grant LoopGen a non-exclusive, royalty-free, worldwide licence to host, display, and distribute that content for platform operation. You retain ownership. The licence ends when you delete the content or close your account.</P>
        <P>Rights holders may submit IP takedown notices to <a href="mailto:ip@loopgen.app">ip@loopgen.app</a>. See the full IP Takedown Procedure in our Legal Pack.</P>
      </Section>

      <Section id="liability">
        <H2>10. Limitation of Liability</H2>
        <Callout title="Platform Liability Shield" type="amber">
          <p>To the maximum extent permitted by Australian law, LoopGen is not liable for: item quality or authenticity, losses from buyer–seller transactions, delivery failures, user conduct, or platform downtime.</p>
        </Callout>
        <P>Where LoopGen's liability cannot be excluded, it is limited to the total listing fees paid by that user in the 12 months preceding the claim. Nothing in these Terms limits liability for personal injury caused by negligence, fraud, or any liability that cannot lawfully be excluded under Australian law.</P>
      </Section>

      <Section id="acl">
        <H2>11. Australian Consumer Law Compliance</H2>
        <Callout title="ACL Rights Fully Preserved" type="green">
          <p>These Terms do NOT exclude, limit, or modify any rights available to consumers under the Australian Consumer Law (ACL). Where any conflict exists between these Terms and the ACL, the ACL prevails in all cases.</p>
        </Callout>
        <P>Consumer guarantees apply to LoopGen's own platform services (due care and skill, fitness for purpose). Buyers and sellers are each independently responsible for ACL compliance in their mutual transactions.</P>
      </Section>

      <Section id="governing">
        <H2>12. Governing Law</H2>
        <P>These Terms are governed by the laws of the Commonwealth of Australia and apply across all states and territories:</P>
        <DataTable
          headers={["State/Territory", "Consumer Authority"]}
          rows={[
            ["Victoria", "Consumer Affairs Victoria — consumer.vic.gov.au"],
            ["New South Wales", "NSW Fair Trading — fairtrading.nsw.gov.au"],
            ["Queensland", "Office of Fair Trading — qld.gov.au/fair-trading"],
            ["Western Australia", "Consumer Protection WA — commerce.wa.gov.au"],
            ["South Australia", "Consumer & Business Services SA — cbs.sa.gov.au"],
            ["Tasmania", "Consumer, Building & Occupational Services — cbos.tas.gov.au"],
            ["ACT", "Access Canberra — accesscanberra.act.gov.au"],
            ["Northern Territory", "NT Consumer Affairs — consumeraffairs.nt.gov.au"],
          ]}
        />
        <P>You submit to the non-exclusive jurisdiction of the courts of New South Wales, without limiting your right to commence proceedings in any other Australian jurisdiction. Federal matters: ACCC at accc.gov.au.</P>
      </Section>

      <Section id="international">
        <H2>13. International Expansion</H2>
        <P>LoopGen may expand to international markets in the future. International users are responsible for compliance with their local laws. Upon expansion, LoopGen will introduce jurisdiction-specific terms as addenda to these Terms with appropriate notice.</P>
      </Section>

      <Section id="contact">
        <H2>14. Contact</H2>
        <DataTable
          headers={["Type", "Address"]}
          rows={[
            ["General Support", "support@loopgen.app"],
            ["Legal & Compliance", "legal@loopgen.app"],
            ["Trust & Safety", "safety@loopgen.app"],
            ["Disputes", "disputes@loopgen.app"],
            ["Security", "security@loopgen.app"],
            ["IP / Takedown", "ip@loopgen.app"],
          ]}
        />
      </Section>
    </>
  );
}
