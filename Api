import { NextResponse } from 'next/server';
import { getAiResponse } from '@/utils/getAiResponse';

export async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { success: false, error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const aiResponse = await getAiResponse(message.trim(), {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    return NextResponse.json({
      success: true,
      data: aiResponse
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Request timeout' },
        { status: 408 }
      );
    }

    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
