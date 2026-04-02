import Link from "next/link";

export default function Navbar() {
  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 20px",
      background: "rgba(15, 23, 42, 0.95)",
      borderBottom: "1px solid #334155",
      color: "#f8fafc",
      position: "sticky",
      top: 0,
      zIndex: 99,
    }}>
      <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>My Portfolio</div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link href="/" style={{ color: "#dbeafe", textDecoration: "none" }}>
          Home
        </Link>
        <Link href="/about" style={{ color: "#dbeafe", textDecoration: "none" }}>
          About
        </Link>
        <Link href="/about" style={{ textDecoration: "none" }}>
          <button
            style={{
              border: "none",
              borderRadius: "8px",
              padding: "8px 12px",
              background: "#2563eb",
              color: "white",
              cursor: "pointer",
            }}
          >
            LeetCode
          </button>
        </Link>
      </div>
    </nav>
  );
}

