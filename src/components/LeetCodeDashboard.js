"use client";

import { useEffect, useState } from "react";

const DEFAULT_USERNAME = "vivek_pawar-3010";

const safeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const formatValue = (value) => {
  const num = safeNumber(value, null);
  return num === null ? "--" : num.toLocaleString();
};

const formatDate = (timestamp) => {
  if (!timestamp) return "-";
  const raw = Number(timestamp);
  if (!Number.isFinite(raw)) return "-";
  const normalized = raw < 1e12 ? raw * 1000 : raw;
  return new Date(normalized).toLocaleString();
};

export default function LeetCodeDashboard() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [myProfile, setMyProfile] = useState({ name: "LeetCode User", username: "vivek_pawar-3010", ranking: "--", avatar: "" });
  // Updated state to include 'today'
  const [myStats, setMyStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0, today: 0 });
  const [myContest, setMyContest] = useState({ rating: "--", rank: "--", attended: 0 });
  const [myLanguages, setMyLanguages] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [myBadges, setMyBadges] = useState([]);

  const [viewedProfile, setViewedProfile] = useState(null);
  // Updated state to include 'today'
  const [viewedStats, setViewedStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0, today: 0 });
  const [viewedContest, setViewedContest] = useState({ rating: "--", rank: "--", attended: 0 });
  const [viewedLanguages, setViewedLanguages] = useState([]);
  const [viewedSubmissions, setViewedSubmissions] = useState([]);
  const [viewedBadges, setViewedBadges] = useState([]);

  const normalizeUsername = (value) => {
    const trimmed = (value || "").trim();
    if (!trimmed) return "";
    const match = trimmed.match(/leetcode\.com\/(?:u\/)??([^/?#]+)/i);
    return match ? match[1].replace("@", "") : trimmed.replace("@", "");
  };

  const fetchProfileData = async (selected) => {
    const key = encodeURIComponent(selected);
    const res = await fetch(`/api/leetcode/${key}`);
    const data = await res.json();
    
    if (!res.ok || data.error) {
      throw new Error(data.error || "Could not fetch data. Verify username and network.");
    }
    
    const matchedUser = data.matchedUser || {};
    const profile = matchedUser.profile || {};
    const submitStats = matchedUser.submitStats?.acSubmissionNum || [];
    const contest = data.userContestRanking || {};
    const submissions = data.recentAcSubmissionList || [];
    const badges = matchedUser.badges || [];

    // --- Calculate problems solved today (5:00 AM IST reset) ---
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
x
    // Convert current time to IST
    const istTime = new Date(now.getTime() + istOffset);

    // Get today's date in IST and set time to 5:00 AM
    const todayIST = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate(), 5, 0, 0, 0);

    // Convert back to UTC for timestamp comparison
    const startOfToday = new Date(todayIST.getTime() - istOffset);

    const todaySubmissions = submissions.filter((sub) => {
      const subTimeMs = sub.timestamp < 1e12 ? sub.timestamp * 1000 : sub.timestamp;
      return subTimeMs >= startOfToday.getTime();
    });

    const uniqueProblemsToday = new Set(todaySubmissions.map((sub) => sub.title)).size;
    // ---------------------------------------

    return {
      profile: {
        name: profile.realName || matchedUser.username || selected,
        username: matchedUser.username || selected,
        ranking: profile.ranking || "--",
        avatar: profile.userAvatar || ""
      },
      stats: {
        total: submitStats.find((s) => s.difficulty === "All")?.count || 0,
        easy: submitStats.find((s) => s.difficulty === "Easy")?.count || 0,
        medium: submitStats.find((s) => s.difficulty === "Medium")?.count || 0,
        hard: submitStats.find((s) => s.difficulty === "Hard")?.count || 0,
        today: uniqueProblemsToday // Added to the returned object
      },
      contest: {
        rating: contest.rating ? Math.round(contest.rating) : "--",
        rank: contest.globalRanking || "--",
        attended: contest.attendedContestsCount || 0
      },
      languages: (matchedUser.languageProblemCount || [])
        .map(lang => ({ name: lang.languageName, count: lang.problemsSolved }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      submissions: submissions
        .slice(0, 10)
        .map((item) => ({
          title: item.title || "Untitled",
          status: item.statusDisplay || "Unknown",
          lang: item.lang || "N/A",
          time: item.timestamp || 0
        })),
      badges: badges
    };
  };

  const loadMyProfile = async (selected) => {
    if (!selected) return;
    setLoading(true);
    setError("");

    try {
      const result = await fetchProfileData(selected);
      setMyProfile(result.profile);
      setMyStats(result.stats);
      setMyContest(result.contest);
      setMyLanguages(result.languages);
      setMySubmissions(result.submissions);
      setMyBadges(result.badges || []);
      localStorage.setItem("leetcode_username", selected);
    } catch (err) {
      setError(err?.message || "Unable to load my LeetCode profile.");
    } finally {
      setLoading(false);
    }
  };

  const loadViewedProfile = async (selected) => {
    if (!selected) return;
    setLoading(true);
    setError("");

    try {
      const result = await fetchProfileData(selected);
      setViewedProfile(result.profile);
      setViewedStats(result.stats);
      setViewedContest(result.contest);
      setViewedLanguages(result.languages);
      setViewedSubmissions(result.submissions);
      setViewedBadges(result.badges || []);
    } catch (err) {
      setError(err?.message || "Unable to load the requested profile.");
      setViewedProfile(null);
      setViewedStats({ total: 0, easy: 0, medium: 0, hard: 0, today: 0 }); // Added today: 0
      setViewedContest({ rating: "--", rank: "--", attended: 0 });
      setViewedLanguages([]);
      setViewedSubmissions([]);
      setViewedBadges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("leetcode_username") || DEFAULT_USERNAME;
    loadMyProfile(stored);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const username = normalizeUsername(input);
    if (!username) return;
    loadViewedProfile(username);
  };

  const renderProfileCard = (profileData, statsData, contestData, submissionsData, badgesData, languagesData) => (
    <div style={{ border: "1px solid #3e3e3e", borderRadius: 16, background: "#282828", padding: 24, marginTop: 18, color: "#eff1f6", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
        <img
          src={profileData.avatar || "https://via.placeholder.com/80?text=LC"}
          alt="avatar"
          style={{ width: 84, height: 84, borderRadius: "12px", border: "2px solid #3e3e3e", objectFit: "cover" }}
        />
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "600", color: "#eff1f6" }}>{profileData.name}</h2>
          <p style={{ margin: "4px 0 0", color: "#8a8a8a", fontSize: "14px" }}>@{profileData.username}</p>
          <p style={{ margin: "6px 0 0", fontSize: "14px" }}>Ranking: <span style={{ fontWeight: "600", color: "#eff1f6" }}>{formatValue(profileData.ranking)}</span></p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16, marginTop: 16 }}>
        {/* NEW: Solved Today Box */}
        <div style={{ background: "#3e3e3e", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#8a8a8a", marginBottom: 8, fontWeight: "500" }}>Solved Today</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#a855f7" }}>{formatValue(statsData.today)}</div>
        </div>
        <div style={{ background: "#3e3e3e", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#8a8a8a", marginBottom: 8, fontWeight: "500" }}>Total Solved</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#eff1f6" }}>{formatValue(statsData.total)}</div>
        </div>
        <div style={{ background: "#3e3e3e", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#8a8a8a", marginBottom: 8, fontWeight: "500" }}>Easy</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#00b8a3" }}>{formatValue(statsData.easy)}</div>
        </div>
        <div style={{ background: "#3e3e3e", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#8a8a8a", marginBottom: 8, fontWeight: "500" }}>Medium</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#ffc01e" }}>{formatValue(statsData.medium)}</div>
        </div>
        <div style={{ background: "#3e3e3e", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#8a8a8a", marginBottom: 8, fontWeight: "500" }}>Hard</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#ff375f" }}>{formatValue(statsData.hard)}</div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 150px", background: "#3e3e3e", padding: "16px", borderRadius: "12px" }}>
          <div style={{ fontSize: 13, color: "#8a8a8a", marginBottom: 8, fontWeight: "500" }}>Contest Rating</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#eff1f6" }}>{formatValue(contestData.rating)}</div>
        </div>
        <div style={{ flex: "1 1 150px", background: "#3e3e3e", padding: "16px", borderRadius: "12px" }}>
          <div style={{ fontSize: 13, color: "#8a8a8a", marginBottom: 8, fontWeight: "500" }}>Global Rank</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#eff1f6" }}>{formatValue(contestData.rank)}</div>
        </div>
        <div style={{ flex: "1 1 150px", background: "#3e3e3e", padding: "16px", borderRadius: "12px" }}>
          <div style={{ fontSize: 13, color: "#8a8a8a", marginBottom: 8, fontWeight: "500" }}>Contests</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#eff1f6" }}>{formatValue(contestData.attended)}</div>
        </div>
      </div>

      {languagesData && languagesData.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 12, fontSize: "18px", color: "#eff1f6", fontWeight: "600" }}>Top Languages <span style={{ color: "#8a8a8a", fontSize: "15px", fontWeight: "500" }}>({languagesData.length})</span></h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {languagesData.map((lang, idx) => (
              <div key={idx} style={{ background: "#3e3e3e", padding: "8px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#eff1f6" }}>{lang.name}</div>
                <div style={{ fontSize: "12px", color: "#8a8a8a", background: "#282828", padding: "2px 8px", borderRadius: "12px" }}>{formatValue(lang.count)} solved</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {badgesData && badgesData.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 12, fontSize: "18px", color: "#eff1f6", fontWeight: "600" }}>Badges <span style={{ color: "#8a8a8a", fontSize: "15px", fontWeight: "500" }}>({badgesData.length})</span></h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {badgesData.map((badge, idx) => (
              <div key={idx} style={{ background: "#3e3e3e", padding: "8px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px" }} title={badge.hoverText}>
                <img src={badge.icon.startsWith('/') ? `https://leetcode.com${badge.icon}` : badge.icon} alt={badge.name} style={{ width: 36, height: 36, objectFit: "contain" }} />
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#eff1f6" }}>{badge.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 12, fontSize: "18px", color: "#eff1f6", fontWeight: "600" }}>Recent Submissions</h3>
        {submissionsData.length === 0 ? (
          <p style={{ color: "#8a8a8a", fontSize: "14px" }}>No recent submissions available.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
            {submissionsData.map((item, idx) => {
              const accepted = item.status && item.status.toLowerCase().includes("accepted");
              const statusColor = accepted ? "#00b8a3" : "#ff375f";
              return (
                <li
                  key={idx}
                  style={{
                    background: "#3e3e3e",
                    borderRadius: 8,
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <strong style={{ color: "#eff1f6", fontSize: "15px" }}>{item.title}</strong>
                  <div style={{ display: "flex", gap: "12px", fontSize: "13px", alignItems: "center" }}>
                    <span style={{ color: statusColor, fontWeight: "600" }}>{item.status}</span>
                    <span style={{ color: "#8a8a8a" }}>•</span>
                    <span style={{ color: "#8a8a8a", background: "#282828", padding: "2px 8px", borderRadius: "12px", fontSize: "12px" }}>{item.lang}</span>
                    <span style={{ color: "#8a8a8a" }}>•</span>
                    <span style={{ color: "#8a8a8a" }}>{formatDate(item.time)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "20px", color: "#eff1f6", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px", color: "#eff1f6" }}>My LeetCode Profile Overview</h1>
        <p style={{ color: "#8a8a8a", margin: 0 }}>This is my LeetCode statistics and recent activity.</p>
      </div>

      {error && (
        <div style={{ color: "#ff375f", background: "rgba(255, 55, 95, 0.1)", padding: 12, borderRadius: 8, marginBottom: 16, border: "1px solid rgba(255, 55, 95, 0.2)" }}>
          {error}
        </div>
      )}

      {renderProfileCard(myProfile, myStats, myContest, mySubmissions, myBadges, myLanguages)}

      <div style={{ marginTop: 24, padding: 24, borderRadius: 16, background: "#282828", border: "1px solid #3e3e3e", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}>
        <h2 style={{ margin: 0, marginBottom: 16, fontSize: "20px", fontWeight: "600", color: "#eff1f6" }}>View Your LeetCode Profile Overview</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter username or LeetCode profile URL"
            style={{ flex: "1 1 320px", minWidth: 0, padding: "12px 16px", borderRadius: 8, border: "1px solid #4a4a4a", background: "#3e3e3e", color: "#eff1f6", outline: "none", fontSize: "15px", transition: "border-color 0.2s" }}
            onFocus={(e) => e.target.style.borderColor = '#ffa116'}
            onBlur={(e) => e.target.style.borderColor = '#4a4a4a'}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: "#ffa116", color: "#1a1a1a", fontWeight: "600", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", transition: "opacity 0.2s" }}
            onMouseOver={(e) => !loading && (e.target.style.opacity = '0.9')}
            onMouseOut={(e) => !loading && (e.target.style.opacity = '1')}
          >
            {loading ? "Loading..." : "Load Profile"}
          </button>
        </form>
        <p style={{ margin: "14px 0 0", color: "#8a8a8a", fontSize: "14px" }}>
          Example: <code style={{ background: "#3e3e3e", padding: "2px 6px", borderRadius: "4px", color: "#eff1f6" }}>username</code> or <code style={{ background: "#3e3e3e", padding: "2px 6px", borderRadius: "4px", color: "#eff1f6" }}>https://leetcode.com/u/username</code>
        </p>
      </div>

      {viewedProfile && (
        <>
          <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: "20px", color: "#eff1f6" }}>Viewed Profile</h2>
            <span style={{ color: "#8a8a8a" }}>@{viewedProfile.username}</span>
          </div>
          {renderProfileCard(viewedProfile, viewedStats, viewedContest, viewedSubmissions, viewedBadges, viewedLanguages)}
        </>
      )}
    </section>
  );
}
