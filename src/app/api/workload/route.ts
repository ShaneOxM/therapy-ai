import { NextResponse } from 'next/server';

export async function GET() {
  const workload = {
    clientsThisWeek: 15,
    totalClients: 20,
    notesToComplete: 3,
  };

  return NextResponse.json(workload);
}