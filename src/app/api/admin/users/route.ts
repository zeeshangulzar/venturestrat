import { NextResponse } from 'next/server';
import { getApiUrl } from '@lib/api';
import { verifyBasicAuth, createBasicAuthResponse } from '@utils/basicAuth';

export async function GET(request: Request) {
  try {
    // Check Basic Authentication
    if (!verifyBasicAuth(request as any)) {
      return createBasicAuthResponse();
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Build query parameters for backend API
    const backendParams = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(), // Backend expects 'limit' instead of 'pageSize'
    });
    
    if (search) {
      backendParams.append('search', search);
    }

    // Fetch users from backend API
    const backendResponse = await fetch(getApiUrl(`/api/users?${backendParams}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend API error: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();

    // Transform backend data to match frontend expectations
    const users = backendData.users.map((user: Record<string, unknown>) => ({
      id: user.id,
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      role: user.role,
      onboardingComplete: user.onboardingComplete,
      publicMetaData: user.publicMetaData,
      createdAt: new Date(user.createdAt as string).getTime(), // Convert to timestamp for compatibility
      banned: false, // Backend doesn't have banned status
      locked: false, // Backend doesn't have locked status
    }));

    return NextResponse.json({
      users,
      total: backendData.pagination.totalCount,
      pagination: backendData.pagination,
      success: true
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', success: false },
      { status: 500 }
    );
  }
}
