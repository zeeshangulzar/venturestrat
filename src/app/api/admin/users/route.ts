import { NextResponse } from 'next/server';
import { checkRole } from '@utils/roles';
import { clerkClient } from '@clerk/nextjs/server';

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

    const client = await clerkClient();
    const limit = pageSize;
    const offset = (Math.max(1, page) - 1) * pageSize;

    const resp = await client.users.getUserList({
      query: search || undefined,
      limit,
      offset,
      orderBy: '-created_at',
    });

    const users = resp.data.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddresses: user.emailAddresses,
      primaryEmailAddressId: user.primaryEmailAddressId,
      publicMetadata: user.publicMetadata,
      createdAt: user.createdAt,
      banned: user.banned,
      locked: user.locked
    }));

    return NextResponse.json({
      users,
      total: resp.totalCount,
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
