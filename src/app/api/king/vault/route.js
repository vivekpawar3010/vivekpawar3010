import { NextResponse } from 'next/server';
import {
  getVaultNotes,
  saveVaultNote,
  deleteVaultNote,
  togglePinVaultNote,
} from '@/lib/data';

export async function GET() {
  try {
    const notes = await getVaultNotes();
    return NextResponse.json({ success: true, notes });
  } catch (err) {
    console.error('Error fetching vault notes:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, id, note } = body;

    let updatedNotes;

    if (action === 'delete') {
      if (!id) {
        return NextResponse.json({ error: 'Note ID is required for deletion.' }, { status: 400 });
      }
      updatedNotes = await deleteVaultNote(id);
    } else if (action === 'togglePin') {
      if (!id) {
        return NextResponse.json({ error: 'Note ID is required to toggle pin.' }, { status: 400 });
      }
      updatedNotes = await togglePinVaultNote(id);
    } else {
      // save or create
      const noteToSave = note || body;
      if (!noteToSave || (!noteToSave.title && !noteToSave.content)) {
        return NextResponse.json(
          { error: 'Note title or content is required.' },
          { status: 400 }
        );
      }
      updatedNotes = await saveVaultNote(noteToSave);
    }

    return NextResponse.json({ success: true, notes: updatedNotes });
  } catch (err) {
    console.error('Error modifying vault note:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
