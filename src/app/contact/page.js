import Contact from "../../components/Contact";

export const metadata = {
  title: "Contact | Vivek Pawar",
  description:
    "Let's build something amazing together. Reach out for software engineering internships, full-time opportunities, or collaborations.",
};

export default function ContactPage() {
  return (
    <main style={{ minHeight: "calc(100vh - 72px)", padding: "1.5rem 0 3rem" }}>
      <Contact />
    </main>
  );
}
