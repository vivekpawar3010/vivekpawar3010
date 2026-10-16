import Projects from "../../components/Projects";

export const metadata = {
  title: "Projects | Vivek Pawar - Full-Stack Developer",
  description:
    "Explore full-stack web applications, Android applications, and AI integrations built by Vivek Pawar.",
};

export default function ProjectsPage() {
  return (
    <main style={{ padding: "2rem 1.25rem 4rem", minHeight: "calc(100vh - 72px)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--accent-cyan)",
              background: "rgba(56, 189, 248, 0.1)",
              padding: "4px 14px",
              borderRadius: 20,
              border: "1px solid rgba(56, 189, 248, 0.25)",
              marginBottom: 12,
            }}
          >
            Showcase
          </span>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
            Featured <span className="gradient-text">Projects</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto", fontSize: "1.05rem" }}>
            A curated collection of web apps, native Android tools, and AI solutions I&apos;ve built.
          </p>
        </div>

        <Projects />
      </div>
    </main>
  );
}
