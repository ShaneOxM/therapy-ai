import { NextResponse } from 'next/server';

export async function GET() {
  const notes = [
    "Session summary for John Doe",
    "Treatment plan update for Jane Smith",
    "Progress notes for Alex Johnson",
  ];

  return NextResponse.json(notes);
}