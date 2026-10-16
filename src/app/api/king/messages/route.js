import { NextResponse } from 'next/server';
import { getMessages, markMessageRead, deleteMessage } from '@/lib/data';

export async function GET() {
  try {
    const messages = await getMessages();
    return NextResponse.json({ messages });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.action === 'mark_read') {
      const messages = await markMessageRead(body.id);
      return NextResponse.json({ success: true, messages });
    }

    if (body.action === 'delete') {
      const messages = await deleteMessage(body.id);
      return NextResponse.json({ success: true, messages });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
