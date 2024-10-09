import { NextResponse } from 'next/server';

export async function GET() {
  const insights = {
    trends: "Client improvement rate has increased by 15% this month.",
    predictions: "85% chance of positive outcomes for current treatment plans.",
  };

  return NextResponse.json(insights);
}