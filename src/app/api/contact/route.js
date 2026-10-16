import { NextResponse } from 'next/server';
import { addMessage } from '@/lib/data';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Please provide your name.' }, { status: 400 });
    }
    if (!email || !emailPattern.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid email address (e.g. name@example.com).' },
        { status: 400 }
      );
    }
    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please enter a message of at least 10 characters.' },
        { status: 400 }
      );
    }

    const saved = await addMessage({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been received successfully. Vivek will review it and get back to you soon.',
      id: saved.id,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Unable to deliver message right now. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
