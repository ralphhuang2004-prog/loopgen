import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { registerSW } from 'virtual:pwa-register';

// ── Service Worker: force update on new version ───────────────────────────────
// skipWaiting is set in vite.config.js (workbox config)
// This handles the client side: detects waiting SW and activates it immediately

const updateSW = registerSW({
  // Called when a new SW is waiting to activate
  onNeedRefresh() {
    console.log('[LoopGen SW] New version available — activating immediately');
    // Skip the "update available" prompt — just update silently
    updateSW(true);
  },
  // Called when SW is registered and controlling the page
  onOfflineReady() {
    console.log('[LoopGen SW] App ready for offline use');
  },
  // Called on SW registration error
  onRegisterError(error) {
    console.error('[LoopGen SW] Registration error:', error);
  },
});

// ── Also detect waiting SW via native API ────────────────────────────────────
// Catches edge case where registerSW misses the waiting state
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    // If a new SW is already waiting, activate it now
    if (registration.waiting) {
      console.log('[LoopGen SW] Found waiting SW — posting skipWaiting');
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    // Listen for new SW installations
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[LoopGen SW] New SW installed — activating');
          newWorker.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    });
  });

  // When SW controller changes (new SW took over), reload to get fresh assets
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    console.log('[LoopGen SW] Controller changed — reloading for fresh assets');
    window.location.reload();
  });
}

// ── Path-based router ─────────────────────────────────────────────────────────
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
