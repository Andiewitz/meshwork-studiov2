import OpenAI from "openai";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * Get the application URL for OpenRouter referer header.
 * Uses APP_URL or FRONTEND_URL env var, falling back to localhost for development.
 */
function getAppUrl(): string {
  return process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost:5173";
}

/**
 * OpenRouter Provider Handler
 * Makes requests to OpenRouter API
 */
export async function createOpenRouterChatCompletion(
  apiKey: string,
  request: ChatCompletionRequest
): Promise<ReadableStream | object> {
  const openai = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": getAppUrl(),
      "X-Title": "Meshwork Studio",
    },
  });

  const response = await openai.chat.completions.create({
    model: request.model,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens,
    stream: request.stream ?? false,
  });

  return response;
}

/**
 * OpenRouter Streaming Chat Completion
 */
export async function* streamOpenRouterChatCompletion(
  apiKey: string,
  request: ChatCompletionRequest
): AsyncGenerator<string, void, unknown> {
  const openai = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": getAppUrl(),
      "X-Title": "Meshwork Studio",
    },
  });

  const stream = await openai.chat.completions.create({
    model: request.model,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

/**
 * Validate an OpenRouter API key by querying the auth/key endpoint.
 * Returns true if the key is valid and has quota.
 */
export async function validateOpenRouterKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}

