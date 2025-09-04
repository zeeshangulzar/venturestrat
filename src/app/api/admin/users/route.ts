import { NextResponse } from 'next/server';
import { checkRole } from '@utils/roles';
import { getApiUrl } from '@lib/api';

export async function GET(request: Request) {
  try {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required', success: false },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Build query parameters for backend API
    const backendParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
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
    const users = backendData.map((user: any) => ({
      id: user.id,
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      role: user.role,
      onboardingComplete: user.onboardingComplete,
      publicMetaData: user.publicMetaData,
      createdAt: new Date(user.createdAt).getTime(), // Convert to timestamp for compatibility
      banned: false, // Backend doesn't have banned status
      locked: false, // Backend doesn't have locked status
    }));

    return NextResponse.json({
      users,
      total: users.length, // Backend might not return total count, using current page length
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
