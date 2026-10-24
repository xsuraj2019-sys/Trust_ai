export const dynamic = 'force-dynamic';  import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Msg {
  role: 'user' | 'assistant';
  text: striCheckerexport async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 });

    const body = await req.json().catch(() => ({}));
    const message: string = String(body?.message ?? '').trim();
    const userName: string = String(body?.userName ?? 'friend').slice(0, 40);
    const history: Msg[] = Array.isArray(body?.history) ? body.history.slice(-12) : [];

    if (!message) return NextResponse.json({ error: 'Message is required.' }, { status: 400 });

    const system = `You are TrustAI, a warm, friendly digital-safety companion.
The user's name is "${userName}". Occasionally (not every time) address them by name.
Your mission: help them spot scams, phishing, misinformation, and stay digitally safe.
Guidelines:
- Keep answers concise (2-5 sentences) unless the user asks for more detail.
- If they paste a suspicious message, give clear red flags and next steps.
- Never invent facts. If unsure, say so and suggest where to verify.
- Be supportive, human, and never preachy.
- If a question is off-topic, gently steer back to digital safety.`;

    const convo = history.map((m) => `${m.role === 'user' ? 'User' : 'TrustAI'}: ${m.text}`).join('\n');
    const prompt = `${system}
${convo ? `Conversation so far:\n${convo}\n` : ''}User: ${message}
TrustAI:`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
    });

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim() || "I'm here! What would you like to check today?";

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Chat failed.';
    console.error('[chat] error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
