import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
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
            2. Write the email body in HTML format with proper tags (e.g., <p>, <ul>, <li>, <strong>)
            3. Do not return Markdown - use HTML only
            4. The subject line should be compelling and professional
            5. The body should be well-structured with proper HTML formatting
            6. Always insert the empty <p><br></p> after the greeting ("Dear [Name],")
            7. Always insert the empty line before closing ("Best Regards")
            8. Use proper paragraph spacing - each paragraph should be wrapped in <p> tags
            9. Each paragraph separated by a single blank line <p><br></p>
            10. For signatures, use proper HTML structure with <p> tags.
            11. Make sure the each signature is wrapped in a seperate <p> without <br> tags
            12. Do not use \\n characters within HTML content - use proper HTML tags instead
            13. Ensure the signature is properly aligned with proper spacing
            14. Remove the phone number from the signature`
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
