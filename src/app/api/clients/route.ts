import { NextResponse } from 'next/server';

export async function GET() {
  const clients = [
    { name: "John Doe", nextSession: "Today, 3:00 PM" },
    { name: "Jane Smith", nextSession: "Tomorrow, 2:00 PM" },
    { name: "Alex Johnson", nextSession: "Friday, 11:00 AM" },
  ];

  return NextResponse.json(clients);
}