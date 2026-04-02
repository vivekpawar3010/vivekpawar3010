"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE = "https://alfa-leetcode-api.onrender.com";
const DEFAULT_USERNAME = "FWAtxJlGR3";

const safeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const formatValue = (value) => {
  const num = safeNumber(value, null);
  return num === null ? "--" : num.toLocaleString();
};

const parseProfile = (raw) => {
  const profile = raw?.data ?? raw ?? {};

  return {
    name: profile.name || profile.realName || profile.username || "LeetCode User",
    username: profile.username || DEFAULT_USERNAME,
    ranking: profile.ranking ?? profile.rank ?? profile.globalRanking ?? "--",
    avatar:
      profile.avatar || profile.userAvatar || profile.profile?.userAvatar || profile.profile?.avatar || "",
  };
};

const findDifficultyCount = (data, level) => {
  if (!Array.isArray(data)) return 0;
  const found = data.find((item) => (item.difficulty || item.label || "").toLowerCase() === level.toLowerCase());
  return safeNumber(found?.count, 0);
};

const parseStats = (data) => {
  const profile = data?.data ?? data ?? {};
  return {
    total: safeNumber(
      profile.totalSolved || profile.totalSolvedCount || profile.solvedProblem ||
        findDifficultyCount(profile.acSubmissionNum, "All") ||
        findDifficultyCount(profile.submitStats?.acSubmissionNum, "All"),
      0
    ),
    easy: safeNumber(
      profile.easySolved || profile.easySolvedCount || findDifficultyCount(profile.acSubmissionNum, "Easy") ||
        findDifficultyCount(profile.submitStats?.acSubmissionNum, "Easy"),
      0
    ),
    medium: safeNumber(
      profile.mediumSolved || profile.mediumSolvedCount || findDifficultyCount(profile.acSubmissionNum, "Medium") ||
        findDifficultyCount(profile.submitStats?.acSubmissionNum, "Medium"),
      0
    ),
    hard: safeNumber(
      profile.hardSolved || profile.hardSolvedCount || findDifficultyCount(profile.acSubmissionNum, "Hard") ||
        findDifficultyCount(profile.submitStats?.acSubmissionNum, "Hard"),
      0
    ),
  };
};

const parseContest = (data) => {
  const profile = data?.data ?? data ?? {};
  const rating = profile.rating ?? profile.contestRating ?? profile.currentRating ?? "--";
  const rank = profile.globalRanking ?? profile.globalRank ?? profile.ranking ?? "--";
  const attended = profile.attendedContestsCount ?? profile.contestCount ?? profile.attendedContests ?? 0;
  return { rating, rank, attended };
};

const parseLanguages = (data) => {
  const list =
    data?.languageProblemCount || data?.data?.languageProblemCount || data?.matchedUser?.languageProblemCount ||
    data || [];
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => ({
      name: item.languageName || item.language || item.name || "Unknown",
      count: safeNumber(item.problemsSolved ?? item.count ?? item.value, 0),
    }))
    .filter((item) => item.count > 0);
};

const parseSubmissions = (data) => {
  const list = data?.submission || data?.data?.submission || data?.recentSubmissions || data || [];
  if (!Array.isArray(list)) return [];
  return list.slice(0, 5).map((item) => ({
    title: item.title || item.problemTitle || item.name || "Untitled",
    status: item.statusDisplay || item.status || item.result || "Unknown",
    lang: item.lang || item.language || "N/A",
    time: item.timestamp || item.submitTime || item.time || 0,
  }));
};

const formatDate = (timestamp) => {
  if (!timestamp) return "-";
  const raw = Number(timestamp);
  if (!Number.isFinite(raw)) return "-";
  const normalized = raw < 1e12 ? raw * 1000 : raw;
  return new Date(normalized).toLocaleString();
};

export default function LeetCodeDashboard() {
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(parseProfile(null));
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });
  const [contest, setContest] = useState({ rating: "--", rank: "--", attended: 0 });
  const [languages, setLanguages] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const normalizedUsername = useMemo(() => {
    if (!input && !username) return DEFAULT_USERNAME;
    const value = input || username;
    const trimmed = (value || "").trim();
    if (!trimmed) return DEFAULT_USERNAME;
    const match = trimmed.match(/leetcode\.com\/(?:u\/)?([^/?#]+)/i);
    return match ? match[1].replace("@", "") : trimmed.replace("@", "");
  }, [input, username]);

  const loadProfile = async (selected) => {
    if (!selected) return;
    setLoading(true);
    setError("");

    try {
      const key = encodeURIComponent(selected);
      const [profileRes, solvedRes, contestRes, submissionsRes, languageRes] = await Promise.all([
        fetch(`${API_BASE}/${key}`),
        fetch(`${API_BASE}/${key}/solved`),
        fetch(`${API_BASE}/${key}/contest`),
        fetch(`${API_BASE}/${key}/submission?limit=5`),
        fetch(`${API_BASE}/${key}/language`),
      ]);

      if (!profileRes.ok || !solvedRes.ok || !contestRes.ok) {
        throw new Error("Could not fetch most of the data. Verify username and network.");
      }

      const profileJson = await profileRes.json();
      const solvedJson = await solvedRes.json();
      const contestJson = await contestRes.json();
      const submissionsJson = await submissionsRes.json();
      const languageJson = await languageRes.json();

      setProfile(parseProfile(profileJson));
      setStats(parseStats(solvedJson));
      setContest(parseContest(contestJson));
      setLanguages(parseLanguages(languageJson));
      setSubmissions(parseSubmissions(submissionsJson));

      setUsername(selected);
      localStorage.setItem("leetcode_username", selected);
      setInput("");
    } catch (err) {
      setError(err?.message || "Unable to load LeetCode profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("leetcode_username") || DEFAULT_USERNAME;
    loadProfile(stored);
  }, []);

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: 18 }}>
        <h1>LeetCode Profile</h1>
        <p>Show your LeetCode stats and contest info from API.</p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter username or leetcode.com/u/username"
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", minWidth: 240 }}
        />
        <button
          onClick={() => loadProfile(normalizedUsername)}
          style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#3b82f6", color: "white", cursor: "pointer" }}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load Profile"}
        </button>
      </div>

      {error && (
        <div style={{ color: "#b91c1c", background: "#fee2e2", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div style={{ border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 16, background: "rgba(255,255,255,0.03)", padding: 18 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <img
            src={profile.avatar || "https://via.placeholder.com/80?text=LC"}
            alt="avatar"
            style={{ width: 84, height: 84, borderRadius: "50%", border: "2px solid #60a5fa", objectFit: "cover" }}
          />
          <div>
            <h2 style={{ margin: 0 }}>{profile.name}</h2>
            <p style={{ margin: "4px 0 0", color: "#a1a1aa" }}>@{profile.username}</p>
            <p style={{ margin: "6px 0 0" }}>Ranking: {formatValue(profile.ranking)}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginTop: 16 }}>
          <div style={{ background: "rgba(15, 23, 42, 0.9)", padding: 12, borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase" }}>Total Solved</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{formatValue(stats.total)}</div>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.9)", padding: 12, borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Easy</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{formatValue(stats.easy)}</div>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.9)", padding: 12, borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Medium</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{formatValue(stats.medium)}</div>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.9)", padding: 12, borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Hard</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{formatValue(stats.hard)}</div>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 150px", background: "rgba(15, 23, 42, 0.9)", padding: 12, borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Contest Rating</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{formatValue(contest.rating)}</div>
          </div>
          <div style={{ flex: "1 1 150px", background: "rgba(15, 23, 42, 0.9)", padding: 12, borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Global Rank</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{formatValue(contest.rank)}</div>
          </div>
          <div style={{ flex: "1 1 150px", background: "rgba(15, 23, 42, 0.9)", padding: 12, borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Contests</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{formatValue(contest.attended)}</div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <h3 style={{ marginBottom: 8 }}>Recent Submissions</h3>
          {submissions.length === 0 ? (
            <p>No recent submissions available.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
              {submissions.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    background: "rgba(30, 41, 59, 0.85)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: 10,
                    padding: 10,
                    display: "grid",
                    gap: 6,
                  }}
                >
                  <strong>{item.title}</strong>
                  <span>{item.status} • {item.lang} • {formatDate(item.time)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
