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
      "HTTP-Referer": "http://localhost:5173", // Optional, for including your app on openrouter.ai rankings
      "X-Title": "Meshwork Studio", // Optional, shows in rankings
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
      "HTTP-Referer": "http://localhost:5173",
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
