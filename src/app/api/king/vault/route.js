import { NextResponse } from 'next/server';
import {
  getVaultNotes,
  saveVaultNote,
  deleteVaultNote,
  togglePinVaultNote,
  getVaultFolders,
  createVaultFolder,
  renameVaultFolder,
  deleteVaultFolder,
  moveVaultNoteFolder,
} from '@/lib/data';

export async function GET() {
  try {
    const [notes, folders] = await Promise.all([
      getVaultNotes(),
      getVaultFolders(),
    ]);
    return NextResponse.json({ success: true, notes, folders });
  } catch (err) {
    console.error('Error fetching vault notes and folders:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, id, note, folderName, newFolderName, oldFolderName, color, description, moveToFolder, targetFolder } = body;

    // ── Folder Operations ──
    if (action === 'create_folder') {
      if (!folderName) {
        return NextResponse.json({ error: 'Folder name is required.' }, { status: 400 });
      }
      const folders = await createVaultFolder(folderName, color, description);
      const notes = await getVaultNotes();
      return NextResponse.json({ success: true, folders, notes });
    }

    if (action === 'rename_folder') {
      if (!oldFolderName || !newFolderName) {
        return NextResponse.json({ error: 'Old and new folder names are required.' }, { status: 400 });
      }
      const notes = await renameVaultFolder(oldFolderName, newFolderName);
      const folders = await getVaultFolders();
      return NextResponse.json({ success: true, folders, notes });
    }

    if (action === 'delete_folder') {
      if (!folderName) {
        return NextResponse.json({ error: 'Folder name is required.' }, { status: 400 });
      }
      const notes = await deleteVaultFolder(folderName, moveToFolder || 'General');
      const folders = await getVaultFolders();
      return NextResponse.json({ success: true, folders, notes });
    }

    if (action === 'move_note') {
      if (!id || !targetFolder) {
        return NextResponse.json({ error: 'Note ID and target folder are required.' }, { status: 400 });
      }
      const notes = await moveVaultNoteFolder(id, targetFolder);
      const folders = await getVaultFolders();
      return NextResponse.json({ success: true, notes, folders });
    }

    // ── Note Operations ──
    if (action === 'delete') {
      if (!id) {
        return NextResponse.json({ error: 'Note ID is required for deletion.' }, { status: 400 });
      }
      const notes = await deleteVaultNote(id);
      const folders = await getVaultFolders();
      return NextResponse.json({ success: true, notes, folders });
    }

    if (action === 'togglePin') {
      if (!id) {
        return NextResponse.json({ error: 'Note ID is required to toggle pin.' }, { status: 400 });
      }
      const notes = await togglePinVaultNote(id);
      const folders = await getVaultFolders();
      return NextResponse.json({ success: true, notes, folders });
    }

    // Save or create note
    const noteToSave = note || body;
    if (!noteToSave || (!noteToSave.title && !noteToSave.content)) {
      return NextResponse.json(
        { error: 'Note title or content is required.' },
        { status: 400 }
      );
    }
    const notes = await saveVaultNote(noteToSave);
    const folders = await getVaultFolders();
    return NextResponse.json({ success: true, notes, folders });
  } catch (err) {
    console.error('Error modifying vault:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
