import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialization: true,
        email: true,
      }
    });

    return NextResponse.json(doctors, { status: 200 });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}
