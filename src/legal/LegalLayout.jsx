import React from "react";
import { useLegalBack } from "./LegalBackContext.js";

// ─── Back button header ───────────────────────────────────────────────────────
function LegalHeader({ title, badge }) {
  const onBack = useLegalBack();
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 10,
      background: "#fff",
      borderBottom: "1px solid #f0f0f0",
      padding: "12px 20px",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          padding: "4px 0", display: "flex", alignItems: "center",
          color: "#374151", flexShrink: 0,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      )}
      <div>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#111", lineHeight: 1.2 }}>
          {title}
        </div>
        {badge && (
          <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{badge}</div>
        )}
      </div>
    </div>
  );
}

// ─── Root layout ─────────────────────────────────────────────────────────────
export default function LegalLayout({ title, badge, sections, children }) {
  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      background: "#fff",
      minHeight: "100%",
      display: "flex", flexDirection: "column",
    }}>
      {title && <LegalHeader title={title} badge={badge} />}


      <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: "20px 20px 60px" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Primitives ───────────────────────────────────────────────────────────────
export const Section = ({ id, children }) => (
  <section id={id} style={{ marginBottom: 24 }}>{children}</section>
);

export const H2 = ({ children }) => (
  <h2 style={{ marginTop: 32, fontSize: 17, fontWeight: 700, color: "#111", marginBottom: 8 }}>{children}</h2>
);

export const H3 = ({ children }) => (
  <h3 style={{ marginTop: 18, fontSize: 14, fontWeight: 600, color: "#222", marginBottom: 6 }}>{children}</h3>
);

export const P = ({ children }) => (
  <p style={{ lineHeight: 1.6, color: "#374151", fontSize: 14, marginBottom: 10 }}>{children}</p>
);

export const Ul = ({ children }) => (
  <ul style={{ paddingLeft: 20, color: "#374151", fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>{children}</ul>
);

export const Li = ({ children }) => (
  <li style={{ marginBottom: 6 }}>{children}</li>
);

export const Callout = ({ title, type = "blue", children }) => {
  const colors = {
    green: { bg: "#f0fdf4", border: "#bbf7d0", title: "#166534" },
    blue:  { bg: "#eff6ff", border: "#bfdbfe", title: "#1e40af" },
    amber: { bg: "#fffbeb", border: "#fde68a", title: "#92400e" },
  };
  const c = colors[type] || colors.blue;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 10, padding: "14px 16px", marginBottom: 16,
    }}>
      {title && (
        <div style={{ fontWeight: 700, color: c.title, fontSize: 13, marginBottom: 6 }}>{title}</div>
      )}
      <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
};

export const DataTable = ({ headers, rows, children }) => {
  if (headers && rows) {
    return (
      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={{
                  textAlign: "left", padding: "8px 10px",
                  background: "#f9fafb", borderBottom: "2px solid #e5e7eb",
                  fontWeight: 600, color: "#111",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: "1px solid #f0f0f0" }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: "8px 10px", color: "#374151", verticalAlign: "top" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  // Fallback for raw <tr>/<td> children
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>{children}</table>
  );
};
