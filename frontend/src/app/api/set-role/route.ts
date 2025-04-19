import { NextResponse } from 'next/server';
import { auth, clerkClient as getClerkClient } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  // Await auth() as indicated by linter
  const authResult = await auth();
  const userId = authResult.userId;

  if (!userId) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { role } = await request.json();

    // Validate the role
    if (role !== 'doctor' && role !== 'patient') {
      return new NextResponse(JSON.stringify({ error: 'Invalid role specified' }), { status: 400 });
    }

    // Await or call clerkClient if it's a function returning a promise
    const clerkClient = await getClerkClient(); // Assuming it might be a promise/function
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
      },
    });

    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("Error updating user metadata:", error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
