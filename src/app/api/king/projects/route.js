import { NextResponse } from 'next/server';
import { getProjects, addProject, updateProject, deleteProject } from '@/lib/data';

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json({ projects });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.action === 'add') {
      const newProject = await addProject(body.project);
      const projects = await getProjects();
      return NextResponse.json({ success: true, project: newProject, projects });
    }

    if (body.action === 'update') {
      await updateProject(body.id, body.project);
      const projects = await getProjects();
      return NextResponse.json({ success: true, projects });
    }

    if (body.action === 'delete') {
      await deleteProject(body.id);
      const projects = await getProjects();
      return NextResponse.json({ success: true, projects });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
