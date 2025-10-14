import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Forward the request to the backend
    const backendResponse = await fetch(getApiUrl(`/api/message/${messageId}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch message' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in message fetch API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const { subject, body, to, cc, from } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    if (!subject && !body && !to && !cc && !from) {
      return NextResponse.json(
        { error: 'At least one field is required' },
        { status: 400 }
      );
    }

    // Process CC field - split by comma if it's a string
    const ccArray = cc ? (Array.isArray(cc) ? cc : cc.split(',').map((email: string) => email.trim()).filter((email: string) => email)) : undefined;

    // Forward the request to the backend
    const backendResponse = await fetch(getApiUrl(`/api/message/${messageId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject,
        body,
        to,
        cc: ccArray,
        from,
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to update message' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in message update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

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

    // Get the message from backend first
    const messageResponse = await fetch(getApiUrl(`/api/message/${messageId}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!messageResponse.ok) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    const message = await messageResponse.json();

    // Prepare email data with attachments
    const emailData = {
      to: Array.isArray(message.to) ? message.to : [message.to],
      ...(message.cc && message.cc.length > 0 && {
        cc: message.cc
      }),
      from: {
        email: 'info@venturestrat.ai',
        name: message.user.firstname + ' ' + message.user.lastname
      },
      replyTo: message.from,
      subject: message.subject,
      text: message.body,
      html: `
        <div>
          <div>
            ${message.body}
          </div>
        </div>
      `,
      // Add attachments if any
      ...(attachments.length > 0 && {
        attachments: await Promise.all(attachments.map(async (attachment: any, index: number) => {
          const file = formData.get(`attachment_${index}`);
          if (file instanceof File) {
            return {
              content: Buffer.from(await file.arrayBuffer()).toString('base64'),
              filename: attachment.name,
              type: attachment.type,
              disposition: 'attachment'
            };
          }
          return null;
        })).then(results => results.filter(Boolean))
      })
    };

    console.log('Email data with attachments:', JSON.stringify(emailData, null, 2));

    // Send email via SendGrid
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    await sgMail.send(emailData);

    // Update message status to SENT
    const updateResponse = await fetch(getApiUrl(`/api/message/${messageId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'SENT' }),
    });

    if (!updateResponse.ok) {
      console.error('Failed to update message status');
    }

    return NextResponse.json({
      message: 'Email sent successfully with attachments',
      data: { status: 'SENT' }
    });

  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
