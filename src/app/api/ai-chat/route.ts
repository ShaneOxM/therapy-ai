import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { encryptMessage, decryptMessage } from '@/utils/encryption';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const decryptedMessage = decryptMessage(message);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an AI assistant for therapists, helping them with case discussions, advice, and creating materials." },
        { role: "user", content: decryptedMessage }
      ],
    });

    const aiResponse = completion.choices[0].message?.content || 'I apologize, but I couldn\'t generate a response.';
    const encryptedResponse = encryptMessage(aiResponse);

    return NextResponse.json({ encryptedResponse });
  } catch (error) {
    console.error('Error in AI chat API:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}
