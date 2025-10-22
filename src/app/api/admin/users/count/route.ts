import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { verifyBasicAuth, createBasicAuthResponse } from '@utils/basicAuth';

export async function GET(request: Request) {
  try {
    // Check Basic Authentication
    if (!verifyBasicAuth(request as any)) {
      return createBasicAuthResponse();
    }
    // Check if user is admin
    // const isAdmin = await checkRole('admin');
    // if (!isAdmin) {
    //   return NextResponse.json(
    //     { 
    //       error: 'Unauthorized - Admin access required',
    //       success: false 
    //     },
    //     { status: 403 }
    //   );
    // }

    // Get the Clerk client
    const client = await clerkClient();
    
    // Get total users count (we only need the count, not the actual users)
    const response = await client.users.getUserList({
      limit: 1, // We only need the count, not the actual users
      offset: 0,
    });
    
    const totalUsers = response.totalCount || 0;
    
    return NextResponse.json({
      totalUsers,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching users count:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users count',
        success: false 
      },
      { status: 500 }
    );
  }
}
