import About from "../../components/About";

export const metadata = {
  title: "About Vivek Pawar | Full-Stack & Android Developer",
  description:
    "Learn more about Vivek Pawar, Final Year B.Tech CSE student at SVERI's College of Engineering. Background, education, journey, and technical philosophy.",
};

export default function AboutPage() {
  return (
    <main style={{ padding: "1.5rem 1.25rem 3rem", minHeight: "calc(100vh - 72px)" }}>
      <About />
    </main>
  );
}
