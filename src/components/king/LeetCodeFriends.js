"use client";

import { useEffect, useState, useCallback } from "react";

export default function LeetCodeFriends() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionNote, setSessionNote] = useState("");
  const [sessionCookie, setSessionCookie] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async (cookie = sessionCookie) => {
    try {
      const url = cookie
        ? `/api/king/leetcode-friends?session=${encodeURIComponent(cookie)}`
        : `/api/king/leetcode-friends`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
        setSessionNote(data.sessionNote);
      }
    } catch (err) {
      setError("Failed to fetch friends statistics from LeetCode");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sessionCookie]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    setAddLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/king/leetcode-friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          username: newUsername.trim(),
          name: newName.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Friend added successfully!");
        setNewUsername("");
        setNewName("");
        loadData();
      } else {
        setError(data.error || "Failed to add friend");
      }
    } catch (err) {
      setError("Error adding friend. Please check network connection.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteFriend = async (username) => {
    if (!confirm(`Remove ${username} from your tracked friends?`)) return;

    try {
      const res = await fetch("/api/king/leetcode-friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", username }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Removed ${username}`);
        loadData();
      } else {
        setError(data.error || "Failed to remove friend");
      }
    } catch (err) {
      setError("Error removing friend");
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return "🥇 1st";
    if (rank === 2) return "🥈 2nd";
    if (rank === 3) return "🥉 3rd";
    return `#${rank}`;
  };

  return (
    <div>
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.6rem", margin: "0 0 6px" }}>
            🏆 LeetCode <span className="gradient-text">Friends & Rivalry Tracker</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Live public GraphQL statistics for your peer circle, comparing total solved questions and rankings.
          </p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            loadData();
          }}
          disabled={refreshing}
          className="btn-secondary"
          style={{ fontSize: "0.85rem", padding: "8px 14px" }}
        >
          {refreshing ? "🔄 Refreshing..." : "🔄 Refresh All"}
        </button>
      </div>

      {/* Info Notice Banner */}
      <div
        style={{
          background: "rgba(56, 189, 248, 0.08)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 20 }}>ℹ️</span>
        <div style={{ fontSize: "0.88rem", color: "#e0f2fe", lineHeight: 1.5 }}>
          <strong>LeetCode Architecture Note:</strong> {sessionNote} You can add any friend&apos;s username below to track them.
        </div>
      </div>

      {/* Add Friend Card */}
      <div className="glass-card" style={{ padding: "1.4rem", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.1rem", margin: "0 0 12px" }}>➕ Add Friend / Rival to Track</h3>
        <form
          onSubmit={handleAddFriend}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr)) auto",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
              LeetCode Username *
            </label>
            <input
              type="text"
              placeholder="e.g. tourist, neal_wu"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "#f8fafc",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
              Display Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. College Friend, Rival"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "#f8fafc",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={addLoading}
            className="btn-primary"
            style={{ padding: "9px 18px", fontSize: "0.9rem", height: 38 }}
          >
            {addLoading ? "Verifying on LeetCode..." : "Verify & Add"}
          </button>
        </form>

        {message && (
          <div style={{ marginTop: 10, color: "#34d399", fontSize: "0.85rem" }}>
            ✓ {message}
          </div>
        )}
        {error && (
          <div style={{ marginTop: 10, color: "#fb7185", fontSize: "0.85rem" }}>
            ✕ {error}
          </div>
        )}
      </div>

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          Loading LeetCode GraphQL statistics for all friends...
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {leaderboard.map((friend) => (
            <div
              key={friend.username}
              className="glass-card"
              style={{
                padding: "1.2rem 1.4rem",
                display: "grid",
                gridTemplateColumns: "70px 1fr auto",
                alignItems: "center",
                gap: "1.2rem",
                border: friend.isUser
                  ? "1px solid rgba(56, 189, 248, 0.4)"
                  : "1px solid var(--border-subtle)",
                background: friend.isUser
                  ? "rgba(56, 189, 248, 0.06)"
                  : "var(--bg-card)",
              }}
            >
              {/* Rank */}
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color:
                    friend.leaderboardRank === 1
                      ? "#fbbf24"
                      : friend.leaderboardRank === 2
                      ? "#94a3b8"
                      : friend.leaderboardRank === 3
                      ? "#f97316"
                      : "var(--text-muted)",
                }}
              >
                {getRankBadge(friend.leaderboardRank)}
              </div>

              {/* User Info & Stats */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  {friend.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={friend.avatar}
                      alt={friend.username}
                      style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#334155",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: "1rem" }}>{friend.name}</span>
                      {friend.isUser && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#38bdf8",
                            background: "rgba(56, 189, 248, 0.15)",
                            border: "1px solid rgba(56, 189, 248, 0.3)",
                            borderRadius: 6,
                            padding: "1px 6px",
                          }}
                        >
                          👑 YOU
                        </span>
                      )}
                    </div>
                    <a
                      href={`https://leetcode.com/u/${friend.username}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: "0.82rem", color: "var(--accent-cyan)" }}
                    >
                      @{friend.username} ↗
                    </a>
                  </div>
                </div>

                {/* Question Breakdown Bars */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                    Total Solved: {friend.totalSolved}
                  </span>
                  <span style={{ fontSize: 12, color: "#34d399" }}>Easy: {friend.easySolved}</span>
                  <span style={{ fontSize: 12, color: "#fbbf24" }}>Med: {friend.mediumSolved}</span>
                  <span style={{ fontSize: 12, color: "#f43f5e" }}>Hard: {friend.hardSolved}</span>
                  {friend.ranking !== "--" && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Global Rank: #{friend.ranking.toLocaleString ? friend.ranking.toLocaleString() : friend.ranking}
                    </span>
                  )}
                </div>
              </div>

              {/* Action */}
              <div>
                {!friend.isUser && (
                  <button
                    onClick={() => handleDeleteFriend(friend.username)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      fontSize: 14,
                      padding: "4px 8px",
                      borderRadius: 6,
                    }}
                    title="Remove from tracking"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
