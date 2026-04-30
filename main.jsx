import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// ── FORCE PWA CACHE CLEAR on every new build ─────────────────────────────
// This runs BEFORE the app renders — clears stale SW caches immediately
const BUILD_STAMP = 'CHAT-FIX-002';

async function clearStaleCache() {
  if (!('caches' in window)) return;
  try {
    const keys = await caches.keys();
    const stamp = localStorage.getItem('build_stamp');
    if (stamp !== BUILD_STAMP) {
      console.log('[LoopGen] New build detected — clearing caches');
      await Promise.all(keys.map(k => caches.delete(k)));
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
      localStorage.setItem('build_stamp', BUILD_STAMP);
      // Reload once to get fresh assets
      window.location.reload();
      return true;
    }
  } catch (e) {
    console.warn('[LoopGen] Cache clear failed:', e);
  }
  return false;
}

clearStaleCache().then(reloaded => {
  if (reloaded) return; // page is reloading
  mountApp();
});

function mountApp() {
  // ── Path-based router ─────────────────────────────────────────────────
  const path = window.location.pathname.replace(/\/$/, '').toLowerCase();

  const LEGAL_ROUTES = {
    '/terms':              () => import('./legal/TermsOfService.jsx'),
    '/legal/terms':        () => import('./legal/TermsOfService.jsx'),
    '/privacy':            () => import('./legal/PrivacyPolicy.jsx'),
    '/legal/privacy':      () => import('./legal/PrivacyPolicy.jsx'),
    '/trust':              () => import('./legal/TrustSafety.jsx'),
    '/legal/trust':        () => import('./legal/TrustSafety.jsx'),
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
}
