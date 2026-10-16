"use client";

import { useState } from "react";
import profile from "../data/profile";

const initialForm = {
  name: "",
  email: "",
  message: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  const validateField = (field, value) => {
    if (!value.trim()) {
      if (field === "name") return "Please enter your name.";
      if (field === "email") return "Please enter your email address.";
      if (field === "message") return "Please write your message.";
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
    }

    if (field === "email" && !emailPattern.test(value)) {
      return "Please enter a valid email address (e.g. name@example.com).";
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
    setForm((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      const updated = { ...prev, [name]: validateField(name, value) };
      if (!updated[name]) delete updated[name];
      return updated;
    });
  };

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (evt) => {
    evt.preventDefault();
    setStatus("");

    if (!validateAll()) {
      setStatus("Please review and fix the highlighted field before sending.");
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
      setStatus("Network connection error. Please verify your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 1000, margin: "0 auto", padding: "1.5rem 0 3.5rem" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--accent-cyan)",
            background: "rgba(56, 189, 248, 0.1)",
            padding: "4px 14px",
            borderRadius: 20,
            border: "1px solid rgba(56, 189, 248, 0.25)",
            marginBottom: 12,
          }}
        >
          Let&apos;s Connect
        </span>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
          Get In <span className="gradient-text">Touch</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: 550, margin: "0 auto", fontSize: "1.05rem" }}>
          Have an exciting project, internship opportunity, or question? Send a message or connect directly.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        {/* Contact Info Sidebar */}
        <div className="glass-card" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1.35rem", marginBottom: "1rem" }}>Contact Details</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            I am always open to discussing new opportunities, open source projects, or collaborating on innovative ideas.
          </p>

          <div style={{ display: "grid", gap: "1.2rem" }}>
            <a
              href={`mailto:${profile.email}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 16px",
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: 12,
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              <span style={{ fontSize: 22 }}>✉️</span>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Email
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-cyan)" }}>{profile.email}</div>
              </div>
            </a>

            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 16px",
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: 12,
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              <span style={{ fontSize: 22 }}>💼</span>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  LinkedIn
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#60a5fa" }}>linkedin.com/in/vivek-pawar</div>
              </div>
            </a>

            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 16px",
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: 12,
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              <span style={{ fontSize: 22 }}>🐙</span>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  GitHub
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#34d399" }}>github.com/{profile.githubUsername}</div>
              </div>
            </a>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 16px",
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: 12,
                border: "1px solid var(--border-subtle)",
              }}
            >
              <span style={{ fontSize: 22 }}>📍</span>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Location
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{profile.location}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-card" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1.35rem", marginBottom: "1.2rem" }}>Send a Message</h2>

          <form onSubmit={onSubmit} noValidate>
            <div style={{ marginBottom: "1.2rem" }}>
              <label htmlFor="name" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="e.g. Alex Smith"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--input-bg)",
                  border: `1px solid ${errors.name ? "#f43f5e" : "var(--border-light)"}`,
                  borderRadius: 10,
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
              {errors.name && <p style={{ color: "#fb7185", margin: "4px 0 0", fontSize: "0.82rem" }}>{errors.name}</p>}
            </div>

            <div style={{ marginBottom: "1.2rem" }}>
              <label htmlFor="email" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Your Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="e.g. alex@example.com"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--input-bg)",
                  border: `1px solid ${errors.email ? "#f43f5e" : "var(--border-light)"}`,
                  borderRadius: 10,
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
              {errors.email && <p style={{ color: "#fb7185", margin: "4px 0 0", fontSize: "0.82rem" }}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="message" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={onChange}
                rows={5}
                placeholder="Write your message or inquiry here..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--input-bg)",
                  border: `1px solid ${errors.message ? "#f43f5e" : "var(--border-light)"}`,
                  borderRadius: 10,
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
              {errors.message && (
                <p style={{ color: "#fb7185", margin: "4px 0 0", fontSize: "0.82rem" }}>{errors.message}</p>
              )}
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              Send Message 🚀
            </button>
          </form>

          {status && (
            <div
              style={{
                marginTop: "1.2rem",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: "0.9rem",
                fontWeight: 500,
                background: status.includes("successfully") ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
                border: `1px solid ${status.includes("successfully") ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
                color: status.includes("successfully") ? "#34d399" : "#fb7185",
              }}
            >
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
