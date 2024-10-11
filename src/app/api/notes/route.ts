import { NextResponse } from 'next/server';
import { createNote } from '@/utils/healthLakeUtils';

export async function POST(request: Request) {
  try {
    const { clientId, content } = await request.json();
    const newNote = await createNote(clientId, content);
    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/notes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  const notes = [
    "Session summary for John Doe",
    "Treatment plan update for Jane Smith",
    "Progress notes for Alex Johnson",
  ];

  return NextResponse.json(notes);
}