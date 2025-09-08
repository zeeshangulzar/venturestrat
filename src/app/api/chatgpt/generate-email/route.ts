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
            content: 'You are a professional email writing assistant specializing in investor outreach emails. Write clear, concise, and professional emails that are personalized and engaging.'
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

    // Check if the response starts with "Subject:"
    if (trimmedContent.startsWith('Subject:')) {
      const lines = trimmedContent.split('\n');
      const subjectLine = lines[0];
      subject = subjectLine.replace('Subject:', '').trim();
      
      // Remove the subject line and any empty lines after it
      const bodyLines = lines.slice(1).filter((line: string) => line.trim() !== '');
      body = bodyLines.join('\n').trim();
    } else {
      // If no subject line, use a default subject and the entire content as body
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
