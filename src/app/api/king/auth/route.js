import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { passcode } = await request.json();
    const serverPassword = process.env.KING_PASSWORD || 'king2026';

    if (!passcode) {
      return NextResponse.json(
        { success: false, error: 'Passcode is required to access the administrative deck.' },
        { status: 400 }
      );
    }

    if (passcode.trim() === serverPassword.trim()) {
      return NextResponse.json({
        success: true,
        message: 'Access granted. Welcome back, King.',
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Access denied: Invalid passcode. Please check your credentials and try again.',
      },
      { status: 401 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Authentication verification service temporarily unavailable.' },
      { status: 500 }
    );
  }
}
