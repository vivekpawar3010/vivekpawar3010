import { NextResponse } from 'next/server';
import {
  getTasks,
  addTask,
  updateTaskStatus,
  deleteTask,
  checkInStreak,
  updateStreakGoal,
  evaluateSundayPoints,
  resetWeeklyPoints,
  getStreakEvaluations,
  seedCoreHabits,
  updateHabitMeta,
} from '@/lib/data';

export async function GET() {
  try {
    const tasks = await getTasks();
    const evaluations = await getStreakEvaluations();
    return NextResponse.json({ tasks, evaluations });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // 0. Seed or Reset the 5 Core Atomic Habits (From Notebook)
    if (body.action === 'seed_core_habits') {
      const tasks = await seedCoreHabits();
      return NextResponse.json({ success: true, tasks, message: '5 Core Habit Pillars seeded successfully!' });
    }

    // 1. Add Task (General or Streak with max 5 enforcement & custom fields)
    if (body.action === 'add') {
      try {
        const newTask = await addTask({
          title: body.title,
          category: body.category,
          priority: body.priority,
          dueDate: body.dueDate,
          goalDays: body.goalDays,
          dailyLog: body.dailyLog,
          fields: body.fields,
        });
        const tasks = await getTasks();
        return NextResponse.json({ success: true, tasks, task: newTask });
      } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
    }

    // 2. Check In Streak with dynamic fields, numbers done, topics list & daily log
    if (body.action === 'check_in') {
      if (!body.id) {
        return NextResponse.json({ error: 'Task ID is required for streak check-in.' }, { status: 400 });
      }
      const tasks = await checkInStreak(
        body.id,
        body.dailyLog,
        body.date,
        body.fieldValues,
        body.topics,
        body.numberDone,
        body.nextDayQueue,
        body.completedTopic
      );
      return NextResponse.json({ success: true, tasks });
    }

    // 3. Update Habit Metadata (topicsMasterList, nextDayQueue, timerMinutes)
    if (body.action === 'update_habit_meta') {
      if (!body.id) {
        return NextResponse.json({ error: 'Task ID is required to update habit metadata.' }, { status: 400 });
      }
      const tasks = await updateHabitMeta(body.id, body.meta || {});
      return NextResponse.json({ success: true, tasks });
    }

    // 4. Update Streak Goal Days
    if (body.action === 'update_goal') {
      if (!body.id || !body.goalDays) {
        return NextResponse.json({ error: 'Task ID and goal days required.' }, { status: 400 });
      }
      const tasks = await updateStreakGoal(body.id, body.goalDays);
      return NextResponse.json({ success: true, tasks });
    }

    // 5. Sunday Gemini AI Points Evaluation & Reset
    if (body.action === 'evaluate_sunday_points') {
      const result = await evaluateSundayPoints();
      return NextResponse.json({
        success: true,
        evaluation: result.evaluation,
        tasks: result.tasks,
      });
    }

    // 6. Reset Weekly Points to Zero
    if (body.action === 'reset_weekly_points') {
      const tasks = await resetWeeklyPoints();
      return NextResponse.json({ success: true, tasks });
    }

    // 7. Update Status (General workflow tasks)
    if (body.action === 'update_status') {
      const tasks = await updateTaskStatus(body.id, body.status);
      return NextResponse.json({ success: true, tasks });
    }

    // 8. Delete Task
    if (body.action === 'delete') {
      const tasks = await deleteTask(body.id);
      return NextResponse.json({ success: true, tasks });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
