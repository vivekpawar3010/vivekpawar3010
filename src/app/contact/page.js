import Contact from "../../components/Contact";

export const metadata = {
  title: "Contact | Vivek Pawar",
  description: "Get in touch with Vivek Pawar for software engineering internships, collaborations, or inquiries.",
};

export default function ContactPage() {
  return (
    <main style={{ minHeight: "calc(100vh - 72px)" }}>
      <Contact />
    </main>
  );
}
