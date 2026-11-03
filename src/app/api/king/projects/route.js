import { NextResponse } from "next/server";
import { getProjects, addProject, updateProject, deleteProject } from "@/lib/data";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

const CATEGORIES_FILE = path.join(process.cwd(), "src", "data", "project_categories.json");

async function readCategories() {
  if (prisma) {
    try {
      const record = await prisma.systemData.findUnique({
        where: { key: "project_categories" },
      });
      if (record && record.value) {
        const parsed = JSON.parse(record.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Prisma readCategories fallback:", e.message);
    }
  }

  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      return JSON.parse(fs.readFileSync(CATEGORIES_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading project categories:", err);
  }
  return ["All", "Full Stack", "AI & Web", "Frontend"];
}

async function writeCategories(categories) {
  if (prisma) {
    try {
      await prisma.systemData.upsert({
        where: { key: "project_categories" },
        create: { key: "project_categories", value: JSON.stringify(categories) },
        update: { value: JSON.stringify(categories) },
      });
    } catch (e) {
      console.warn("Prisma writeCategories fallback:", e.message);
    }
  }

  try {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing project categories:", err);
  }
}

export async function GET() {
  try {
    const projects = await getProjects();
    const categories = await readCategories();
    return NextResponse.json({ projects, categories });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.action === "add") {
      const newProject = await addProject(body.project);
      const projects = await getProjects();
      const categories = await readCategories();
      return NextResponse.json({ success: true, project: newProject, projects, categories });
    }

    if (body.action === "update") {
      await updateProject(body.id, body.project);
      const projects = await getProjects();
      const categories = await readCategories();
      return NextResponse.json({ success: true, projects, categories });
    }

    if (body.action === "delete") {
      await deleteProject(body.id);
      const projects = await getProjects();
      const categories = await readCategories();
      return NextResponse.json({ success: true, projects, categories });
    }

    if (body.action === "add_category") {
      const current = await readCategories();
      const trimmed = body.category?.trim();
      if (trimmed && !current.includes(trimmed)) {
        current.push(trimmed);
        await writeCategories(current);
      }
      return NextResponse.json({ success: true, categories: current });
    }

    if (body.action === "delete_category") {
      const current = await readCategories();
      const filtered = current.filter((c) => c !== body.category && c !== "All");
      const finalCats = ["All", ...filtered.filter((c) => c !== "All")];
      await writeCategories(finalCats);
      return NextResponse.json({ success: true, categories: finalCats });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
