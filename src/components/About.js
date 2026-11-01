"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import defaultProfile from "../data/profile";
import HolographicPortrait from "./HolographicPortrait";
import {
  Zap,
  GraduationCap,
  Briefcase,
  Bot,
  BarChart3,
  Trophy,
  CheckCircle2,
  Code2,
  Cloud,
  Users,
  Award,
  Sparkles,
  MapPin,
  BookOpen,
  Sprout,
  Compass,
  Download,
  ArrowRight,
  Dumbbell,
  Plane,
  Headphones,
  Gamepad2,
  Library,
  Mail,
  Terminal,
} from "lucide-react";
import { GithubIcon as Github, LinkedinIcon as Linkedin, TwitterIcon as Twitter, InstagramIcon as Instagram } from "./BrandIcons";

export default function About() {
  const [profile, setProfile] = useState(defaultProfile);
  const [activeMilestone, setActiveMilestone] = useState(null);

  useEffect(() => {
    fetch("/api/king/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.profile) {
          setProfile(data.profile);
        }
      })
      .catch((err) => console.error("Error loading dynamic profile in About", err));
  }, []);

  const aboutStats = [
    { value: "500+", label: "LeetCode Solved", icon: Zap, color: "#fbbf24" },
    { value: "9.21", label: "CGPA (B.Tech CSE)", icon: GraduationCap, color: "#22D3EE" },
    { value: "4+", label: "Major Production Apps", icon: Briefcase, color: "#c084fc" },
    { value: "2", label: "AI & ML Integrations", icon: Bot, color: "#38bdf8" },
    { value: "36", label: "Contests Attended", icon: BarChart3, color: "var(--accent-lime)" },
    { value: "9", label: "LeetCode Badges", icon: Trophy, color: "#f43f5e" },
  ];

  const milestones = [
    {
      year: "2022",
      title: "Started B.Tech in CSE",
      desc: "Began my journey at SVERI's College of Engineering, Pandharpur, focusing on Core Computer Science and Algorithms.",
      icon: GraduationCap,
    },
    {
      year: "2023",
      title: "Full-Stack Web & Android Foundations",
      desc: "Built modern responsive SPAs using React.js, native Android applications, and mastered OOP principles.",
      icon: Code2,
    },
    {
      year: "2024",
      title: "Front-End Developer Intern @ Micro IT",
      desc: "1-month intensive frontend internship building production React features, guided by Vijay Kumar (Sr. Tech Lead).",
      icon: Briefcase,
    },
    {
      year: "2024",
      title: "Google Cloud AI Certifications",
      desc: "Completed Google Cloud credentials in Responsible AI, Prompt Engineering, and Large Language Model architectures.",
      icon: Cloud,
    },
    {
      year: "2024",
      title: "Event Manager - Mirror Code @ Olympus 2K24",
      desc: "Led coordination and technical problem setting for collegiate competitive programming tracks at national symposium.",
      icon: Users,
    },
    {
      year: "2025",
      title: "Software Testing & QA Training @ QSpiders Pune",
      desc: "Rigorous test engineering training in manual QA, automation test suites, Selenium, and API regression testing.",
      icon: CheckCircle2,
    },
    {
      year: "2025",
      title: "Led SPIRIT 2K25 (Registration Head)",
      desc: "Managed 500–600 participants across 6 events, leading a 12-member operations team.",
      icon: Users,
    },
    {
      year: "2025",
      title: "Selected for TCS Digital",
      desc: "Cleared competitive NQT and technical rounds for the premier ₹7 LPA TCS Digital software engineering role.",
      icon: Trophy,
    },
    {
      year: "Dec 2025 – Apr 2026",
      title: "Software Development Intern @ Webvarad / Fourise",
      desc: "Engineered scalable backend microservices, optimized database schemas, and built Next.js enterprise modules.",
      icon: Briefcase,
    },
    {
      year: "2026",
      title: "Graduated with Honors",
      desc: "Graduated with 9.21 / 10 CGPA, perfect 10.00 / 10 Final Sem SGPA, and GATE 2026 Qualified.",
      icon: Award,
    },
  ];

  const interests = [
    {
      title: "AI & Machine Learning",
      desc: "Building LLM agents, generative tools, and intelligent reasoning engines that augment human productivity.",
      icon: Bot,
      color: "#38bdf8",
    },
    {
      title: "EdTech & Learning Tools",
      desc: "Creating intuitive study platforms like StudyBuddy AI that democratize complex technical concepts.",
      icon: BookOpen,
      color: "#fbbf24",
    },
    {
      title: "AgriTech & Climate",
      desc: "Leveraging computer vision leaf diagnostics and APMC mandi pricing to empower Indian farmers.",
      icon: Sprout,
      color: "#34d399",
    },
    {
      title: "Travel & Exploration",
      desc: "Designing cultural pilgrimage platforms like Pandharpur Darshan with real-time geospatial routing.",
      icon: MapPin,
      color: "#f43f5e",
    },
  ];

  const hobbies = [
    { label: "Fitness & Workouts", icon: Dumbbell },
    { label: "Exploration & Travel", icon: Plane },
    { label: "Instrumental & Coding Lo-Fi", icon: Headphones },
    { label: "Strategy Games", icon: Gamepad2 },
    { label: "Tech Biographies", icon: Library },
  ];

  return (
    <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 0 4rem" }}>
      {/* ── 1. Hero / Introduction ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2.5rem",
          alignItems: "center",
          marginBottom: "3.5rem",
        }}
      >
        {/* Left Column: Bio & Actions */}
        <div>
          <div className="section-tag">
            <span className="handwritten" style={{ fontSize: "1.1rem", marginRight: 4 }}>✦</span> About Me
          </div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.8rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: "1rem",
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            More than just a <br />
            <span className="lime-underline">Developer.</span>
          </h1>

          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              maxWidth: 540,
              marginBottom: "2rem",
            }}
          >
            {profile.about ||
              "I'm Vivek Pawar, a Software Developer and Computer Science graduate who loves building real-world products, solving problems, and exploring new technologies. I enjoy turning ideas into useful, impactful applications whether it's for travel, education, agriculture or beyond."}
          </p>

          {/* Quick Action Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: "1.8rem" }}>
            <Link href="/projects" className="btn-lime">
              Explore My Work <ArrowRight size={16} />
            </Link>
            <a
              href={profile.resumeUrl || "https://drive.google.com/file/d/1X5X9kC5d7eL3yZk_example/view?usp=sharing"}
              target="_blank"
              rel="noreferrer"
              className="btn-dark-pill"
            >
              <Download size={15} /> Download Resume
            </a>
          </div>

          {/* Social Links Row + Handwritten Connect Note */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <a
                href="https://github.com/vivekpawar3010"
                target="_blank"
                rel="noreferrer"
                title="GitHub"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent-lime)";
                  e.currentTarget.style.borderColor = "var(--accent-lime)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                }}
              >
                <Github size={17} />
              </a>

              <a
                href="https://linkedin.com/in/vivek-pawar-16548a275"
                target="_blank"
                rel="noreferrer"
                title="LinkedIn"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent-lime)";
                  e.currentTarget.style.borderColor = "var(--accent-lime)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                }}
              >
                <Linkedin size={17} />
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                title="Twitter"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent-lime)";
                  e.currentTarget.style.borderColor = "var(--accent-lime)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                }}
              >
                <Twitter size={16} />
              </a>

              <a
                href="mailto:vivekpawar3010@gmail.com"
                title="Email"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent-lime)";
                  e.currentTarget.style.borderColor = "var(--accent-lime)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                }}
              >
                <Mail size={17} />
              </a>

              <a
                href="https://instagram.com/vivek.pawar.dev"
                target="_blank"
                rel="noreferrer"
                title="Instagram"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent-lime)";
                  e.currentTarget.style.borderColor = "var(--accent-lime)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                }}
              >
                <Instagram size={17} />
              </a>

              <Link
                href="/leetcode"
                title="LeetCode"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent-lime)";
                  e.currentTarget.style.borderColor = "var(--accent-lime)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                }}
              >
                <Zap size={17} />
              </Link>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="handwritten" style={{ fontSize: "1.3rem" }}>
                Let&apos;s connect!
              </span>
              <span style={{ color: "var(--accent-lime)", fontSize: "1.1rem" }}>⤷</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Hologram Showcase with handwritten pointer */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", minHeight: 480, position: "relative" }}>
          <HolographicPortrait />
          {/* Handwritten Annotation pointing to the hologram */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 10,
              padding: "4px 14px",
              borderRadius: 9999,
              background: "var(--tag-bg)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span className="handwritten" style={{ fontSize: "1.35rem", color: "var(--text-primary)" }}>
              That&apos;s me!
            </span>
            <span style={{ color: "var(--accent-lime)", fontSize: "1.2rem", transform: "rotate(-10deg)" }}>⤷</span>
          </div>
        </div>
      </div>

      {/* ── 2. Animated Stats Strip ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1.2rem",
          marginBottom: "3.5rem",
        }}
      >
        {aboutStats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: "1.4rem 1.2rem",
                borderRadius: 14,
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = stat.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "var(--tag-bg)",
                  border: "1px solid var(--border-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                  color: stat.color,
                }}
              >
                <IconComponent size={20} />
              </div>

              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  lineHeight: 1.1,
                  fontFamily: "var(--font-heading)",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 4, fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Two Columns: Academic Journey & Timeline vs Passions & Beyond Code ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "2.5rem",
          alignItems: "start",
        }}
      >
        {/* Left Column: Education & Timeline */}
        <div style={{ display: "grid", gap: "2rem" }}>
          {/* Academic Journey Card with 10.00 SGPA and GATE 2026 Qualified */}
          <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div className="section-tag">Education</div>
              <span className="handwritten" style={{ fontSize: "1.1rem", color: "var(--accent-lime)" }}>
                Verified Degree ✦
              </span>
            </div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text-primary)" }}>
              My Academic Foundation
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: "0 0 1.2rem" }}>
              Computer Science engineering curriculum paired with continuous competitive coding and systems architecture.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px",
                borderRadius: 12,
                background: "var(--tag-bg)",
                border: "1px solid var(--border-subtle)",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 10,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-lime)",
                  flexShrink: 0,
                }}
              >
                <GraduationCap size={28} />
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: "0.98rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  B.Tech in Computer Science and Engineering
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 2 }}>
                  Punyashlok Ahilyadevi Holkar Solapur University <br />
                  (SVERI&apos;s College of Engineering, Pandharpur)
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                  2022 – 2026 • Final Year
                </div>
              </div>

              {/* Dual GPA highlight badges */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 130 }}>
                <div
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid var(--accent-lime)",
                    background: "rgba(200, 255, 69, 0.12)",
                    color: "var(--accent-lime)",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    textAlign: "center",
                  }}
                >
                  CGPA: <strong>9.21 / 10</strong>
                </div>
                <div
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid #38bdf8",
                    background: "rgba(56, 189, 248, 0.12)",
                    color: "#38bdf8",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    textAlign: "center",
                  }}
                >
                  8th Sem SGPA: <strong>10.00 / 10</strong>
                </div>
                <div
                  style={{
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: "var(--badge-bg)",
                    color: "var(--text-primary)",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    textAlign: "center",
                  }}
                >
                  GATE 2026 Qualified
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Scroll-Beam Journey Timeline */}
          <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 14 }}>
            <div className="section-tag">My Journey</div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text-primary)" }}>
              From Curiosity to Creation
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: "0 0 1.5rem" }}>
              Key milestones, production internships, and leadership roles that accelerated my engineering career.
            </p>

            <div style={{ display: "grid", gap: "1rem", position: "relative", paddingLeft: 8 }}>
              {/* Glowing vertical spine */}
              <div
                style={{
                  position: "absolute",
                  left: 20,
                  top: 15,
                  bottom: 20,
                  width: 2,
                  background: "linear-gradient(180deg, var(--accent-lime) 0%, #22D3EE 50%, #c084fc 100%)",
                  boxShadow: "0 0 10px rgba(200, 255, 69, 0.35)",
                }}
              />

              {milestones.map((item, idx) => {
                const MilestoneIcon = item.icon;
                const isExpanded = activeMilestone === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => setActiveMilestone(isExpanded ? null : idx)}
                    className="interactive-card"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      position: "relative",
                      zIndex: 1,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "var(--tag-bg)",
                      border: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {/* Node icon */}
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "var(--bg-card)",
                        border: "2px solid var(--accent-lime)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--accent-lime)",
                        flexShrink: 0,
                      }}
                    >
                      <MilestoneIcon size={16} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 800,
                              color: "var(--accent-lime)",
                              background: "rgba(200, 255, 69, 0.12)",
                              padding: "2px 8px",
                              borderRadius: 4,
                            }}
                          >
                            {item.year}
                          </span>
                          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                            {item.title}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {isExpanded ? "▲ Less" : "▼ Details"}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-secondary)",
                          margin: "6px 0 0",
                          lineHeight: 1.5,
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pandharpur Quote Card */}
          <div
            className="glass-card"
            style={{
              padding: "2rem",
              borderRadius: 14,
              position: "relative",
              overflow: "hidden",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-card)",
            }}
          >
            <div style={{ fontSize: 32, color: "var(--accent-lime)", lineHeight: 1, marginBottom: 8 }}>“</div>
            <p
              style={{
                fontSize: "1.05rem",
                color: "var(--text-primary)",
                fontWeight: 600,
                lineHeight: 1.6,
                margin: "0 0 1rem",
              }}
            >
              I believe in writing clean, scalable code that creates tangible value for everyday people.
            </p>
            <div style={{ fontSize: "0.95rem", color: "var(--accent-lime)", fontWeight: 800 }} className="handwritten">
              — Vivek Pawar
            </div>
          </div>
        </div>

        {/* Right Column: Passions Bento Cards + Beyond Code */}
        <div style={{ display: "grid", gap: "2rem" }}>
          {/* Bento Grid: Things I'm Passionate About */}
          <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 14 }}>
            <div className="section-tag">Passions</div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text-primary)" }}>
              Things I&apos;m Passionate About
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: "0 0 1.2rem" }}>
              Domains where I dedicate my creative energy, experiment with algorithms, and build useful products.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "1rem",
              }}
            >
              {interests.map((item, idx) => {
                const InterestIcon = item.icon;
                return (
                  <div
                    key={idx}
                    className="interactive-card"
                    style={{
                      padding: "1.2rem",
                      borderRadius: 12,
                      background: "var(--tag-bg)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: 150,
                      transition: "transform 0.2s ease, border-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.borderColor = item.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "var(--border-subtle)";
                    }}
                  >
                    <div>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-light)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: item.color,
                          marginBottom: 10,
                        }}
                      >
                        <InterestIcon size={20} />
                      </div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Beyond Code (Hobbies & Life Terminal) */}
          <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 14 }}>
            <div className="section-tag">Beyond Code</div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text-primary)" }}>
              Life Outside the Terminal
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: "0 0 1.2rem" }}>
              Balancing deep engineering with fitness, travel exploration, music, and continuous learning.
            </p>

            {/* Hobbies Pills with vector icons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "1.4rem" }}>
              {hobbies.map((h, i) => {
                const HobbyIcon = h.icon;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 14px",
                      borderRadius: 10,
                      background: "var(--tag-bg)",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    <HobbyIcon size={15} color="var(--accent-lime)" />
                    <span>{h.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Life Terminal Code Box */}
            <div
              style={{
                background: "var(--input-bg)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                padding: "12px 16px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                lineHeight: 1.6,
              }}
            >
              <div>
                <span style={{ color: "#a855f7" }}>const</span>{" "}
                <span style={{ color: "var(--accent-lime)" }}>lifePhilosophy</span> = &#123;
              </div>
              <div style={{ paddingLeft: 14, color: "#38bdf8" }}>curiosity: <span style={{ color: "var(--accent-lime)" }}>Infinity</span>,</div>
              <div style={{ paddingLeft: 14, color: "#38bdf8" }}>discipline: <span style={{ color: "var(--accent-lime)" }}>true</span>,</div>
              <div style={{ paddingLeft: 14, color: "#38bdf8" }}>buildSolutions: <span style={{ color: "var(--accent-lime)" }}>true</span>,</div>
              <div style={{ paddingLeft: 14, color: "#38bdf8" }}>alwaysLearning: <span style={{ color: "var(--accent-lime)" }}>true</span></div>
              <div>&#125;;</div>
            </div>

            <div style={{ textAlign: "right", marginTop: 10 }}>
              <span className="handwritten" style={{ fontSize: "1.25rem", color: "var(--accent-lime)" }}>
                Same curiosity in life as in code!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Next Actions Section ── */}
      <div
        className="glass-card"
        style={{
          marginTop: "3.5rem",
          padding: "2.5rem 2rem",
          borderRadius: 20,
          textAlign: "center",
          border: "1px solid var(--border-lime)",
          background: "var(--bg-card)",
        }}
      >
        <div className="section-tag" style={{ justifyContent: "center", marginBottom: 8 }}>
          Next Steps
        </div>
        <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.3rem)", fontWeight: 800, margin: "0 0 10px", color: "var(--text-primary)" }}>
          Ready to explore <span className="lime-underline">my work &amp; impact?</span>
        </h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: 540, margin: "0 auto 1.8rem", fontSize: "0.95rem" }}>
          Check out my featured production apps, track record of achievements, or get directly in touch for opportunities.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/projects" className="btn-lime">
            <Briefcase size={16} /> Explore Projects <ArrowRight size={15} />
          </Link>
          <Link href="/experience" className="btn-dark-pill">
            <Trophy size={16} /> Experience &amp; Skills
          </Link>
          <Link href="/leetcode" className="btn-dark-pill" style={{ color: "#fbbf24", borderColor: "rgba(245, 158, 11, 0.4)" }}>
            <Zap size={16} /> LeetCode Profile
          </Link>
          <Link href="/github" className="btn-dark-pill" style={{ color: "#22D3EE", borderColor: "rgba(34, 211, 238, 0.4)" }}>
            <Github size={16} /> GitHub Analytics
          </Link>
          <Link href="/contact" className="btn-lime">
            <Mail size={16} /> Let&apos;s Connect <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
