import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// ── Path-based router ─────────────────────────────────────────────────────────
// Legal pages are served at /terms, /privacy, /trust (and full /legal/* paths).
// No react-router-dom dependency required — we inspect window.location.pathname
// at boot time and mount the correct component.
// Vercel rewrites all paths to /index.html, so this always runs.

const path = window.location.pathname.replace(/\/$/, '').toLowerCase();

// Route map: pathname → lazy loader
const LEGAL_ROUTES = {
  '/terms':              () => import('./legal/TermsOfService.jsx'),
  '/legal/terms':        () => import('./legal/TermsOfService.jsx'),
  '/privacy':            () => import('./legal/PrivacyPolicy.jsx'),
  '/legal/privacy':      () => import('./legal/PrivacyPolicy.jsx'),
  '/trust':              () => import('./legal/TrustSafety.jsx'),
  '/legal/trust':        () => import('./legal/TrustSafety.jsx'),
  '/legal/cookies':      () => import('./legal/PoliciesGroup1.jsx'),
  '/legal/community':    () => import('./legal/PoliciesGroup1.jsx'),
  '/legal/prohibited':   () => import('./legal/PoliciesGroup1.jsx'),
  '/legal/buyer':        () => import('./legal/PoliciesGroup2.jsx'),
  '/legal/seller':       () => import('./legal/PoliciesGroup2.jsx'),
  '/legal/refunds':      () => import('./legal/PoliciesGroup2.jsx'),
  '/legal/antiscam':     () => import('./legal/PoliciesGroup3.jsx'),
  '/legal/verification': () => import('./legal/PoliciesGroup3.jsx'),
};

// Named exports for policy group files
const GROUP_EXPORTS = {
  '/legal/cookies':      'CookiePolicy',
  '/legal/community':    'CommunityGuidelines',
  '/legal/prohibited':   'ProhibitedItemsPolicy',
  '/legal/buyer':        'BuyerProtectionPolicy',
  '/legal/seller':       'SellerPolicy',
  '/legal/refunds':      'RefundDisputePolicy',
  '/legal/antiscam':     'AntiScamPolicy',
  '/legal/verification': 'SellerVerificationPolicy',
};

const root = ReactDOM.createRoot(document.getElementById('root'));

if (LEGAL_ROUTES[path]) {
  LEGAL_ROUTES[path]()
    .then((mod) => {
      const exportName = GROUP_EXPORTS[path];
      const Component = exportName ? mod[exportName] : mod.default;
      root.render(
        <React.StrictMode>
          <Component />
        </React.StrictMode>
      );
    })
    .catch((err) => {
      console.error('Failed to load legal page:', err);
      root.render(<React.StrictMode><App /></React.StrictMode>);
    });
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
