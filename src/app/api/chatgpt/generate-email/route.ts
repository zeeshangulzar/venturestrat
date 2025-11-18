import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, userId } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Validate subscription for AI draft
    if (userId) {
      const validationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'ai_draft' })
      });

      if (validationResponse.ok) {
        const validation = await validationResponse.json();
        if (!validation.allowed) {
          return NextResponse.json(
            { 
              error: 'Subscription limit reached',
              reason: validation.reason,
              currentUsage: validation.currentUsage,
              limits: validation.limits
            },
            { status: 403 }
          );
        }
      }
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional email writing assistant specializing in investor outreach emails. 

            IMPORTANT FORMATTING RULES:
            1. Start your response with "Subject: [Your Subject Here]" on the first line
            2. Do not skip this: Always insert <p><br></p> between paragraphs, without exception.
            3. Write the email body in HTML format with proper tags (e.g., <p>, <ul>, <li>, <strong>)
            4. Do not return Markdown - use HTML only
            5. The subject line should be compelling and professional
            6. The body should be well-structured with proper HTML formatting
            7. Always insert the empty <p><br></p> after the greeting ("Dear [Name],")
            8. Always insert the empty line before closing ("Best Regards")
            9. Use proper paragraph spacing - each paragraph should be wrapped in <p> tags
            10. After adding all bullet points please add a <p><br></p> before continuing the rest of the email
            11. Do not include a signature block; the platform will append one automatically.
            12. Do not use \\n characters within HTML content - use proper HTML tags instead
            13. End with a polite closing (e.g., "Best regards") even though you are not adding a signature yourself.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.5,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate email' },
        { status: 500 }
      );
    }

    const openaiData = await openaiResponse.json();
    const emailContent = openaiData.choices[0]?.message?.content;

    if (!emailContent) {
      return NextResponse.json(
        { error: 'No email content generated' },
        { status: 500 }
      );
    }

    // Parse subject and body from the response
    const trimmedContent = emailContent.trim();
    let subject = '';
    let body = '';

    // Check if the response contains "Subject:" (case insensitive)
    const subjectMatch = trimmedContent.match(/^Subject:\s*(.+)$/im);
    
    if (subjectMatch) {
      // Extract subject
      subject = subjectMatch[1].trim();
      
      // Remove the subject line from the content to get the body
      // Handle both plain text and HTML content
      if (trimmedContent.includes('<')) {
        // HTML content - remove the subject line while preserving HTML
        body = trimmedContent.replace(/^Subject:\s*.+$/im, '').trim();
        // Remove any leading empty lines or <br> tags
        body = body.replace(/^(\s*<br\s*\/?>\s*)+/, '').trim();
      } else {
        // Plain text content
        const lines = trimmedContent.split('\n');
        const bodyLines = lines.slice(1).filter((line: string) => line.trim() !== '');
        body = bodyLines.join('\n').trim();
      }
    } else {
      // If no subject line found, use a default subject and the entire content as body
      subject = 'Partnership Opportunity';
      body = trimmedContent;
    }

    // Track usage after successful generation
    if (userId) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, action: 'ai_draft' })
        });
      } catch (error) {
        console.error('Error tracking AI draft usage:', error);
      }
    }

    return NextResponse.json({
      subject: subject,
      body: body,
      emailContent: trimmedContent, // Keep the full content for backward compatibility
    });

  } catch (error) {
    console.error('Error in ChatGPT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
