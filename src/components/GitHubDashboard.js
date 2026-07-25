"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const DEFAULT_USERNAME = "vivekpawar3010";
const CACHE_TTL_MS = 5 * 60 * 1000;

// ─── Client-side cache ───────────────────────────────────────────────────────
const CLIENT_CACHE = new Map();

function getClientCached(username) {
  const entry = CLIENT_CACHE.get(username.toLowerCase());
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) { CLIENT_CACHE.delete(username.toLowerCase()); return null; }
  return entry;
}
function setClientCache(username, data) {
  CLIENT_CACHE.set(username.toLowerCase(), { data, fetchedAt: Date.now() });
}
// ────────────────────────────────────────────────────────────────────────────

// ─── Language color map ──────────────────────────────────────────────────────
const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
  Java: "#b07219", "C++": "#f34b7d", C: "#555555", Go: "#00ADD8",
  Rust: "#dea584", Ruby: "#701516", Swift: "#F05138",
  Kotlin: "#A97BFF", Dart: "#00B4AB", PHP: "#4F5D95",
  CSS: "#563d7c", HTML: "#e34c26", Shell: "#89e051",
  "C#": "#178600", Scala: "#c22d40",
};

function getLangColor(name) {
  return LANG_COLORS[name] || "#8b949e";
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmtNum = (n) => {
  const num = Number(n);
  return Number.isFinite(num) ? num.toLocaleString() : "--";
};

const fmtDate = (iso) => {
  if (!iso) return "--";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const timeSince = (ms) => {
  if (!ms) return null;
  const diff = Math.floor((Date.now() - ms) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const CacheBadge = ({ fromCache, fetchedAt }) => {
  const label = fromCache ? "⚡ Cached" : "🔄 Live";
  const color = fromCache ? "#a78bfa" : "#34d399";
  const ago = timeSince(fetchedAt);
  return (
    <span style={{ fontSize: 11, color, background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 20, padding: "2px 10px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
      {label}{ago && <span style={{ color: "#6b7280", fontWeight: 400 }}>· {ago}</span>}
    </span>
  );
};

const StatCard = ({ label, value, color = "#e2e8f0", icon }) => (
  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 16px", textAlign: "center", transition: "transform 0.18s, border-color 0.18s" }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
  >
    {icon && <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>}
    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
  </div>
);

const LangBar = ({ languages }) => {
  const total = languages.reduce((s, l) => s + l.count, 0);
  if (!total) return null;
  return (
    <div>
      <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 10, marginBottom: 12 }}>
        {languages.map((l, i) => (
          <div key={i} style={{ width: `${(l.count / total) * 100}%`, background: getLangColor(l.name), transition: "width 0.4s" }} title={`${l.name} (${l.count} repos)`} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px" }}>
        {languages.map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: getLangColor(l.name), display: "inline-block" }} />
            <span style={{ color: "#e2e8f0" }}>{l.name}</span>
            <span style={{ color: "#6b7280" }}>{((l.count / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ContribHeatmap = ({ weeks }) => {
  if (!weeks || weeks.length === 0) return null;
  const last16 = weeks.slice(-16);
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 3, minWidth: "fit-content" }}>
        {last16.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {week.contributionDays.map((day, di) => (
              <div
                key={di}
                title={`${day.date}: ${day.contributionCount} contributions`}
                style={{
                  width: 12, height: 12, borderRadius: 3,
                  background: day.contributionCount === 0 ? "rgba(255,255,255,0.06)" : day.color || "#39d353",
                  opacity: day.contributionCount === 0 ? 1 : 0.85 + (day.contributionCount > 3 ? 0.15 : day.contributionCount * 0.05),
                  cursor: "default",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const RepoCard = ({ repo }) => {
  // Guard: GraphQL can return null nodes inside pinnedItems / topRepositories
  if (!repo || !repo.url) return null;
  return (
  <a
    href={repo.url}
    target="_blank"
    rel="noopener noreferrer"
    style={{ display: "block", textDecoration: "none", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px", transition: "transform 0.18s, border-color 0.18s, background 0.18s" }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(99,179,237,0.4)"; e.currentTarget.style.background = "rgba(99,179,237,0.06)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
      <span style={{ fontWeight: 600, color: "#60a5fa", fontSize: 15, wordBreak: "break-word" }}>{repo.name}</span>
      <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#9ca3af", flexShrink: 0, marginLeft: 8 }}>
        <span title="Stars">⭐ {fmtNum(repo.stargazerCount)}</span>
        <span title="Forks">🍴 {fmtNum(repo.forkCount)}</span>
      </div>
    </div>
    {repo.description && (
      <p style={{ margin: "0 0 10px", color: "#9ca3af", fontSize: 13, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {repo.description}
      </p>
    )}
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}>
      {repo.primaryLanguage && (
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: getLangColor(repo.primaryLanguage.name), display: "inline-block" }} />
          <span style={{ color: "#d1d5db" }}>{repo.primaryLanguage.name}</span>
        </span>
      )}
      <span style={{ color: "#6b7280" }}>Updated {fmtDate(repo.updatedAt)}</span>
    </div>
  </a>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function GitHubDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [data, setData]       = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const autoRefreshRef = useRef(null);

  // ── Fetch & parse ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async ({ forceRefresh = false } = {}) => {
    const username = DEFAULT_USERNAME;
    if (!forceRefresh) {
      const cached = getClientCached(username);
      if (cached) {
        setData(cached.data);
        setFromCache(true);
        setFetchedAt(cached.fetchedAt);
        return;
      }
    }

    const res = await fetch(`/api/github/${encodeURIComponent(username)}`);
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || "Failed to fetch GitHub data.");

    setClientCache(username, json);
    setData(json);
    setFromCache(false);
    setFetchedAt(json.fetchedAt || Date.now());
  }, []);

  const load = useCallback(async ({ silent = false, forceRefresh = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      await fetchData({ forceRefresh });
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    load();
    autoRefreshRef.current = setInterval(() => load({ silent: true, forceRefresh: true }), CACHE_TTL_MS);
    return () => clearInterval(autoRefreshRef.current);
  }, [load]);

  // ── Derived data ───────────────────────────────────────────────────────────
  const user = data?.user || null;
  const languages = data?.languages || [];
  const contrib = user?.contributionsCollection || {};
  const todayContrib = user?.todayContributions || {};
  const todayCommits = todayContrib.totalCommitContributions || 0;
  const todayRepos = (todayContrib.commitContributionsByRepository || [])
    .filter(r => r.contributions.totalCount > 0)
    .sort((a, b) => b.contributions.totalCount - a.contributions.totalCount);
  const calendar = contrib.contributionCalendar || {};
  const pinnedRepos = (user?.pinnedItems?.nodes || []).filter(Boolean);
  const topRepos    = (user?.topRepositories?.nodes || []).filter(Boolean);
  const displayRepos = pinnedRepos.length > 0 ? pinnedRepos : topRepos.slice(0, 6);

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const tabs = [
    { id: "overview",      label: "Overview" },
    { id: "contributions", label: "Contributions" },
    { id: "repositories",  label: "Repositories" },
    { id: "languages",     label: "Languages" },
  ];

  const cardStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  };

  const sectionTitle = (title, sub) => (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>{title}</h2>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{sub}</p>}
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 40px", color: "#e2e8f0", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            GitHub Dashboard
          </h1>
          {fetchedAt && <CacheBadge fromCache={fromCache} fetchedAt={fetchedAt} />}
        </div>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
          Live stats for{" "}
          <a href={`https://github.com/${DEFAULT_USERNAME}`} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>
            @{DEFAULT_USERNAME}
          </a>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ color: "#f87171", fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                {error.includes("timed out") ? "Connection Timed Out" :
                 error.includes("PAT is not configured") ? "GitHub Token Not Found" :
                 error.includes("invalid or expired") ? "GitHub Token Invalid" :
                 error.includes("lacks required scopes") ? "GitHub Token Missing Scopes" :
                 "GitHub API Error"}
              </div>
              <div style={{ color: "#fca5a5", fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{error}</div>
              {error.includes("PAT is not configured") && (
                <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "12px 14px", fontSize: 12, color: "#d1d5db", fontFamily: "monospace" }}>
                  <div style={{ color: "#86efac", marginBottom: 4 }}># Add to your .env.local file:</div>
                  <div>GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxx</div>
                  <div style={{ marginTop: 8, color: "#93c5fd", fontFamily: "sans-serif", fontSize: 11 }}>
                    Generate at: GitHub → Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens
                  </div>
                </div>
              )}
              {(error.includes("invalid or expired") || error.includes("lacks required scopes")) && (
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-block", marginTop: 8, color: "#60a5fa", fontSize: 13, textDecoration: "none", fontWeight: 600 }}
                >
                  → Open GitHub Token Settings ↗
                </a>
              )}
              {error.includes("timed out") && (
                <button
                  onClick={() => load({ forceRefresh: true })}
                  style={{ marginTop: 8, padding: "6px 16px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.15)", color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && !data && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#60a5fa", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#6b7280", margin: 0 }}>Fetching GitHub profile…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {user && (
        <>
          {/* Profile hero */}
          <div style={{ ...cardStyle, background: "linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(167,139,250,0.08) 100%)", border: "1px solid rgba(96,165,250,0.2)" }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
              <img
                src={user.avatarUrl}
                alt={user.login}
                style={{ width: 88, height: 88, borderRadius: 16, border: "2px solid rgba(96,165,250,0.4)", objectFit: "cover", flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>{user.name || user.login}</h2>
                  <span style={{ fontSize: 14, color: "#6b7280" }}>@{user.login}</span>
                </div>
                {user.bio && <p style={{ margin: "0 0 10px", color: "#94a3b8", fontSize: 14, lineHeight: 1.6 }}>{user.bio}</p>}
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#6b7280" }}>
                  {user.location && <span>📍 {user.location}</span>}
                  {user.company  && <span>🏢 {user.company}</span>}
                  {user.websiteUrl && <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "none" }}>🔗 {user.websiteUrl}</a>}
                  <a href={user.url} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>View on GitHub ↗</a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 24 }}>
            <StatCard label="Today's Commits" value={fmtNum(todayCommits)} color="#a78bfa" icon="✨" />
            <StatCard label="Total Contributions" value={fmtNum(calendar.totalContributions)} color="#60a5fa" icon="📊" />
            <StatCard label="Followers" value={fmtNum(user.followers?.totalCount)} color="#34d399" icon="👥" />
            <StatCard label="Following" value={fmtNum(user.following?.totalCount)} color="#fbbf24" icon="➕" />
            <StatCard label="Public Repos" value={fmtNum(user.repositories?.totalCount)} color="#f472b6" icon="📦" />
            <StatCard label="PRs Contributed" value={fmtNum(contrib.totalPullRequestContributions)} color="#fb923c" icon="🔀" />
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 0, overflowX: "auto" }}>
            {tabs.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "10px 20px", border: "none", background: "none", cursor: "pointer",
                    color: active ? "#60a5fa" : "#6b7280",
                    fontWeight: active ? 700 : 500, fontSize: 14,
                    borderBottom: active ? "2px solid #60a5fa" : "2px solid transparent",
                    transition: "color 0.2s, border-color 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { if (!active) e.target.style.color = "#94a3b8"; }}
                  onMouseLeave={e => { if (!active) e.target.style.color = "#6b7280"; }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Tab: Overview ─────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <>
              {/* Today's commits breakdown */}
              {todayRepos.length > 0 && (
                <div style={cardStyle}>
                  {sectionTitle("Today's Activity", `${todayCommits} commit${todayCommits !== 1 ? "s" : ""} across ${todayRepos.length} repo${todayRepos.length !== 1 ? "s" : ""} today`)}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {todayRepos.map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.repository.primaryLanguage ? getLangColor(r.repository.primaryLanguage.name) : "#6b7280", flexShrink: 0 }} />
                        <a href={r.repository.url} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 600, fontSize: 14, flex: 1 }}>
                          {r.repository.name}
                        </a>
                        <span style={{ fontSize: 12, color: "#6b7280" }}>{r.repository.primaryLanguage?.name}</span>
                        <span style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                          {r.contributions.totalCount} commit{r.contributions.totalCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {todayCommits === 0 && (
                <div style={{ ...cardStyle, textAlign: "center", padding: 32 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>😴</div>
                  <p style={{ color: "#6b7280", margin: 0 }}>No commits yet today. Go ship something! 🚀</p>
                </div>
              )}

              {/* Pinned / Top repos */}
              {displayRepos.length > 0 && (
                <div style={cardStyle}>
                  {sectionTitle(pinnedRepos.length > 0 ? "Pinned Repositories" : "Top Repositories")}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                    {displayRepos.filter(Boolean).map((repo, i) => <RepoCard key={i} repo={repo} />)}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Tab: Contributions ────────────────────────────────────────── */}
          {activeTab === "contributions" && (
            <>
              <div style={cardStyle}>
                {sectionTitle("Contribution Calendar", "Last 16 weeks of activity")}
                <ContribHeatmap weeks={calendar.weeks} />
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" }}>
                  <span>Less</span>
                  {["rgba(255,255,255,0.06)", "#0e4429", "#006d32", "#26a641", "#39d353"].map((c, i) => (
                    <span key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c, display: "inline-block" }} />
                  ))}
                  <span>More</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <StatCard label="Total Commits (Year)" value={fmtNum(contrib.totalCommitContributions)} color="#60a5fa" icon="💻" />
                <StatCard label="PRs Opened" value={fmtNum(contrib.totalPullRequestContributions)} color="#a78bfa" icon="🔀" />
                <StatCard label="Issues Opened" value={fmtNum(contrib.totalIssueContributions)} color="#34d399" icon="🐛" />
                <StatCard label="Repos Contributed" value={fmtNum(contrib.totalRepositoriesWithContributedCommits)} color="#fbbf24" icon="📁" />
              </div>
            </>
          )}

          {/* ── Tab: Repositories ─────────────────────────────────────────── */}
          {activeTab === "repositories" && (
            <div style={cardStyle}>
              {sectionTitle("Top Repositories", "By star count")}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                {topRepos.filter(Boolean).slice(0, 12).map((repo, i) => <RepoCard key={i} repo={repo} />)}
              </div>
            </div>
          )}

          {/* ── Tab: Languages ────────────────────────────────────────────── */}
          {activeTab === "languages" && (
            <div style={cardStyle}>
              {sectionTitle("Languages", "Breakdown across all public repositories")}
              <LangBar languages={languages} />
              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {languages.map((l, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: getLangColor(l.name), display: "inline-block", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{l.name}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{l.count} repo{l.count !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
