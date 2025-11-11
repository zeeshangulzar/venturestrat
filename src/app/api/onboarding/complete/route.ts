// app/api/onboarding/complete/route.ts
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define the type for onboarding metadata
interface OnboardingMetadata {
  firstName: string;
  lastName: string;
  companyName: string;
  position: string;
  siteUrl: string;
  userCountry: string;
  incorporationCountry: string;
  operationalRegions: string[];
  revenue: string;
  stages: string[];
  businessSectors: string[];
  currency: string;
  fundingCurrency: string;
  fundingAmount?: number;
  onboardingComplete?: boolean;
  [key: string]: unknown; // Allow other metadata properties
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return new NextResponse('Unauthorized', { status: 401 })

    const body = await request.json().catch(() => ({}))
    const { 
      firstName,
      lastName,
      companyName, 
      position,
      siteUrl,
      userCountry,
      incorporationCountry, 
      operationalRegions, 
      revenue, 
      stages, 
      businessSectors,
      currency,
      fundingCurrency,
      fundingAmount,
      isComplete = false // New flag to indicate if this is completion or just progress save
    } = body ?? {}

    const client = await clerkClient()
    
    // First, get the current user to preserve existing metadata
    const currentUser = await client.users.getUser(userId)
    
    // Prepare the metadata to save
    const metadataToSave: OnboardingMetadata = {
      ...currentUser.publicMetadata,
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      companyName: companyName ?? '',
      position: position ?? '',
      siteUrl: siteUrl ?? '',
      userCountry: userCountry ?? '',
      incorporationCountry: incorporationCountry ?? '',
      operationalRegions: operationalRegions ?? [],
      revenue: revenue ?? '',
      stages: stages ?? [],
      businessSectors: businessSectors ?? [],
      currency: currency ?? '',
      fundingCurrency: fundingCurrency ?? '',
      fundingAmount: fundingAmount ?? 0,
    }

    // Only mark as complete if this is the final submission
    if (isComplete) {
      metadataToSave.onboardingComplete = true;
    }

    const updatedUser = await client.users.updateUser(userId, {
      privateMetadata: {
        ...currentUser.privateMetadata,
        // Only mark as complete in private metadata if this is completion
        ...(isComplete && { onboardingComplete: true }),
      },
      publicMetadata: metadataToSave,
    })

    return NextResponse.json({
      success: true,
      userId: updatedUser.id,
      metadata: updatedUser.publicMetadata,
      privateMetadata: updatedUser.privateMetadata,
      isComplete: isComplete,
    })
  } catch (error: unknown) {
    console.error('Onboarding API error:', error)
    
    let errorMessage = 'Unknown error';
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as { message: unknown }).message);
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error', details: errorMessage },
      { status: 500 }
    )
  }
}
