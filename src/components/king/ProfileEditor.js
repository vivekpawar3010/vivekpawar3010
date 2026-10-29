"use client";

import { useState, useEffect } from "react";

export default function ProfileEditor() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetch("/api/king/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      })
      .catch((err) => console.error("Error loading profile", err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback("");

    try {
      const res = await fetch("/api/king/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback("Profile updated successfully in database!");
        setTimeout(() => setFeedback(""), 3500);
      } else {
        setFeedback("Failed to update profile: " + (data.error || ""));
      }
    } catch (err) {
      setFeedback("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: "var(--text-secondary)", padding: "2rem" }}>Loading profile editor...</div>;
  }

  if (!profile) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.6rem", margin: "0 0 6px" }}>
            👤 Profile & <span className="gradient-text">Hero Content Editor</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Edit your live portfolio information, status badge, bio, and social handles in real-time.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
          style={{ fontSize: "0.9rem", padding: "9px 20px" }}
        >
          {saving ? "Saving..." : "Save Profile 💾"}
        </button>
      </div>

      {feedback && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "10px 16px",
            borderRadius: 8,
            fontSize: "0.9rem",
            fontWeight: 600,
            background: feedback.includes("successfully") ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
            border: `1px solid ${feedback.includes("successfully") ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
            color: feedback.includes("successfully") ? "#34d399" : "#fb7185",
          }}
        >
          {feedback}
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card" style={{ padding: "2rem", display: "grid", gap: "1.4rem" }}>
        {/* Avatar / Photo Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            padding: "1.2rem",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
            flexWrap: "wrap",
          }}
        >
          {/* Circular Photo Preview */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid var(--accent-cyan)",
                boxShadow: "0 0 20px rgba(56, 189, 248, 0.35)",
                background: "rgba(15, 23, 42, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.name || "Avatar"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src = "/images/avatar.png";
                  }}
                />
              ) : (
                <span style={{ fontSize: 32 }}>🍃</span>
              )}
            </div>
          </div>

          {/* Avatar Inputs & Presets */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              Profile Photo / Rock Lee Avatar URL
            </label>
            <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
              <input
                type="text"
                name="avatarUrl"
                value={profile.avatarUrl || ""}
                onChange={handleChange}
                placeholder="/images/avatar.png or image URL"
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  fontSize: "0.88rem",
                  fontFamily: "var(--font-mono)",
                }}
              />
            </div>

            {/* Quick Presets */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() =>
                  setProfile((prev) => ({ ...prev, avatarUrl: "/images/vivek-profile-photo.png" }))
                }
                style={{
                  fontSize: "0.8rem",
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid rgba(132, 204, 22, 0.35)",
                  background: "rgba(132, 204, 22, 0.12)",
                  color: "#84cc16",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                👤 Vivek Real Photo (Local)
              </button>
              <button
                type="button"
                onClick={() =>
                  setProfile((prev) => ({ ...prev, avatarUrl: "/images/avatar.png" }))
                }
                style={{
                  fontSize: "0.8rem",
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  background: "rgba(56, 189, 248, 0.12)",
                  color: "var(--accent-cyan)",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                🍃 Rock Lee Avatar (Local)
              </button>
              <button
                type="button"
                onClick={() =>
                  setProfile((prev) => ({
                    ...prev,
                    avatarUrl:
                      "https://assets.leetcode.com/users/vivek_pawar-3010/avatar_1739633328.png",
                  }))
                }
                style={{
                  fontSize: "0.8rem",
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  background: "rgba(245, 158, 11, 0.12)",
                  color: "#fbbf24",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ⚡ LeetCode Rock Lee URL
              </button>
            </div>
          </div>
        </div>

        {/* Name and Role */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={profile.name || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Role / Subtitle
            </label>
            <input
              type="text"
              name="role"
              value={profile.role || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "#f8fafc",
                fontSize: "0.95rem",
              }}
            />
          </div>
        </div>

        {/* Availability Badge & Location */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Live Availability Status Badge
            </label>
            <input
              type="text"
              name="status"
              value={profile.status || ""}
              onChange={handleChange}
              placeholder="e.g. Open to Internships & Opportunities 🚀"
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "#34d399",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Location
            </label>
            <input
              type="text"
              name="location"
              value={profile.location || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "#f8fafc",
                fontSize: "0.95rem",
              }}
            />
          </div>
        </div>

        {/* Tagline */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Tagline
          </label>
          <input
            type="text"
            name="tagline"
            value={profile.tagline || ""}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              color: "#f8fafc",
              fontSize: "0.95rem",
            }}
          />
        </div>

        {/* Bio / About */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            About / Bio Description
          </label>
          <textarea
            name="about"
            rows={4}
            value={profile.about || ""}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              color: "#f8fafc",
              fontSize: "0.95rem",
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
        </div>

        {/* Social Links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={profile.email || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "#f8fafc",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              GitHub URL
            </label>
            <input
              type="url"
              name="github"
              value={profile.github || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "#f8fafc",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              LinkedIn URL
            </label>
            <input
              type="url"
              name="linkedin"
              value={profile.linkedin || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "#f8fafc",
                fontSize: "0.95rem",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ padding: "10px 24px" }}>
            {saving ? "Saving Changes..." : "Save Profile 💾"}
          </button>
        </div>
      </form>
    </div>
  );
}
