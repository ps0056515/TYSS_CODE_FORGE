import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

type LLMProvider = "openai" | "claude" | "llama";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  llm?: LLMProvider;
  history?: ChatMessage[];
}

// ─── Resource Loading ─────────────────────────────────────────────────────────

function loadResources(): { filename: string; content: string }[] {
  const resourcesDir = path.join(process.cwd(), "resources");

  if (!fs.existsSync(resourcesDir)) {
    return [];
  }

  const supportedExtensions = [".md", ".txt", ".json", ".csv"];
  const files: { filename: string; content: string }[] = [];

  try {
    const entries = fs.readdirSync(resourcesDir, { recursive: true }) as string[];

    for (const entry of entries) {
      const fullPath = path.join(resourcesDir, entry);
      const stat = fs.statSync(fullPath);

      if (!stat.isFile()) continue;
      if (!supportedExtensions.includes(path.extname(entry).toLowerCase())) continue;

      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        files.push({ filename: entry, content });
      } catch {
        // skip unreadable files
      }
    }
  } catch {
    // skip if resources dir can't be read
  }

  return files;
}

// ─── Context Retrieval ────────────────────────────────────────────────────────

function findRelevantContext(query: string, resources: { filename: string; content: string }[]): string {
  if (resources.length === 0) {
    return "No resource files found. Please add .md or .txt files to the /resources folder.";
  }

  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  // Score each chunk (paragraph-level)
  const scored: { text: string; score: number; filename: string }[] = [];

  for (const { filename, content } of resources) {
    const paragraphs = content.split(/\n{2,}/);
    for (const para of paragraphs) {
      if (para.trim().length < 20) continue;

      const paraLower = para.toLowerCase();
      let score = 0;
      for (const word of queryWords) {
        const occurrences = (paraLower.match(new RegExp(word, "g")) || []).length;
        score += occurrences;
      }

      if (score > 0) {
        scored.push({ text: para.trim(), score, filename });
      }
    }
  }

  if (scored.length === 0) {
    // Return all resources as full context (capped)
    const allContent = resources
      .map((r) => `## ${r.filename}\n\n${r.content}`)
      .join("\n\n---\n\n");
    return allContent.slice(0, 6000);
  }

  // Sort by score descending and take top chunks
  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, 8);

  return topChunks
    .map((c) => `[From: ${c.filename}]\n${c.text}`)
    .join("\n\n---\n\n");
}

// ─── LLM Callers ─────────────────────────────────────────────────────────────

async function callOpenAI(
  messages: { role: string; content: string }[],
  apiKey: string
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 800,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "No response from OpenAI.";
}

async function callClaude(
  messages: { role: string; content: string }[],
  apiKey: string
): Promise<string> {
  // Extract system message and user/assistant messages
  const systemMsg = messages.find((m) => m.role === "system")?.content ?? "";
  const conversationMsgs = messages.filter((m) => m.role !== "system");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 800,
      system: systemMsg,
      messages: conversationMsgs,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? "No response from Claude.";
}

async function callLlama(
  messages: { role: string; content: string }[],
  apiKey: string
): Promise<string> {
  // Using Groq API (OpenAI-compatible) with Llama 3
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages,
      max_tokens: 800,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq/Llama API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "No response from Llama.";
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, llm = "openai", history = [] } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // Load resources and find relevant context
    const resources = loadResources();
    const context = findRelevantContext(message, resources);

    // Build system prompt
    const systemPrompt = `You are a helpful Q&A assistant for the CodeForge coding platform.
Answer questions based on the provided context from the knowledge base.
If the answer is not in the context, say so clearly and provide a helpful general answer.
Be concise, friendly, and accurate.

=== KNOWLEDGE BASE CONTEXT ===
${context}
=== END CONTEXT ===`;

    // Build messages array
    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6), // Keep last 6 messages for context
      { role: "user", content: message },
    ];

    let answer: string;

    switch (llm) {
      case "claude": {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set in environment variables.");
        answer = await callClaude(messages, apiKey);
        break;
      }

      case "llama": {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error("GROQ_API_KEY is not set in environment variables. Sign up at console.groq.com for free Llama access.");
        answer = await callLlama(messages, apiKey);
        break;
      }

      case "openai":
      default: {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error("OPENAI_API_KEY is not set in environment variables.");
        answer = await callOpenAI(messages, apiKey);
        break;
      }
    }

    return NextResponse.json({ answer, llm });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[chatbot]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// List available resource files
export async function GET() {
  const resources = loadResources();
  return NextResponse.json({
    files: resources.map((r) => r.filename),
    count: resources.length,
  });
}
