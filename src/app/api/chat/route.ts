import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { content } = await request.json();

  // In a real application, you would send this message to an AI service and get a response
  // For now, we'll just echo back a simple response
  const response = `I've received your message: "${content}". How else can I assist you?`;

  return NextResponse.json({ response });
}