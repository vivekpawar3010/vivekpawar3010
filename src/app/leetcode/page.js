import LeetCodeDashboard from "../../components/LeetCodeDashboard";

export const metadata = {
  title: "LeetCode Dashboard | Vivek Pawar",
  description:
    "Live LeetCode problem-solving statistics, contest ratings, recent submissions, and badges for Vivek Pawar (vivek_pawar-3010).",
};

export default function LeetCodePage() {
  return (
    <main style={{ padding: "1.5rem 1.25rem 3rem", minHeight: "calc(100vh - 72px)" }}>
      <LeetCodeDashboard />
    </main>
  );
}
