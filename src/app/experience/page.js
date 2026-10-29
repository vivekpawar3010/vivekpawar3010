import Experience from "../../components/Experience";

export const metadata = {
  title: "Experience & Achievements | Vivek Pawar",
  description:
    "Explore internships, technical achievements, TCS Digital selection, and certifications for Vivek Pawar.",
};

export default function ExperiencePage() {
  return (
    <main style={{ minHeight: "calc(100vh - 72px)", padding: "1rem 1.25rem 3rem" }}>
      <Experience />
    </main>
  );
}
