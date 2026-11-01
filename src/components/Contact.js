"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import defaultProfile from "../data/profile";
import {
  Send,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageSquare,
  Briefcase,
  Users,
  Code2,
  Compass,
  Laptop,
  Check,
  Building,
  Terminal,
} from "lucide-react";
import { GithubIcon as Github, LinkedinIcon as Linkedin, InstagramIcon as Instagram } from "./BrandIcons";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const [profile, setProfile] = useState(defaultProfile);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");

  // Live IST Clock
  const [currentTimeIST, setCurrentTimeIST] = useState("");

  // Terminal Typing Animation State
  const [typedLines, setTypedLines] = useState([
    'const message = {',
    '  from: "Vivek",',
    '  to: "You",',
    '  purpose: "Build Something Amazing",',
    '  status: "Open for Opportunities",',
    '};',
  ]);

  useEffect(() => {
    fetch("/api/king/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.profile) setProfile(data.profile);
      })
      .catch((err) => console.error("Error loading dynamic profile in Contact", err));

    // Update IST clock every second
    const updateTime = () => {
      try {
        const istString = new Date().toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        setCurrentTimeIST(istString);
      } catch {
        setCurrentTimeIST(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyEmail = () => {
    const emailToCopy = profile.email || "vivekpawar3010@gmail.com";
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(emailToCopy);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2800);
    }
  };

  const handleSelectTopicChip = (topicName) => {
    setSelectedTopic(topicName);
    setForm((prev) => ({
      ...prev,
      subject: topicName,
      message: prev.message ? prev.message : `Hi Vivek, I'd like to discuss ${topicName.toLowerCase()} with you. `,
    }));
  };

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
        setSelectedTopic("");
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

  const topicsList = [
    { label: "Project Collab", icon: Code2, desc: "Building applications & systems" },
    { label: "Job Opportunity", icon: Briefcase, desc: "Full-time & internship roles" },
    { label: "Freelance Work", icon: Laptop, desc: "Custom web & mobile apps" },
    { label: "Technical Discussion", icon: MessageSquare, desc: "Architecture, DSA & AI" },
  ];

  return (
    <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 0 4rem" }}>
      {/* ── 1. Contact Hero ── */}
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
          <div className="section-tag">
            <span className="handwritten" style={{ fontSize: "1.1rem", marginRight: 4 }}>✦</span> Get In Touch
          </div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: "1.2rem",
              color: "var(--text-primary)",
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
            I&apos;m always open to new engineering opportunities, ambitious projects, open-source collaborations, or exchanging ideas about full-stack engineering and AI.
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
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                fontSize: "12px",
                color: "var(--text-primary)",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--accent-lime)",
                  boxShadow: "0 0 10px var(--accent-lime)",
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
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              <Briefcase size={14} style={{ color: "var(--accent-brand)" }} /> Freelance / Part-time
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: "9999px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              <Users size={14} style={{ color: "var(--accent-secondary)" }} /> Collaborations
            </div>
          </div>
        </div>

        {/* Right: Interactive Terminal Workstation Preview */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            className="glass-card"
            style={{
              width: "min(420px, 92vw)",
              borderRadius: "16px",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-card)",
              overflow: "hidden",
              boxShadow: "0 20px 45px rgba(0,0,0,0.3), 0 0 25px rgba(56, 189, 248, 0.1)",
            }}
          >
            {/* Monitor Header */}
            <div
              style={{
                background: "var(--bg-surface)",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f43f5e" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fbbf24" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Terminal size={12} style={{ color: "var(--accent-brand)" }} />
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                  workspace_terminal.ts
                </span>
              </div>
            </div>

            {/* Code on Screen */}
            <div style={{ padding: "18px 20px", fontFamily: "monospace", fontSize: "12px", lineHeight: 1.8 }}>
              <div>
                <span style={{ color: "#c084fc" }}>const</span>{" "}
                <span style={{ color: "var(--accent-brand)" }}>message</span> = &#123;
              </div>
              <div style={{ paddingLeft: 14 }}>
                <span style={{ color: "var(--accent-secondary)" }}>from</span>: <span style={{ color: "#fbbf24" }}>&quot;Vivek&quot;</span>,
              </div>
              <div style={{ paddingLeft: 14 }}>
                <span style={{ color: "var(--accent-secondary)" }}>to</span>: <span style={{ color: "#fbbf24" }}>&quot;You&quot;</span>,
              </div>
              <div style={{ paddingLeft: 14 }}>
                <span style={{ color: "var(--accent-secondary)" }}>purpose</span>: <span style={{ color: "#fbbf24" }}>&quot;Build Something Amazing&quot;</span>,
              </div>
              <div style={{ paddingLeft: 14 }}>
                <span style={{ color: "var(--accent-secondary)" }}>status</span>: <span style={{ color: "var(--accent-lime)" }}>&quot;Open for Opportunities&quot;</span>,
              </div>
              <div style={{ paddingLeft: 14 }}>
                <span style={{ color: "var(--accent-secondary)" }}>location</span>: <span style={{ color: "#fbbf24" }}>&quot;Pandharpur, MH, India&quot;</span>
              </div>
              <div>&#125;;</div>
              <div style={{ color: "var(--text-secondary)", marginTop: 8, fontStyle: "italic" }}>
                // Ready to turn ambitious ideas into reliable code!
              </div>
            </div>

            <div
              style={{
                padding: "10px 18px",
                borderTop: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--bg-surface)",
              }}
            >
              <div style={{ display: "flex", gap: 6, fontSize: "11px", color: "var(--text-secondary)" }}>
                <span>Build</span> • <span>Learn</span> • <span>Improve</span> • <span>Repeat</span>
              </div>
              <span className="handwritten" style={{ fontSize: "1.15rem", color: "var(--accent-brand)" }}>
                Good Ideas Start Here! ⤷
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Two Columns: Contact Form (Left) vs Contact Channels (Right) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "2.5rem",
          alignItems: "start",
          marginBottom: "4rem",
        }}
      >
        {/* Left Column: Contact Form */}
        <div className="glass-card" style={{ padding: "2.2rem", borderRadius: 16 }}>
          <div className="section-tag">
            <Send size={13} style={{ marginRight: 4 }} /> Send a Message
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              Tell me about your idea!
            </h2>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "var(--badge-bg)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-brand)",
              }}
            >
              <Send size={18} />
            </div>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0 0 1.4rem" }}>
            Fill out the form below or pick a quick topic to start our conversation.
          </p>

          {/* Topic Selector Chips */}
          <div style={{ marginBottom: "1.6rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Quick Conversation Starter:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {topicsList.map((t, idx) => {
                const Icon = t.icon;
                const isSelected = selectedTopic === t.label;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectTopicChip(t.label)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 9999,
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: isSelected ? "1px solid var(--accent-brand)" : "1px solid var(--border-subtle)",
                      background: isSelected ? "var(--badge-bg)" : "var(--bg-surface)",
                      color: isSelected ? "var(--accent-brand)" : "var(--text-secondary)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Icon size={13} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {status && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                marginBottom: "1.5rem",
                fontSize: "0.88rem",
                fontWeight: 600,
                background: status.includes("successfully") ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)",
                border: `1px solid ${status.includes("successfully") ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
                color: status.includes("successfully") ? "#34d399" : "#fb7185",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {status.includes("successfully") ? <CheckCircle2 size={16} /> : null}
              {status}
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: "grid", gap: "1.3rem" }}>
            {/* Name */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
                Your Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="e.g. John Doe"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  fontSize: "0.92rem",
                  background: "var(--input-bg)",
                  border: errors.name ? "1px solid #f43f5e" : "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
              {errors.name && (
                <div style={{ color: "#fb7185", fontSize: "12px", marginTop: 4 }}>{errors.name}</div>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
                Your Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="e.g. name@company.com"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  fontSize: "0.92rem",
                  background: "var(--input-bg)",
                  border: errors.email ? "1px solid #f43f5e" : "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
              {errors.email && (
                <div style={{ color: "#fb7185", fontSize: "12px", marginTop: 4 }}>{errors.email}</div>
              )}
            </div>

            {/* Message */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  Your Message
                </label>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                  {form.message.length}/500
                </span>
              </div>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                rows={5}
                placeholder="Tell me about your project, idea, or questions..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  fontSize: "0.92rem",
                  background: "var(--input-bg)",
                  border: errors.message ? "1px solid #f43f5e" : "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  resize: "vertical",
                  outline: "none",
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {submitting ? "Sending Message..." : "Send Message"}
              <Send size={16} />
            </button>

            {/* Privacy note */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "12px", color: "var(--text-secondary)", justifyContent: "center" }}>
              <CheckCircle2 size={13} style={{ color: "var(--accent-lime)" }} /> Direct encrypted delivery straight to my admin inbox.
            </div>
          </form>
        </div>

        {/* Right Column: Other Ways to Reach Me & Current Availability */}
        <div style={{ display: "grid", gap: "2rem" }}>
          {/* Other Ways to Reach Me */}
          <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 16 }}>
            <div className="section-tag">Direct Channels</div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text-primary)" }}>
              Other Ways to Reach Me
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 1.4rem" }}>
              Feel free to connect or drop a message through any of these verified channels.
            </p>

            <div style={{ display: "grid", gap: "10px" }}>
              {/* Email with Quick Copy */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "rgba(234, 88, 12, 0.15)",
                      border: "1px solid rgba(234, 88, 12, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-brand)",
                    }}
                  >
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>Email</div>
                    <a
                      href="mailto:vivekpawar3010@gmail.com"
                      style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)", textDecoration: "none" }}
                    >
                      vivekpawar3010@gmail.com
                    </a>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Replies within 24 hours
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  title="Copy email to clipboard"
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: copiedEmail ? "rgba(16, 185, 129, 0.15)" : "var(--badge-bg)",
                    border: copiedEmail ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid var(--border-subtle)",
                    color: copiedEmail ? "#34d399" : "var(--text-primary)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    transition: "all 0.2s ease",
                  }}
                >
                  {copiedEmail ? <Check size={13} /> : <Copy size={13} />}
                  {copiedEmail ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/in/vivek-pawar-16548a275"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "rgba(2, 132, 199, 0.15)",
                      border: "1px solid rgba(2, 132, 199, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0284c7",
                    }}
                  >
                    <Linkedin size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>LinkedIn</div>
                    <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      linkedin.com/in/vivek-pawar
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Professional network & career updates
                    </div>
                  </div>
                </div>
                <ExternalLink size={15} style={{ color: "var(--text-secondary)" }} />
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/vivekpawar3010"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "rgba(168, 85, 247, 0.15)",
                      border: "1px solid rgba(168, 85, 247, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#c084fc",
                    }}
                  >
                    <Github size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>GitHub</div>
                    <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      github.com/vivekpawar3010
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Explore repositories & open source
                    </div>
                  </div>
                </div>
                <ExternalLink size={15} style={{ color: "var(--text-secondary)" }} />
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/vivek.pawar.dev"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "rgba(244, 63, 94, 0.15)",
                      border: "1px solid rgba(244, 63, 94, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#f43f5e",
                    }}
                  >
                    <Instagram size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>Instagram</div>
                    <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      @vivek.pawar.dev
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Behind the scenes & developer life
                    </div>
                  </div>
                </div>
                <ExternalLink size={15} style={{ color: "var(--text-secondary)" }} />
              </a>
            </div>
          </div>

          {/* Current Availability Box */}
          <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--accent-lime)",
                    boxShadow: "0 0 10px var(--accent-lime)",
                  }}
                />
                <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "var(--accent-brand)", letterSpacing: "0.06em" }}>
                  Current Availability
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  background: "var(--badge-bg)",
                  color: "var(--accent-brand)",
                  padding: "3px 10px",
                  borderRadius: 9999,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                Available for Q1–Q2
              </span>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, margin: "0 0 1rem" }}>
              I am actively reviewing full-time software engineering roles, impactful startup contracts, and collaborative open-source modules.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                "Full-time Software Roles",
                "Backend / Full-Stack",
                "Next.js & Cloud Apps",
                "AI Agent Integrations",
                "Android (Java/Kotlin)",
              ].map((badge, bIdx) => (
                <span
                  key={bIdx}
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Lower Section: Location with Live IST Clock & Discussion Topics ── */}
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
          <div className="section-tag">
            <MapPin size={13} style={{ marginRight: 4 }} /> Location & Timezone
          </div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text-primary)" }}>
            Based in Pandharpur, India
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 1.4rem" }}>
            Currently located in Pandharpur, Maharashtra, collaborating with engineering teams and clients worldwide.
          </p>

          <div style={{ display: "grid", gap: "10px", marginBottom: "1.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem", color: "var(--text-primary)" }}>
              <Building size={16} style={{ color: "var(--accent-brand)" }} /> Pandharpur, Maharashtra, India
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem", color: "var(--text-primary)" }}>
              <Laptop size={16} style={{ color: "var(--accent-secondary)" }} /> 100% Remote / Hybrid Ready
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem", color: "var(--text-primary)" }}>
              <Clock size={16} style={{ color: "var(--accent-highlight)" }} /> IST (UTC +5:30) • {currentTimeIST || "Live Clock Active"}
            </div>
          </div>

          {/* Interactive Radar Map Banner */}
          <div
            style={{
              width: "100%",
              height: 120,
              borderRadius: 12,
              background: "radial-gradient(circle at 60% 60%, rgba(234, 88, 12, 0.2) 0%, var(--bg-surface) 75%)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "8px 16px",
                borderRadius: 9999,
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 10px #22c55e",
                }}
              />
              <MapPin size={13} style={{ color: "var(--accent-brand)" }} />
              Pandharpur, Maharashtra • IST Active
            </div>
          </div>
        </div>

        {/* Right: Things We Can Talk About */}
        <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 16 }}>
          <div className="section-tag">
            <Sparkles size={13} style={{ marginRight: 4 }} /> Collaboration Scope
          </div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text-primary)" }}>
            Things We Can Talk About
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 1.4rem" }}>
            Here are common domains where I help teams and creators engineer impactful results:
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
            }}
          >
            {[
              { title: "Full-Stack Web Apps", desc: "Next.js, React, Node.js, Spring Boot", icon: Code2 },
              { title: "System Design & APIs", desc: "PostgreSQL, Prisma, REST, microservices", icon: Laptop },
              { title: "Job Opportunities", desc: "Software Engineer, Full-Stack roles", icon: Briefcase },
              { title: "AI & ML Integrations", desc: "LLM agents, vector tools, automation", icon: Sparkles },
              { title: "Open Source", desc: "Developer tools & collaborative packages", icon: Users },
              { title: "Tech Exchange & Mentorship", desc: "DSA patterns, LeetCode, system design", icon: MessageSquare },
            ].map((topic, tIdx) => {
              const Icon = topic.icon;
              return (
                <div
                  key={tIdx}
                  style={{
                    padding: "12px",
                    borderRadius: 10,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ color: "var(--accent-brand)", marginBottom: 6 }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>{topic.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 2 }}>
                    {topic.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Horizon CTA ── */}
      <div
        className="glass-card"
        style={{
          padding: "3.5rem 2rem",
          borderRadius: 20,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          border: "1px solid var(--border-subtle)",
          background: "radial-gradient(circle at 50% 120%, var(--badge-bg) 0%, var(--bg-card) 75%)",
        }}
      >
        <div className="section-tag" style={{ justifyContent: "center" }}>
          Ready to Create Impact?
        </div>
        <h2
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 900,
            marginBottom: "0.6rem",
            color: "var(--text-primary)",
          }}
        >
          Have a vision in mind? <br />
          <span className="lime-underline">Let&apos;s build it.</span>
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
          Let&apos;s turn your ideas into high-performance software. I am always excited to solve complex challenges and create lasting value.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 300, behavior: "smooth" });
              }
            }}
            className="btn-lime"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            Start a Conversation <Send size={15} />
          </button>
          <Link href="/projects" className="btn-dark-pill" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Compass size={15} /> View My Projects
          </Link>
        </div>

        <div style={{ marginTop: 18 }}>
          <span className="handwritten" style={{ fontSize: "1.35rem", color: "var(--accent-brand)" }}>
            Same curiosity in life as in code! ⤷
          </span>
        </div>
      </div>
    </div>
  );
}
