import { useEffect, useState } from 'react';

// ── Inline styles — isolated from app CSS, consistent with LoopGen green ──────
const S = {
  banner: {
    position: 'fixed',
    bottom: '1.25rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.875rem',
    background: '#ffffff',
    boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
    border: '1px solid rgba(28,124,69,0.2)',
    maxWidth: '90vw',
    width: 'max-content',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    flexShrink: 0,
    objectFit: 'contain',
  },
  text: {
    fontSize: '0.875rem',
    color: '#111',
    margin: 0,
    lineHeight: 1.45,
  },
  bold: {
    fontWeight: 700,
    color: '#1c7c45',
    display: 'block',
  },
  installBtn: {
    flexShrink: 0,
    background: '#1c7c45',
    color: '#fff',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.45rem 0.9rem',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    whiteSpace: 'nowrap',
    WebkitTapHighlightColor: 'transparent',
  },
  dismissBtn: {
    flexShrink: 0,
    background: 'none',
    border: 'none',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: 1,
    padding: '0 0.2rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    WebkitTapHighlightColor: 'transparent',
  },
};

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

const DISMISSED_KEY = 'loopgen_install_dismissed';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroid, setShowAndroid]       = useState(false);
  const [showIos, setShowIos]               = useState(false);

  useEffect(() => {
    // Already installed or dismissed this session — show nothing
    if (isStandalone()) return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    if (isIos()) {
      // Delay so it doesn't pop immediately on load
      const t = setTimeout(() => setShowIos(true), 3500);
      return () => clearTimeout(t);
    }

    // Android / Chrome / Edge — listen for the native install event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroid(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setShowAndroid(false);
    setShowIos(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowAndroid(false);
  }

  // ── Android / Chrome install banner ──────────────────────────────────────
  if (showAndroid) return (
    <div style={S.banner} role="banner">
      <img src="/icons/icon-192.png" alt="LoopGen" style={S.icon} />
      <p style={S.text}>
        <span style={S.bold}>Install LoopGen</span>
        Add to your home screen
      </p>
      <button style={S.installBtn} onClick={handleInstall}>Install</button>
      <button style={S.dismissBtn} onClick={dismiss} aria-label="Dismiss">✕</button>
    </div>
  );

  // ── iOS / Safari "Add to Home Screen" hint ────────────────────────────────
  if (showIos) return (
    <div style={S.banner} role="banner">
      <img src="/icons/icon-192.png" alt="LoopGen" style={S.icon} />
      <p style={S.text}>
        <span style={S.bold}>Add to Home Screen</span>
        Tap <strong>⎙ Share</strong> → <em>Add to Home Screen</em>
      </p>
      <button style={S.dismissBtn} onClick={dismiss} aria-label="Dismiss">✕</button>
    </div>
  );

  return null;
}
