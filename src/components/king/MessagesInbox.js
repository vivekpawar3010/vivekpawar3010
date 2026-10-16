"use client";

import { useState, useEffect } from "react";

export default function MessagesInbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    try {
      const res = await fetch("/api/king/messages");
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (err) {
      console.error("Error loading messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleMarkRead = async (id) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
    try {
      await fetch("/api/king/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", id }),
      });
    } catch (err) {
      console.error("Error marking read", err);
    }
  };

  const handleDelete = async (id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch("/api/king/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
    } catch (err) {
      console.error("Error deleting message", err);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.6rem", margin: "0 0 6px" }}>
            📬 Contact Inquiries <span className="gradient-text">Inbox</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Messages and internship inquiries submitted through your public contact form.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontSize: 13, background: "rgba(56,189,248,0.15)", color: "#38bdf8", padding: "6px 14px", borderRadius: 20, fontWeight: 600 }}>
            {unreadCount} Unread
          </span>
          <span style={{ fontSize: 13, background: "rgba(255,255,255,0.05)", color: "#94a3b8", padding: "6px 14px", borderRadius: 20, fontWeight: 600 }}>
            {messages.length} Total
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
          <span style={{ fontSize: 32, display: "block", marginBottom: 10 }}>📭</span>
          No messages received yet. Inquiries submitted on /contact will appear here!
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="glass-card"
              style={{
                padding: "1.4rem",
                borderLeft: msg.read ? "4px solid #64748b" : "4px solid #38bdf8",
                background: msg.read ? "var(--bg-card)" : "rgba(56,189,248,0.06)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h3 style={{ fontSize: "1.05rem", margin: 0, fontWeight: 700 }}>{msg.name}</h3>
                    {!msg.read && (
                      <span style={{ fontSize: 10, background: "rgba(56,189,248,0.2)", color: "#38bdf8", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <a href={`mailto:${msg.email}`} style={{ fontSize: "0.85rem", color: "var(--accent-cyan)" }}>
                    {msg.email}
                  </a>
                </div>

                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
                </div>
              </div>

              <p style={{ color: "#e2e8f0", fontSize: "0.92rem", lineHeight: 1.6, margin: "8px 0 14px" }}>
                {msg.message}
              </p>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <a
                  href={`mailto:${msg.email}?subject=Reply to your portfolio inquiry`}
                  className="btn-primary"
                  style={{ fontSize: 12, padding: "5px 12px" }}
                >
                  ✉️ Reply
                </a>
                {!msg.read && (
                  <button
                    onClick={() => handleMarkRead(msg.id)}
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: "5px 12px" }}
                  >
                    ✓ Mark as Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(msg.id)}
                  style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13, padding: "4px 8px" }}
                  title="Delete message"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
