import { NextResponse } from "next/server";
import { getProjects, addProject, updateProject, deleteProject } from "@/lib/data";
import fs from "fs";
import path from "path";

const CATEGORIES_FILE = path.join(process.cwd(), "src", "data", "project_categories.json");

function readCategories() {
  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      return JSON.parse(fs.readFileSync(CATEGORIES_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading project categories:", err);
  }
  return ["All", "Full Stack", "AI & Web", "Frontend"];
}

function writeCategories(categories) {
  try {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing project categories:", err);
  }
}

export async function GET() {
  try {
    const projects = await getProjects();
    const categories = readCategories();
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
      const categories = readCategories();
      return NextResponse.json({ success: true, project: newProject, projects, categories });
    }

    if (body.action === "update") {
      await updateProject(body.id, body.project);
      const projects = await getProjects();
      const categories = readCategories();
      return NextResponse.json({ success: true, projects, categories });
    }

    if (body.action === "delete") {
      await deleteProject(body.id);
      const projects = await getProjects();
      const categories = readCategories();
      return NextResponse.json({ success: true, projects, categories });
    }

    if (body.action === "add_category") {
      const cat = (body.category || "").trim();
      if (!cat) return NextResponse.json({ error: "Category name required" }, { status: 400 });
      const current = readCategories();
      if (!current.includes(cat)) {
        current.push(cat);
        writeCategories(current);
      }
      return NextResponse.json({ success: true, categories: current });
    }

    if (body.action === "delete_category") {
      const cat = (body.category || "").trim();
      const current = readCategories().filter((c) => c !== cat && c !== "All");
      current.unshift("All");
      writeCategories(current);
      return NextResponse.json({ success: true, categories: current });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
