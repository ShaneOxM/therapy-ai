import { NextResponse } from 'next/server';
import { getClients, addClient } from '@/utils/dataStorage';

export async function GET() {
  try {
    const clients = await getClients();
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error in GET /api/clients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const clientData = await request.json();
    const newClient = await addClient(clientData);
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/clients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}