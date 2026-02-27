import { NextResponse } from 'next/server';
import { calculateBelief } from '@/lib/calculateBelief';

export async function GET() {
  try {
    const result = await calculateBelief();

    return NextResponse.json({
      status: 'updated',
      result,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error?.message || 'Unknown error',
    });
  }
}