// /legal/trust — LoopGen Trust & Safety Architecture
import LegalLayout, { Section, H2, H3, P, Ul, Li, Callout, DataTable } from "./LegalLayout.jsx";

const SECTIONS = [
  { id: "overview",      label: "Framework Overview" },
  { id: "reputation",    label: "Seller Reputation System" },
  { id: "verification",  label: "Seller Verification System" },
  { id: "badges",        label: "Trust Badge System" },
  { id: "antiscam",      label: "Anti-Scam Detection" },
  { id: "reporting",     label: "Reporting System" },
  { id: "buyer-flow",    label: "Buyer Protection Flow" },
  { id: "actions",       label: "Account Actions" },
  { id: "law",           label: "Law Enforcement Cooperation" },
];

export default function TrustSafetyArchitecture() {
  return (
    <LegalLayout
      pageId="trust"
      title="Trust & Safety Architecture"
      badge="Internal System Design"
      sections={SECTIONS}
    >
      <Callout title="About This Document" type="blue">
        <p>This document describes LoopGen's complete Trust & Safety system design — covering seller reputation scoring, verification levels, anti-scam detection, community reporting, and buyer protection processes. It is published for transparency and user education.</p>
      </Callout>

      <Section id="overview">
        <H2>1. Framework Overview</H2>
        <P>LoopGen is operated by <strong>NexaraX Pty Ltd</strong> (ACN: 696 134 620 / ABN: 43 696 134 620), 2 Patricia Road, Blackburn VIC 3130, Australia.</P>
        <P>LoopGen's Trust & Safety (T&S) system operates across four pillars that together create a safe classified marketplace:</P>
        <DataTable
          headers={["Pillar", "Components"]}
          rows={[
            ["Prevention", "Seller verification tiers, listing requirements, rate-limiting for new accounts, high-value listing holds"],
            ["Detection", "AI-powered risk scoring (0–100), anomaly pattern analysis, community reporting, automated rule triggers"],
            ["Response", "Manual review queue, account actions framework, dispute facilitation, law enforcement cooperation"],
            ["Education", "Anti-scam guides, seller onboarding safety, buyer safety warnings, in-app contextual alerts"],
          ]}
        />
      </Section>

      <Section id="reputation">
        <H2>2. Seller Reputation System</H2>
        <H3>Trust Score Formula</H3>
        <P>Every seller on LoopGen has a Trust Score from 0 to 100, recalculated every 24 hours and displayed publicly on all listings and profiles.</P>
        <div className="trust-formula">
          <div className="trust-formula-label">Trust Score (Max 100 points)</div>
          <div className="trust-formula-eq">
            Trust Score<span className="plus">=</span>Verified Status (25)<span className="plus">+</span>Buyer Ratings (15)<span className="plus">+</span>Successful Transactions (30)<span className="plus">+</span>Account Age (20)<span className="plus">+</span>Response Speed (10)
          </div>
        </div>

        <H3>Component Detail</H3>
        <DataTable
          headers={["Component", "Maximum Points", "Scoring"]}
          rows={[
            ["Verified Status", "25 pts", "Level 1 = 10 pts  |  Level 2 = 20 pts  |  Level 3 = 25 pts. Mandatory base — no other component scores without at least L1."],
            ["Buyer Ratings", "15 pts", "(average_rating ÷ 5) × 15. Minimum 3 reviews required to activate this component."],
            ["Successful Transactions", "30 pts", "1 pt per completed, undisputed sale — capped at 30. −2 pts per upheld refund or dispute."],
            ["Account Age", "20 pts", "1 pt per active calendar month — capped at 20. Resets to 0 if account is banned and reinstated."],
            ["Response Speed", "10 pts", "Under 2 hrs = 10 pts | 2–12 hrs = 7 pts | 12–24 hrs = 4 pts | Over 24 hrs = 0 pts. Rolling 30-day average."],
          ]}
        />

        <H3>Trust Score Tiers</H3>
        <DataTable
          headers={["Score Range", "Tier", "Platform Effect"]}
          rows={[
            ["0–10",   "Unestablished", "Browse only. Cannot list. No badge."],
            ["11–25",  "New Seller",    "Max 5 listings. Reduced search placement. Blue 'New' badge."],
            ["26–50",  "Emerging",      "Standard listing access. Standard placement."],
            ["51–75",  "Trusted Seller","Priority category placement. Green 'Trusted' badge."],
            ["76–90",  "Highly Trusted","Featured sections. Promoted listing discounts. 'Top Seller' badge."],
            ["91–100", "Star Seller",   "Homepage eligible. Dedicated account support. Gold 'Star Seller' badge."],
          ]}
        />

        <H3>Score Penalties</H3>
        <DataTable
          headers={["Event", "Penalty"]}
          rows={[
            ["Upheld buyer dispute or complaint", "−5 points"],
            ["Formal Trust & Safety warning", "−10 points"],
            ["Temporary account suspension", "Score frozen during suspension period"],
            ["Serious policy violation", "Score reset to 0 — review required before relisting"],
          ]}
        />
      </Section>

      <Section id="verification">
        <H2>3. Seller Verification System</H2>

        <div className="level-card">
          <div className="level-icon" style={{background:"#f1f5f9"}}>0️⃣</div>
          <div>
            <div className="level-title">Level 0 — Unverified</div>
            <div className="level-sub">No verification completed</div>
            <p style={{fontSize:13,color:"var(--muted)"}}>Browse only. Cannot list items, message sellers, or complete purchases.</p>
          </div>
        </div>

        <div className="level-card">
          <div className="level-icon l1">✉️</div>
          <div>
            <div className="level-title">Level 1 — Email Verified</div>
            <div className="level-sub">Email confirmed via verification link sent to registered address</div>
            <p style={{fontSize:13,color:"var(--muted)"}}>List up to 5 items · Basic Trust Score begins · ✉ Email Verified badge displayed</p>
          </div>
        </div>

        <div className="level-card">
          <div className="level-icon l2">✅</div>
          <div>
            <div className="level-title">Level 2 — Payment Verified</div>
            <div className="level-sub">Valid payment method connected and verified via payment processor</div>
            <p style={{fontSize:13,color:"var(--muted)"}}>Unlimited listings · Full seller features · Priority placement · ✅ Payment Verified badge</p>
          </div>
        </div>

        <div className="level-card">
          <div className="level-icon l3">🪪</div>
          <div>
            <div className="level-title">Level 3 — Identity Verified <em style={{fontSize:11,fontWeight:400}}>Coming soon</em></div>
            <div className="level-sub">Government ID verified via accredited identity verification service</div>
            <p style={{fontSize:13,color:"var(--muted)"}}>High-value categories · Maximum trust weighting · 🪪 Identity Verified badge · Dedicated support</p>
          </div>
        </div>
      </Section>

      <Section id="badges">
        <H2>4. Trust Badge System</H2>
        <P>Trust badges are displayed on seller profiles and listings. They provide buyers with instant visual signals of seller trustworthiness and achievement.</P>
        <div className="badge-grid">
          <span className="badge green">✉ Email Verified</span>
          <span className="badge green">✅ Payment Verified</span>
          <span className="badge blue">🪪 Identity Verified</span>
          <span className="badge green">💚 Trusted Trader</span>
          <span className="badge gold">⭐ Top Seller</span>
          <span className="badge slate">⚡ Fast Responder</span>
          <span className="badge gold">🌟 Star Seller</span>
        </div>
        <DataTable
          headers={["Badge", "Award Criteria", "Display Location"]}
          rows={[
            ["Email Verified", "Level 1 verification", "All listings + profile"],
            ["Payment Verified", "Level 2 verification", "All listings + profile"],
            ["Identity Verified", "Level 3 verification", "All listings + profile (separate badge)"],
            ["Trusted Trader", "Trust Score ≥ 51 + 20 completed transactions", "Profile + listing stamp"],
            ["Top Seller", "Trust Score ≥ 76", "Profile + category featured"],
            ["Fast Responder", "30-day avg response < 2 hours", "Profile only"],
            ["Star Seller", "Trust Score 91–100", "All placements + homepage eligible"],
          ]}
        />
      </Section>

      <Section id="antiscam">
        <H2>5. Anti-Scam Detection System</H2>
        <H3>Automated Risk Scoring</H3>
        <P>Every listing, account registration, and user session is assigned a Risk Score (0–100). The following signals trigger elevated risk scores:</P>
        <Ul>
          <Li>High-value listing (&gt;$200) from an account created within 30 days with zero transaction history</Li>
          <Li>Listing price more than 40% below average market rate for the category</Li>
          <Li>Account receiving 3+ user reports across different listings within 7 days</Li>
          <Li>Listing description or in-app message containing an external payment link</Li>
          <Li>Messages containing keywords associated with off-platform payment requests</Li>
          <Li>IP or device fingerprint matching a previously banned account</Li>
          <Li>Account registration patterns consistent with automated bulk creation</Li>
        </Ul>

        <H3>Risk Score Response Matrix</H3>
        <DataTable
          headers={["Risk Score", "Status", "System Action"]}
          rows={[
            ["0–30  Low", "Normal", "No intervention. Standard listing display."],
            ["31–60  Moderate", "Monitoring", "Flagged internally. Reviewed if user-reported."],
            ["61–80  High", "Hold", "Listing withheld. User notified. Manual review within 48 hours."],
            ["81–100  Critical", "Block", "Listing blocked. Account restricted. Review within 4 hours."],
          ]}
        />

        <H3>Scam Patterns Actively Monitored</H3>
        <DataTable
          headers={["Pattern", "Detection Signal"]}
          rows={[
            ["Off-platform payment requests", "Message or listing contains bank transfer, crypto, gift card, or PayID payment request"],
            ["Overpayment scam", "Buyer offers more than asking price, requests refund of difference"],
            ["LoopGen impersonation", "Emails or messages claiming to be from LoopGen with unusual fee requests"],
            ["Ghost listings", "High-demand items at low prices from new accounts with no prior history"],
            ["Trust Score farming", "Multiple linked accounts generating coordinated positive reviews"],
            ["Phishing", "Listing or message contains suspicious links to login or payment pages"],
          ]}
        />
      </Section>

      <Section id="reporting">
        <H2>6. Community Reporting System</H2>
        <Callout title="Report Listing function" type="green">
          <p>Every LoopGen listing includes a visible "Report Listing" button accessible to all registered users. Reports trigger automated triage and human review based on severity. Your report is confidential and helps protect the whole community.</p>
        </Callout>

        <H3>Report Categories</H3>
        <DataTable
          headers={["Reason", "Description"]}
          rows={[
            ["Scam", "Listing appears designed to defraud a buyer — suspicious price, new account, urgent language"],
            ["Fake / Counterfeit Item", "Item is misrepresented as genuine branded goods"],
            ["Prohibited Item", "Item falls within the Prohibited Items Policy"],
            ["Spam / Duplicate", "Listing is spam, duplicated, or irrelevant to its category"],
            ["Suspicious Activity", "General safety concern not covered by other categories"],
          ]}
        />

        <H3>Response SLAs</H3>
        <DataTable
          headers={["Priority", "Trigger", "Target Response"]}
          rows={[
            ["P1 Critical", "Active scam, illegal item, CSAM, imminent harm", "2 hours"],
            ["P2 High", "Suspected fraud, counterfeit goods, prohibited item", "12 hours"],
            ["P3 Standard", "Spam, duplicate, incorrect category", "48 hours"],
            ["P4 Low", "Preference-based or cosmetic complaint", "5 business days"],
          ]}
        />
      </Section>

      <Section id="buyer-flow">
        <H2>7. Buyer Protection Flow</H2>
        <Callout title="Important" type="amber">
          <p>LoopGen does not process payments and cannot compel refunds. This flow facilitates communication and may produce non-binding recommendations. For financial recovery, contact your bank and Scamwatch immediately.</p>
        </Callout>
        <DataTable
          headers={["Step", "Party", "Action"]}
          rows={[
            ["1 — Report Issue", "Buyer", "Contact seller via in-app messaging with clear description and supporting photos. Most disputes resolve here within 24–48 hours."],
            ["2 — Seller Response", "Seller", "48 hours to respond. Non-response automatically escalates to Step 3."],
            ["3 — LoopGen Review", "LoopGen T&S", "Trust & Safety reviews evidence from both parties. Additional documentation may be requested. Review: 3–5 business days."],
            ["4 — Facilitated Outcome", "LoopGen T&S", "Non-binding recommendation issued. If fraud confirmed: seller permanently banned and reported to law enforcement. Users retain all external remedy rights."],
          ]}
        />
      </Section>

      <Section id="actions">
        <H2>8. Account Actions Framework</H2>
        <DataTable
          headers={["Action", "Description", "Trigger"]}
          rows={[
            ["Warning", "Formal notice recorded on account. No access restriction.", "First minor breach"],
            ["Content Removal", "Specific listing or message removed. User notified with reason.", "Policy-violating content"],
            ["Temporary Restriction", "Listing or purchasing ability suspended (1–30 days).", "Moderate or repeated breach"],
            ["Temporary Suspension", "Full account access suspended (3–14 days) pending review.", "Serious breach"],
            ["Permanent Ban", "Account permanently closed. New account creation prohibited.", "Fraud, scam, severe violation"],
            ["Law Enforcement Referral", "User details shared with AFP, ACCC, or state police per valid legal request.", "Criminal activity or imminent harm"],
          ]}
        />
        <P>Users may appeal account actions within 14 days by contacting <a href="mailto:appeals@loopgen.app">appeals@loopgen.app</a>. Appeals are reviewed by a senior T&S team member not involved in the original decision.</P>
      </Section>

      <Section id="law">
        <H2>9. Law Enforcement Cooperation</H2>
        <Ul>
          <Li>All data disclosure requests require a valid Australian court order, warrant, or formal production notice</Li>
          <Li>Emergency disclosures may be made without a court order where there is an imminent threat to life</Li>
          <Li>CSAM reports are referred immediately to the Australian Federal Police and eSafety Commissioner — no exceptions</Li>
          <Li>LoopGen maintains records of all law enforcement requests and responses</Li>
          <Li>Contact: <a href="mailto:lawenforcement@loopgen.app">lawenforcement@loopgen.app</a></Li>
        </Ul>
        <H3>Safety Inboxes</H3>
        <DataTable
          headers={["Inbox", "Purpose"]}
          rows={[
            ["safety@loopgen.app", "Trust & Safety general enquiries — monitored during AU business hours"],
            ["disputes@loopgen.app", "Dispute facilitation — monitored during AU business hours"],
            ["appeals@loopgen.app", "Account action appeals — 5 business day response SLA"],
            ["legal@loopgen.app", "Legal and compliance enquiries"],
            ["privacy@loopgen.app", "Privacy Officer and data rights requests"],
            ["lawenforcement@loopgen.app", "Law enforcement requests"],
          ]}
        />
      </Section>
    </LegalLayout>
  );
}
