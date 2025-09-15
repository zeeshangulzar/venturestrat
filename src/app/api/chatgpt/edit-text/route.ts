import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, selectedText, previousResponse } = await request.json();
    const isValidString = (value: unknown): value is string =>
      typeof value === 'string' && value.trim().length > 0;

    if (!isValidString(prompt) || !isValidString(selectedText)) {
      return NextResponse.json(
        { error: 'Prompt and selected text are required and must be non-empty strings' },
        { status: 400 }
      );
    }

    // Construct the full prompt for ChatGPT
    let fullPrompt = `You are an AI writing assistant. The user has selected the following text and wants to edit it: "${selectedText}"\n\n`;
    
    if (previousResponse) { fullPrompt += `Previous AI response: "${previousResponse}"\n\n`; }
    
    fullPrompt += `User's instruction: "${prompt}"\n\n`;
    fullPrompt += `Please provide an improved version of the selected text based on the user's instruction. Return only the edited text without any explanations or additional formatting.`;

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
            content: `You are a professional text editing assistant. Edit the provided text according to the user's instructions. Return only the edited text without any explanations or additional formatting.`
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.5,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      return NextResponse.json(
        { error: `Failed to generate AI response: ${errorData.error?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const data = await openaiResponse.json();
    let aiResponse = data.choices[0]?.message?.content?.trim();

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response generated from AI' },
        { status: 500 }
      );
    }

    // Remove surrounding quotes if present
    aiResponse = aiResponse.replace(/^["']|["']$/g, '');

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error in edit-text API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
