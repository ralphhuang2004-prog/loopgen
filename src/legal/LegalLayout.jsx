import React from "react";

export default function LegalLayout({ children }) {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "20px" }}>
      {children}
    </div>
  );
}

export const Section = ({ children }) => (
  <section style={{ marginBottom: 24 }}>{children}</section>
);

export const H2 = ({ children }) => (
  <h2 style={{ marginTop: 32 }}>{children}</h2>
);

export const H3 = ({ children }) => (
  <h3 style={{ marginTop: 20 }}>{children}</h3>
);

export const P = ({ children }) => (
  <p style={{ lineHeight: 1.6 }}>{children}</p>
);

export const Ul = ({ children }) => (
  <ul style={{ paddingLeft: 20 }}>{children}</ul>
);

export const Li = ({ children }) => (
  <li style={{ marginBottom: 6 }}>{children}</li>
);

export const Callout = ({ children }) => (
  <div style={{ background: "#f6f6f6", padding: 12, borderRadius: 6 }}>
    {children}
  </div>
);

export const DataTable = ({ children }) => (
  <table style={{ width: "100%", borderCollapse: "collapse" }}>
    {children}
  </table>
);