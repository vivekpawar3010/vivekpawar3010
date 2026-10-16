import { NextResponse } from 'next/server';
import { getTasks, addTask, updateTaskStatus, deleteTask } from '@/lib/data';

export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json({ tasks });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.action === 'add') {
      const newTask = await addTask({
        title: body.title,
        category: body.category,
        priority: body.priority,
        dueDate: body.dueDate,
      });
      const tasks = await getTasks();
      return NextResponse.json({ success: true, tasks, task: newTask });
    }

    if (body.action === 'update_status') {
      const tasks = await updateTaskStatus(body.id, body.status);
      return NextResponse.json({ success: true, tasks });
    }

    if (body.action === 'delete') {
      const tasks = await deleteTask(body.id);
      return NextResponse.json({ success: true, tasks });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
