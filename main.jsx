import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

const path = window.location.pathname.replace(/\/$/, '').toLowerCase();

const LEGAL_ROUTES = {
  '/terms':         () => import('./legal/TermsOfService.jsx'),
  '/legal/terms':   () => import('./legal/TermsOfService.jsx'),
  '/privacy':       () => import('./legal/PrivacyPolicy.jsx'),
  '/legal/privacy': () => import('./legal/PrivacyPolicy.jsx'),
  '/trust':         () => import('./legal/TrustSafety.jsx'),
  '/legal/trust':   () => import('./legal/TrustSafety.jsx'),
};

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
      root.render(<React.StrictMode><Component /></React.StrictMode>);
    })
    .catch(() => root.render(<React.StrictMode><App /></React.StrictMode>));
} else {
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
