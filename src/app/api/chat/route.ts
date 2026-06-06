import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `You are NGO Assistant, a helpful AI for NGO India Hub — India's most comprehensive NGO directory with 234 verified NGOs across 15 categories and 22 states in India. You help users find NGOs, understand causes, learn about volunteering, internships, CSR partnerships, and donations. Be concise, warm, and helpful. Always guide users to search on the platform. Categories: Education, Healthcare, Women Empowerment, Child Welfare, Animal Welfare, Environment, Sanitation, Rural Development, Disaster Relief, Disability Support, Elderly Care, Hunger Relief, Human Rights, Skill Development, Mental Health. When users ask about specific NGOs or causes, suggest they use the search and filter features on the site.`;

/**
 * POST /api/chat
 * Body: { messages: [{ role: "user" | "assistant", content: string }] }
 * Returns: { reply: string }
 *
 * Uses Gemini with the system prompt above. The full conversation history is
 * replayed each call so the model has context.
 */
export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { reply: "The assistant isn't configured yet. Please try again later." },
      { status: 200 }
    );
  }

  let messages: ChatMessage[] = [];
  try {
    const body = (await request.json()) as { messages?: ChatMessage[] };
    messages = Array.isArray(body.messages) ? body.messages : [];
  } catch {
    return NextResponse.json({ reply: "Invalid request." }, { status: 400 });
  }

  // Gemini requires the conversation to start with a user turn. Drop any
  // leading assistant messages (e.g. the UI's auto-greeting).
  const firstUser = messages.findIndex((m) => m.role === "user");
  messages = firstUser === -1 ? [] : messages.slice(firstUser);

  if (messages.length === 0) {
    return NextResponse.json({ reply: "Ask me anything about NGOs in India!" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      // gemini-2.0-flash has no free-tier quota on the current key (429,
      // limit 0), so default to gemini-2.5-flash which does. Override with
      // GEMINI_MODEL to pin a specific model.
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // The Gemini chat API needs prior turns as `history` and the latest user
    // message sent separately. Map our roles to Gemini's ("assistant" -> "model").
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const latest = messages[messages.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(latest.content);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Gemini chat error:", err);
    return NextResponse.json(
      {
        reply:
          "Sorry, I ran into a problem answering that. Please try again in a moment.",
      },
      { status: 200 }
    );
  }
}
