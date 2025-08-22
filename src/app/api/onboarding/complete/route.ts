// app/api/onboarding/complete/route.ts
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return new NextResponse('Unauthorized', { status: 401 })

    const body = await request.json().catch(() => ({}))
    const { investmentFocus, investmentStage, location } = body ?? {}

    const client = await clerkClient()
    
    // First, get the current user to preserve existing metadata
    const currentUser = await client.users.getUser(userId)
    const updatedUser = await client.users.updateUser(userId, {
      privateMetadata: {
        ...currentUser.privateMetadata,
        onboardingComplete: true,
      },
      // Preserve existing publicMetadata and add new onboarding data
      publicMetadata: {
        ...currentUser.publicMetadata,
        investmentFocus: investmentFocus ?? '',
        investmentStage: investmentStage ?? '',
        location: location ?? '',
        onboardingComplete: true, // Also store here for redundancy
      },
    })

    return NextResponse.json({
      success: true,
      userId: updatedUser.id,
      metadata: updatedUser.publicMetadata,
      privateMetadata: updatedUser.privateMetadata,
    })
  } catch (error: unknown) {
    console.error('Onboarding API error:', error)
    
    let errorMessage = 'Unknown error';
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as { message: unknown }).message);
    }
    
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}