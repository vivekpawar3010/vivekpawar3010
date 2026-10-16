import { NextResponse } from 'next/server';
import { getProfile, updateProfile } from '@/lib/data';

export async function GET() {
  try {
    const profile = await getProfile();
    return NextResponse.json({ profile });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const updated = await updateProfile(body);
    return NextResponse.json({ success: true, profile: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
