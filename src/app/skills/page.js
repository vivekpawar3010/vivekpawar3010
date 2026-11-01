import Skills from "../../components/Skills";

export const metadata = {
  title: "Skills & Technical Arsenal | Vivek Pawar",
  description:
    "Comprehensive technical skills, programming languages, frontend and backend frameworks, databases, and developer tools mastered by Vivek Pawar.",
};

export default function SkillsPage() {
  return (
    <main style={{ minHeight: "calc(100vh - 72px)", padding: "1.5rem 1.25rem 3.5rem" }}>
      <div className="container">
        <Skills />
      </div>
    </main>
  );
}
