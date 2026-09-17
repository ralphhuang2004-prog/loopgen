/**
 * LegalPage.jsx
 * Thin wrapper used by both App.jsx and LandingPage.jsx.
 * Renders the correct legal component and injects onBack via context.
 *
 * Usage:
 *   <LegalPage page="terms"   onBack={pop} />
 *   <LegalPage page="privacy" onBack={pop} />
 *   <LegalPage page="trust"   onBack={pop} />
 */
import React from "react";
import TermsOfService from "./TermsOfService.jsx";
import PrivacyPolicy  from "./PrivacyPolicy.jsx";
import TrustSafety    from "./TrustSafety.jsx";
import { LegalBackContext } from "./LegalBackContext.js";

export default function LegalPage({ page, onBack }) {
  const content =
    page === "terms"   ? <TermsOfService /> :
    page === "privacy" ? <PrivacyPolicy />  :
    page === "trust"   ? <TrustSafety />    :
    null;

  if (!content) return null;

  return (
    <LegalBackContext.Provider value={onBack}>
      <div style={{
        flex: 1,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        background: "#fff",
      }}>
        {content}
      </div>
    </LegalBackContext.Provider>
  );
}
