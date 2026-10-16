import { NextResponse } from 'next/server';
import { getSkills, addSkill, deleteSkill } from '@/lib/data';

export async function GET() {
  try {
    const skills = await getSkills();
    return NextResponse.json({ skills });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.action === 'add') {
      const skills = await addSkill(body.category, {
        name: body.name,
        level: body.level || 'Intermediate',
        badge: body.badge || null,
      });
      return NextResponse.json({ success: true, skills });
    }

    if (body.action === 'delete') {
      const skills = await deleteSkill(body.category, body.name);
      return NextResponse.json({ success: true, skills });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
