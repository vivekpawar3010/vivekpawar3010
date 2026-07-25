import GitHubDashboard from "../../components/GitHubDashboard";

export const metadata = {
  title: "GitHub Dashboard | vivekpawar3010",
  description: "Live GitHub stats, contributions, repositories, and activity for vivekpawar3010",
};

export default function GitHubPage() {
  return (
    <main style={{ padding: "1rem 1.25rem 2rem", minHeight: "calc(100vh - 72px)" }}>
      <GitHubDashboard />
    </main>
  );
}
