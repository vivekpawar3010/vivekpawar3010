import Projects from "../../components/Projects";

export const metadata = {
  title: "Projects | Vivek Pawar - Full-Stack Developer",
  description:
    "A collection of projects where I explored ideas, learned new technologies, and built useful solutions for real world problems.",
};

export default function ProjectsPage() {
  return (
    <main style={{ padding: "2rem 0 4rem", minHeight: "calc(100vh - 72px)" }}>
      <div className="container">
        <Projects />
      </div>
    </main>
  );
}
