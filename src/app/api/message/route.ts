import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@lib/api';

export async function POST(request: NextRequest) {
  try {
    const { userId, investorId, to, from, subject, body } = await request.json();

    if (!userId || !investorId || !to || !from || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure 'to' is an array
    const toArray = Array.isArray(to) ? to : [to];

    // Forward the request to the backend
    const backendResponse = await fetch(getApiUrl('/api/message'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        investorId,
        to: toArray,
        from,
        subject: subject || 'Partnership Opportunity', // Default subject if not provided
        body,
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to save message' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in message API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
