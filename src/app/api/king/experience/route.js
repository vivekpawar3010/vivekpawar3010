import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const EXPERIENCE_FILE = path.join(process.cwd(), "src", "data", "experience.json");

function readExperience() {
  try {
    if (fs.existsSync(EXPERIENCE_FILE)) {
      return JSON.parse(fs.readFileSync(EXPERIENCE_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading experience.json:", err);
  }
  return { internships: [], achievements: [], careerTimeline: [] };
}

function writeExperience(data) {
  try {
    fs.writeFileSync(EXPERIENCE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing experience.json:", err);
  }
}

export async function GET() {
  const data = readExperience();
  return NextResponse.json(data);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const data = readExperience();
    const { action } = body;

    if (action === "save_internship") {
      const item = body.internship;
      if (!item || !item.company || !item.role) {
        return NextResponse.json({ error: "Company and role are required." }, { status: 400 });
      }

      const id = item.id || `internship-${Date.now()}`;
      const entry = {
        id,
        role: item.role,
        company: item.company,
        period: item.period || "2025 – 2026",
        location: item.location || "Remote / Hybrid",
        description: item.description || "",
        highlights: Array.isArray(item.highlights)
          ? item.highlights
          : typeof item.highlights === "string"
          ? item.highlights.split("\n").filter(Boolean)
          : [],
        tech: Array.isArray(item.tech)
          ? item.tech
          : typeof item.tech === "string"
          ? item.tech.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        icon: item.icon || "Briefcase",
        certificateUrl: item.certificateUrl || "",
      };

      const existingIndex = data.internships.findIndex((i) => i.id === id);
      if (existingIndex >= 0) {
        data.internships[existingIndex] = entry;
      } else {
        data.internships.unshift(entry);
      }
      writeExperience(data);
      return NextResponse.json({ success: true, experience: data });
    }

    if (action === "delete_internship") {
      const { id } = body;
      data.internships = data.internships.filter((i) => i.id !== id);
      writeExperience(data);
      return NextResponse.json({ success: true, experience: data });
    }

    if (action === "save_achievement") {
      const item = body.achievement;
      if (!item || !item.title) {
        return NextResponse.json({ error: "Title is required." }, { status: 400 });
      }

      const id = item.id || `achievement-${Date.now()}`;
      const entry = {
        id,
        title: item.title,
        subtitle: item.subtitle || "",
        description: item.description || "",
        category: item.category || "Milestone",
        badge: item.badge || "Verified",
        icon: item.icon || "Trophy",
        color: item.color || "#38bdf8",
        credentialUrl: item.credentialUrl || "",
      };

      const existingIndex = data.achievements.findIndex((a) => a.id === id);
      if (existingIndex >= 0) {
        data.achievements[existingIndex] = entry;
      } else {
        data.achievements.unshift(entry);
      }
      writeExperience(data);
      return NextResponse.json({ success: true, experience: data });
    }

    if (action === "delete_achievement") {
      const { id } = body;
      data.achievements = data.achievements.filter((a) => a.id !== id);
      writeExperience(data);
      return NextResponse.json({ success: true, experience: data });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err) {
    console.error("Experience API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

