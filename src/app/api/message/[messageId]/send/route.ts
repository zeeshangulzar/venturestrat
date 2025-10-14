import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@lib/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  console.log('🚀 NEXT.JS SEND ROUTE CALLED - POST /api/message/[messageId]/send');
  try {
    const { messageId } = await params;
    console.log('Message ID:', messageId);

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    console.log('✅ Send route is working, processing FormData...');

    // Parse FormData to handle attachments
    const formData = await request.formData();
    const attachmentsData = formData.get('attachments');
    
    let attachments = [];
    if (attachmentsData) {
      try {
        attachments = JSON.parse(attachmentsData as string);
      } catch (e) {
        console.error('Error parsing attachments:', e);
      }
    }

    console.log('=== FORWARDING TO BACKEND ===');
    console.log('Attachments being sent to backend:', attachments);

    // Create FormData for backend request
    const backendFormData = new FormData();
    
    // Add attachments to backend FormData
    for (let i = 0; i < 10; i++) { // Support up to 10 attachments
      const attachment = formData.get(`attachment_${i}`);
      if (attachment instanceof File) {
        backendFormData.append(`attachment_${i}`, attachment);
      }
    }
    
    // Add attachments metadata
    backendFormData.append('attachments', JSON.stringify(attachments));

    // Forward the request to the backend send endpoint /api/message/${email.id}/send
    const backendResponse = await fetch(getApiUrl(`/api/message/${messageId}/send`), {
      method: 'POST',
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to send message' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('🚨 ERROR IN NEXT.JS SEND ROUTE:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to send email', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
