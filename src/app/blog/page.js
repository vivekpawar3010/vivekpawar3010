import BlogNotes from "../../components/BlogNotes";

export const metadata = {
  title: "Blog & Notes | Vivek Pawar",
  description:
    "Engineering writeups, project insights, and algorithmic problem-solving breakdowns by Vivek Pawar.",
};

export default function BlogPage() {
  return (
    <main style={{ minHeight: "calc(100vh - 72px)", padding: "1rem 1.25rem 3rem" }}>
      <BlogNotes />
    </main>
  );
}
