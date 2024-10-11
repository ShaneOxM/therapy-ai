import { NextResponse } from 'next/server';
import { checkS3Status } from '@/utils/dataStorage';

export async function GET() {
  try {
    const isS3Connected = await checkS3Status();
    if (isS3Connected) {
      return NextResponse.json({ status: 'connected', message: 'Successfully connected to S3' });
    } else {
      return NextResponse.json({ status: 'error', message: 'Failed to connect to S3' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error checking S3 status:', error);
    return NextResponse.json({ status: 'error', message: 'An error occurred while checking S3 status' }, { status: 500 });
  }
}