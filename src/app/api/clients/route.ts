import { NextResponse } from 'next/server';
import { searchClients, createClient } from '@/utils/healthLakeUtils';

export async function GET() {
  try {
    const clients = await searchClients();
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error in GET /api/clients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const clientData = await request.json();
    console.log('Received client data:', clientData);
    const newClient = await createClient(clientData);
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/clients:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}