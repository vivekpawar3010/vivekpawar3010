import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

const EXPERIENCE_FILE = path.join(process.cwd(), "src", "data", "experience.json");

function readExperienceFile() {
  try {
    if (fs.existsSync(EXPERIENCE_FILE)) {
      return JSON.parse(fs.readFileSync(EXPERIENCE_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading experience.json:", err);
  }
  return { internships: [], achievements: [], careerTimeline: [] };
}

function writeExperienceFile(data) {
  try {
    fs.writeFileSync(EXPERIENCE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing experience.json:", err);
  }
}

async function getExperienceData() {
  if (prisma) {
    try {
      const items = await prisma.experienceItem.findMany({
        orderBy: { order: "asc" },
      });
      if (items && items.length > 0) {
        const internships = [];
        const achievements = [];
        for (const item of items) {
          if (item.type === "internship") {
            let parsedHighlights = [];
            try {
              parsedHighlights = item.highlights ? (item.highlights.startsWith("[") ? JSON.parse(item.highlights) : [item.highlights]) : [];
            } catch {
              parsedHighlights = item.highlights ? [item.highlights] : [];
            }
            internships.push({
              id: item.id,
              role: item.role || "",
              company: item.company || "",
              period: item.period || "",
              location: item.location || "",
              description: item.description || "",
              highlights: parsedHighlights,
              tech: item.tech ? item.tech.split(",").map((t) => t.trim()).filter(Boolean) : [],
              icon: item.icon || "Briefcase",
              certificateUrl: item.certificateUrl || "",
            });
          } else if (item.type === "achievement") {
            achievements.push({
              id: item.id,
              title: item.title || "",
              subtitle: item.subtitle || "",
              description: item.description || "",
              category: item.category || "Milestone",
              badge: item.badge || "Verified",
              icon: item.icon || "Trophy",
              color: item.color || "#38bdf8",
              credentialUrl: item.certificateUrl || "",
            });
          }
        }
        return { internships, achievements, careerTimeline: [] };
      }
    } catch (e) {
      console.warn("Prisma getExperience fallback:", e.message);
    }
  }
  return readExperienceFile();
}

export async function GET() {
  const data = await getExperienceData();
  return NextResponse.json(data);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const data = await getExperienceData();
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

      // Sync to PostgreSQL
      if (prisma) {
        try {
          await prisma.experienceItem.upsert({
            where: { id },
            create: {
              id,
              type: "internship",
              role: entry.role,
              company: entry.company,
              period: entry.period,
              location: entry.location,
              description: entry.description,
              highlights: JSON.stringify(entry.highlights),
              tech: entry.tech.join(", "),
              icon: entry.icon,
              certificateUrl: entry.certificateUrl,
              order: 0,
            },
            update: {
              role: entry.role,
              company: entry.company,
              period: entry.period,
              location: entry.location,
              description: entry.description,
              highlights: JSON.stringify(entry.highlights),
              tech: entry.tech.join(", "),
              icon: entry.icon,
              certificateUrl: entry.certificateUrl,
            },
          });
        } catch (e) {
          console.warn("Prisma save_internship fallback:", e.message);
        }
      }

      writeExperienceFile(data);
      return NextResponse.json({ success: true, experience: data });
    }

    if (action === "delete_internship") {
      const { id } = body;
      data.internships = data.internships.filter((i) => i.id !== id);

      if (prisma) {
        try {
          await prisma.experienceItem.delete({ where: { id } }).catch(() => {});
        } catch (e) {
          console.warn("Prisma delete_internship fallback:", e.message);
        }
      }

      writeExperienceFile(data);
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

      // Sync to PostgreSQL
      if (prisma) {
        try {
          await prisma.experienceItem.upsert({
            where: { id },
            create: {
              id,
              type: "achievement",
              title: entry.title,
              subtitle: entry.subtitle,
              description: entry.description,
              category: entry.category,
              badge: entry.badge,
              icon: entry.icon,
              color: entry.color,
              certificateUrl: entry.credentialUrl,
              order: 0,
            },
            update: {
              title: entry.title,
              subtitle: entry.subtitle,
              description: entry.description,
              category: entry.category,
              badge: entry.badge,
              icon: entry.icon,
              color: entry.color,
              certificateUrl: entry.credentialUrl,
            },
          });
        } catch (e) {
          console.warn("Prisma save_achievement fallback:", e.message);
        }
      }

      writeExperienceFile(data);
      return NextResponse.json({ success: true, experience: data });
    }

    if (action === "delete_achievement") {
      const { id } = body;
      data.achievements = data.achievements.filter((a) => a.id !== id);

      if (prisma) {
        try {
          await prisma.experienceItem.delete({ where: { id } }).catch(() => {});
        } catch (e) {
          console.warn("Prisma delete_achievement fallback:", e.message);
        }
      }

      writeExperienceFile(data);
      return NextResponse.json({ success: true, experience: data });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err) {
    console.error("Experience API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
