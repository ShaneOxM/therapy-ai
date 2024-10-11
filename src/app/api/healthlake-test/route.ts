import { NextResponse } from 'next/server';
import { searchClients } from '@/utils/healthLakeUtils';

export async function GET() {
  try {
    console.log('Starting HealthLake test');
    const clients = await searchClients();
    console.log('HealthLake test completed');
    return NextResponse.json({ message: 'HealthLake test successful', clients });
  } catch (error) {
    console.error('HealthLake test failed:', error);
    return NextResponse.json({ error: 'HealthLake test failed' }, { status: 500 });
  }
}