"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import defaultProfile from "../data/profile";

const initialForm = {
  name: "",
  email: "",
  message: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const [profile, setProfile] = useState(defaultProfile);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/king/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.profile) setProfile(data.profile);
      })
      .catch((err) => console.error("Error loading dynamic profile in Contact", err));
  }, []);

  const validateField = (field, value) => {
    if (!value.trim()) {
      if (field === "name") return "Please enter your name.";
      if (field === "email") return "Please enter your email address.";
      if (field === "message") return "Please write your message.";
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
    }

    if (field === "email" && !emailPattern.test(value)) {
      return "Please enter a valid email address.";
    }

    if (field === "message" && value.trim().length < 10) {
      return "Message must be at least 10 characters.";
    }

    return "";
  };

  const validateAll = () => {
    const nextErrors = {};
    for (const key of ["name", "email", "message"]) {
      const err = validateField(key, form[key]);
      if (err) {
        nextErrors[key] = err;
        break;
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onChange = (evt) => {
    const { name, value } = evt.target;
    if (name === "message" && value.length > 500) return;
    setForm((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      const updated = { ...prev, [name]: validateField(name, value) };
      if (!updated[name]) delete updated[name];
      return updated;
    });
  };

  const onSubmit = async (evt) => {
    evt.preventDefault();
    setStatus("");

    if (!validateAll()) {
      setStatus("Please fix the errors before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Thank you! Your message has been sent successfully. I will get back to you soon.");
        setForm(initialForm);
        setErrors({});
      } else {
        setStatus(data.error || "Unable to send your message. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("A network error occurred while sending your message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 0 4rem" }}>
      {/* 1. Contact Hero (Image 4) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2.5rem",
          alignItems: "center",
          marginBottom: "3.5rem",
        }}
      >
        <div>
          <div className="section-tag">Get In Touch</div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: "1.2rem",
              color: "#F5F7FA",
              letterSpacing: "-0.02em",
            }}
          >
            Let&apos;s build <br />
            something amazing <span className="lime-underline">together.</span>
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              maxWidth: 520,
              marginBottom: "1.8rem",
            }}
          >
            I&apos;m always open to new opportunities, interesting projects, collaborations, or just a friendly chat about technology.
          </p>

          {/* Availability Status Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: "9999px",
                background: "rgba(11, 18, 28, 0.8)",
                border: "1px solid var(--border-subtle)",
                fontSize: "12px",
                color: "#F5F7FA",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--accent-lime)",
                }}
              />
              Open to Opportunities
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: "9999px",
                background: "rgba(11, 18, 28, 0.8)",
                border: "1px solid var(--border-subtle)",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              💼 Freelance / Part-time
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: "9999px",
                background: "rgba(11, 18, 28, 0.8)",
                border: "1px solid var(--border-subtle)",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              👥 Collaborations
            </div>
          </div>
        </div>

        {/* Right: Futuristic Developer Desk Workstation Mockup */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            className="glass-card"
            style={{
              width: "min(400px, 90vw)",
              borderRadius: "16px",
              border: "1px solid rgba(34, 211, 238, 0.25)",
              background: "rgba(11, 18, 28, 0.95)",
              overflow: "hidden",
              boxShadow: "0 20px 45px rgba(0,0,0,0.7), 0 0 25px rgba(34, 211, 238, 0.15)",
            }}
          >
            {/* Monitor Header */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.9)",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#f43f5e" }} />
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fbbf24" }} />
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e" }} />
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                workspace_terminal
              </span>
            </div>

            {/* Code on Screen */}
            <div style={{ padding: "16px 18px", fontFamily: "var(--font-mono)", fontSize: "12px", lineHeight: 1.7 }}>
              <div>
                <span style={{ color: "#a855f7" }}>const</span>{" "}
                <span style={{ color: "var(--accent-lime)" }}>message</span> = &#123;
              </div>
              <div style={{ paddingLeft: 12 }}>
                <span style={{ color: "#38bdf8" }}>from</span>: <span style={{ color: "#fbbf24" }}>&quot;Vivek&quot;</span>,
              </div>
              <div style={{ paddingLeft: 12 }}>
                <span style={{ color: "#38bdf8" }}>to</span>: <span style={{ color: "#fbbf24" }}>&quot;You&quot;</span>,
              </div>
              <div style={{ paddingLeft: 12 }}>
                <span style={{ color: "#38bdf8" }}>purpose</span>: <span style={{ color: "#fbbf24" }}>&quot;Build Something Amazing&quot;</span>,
              </div>
              <div style={{ paddingLeft: 12 }}>
                <span style={{ color: "#38bdf8" }}>status</span>: <span style={{ color: "var(--accent-lime)" }}>&quot;Open for Opportunities&quot;</span>
              </div>
              <div>&#125;;</div>
              <div style={{ color: "var(--text-muted)", marginTop: 6 }}>
                // Let&apos;s create impact together!
              </div>
            </div>

            <div style={{ padding: "10px 18px 14px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6, fontSize: "11px", color: "var(--text-muted)" }}>
                <span>Build</span> • <span>Learn</span> • <span>Improve</span> • <span>Repeat</span>
              </div>
              <span className="handwritten" style={{ fontSize: "1.15rem" }}>
                Good Ideas Start Here!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Two Columns: Contact Form (Left) vs Contact Channels (Right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "2.5rem",
          alignItems: "start",
          marginBottom: "4rem",
        }}
      >
        {/* Left Column: Contact Form (Image 4) */}
        <div className="glass-card" style={{ padding: "2rem", borderRadius: 16 }}>
          <div className="section-tag">Send a Message</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, color: "#F5F7FA" }}>
              Tell me about your idea!
            </h2>
            <span style={{ fontSize: 24 }}>✈️</span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0 0 1.8rem" }}>
            Fill out the form and I&apos;ll get back to you as soon as possible.
          </p>

          {status && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                marginBottom: "1.5rem",
                fontSize: "0.88rem",
                fontWeight: 600,
                background: status.includes("successfully") ? "rgba(200, 255, 69, 0.12)" : "rgba(244, 63, 94, 0.12)",
                border: `1px solid ${status.includes("successfully") ? "rgba(200, 255, 69, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
                color: status.includes("successfully") ? "var(--accent-lime)" : "#fb7185",
              }}
            >
              {status}
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: "grid", gap: "1.4rem" }}>
            {/* Name */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, color: "#F5F7FA" }}>
                <span>👤</span> Your Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Enter your full name"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  fontSize: "0.92rem",
                  background: "#090E17",
                  border: errors.name ? "1px solid #f43f5e" : "1px solid var(--border-subtle)",
                  color: "#F5F7FA",
                }}
              />
              {errors.name && (
                <div style={{ color: "#fb7185", fontSize: "12px", marginTop: 4 }}>{errors.name}</div>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, color: "#F5F7FA" }}>
                <span>✉️</span> Your Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="Enter your email address"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  fontSize: "0.92rem",
                  background: "#090E17",
                  border: errors.email ? "1px solid #f43f5e" : "1px solid var(--border-subtle)",
                  color: "#F5F7FA",
                }}
              />
              {errors.email && (
                <div style={{ color: "#fb7185", fontSize: "12px", marginTop: 4 }}>{errors.email}</div>
              )}
            </div>

            {/* Message */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, color: "#F5F7FA" }}>
                  <span>💬</span> Your Message
                </label>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {form.message.length}/500
                </span>
              </div>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                rows={5}
                placeholder="Tell me about your project, opportunity, or just say hello..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  fontSize: "0.92rem",
                  background: "#090E17",
                  border: errors.message ? "1px solid #f43f5e" : "1px solid var(--border-subtle)",
                  color: "#F5F7FA",
                  resize: "vertical",
                }}
              />
              {errors.message && (
                <div style={{ color: "#fb7185", fontSize: "12px", marginTop: 4 }}>{errors.message}</div>
              )}
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-lime"
              style={{
                width: "100%",
                padding: "12px 18px",
                fontSize: "1rem",
              }}
            >
              {submitting ? "Sending..." : "Send Message →"}
            </button>

            {/* Privacy note */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "12px", color: "var(--text-muted)", justifyContent: "center" }}>
              <span>🔒</span> Your information is safe with me. I&apos;ll never share it with anyone.
            </div>
          </form>
        </div>

        {/* Right Column: Other Ways to Reach Me & Current Availability (Image 4) */}
        <div style={{ display: "grid", gap: "2rem" }}>
          {/* Other Ways to Reach Me */}
          <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 16 }}>
            <div className="section-tag">Let&apos;s Connect</div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 6px", color: "#F5F7FA" }}>
              Other Ways to Reach Me
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 1.4rem" }}>
              Feel free to connect with me through any of these platforms.
            </p>

            <div style={{ display: "grid", gap: "10px" }}>
              {/* Email */}
              <a
                href="mailto:vivekpawar3010@gmail.com"
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 16,
                    }}
                  >
                    ✉️
                  </div>
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>Email</div>
                    <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#F5F7FA" }}>
                      vivekpawar3010@gmail.com
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Usually replies within 24 hours
                    </div>
                  </div>
                </div>
                <span style={{ color: "var(--accent-lime)" }}>→</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/in/vivek-pawar-16548a275"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#0077b5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    in
                  </div>
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>LinkedIn</div>
                    <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#F5F7FA" }}>
                      linkedin.com/in/vivek-pawar
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Let&apos;s connect professionally
                    </div>
                  </div>
                </div>
                <span style={{ color: "var(--accent-lime)" }}>→</span>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/vivekpawar3010"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#24292e",
                      border: "1px solid rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 18,
                    }}
                  >
                    🐙
                  </div>
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>GitHub</div>
                    <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#F5F7FA" }}>
                      github.com/vivekpawar3010
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Check out my code and projects
                    </div>
                  </div>
                </div>
                <span style={{ color: "var(--accent-lime)" }}>→</span>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/vivek.pawar.dev"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 16,
                    }}
                  >
                    📸
                  </div>
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>Instagram</div>
                    <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#F5F7FA" }}>
                      instagram.com/vivek.pawar.dev
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Follow for updates and behind the scenes
                    </div>
                  </div>
                </div>
                <span style={{ color: "var(--accent-lime)" }}>→</span>
              </a>
            </div>
          </div>

          {/* Current Availability Box (Image 4) */}
          <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--accent-lime)",
                  }}
                />
                <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "var(--accent-lime)" }}>
                  Current Availability
                </span>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  background: "rgba(200, 255, 69, 0.12)",
                  color: "var(--accent-lime)",
                  padding: "2px 8px",
                  borderRadius: 4,
                  border: "1px solid rgba(200, 255, 69, 0.3)",
                }}
              >
                Available
              </span>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, margin: "0 0 1rem" }}>
              I&apos;m currently open to new opportunities, internships, freelance projects, and exciting collaborations.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                "Full-time Opportunities",
                "Internships",
                "Part-time / Freelance",
                "Open Source Contributions",
                "Interesting Projects",
              ].map((badge, bIdx) => (
                <span
                  key={bIdx}
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid var(--border-subtle)",
                    color: "#F5F7FA",
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lower Section: Location (Left) vs Why Reach Out (Right) (Image 4) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2.5rem",
          alignItems: "start",
          marginBottom: "4rem",
        }}
      >
        {/* Left: Location Card */}
        <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 16 }}>
          <div className="section-tag">Location</div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 6px", color: "#F5F7FA" }}>
            Based in Pandharpur, India
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 1.4rem" }}>
            I&apos;m currently based in Pandharpur, Maharashtra, but I&apos;m open to remote opportunities and collaborations worldwide.
          </p>

          <div style={{ display: "grid", gap: "10px", marginBottom: "1.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem", color: "#F5F7FA" }}>
              <span>📍</span> Pandharpur, Maharashtra, India
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem", color: "#F5F7FA" }}>
              <span>💻</span> Open to Remote Work
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem", color: "#F5F7FA" }}>
              <span>⏰</span> IST (Indian Standard Time)
            </div>
          </div>

          {/* Glowing Mini Map Banner */}
          <div
            style={{
              width: "100%",
              height: 120,
              borderRadius: 10,
              background: "radial-gradient(circle at 60% 60%, rgba(34, 211, 238, 0.25) 0%, rgba(11, 18, 28, 0.95) 70%)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background: "rgba(5, 8, 13, 0.85)",
                border: "1px solid var(--accent-lime)",
                fontSize: "11px",
                fontWeight: 700,
                color: "#F5F7FA",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>🏛️</span> Pandharpur, Maharashtra, India
            </div>
          </div>
        </div>

        {/* Right: Things We Can Talk About (6 interactive cards) */}
        <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 16 }}>
          <div className="section-tag">Why Reach Out?</div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 6px", color: "#F5F7FA" }}>
            Things We Can Talk About
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 1.4rem" }}>
            Here are some common reasons people reach out to me.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
            }}
          >
            {[
              { title: "Project Collaboration", desc: "Work together on exciting ideas", icon: "🤝" },
              { title: "Freelance Work", desc: "Short-term or long-term projects", icon: "💼" },
              { title: "Job Opportunities", desc: "Full-time or internship roles", icon: "🚀" },
              { title: "Technical Discussion", desc: "Discuss tech, ideas or solve problems", icon: "💬" },
              { title: "Open Source", desc: "Contribute to meaningful projects", icon: "🌐" },
              { title: "Just a Friendly Chat", desc: "Talk about tech, career or anything!", icon: "☕" },
            ].map((topic, tIdx) => (
              <div
                key={tIdx}
                style={{
                  padding: "12px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{topic.icon}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#F5F7FA" }}>{topic.title}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                  {topic.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Horizon CTA (Image 4) */}
      <div
        className="glass-card"
        style={{
          padding: "3.5rem 2rem",
          borderRadius: 20,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(34, 211, 238, 0.3)",
          background: "radial-gradient(circle at 50% 120%, rgba(34, 211, 238, 0.3) 0%, rgba(200, 255, 69, 0.15) 35%, rgba(11, 18, 28, 0.95) 75%)",
        }}
      >
        <div className="section-tag" style={{ justifyContent: "center" }}>Ready to Create Impact?</div>
        <h2
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 900,
            marginBottom: "0.6rem",
            color: "#F5F7FA",
          }}
        >
          Have an <span className="lime-underline">idea</span> in mind?
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            maxWidth: 580,
            margin: "0 auto 2rem",
            fontSize: "1rem",
            lineHeight: 1.6,
          }}
        >
          Let&apos;s turn your ideas into real products. I&apos;m always excited to work on new challenges and meaningful projects.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 300, behavior: "smooth" });
              }
            }}
            className="btn-lime"
          >
            Start a Conversation <span>→</span>
          </button>
          <Link href="/projects" className="btn-dark-pill">
            📁 View My Projects
          </Link>
        </div>

        <div style={{ marginTop: 14 }}>
          <span className="handwritten" style={{ fontSize: "1.25rem" }}>
            Ideas Collaborations Opportunities Let&apos;s Make It Happen!
          </span>
        </div>
      </div>
    </div>
  );
}
