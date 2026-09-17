import React from "react";
import LegalLayout, { Section, H2, P, Ul, Li } from "./LegalLayout.jsx";

const SECTIONS = [
  { id: "s1",  label: "Definitions" },
  { id: "s2",  label: "Platform Overview" },
  { id: "s3",  label: "Eligibility" },
  { id: "s4",  label: "User Accounts" },
  { id: "s5",  label: "Suspension & Termination" },
  { id: "s6",  label: "Marketplace Role" },
  { id: "s7",  label: "Listings & Conduct" },
  { id: "s8",  label: "Payments" },
  { id: "s9",  label: "Fees" },
  { id: "s10", label: "Safety & Reporting" },
  { id: "s11", label: "Intellectual Property" },
  { id: "s12", label: "Privacy" },
  { id: "s13", label: "Limitation of Liability" },
  { id: "s14", label: "Indemnity" },
  { id: "s15", label: "Dispute Resolution" },
  { id: "s16", label: "Consumer Law" },
  { id: "s17", label: "Governing Law" },
  { id: "s18", label: "International Use" },
  { id: "s19", label: "Contact" },
];

const TermsOfService = () => (
  <LegalLayout
    title="Terms and Conditions"
    badge="LoopGen · NexaraX Pty Ltd"
    sections={SECTIONS}
  >
    <Section id="s1">
      <H2>1. Definitions and Interpretation</H2>
      <P>In these Terms:</P>
      <Ul>
        <Li><strong>"Platform"</strong> means the LoopGen website, application, and related services.</Li>
        <Li><strong>"User"</strong> means any individual or entity accessing or using the Platform.</Li>
        <Li><strong>"Services"</strong> means the functionality provided by LoopGen to enable Users to list, discover, and communicate regarding goods.</Li>
        <Li><strong>"Listing"</strong> means any advertisement or post created by a User on the Platform.</Li>
      </Ul>
      <P>Unless the context requires otherwise, headings are for convenience only and do not affect interpretation.</P>
    </Section>

    <Section id="s2">
      <H2>2. Platform Overview</H2>
      <P>LoopGen is operated by NexaraX Pty Ltd (ACN: 696 134 620 / ABN: 43 696 134 620) ("LoopGen", "we", "us", "our").</P>
      <P>LoopGen provides a digital marketplace that facilitates connections between Users.</P>
      <P>LoopGen is not a party to any transaction between Users and does not act as an agent, broker, or payment processor. All contracts are formed directly between Users.</P>
    </Section>

    <Section id="s3">
      <H2>3. Eligibility</H2>
      <P>You must be at least 18 years old or have the consent of a parent or legal guardian.</P>
      <P>By using the Platform, you warrant that you have the legal capacity to enter into a binding contract.</P>
    </Section>

    <Section id="s4">
      <H2>4. User Accounts</H2>
      <P>Users are responsible for:</P>
      <Ul>
        <Li>maintaining the confidentiality of account credentials;</Li>
        <Li>all activity conducted under their account;</Li>
        <Li>ensuring information provided is accurate and up to date.</Li>
      </Ul>
      <P>LoopGen is not liable for any loss arising from unauthorised use of your account where you have failed to take reasonable security measures.</P>
    </Section>

    <Section id="s5">
      <H2>5. Suspension and Termination</H2>
      <P>LoopGen may suspend or terminate access to the Platform where it reasonably considers that:</P>
      <Ul>
        <Li>a User has breached these Terms;</Li>
        <Li>a User poses a risk to other Users or the Platform;</Li>
        <Li>suspension is necessary to comply with legal obligations or protect system integrity.</Li>
      </Ul>
      <P>Where reasonably practicable, LoopGen will provide notice. Immediate suspension may occur where urgent action is required.</P>
    </Section>

    <Section id="s6">
      <H2>6. Marketplace Role</H2>
      <P>LoopGen provides a neutral platform for Users to connect.</P>
      <P>To the maximum extent permitted by law:</P>
      <Ul>
        <Li>LoopGen does not verify, endorse, or guarantee Users or Listings;</Li>
        <Li>LoopGen is not responsible for the quality, safety, legality, or accuracy of Listings;</Li>
        <Li>all transactions and disputes are solely between Users.</Li>
      </Ul>
      <P>Users release LoopGen from claims arising from disputes with other Users, except to the extent such liability cannot be excluded by law.</P>
    </Section>

    <Section id="s7">
      <H2>7. Listings and User Conduct</H2>
      <P>Users must ensure that all Listings:</P>
      <Ul>
        <Li>are accurate, complete, and not misleading;</Li>
        <Li>comply with all applicable laws;</Li>
        <Li>do not infringe intellectual property or other rights.</Li>
      </Ul>
      <P>Users must not engage in:</P>
      <Ul>
        <Li>fraudulent or deceptive conduct;</Li>
        <Li>harassment or abuse;</Li>
        <Li>impersonation;</Li>
        <Li>interference with the Platform's operation or security;</Li>
        <Li>scraping, data extraction, or reverse engineering.</Li>
      </Ul>
      <P>LoopGen may remove, edit, or restrict any Listing or User activity that it reasonably considers to breach these Terms or pose a risk.</P>
    </Section>

    <Section id="s8">
      <H2>8. Payments</H2>
      <P>All payments are arranged directly between Users.</P>
      <P>LoopGen does not process, hold, or guarantee payments and is not responsible for payment disputes.</P>
    </Section>

    <Section id="s9">
      <H2>9. Fees</H2>
      <P>LoopGen may charge fees for certain Services.</P>
      <P>Any applicable fees will be clearly disclosed prior to being incurred.</P>
      <P>Fees are non-refundable except as required by law.</P>
    </Section>

    <Section id="s10">
      <H2>10. Safety and Reporting</H2>
      <P>LoopGen may implement tools that allow Users to report Listings or conduct.</P>
      <P>LoopGen may investigate and take appropriate action, including removal of content or suspension of accounts, where it reasonably considers there is a risk of harm, illegality, or breach of these Terms.</P>
      <P>LoopGen does not guarantee continuous monitoring of the Platform.</P>
    </Section>

    <Section id="s11">
      <H2>11. Intellectual Property</H2>
      <P>All intellectual property in the Platform is owned by or licensed to LoopGen.</P>
      <P>Users must not reproduce, distribute, or exploit Platform content without prior written consent.</P>
    </Section>

    <Section id="s12">
      <H2>12. Privacy</H2>
      <P>LoopGen collects, uses, and stores personal information in accordance with its Privacy Policy.</P>
      <P>By using the Platform, you consent to such collection and use.</P>
      <P>The Privacy Policy forms part of these Terms.</P>
    </Section>

    <Section id="s13">
      <H2>13. Limitation of Liability</H2>
      <P>To the maximum extent permitted by law:</P>
      <Ul>
        <Li>LoopGen excludes all liability for indirect, incidental, or consequential loss;</Li>
        <Li>LoopGen is not liable for loss arising from User transactions;</Li>
        <Li>LoopGen is not liable for interruptions, errors, or unavailability of the Platform.</Li>
      </Ul>
      <P>Where liability cannot be excluded, LoopGen's liability is limited, at its option, to:</P>
      <Ul>
        <Li>resupplying the Services; or</Li>
        <Li>the cost of having the Services resupplied.</Li>
      </Ul>
    </Section>

    <Section id="s14">
      <H2>14. Indemnity</H2>
      <P>You indemnify LoopGen against any claims, losses, damages, or expenses arising from:</P>
      <Ul>
        <Li>your use of the Platform;</Li>
        <Li>your breach of these Terms;</Li>
        <Li>your violation of any law or third-party rights.</Li>
      </Ul>
    </Section>

    <Section id="s15">
      <H2>15. Dispute Resolution</H2>
      <P>If a dispute arises between a User and LoopGen, the parties agree to:</P>
      <ol style={{ paddingLeft: 20, fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
        <li style={{ marginBottom: 6 }}>attempt to resolve the dispute through good faith negotiations;</li>
        <li style={{ marginBottom: 6 }}>if unresolved, refer the dispute to mediation before commencing legal proceedings.</li>
      </ol>
      <P>This clause does not apply where urgent injunctive or equitable relief is sought.</P>
    </Section>

    <Section id="s16">
      <H2>16. Australian Consumer Law</H2>
      <P>Nothing in these Terms excludes, restricts, or modifies any rights under applicable consumer protection laws.</P>
    </Section>

    <Section id="s17">
      <H2>17. Governing Law</H2>
      <P>These Terms are governed by the laws of Australia.</P>
      <P>Users submit to the non-exclusive jurisdiction of the courts of states.</P>
    </Section>

    <Section id="s18">
      <H2>18. International Use</H2>
      <P>Users accessing the Platform from outside Australia are responsible for compliance with local laws.</P>
    </Section>

    <Section id="s19">
      <H2>19. Contact</H2>
      <P>For enquiries:</P>
      <P><a href="mailto:support@loopgen.com.au" style={{ color: "#1a6b3a" }}>support@loopgen.com.au</a></P>
    </Section>
  </LegalLayout>
);

export default TermsOfService;
