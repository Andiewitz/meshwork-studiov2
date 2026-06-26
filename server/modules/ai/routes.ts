import { Router, Request, Response } from "express";
import { createChildLogger } from "../../lib/logger";
import { isAuthenticated } from "../auth/authCore";
import { createApiKey, deleteApiKey, getUserApiKeys, toggleKeyStatus, getApiKeyWithPlaintext, getActiveKeyForProvider } from "./db";
import { validateKeyFormat } from "./encryption";

const log = createChildLogger("ai");
const router = Router();

/**
 * GET /api/ai/keys
 * List all API keys for the current user (returns hints only, never full keys)
 */
router.get("/keys", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const keys = await getUserApiKeys(userId);
    
    // Return keys without encrypted data
    res.json(keys.map(key => ({
      id: key.id,
      provider: key.provider,
      keyHint: key.keyHint,
      isActive: key.isActive,
      createdAt: key.createdAt,
    })));
  } catch (error) {
    log.error({ err: error }, "Failed to list keys");
    res.status(500).json({ error: "Failed to retrieve API keys" });
  }
});

/**
 * POST /api/ai/keys
 * Add a new API key (encrypted and stored)
 */
router.post("/keys", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { provider, apiKey } = req.body;
    
    // Validate input
    if (!provider || !apiKey) {
      return res.status(400).json({ error: "Provider and apiKey are required" });
    }
    
    // Validate key format
    if (!validateKeyFormat(provider, apiKey)) {
      return res.status(400).json({ 
        error: `Invalid API key format for ${provider}` 
      });
    }
    
    // Create encrypted key
    const key = await createApiKey({ userId, provider, apiKey });
    
    res.status(201).json({
      id: key.id,
      provider: key.provider,
      keyHint: key.keyHint,
      isActive: key.isActive,
      createdAt: key.createdAt,
    });
  } catch (error) {
    log.error({ err: error }, "Failed to create key");
    res.status(500).json({ error: "Failed to store API key" });
  }
});

/**
 * POST /api/ai/keys/test
 * Test an API key without storing it
 */
router.post("/keys/test", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { provider, apiKey } = req.body;
    
    if (!provider || !apiKey) {
      return res.status(400).json({ error: "Provider and apiKey are required" });
    }
    
    // Validate format
    if (!validateKeyFormat(provider, apiKey)) {
      return res.status(400).json({ 
        error: `Invalid API key format for ${provider}` 
      });
    }
    
    // TODO: Actually test the key by making a small request to the provider
    // For now, just validate format
    
    res.json({ 
      valid: true, 
      message: "Key format is valid (actual API test not implemented yet)" 
    });
  } catch (error) {
    log.error({ err: error }, "Failed to test key");
    res.status(500).json({ error: "Failed to test API key" });
  }
});

/**
 * DELETE /api/ai/keys/:id
 * Delete an API key
 */
router.delete("/keys/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const keyId = req.params.id as string;
    
    const deleted = await deleteApiKey(userId, keyId);
    
    if (!deleted) {
      return res.status(404).json({ error: "API key not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    log.error({ err: error }, "Failed to delete key");
    res.status(500).json({ error: "Failed to delete API key" });
  }
});

/**
 * POST /api/ai/keys/:id/toggle
 * Toggle key active status
 */
router.post("/keys/:id/toggle", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const keyId = req.params.id as string;
    const { isActive } = req.body;
    
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive boolean is required" });
    }
    
    const key = await toggleKeyStatus(userId, keyId, isActive);
    
    if (!key) {
      return res.status(404).json({ error: "API key not found" });
    }
    
    res.json({
      id: key.id,
      provider: key.provider,
      keyHint: key.keyHint,
      isActive: key.isActive,
    });
  } catch (error) {
    log.error({ err: error }, "Failed to toggle key");
    res.status(500).json({ error: "Failed to update API key" });
  }
});

/**
 * POST /api/ai/chat
 * Proxy chat completion request to AI provider using user's stored key
 */
router.post("/chat", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { provider, model, messages, temperature, maxTokens, stream } = req.body;
    
    if (!provider || !model || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "provider, model, and messages are required" });
    }
    
    // Get user's API key for this provider
    let apiKey = "";
    
    // For openrouter, we check ENV first as a fallback for this test
    if (provider === "openrouter" && process.env.OPENROUTER_API_KEY) {
      apiKey = process.env.OPENROUTER_API_KEY.trim().replace(/^["']|["']$/g, '');
    } else {
      const activeKey = await getActiveKeyForProvider(userId, provider);
      
      if (!activeKey) {
        return res.status(404).json({ 
          error: `No API key found for provider: ${provider}. Please add a key in settings.` 
        });
      }
      
      const apiKeyRecord = await getApiKeyWithPlaintext(userId, activeKey.id);
      
      if (!apiKeyRecord) {
        return res.status(404).json({ 
          error: `Failed to retrieve API key details.` 
        });
      }
      
      apiKey = apiKeyRecord.plaintextKey;
    }
    
    // Route to appropriate provider
    if (provider === "openai") {
      const { createOpenAIChatCompletion } = await import("./providers/openai");
      
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        
        const { streamOpenAIChatCompletion } = await import("./providers/openai");
        const stream = streamOpenAIChatCompletion(apiKey, {
          model,
          messages,
          temperature,
          maxTokens,
          stream: true,
        });
        
        for await (const chunk of stream) {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
        
        res.write("data: [DONE]\n\n");
        res.end();
      } else {
        const response = await createOpenAIChatCompletion(apiKey, {
          model,
          messages,
          temperature,
          maxTokens,
          stream: false,
        });
        res.json(response);
      }
    } else if (provider === "anthropic") {
      const { createAnthropicChatCompletion, streamAnthropicChatCompletion } = await import("./providers/anthropic");
      
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        
        const stream = streamAnthropicChatCompletion(apiKey, {
          model,
          messages,
          temperature,
          maxTokens,
          stream: true,
        });
        
        for await (const chunk of stream) {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
        
        res.write("data: [DONE]\n\n");
        res.end();
      } else {
        const response = await createAnthropicChatCompletion(apiKey, {
          model,
          messages,
          temperature,
          maxTokens,
          stream: false,
        });
        
        const data = await response.json();
        res.json(data);
      }
    } else if (provider === "openrouter") {
      const { createOpenRouterChatCompletion, streamOpenRouterChatCompletion } = await import("./providers/openrouter");
      
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        
        const stream = streamOpenRouterChatCompletion(apiKey, {
          model,
          messages,
          temperature,
          maxTokens,
          stream: true,
        });
        
        for await (const chunk of stream) {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
        
        res.write("data: [DONE]\n\n");
        res.end();
      } else {
        const response = await createOpenRouterChatCompletion(apiKey, {
          model,
          messages,
          temperature,
          maxTokens,
          stream: false,
        });
        res.json(response);
      }
    } else {
      return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }
  } catch (error: any) {
    log.error({ err: error }, "Chat completion failed");
    res.status(500).json({ error: error.message || "Failed to complete chat request" });
  }
});

/**
 * POST /api/ai/suggestions
 * Generate contextual next-step suggestions based on the current canvas state.
 */
router.post("/suggestions", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { canvas } = req.body; // { nodes, edges }

    // Find the first active provider/key or check env
    let provider = "";
    let apiKey = "";
    let model = "";

    // 1. Check openrouter env first
    if (process.env.OPENROUTER_API_KEY) {
      provider = "openrouter";
      apiKey = process.env.OPENROUTER_API_KEY.trim().replace(/^["']|["']$/g, '');
      model = "gpt-oss-120b:free";
    } else {
      // 2. Otherwise find the first active key in user database
      const keys = await getUserApiKeys(userId);
      const activeKey = keys.find(k => k.isActive);
      
      if (!activeKey) {
        // Fallback gracefully to default suggestions if no key is configured
        return res.json([
          "Design a scalable Kubernetes microservices architecture",
          "Set up a high-availability Postgres cluster",
          "Build a serverless event-driven data pipeline",
          "Create a secure AWS VPC with public/private subnets"
        ]);
      }

      provider = activeKey.provider;
      const keyDetails = await getApiKeyWithPlaintext(userId, activeKey.id);
      if (!keyDetails) {
        return res.status(500).json({ error: "Failed to load API key details" });
      }
      apiKey = keyDetails.plaintextKey;
      
      // Select model based on provider
      if (provider === "openai") {
        model = "gpt-4o-mini";
      } else if (provider === "anthropic") {
        model = "claude-3-5-haiku-20241022";
      } else if (provider === "openrouter") {
        model = "gpt-oss-120b:free";
      } else {
        return res.status(400).json({ error: `Unsupported provider for suggestions: ${provider}` });
      }
    }

    const canvasNodes = canvas?.nodes || [];
    const canvasEdges = canvas?.edges || [];

    const prompt = `You are Mosh, the expert cloud architecture co-pilot for Meshwork Studio. 
Based on the current canvas state, generate 4 short, highly relevant, and actionable next-step suggestions or starter layout ideas for the user.

Current canvas contains:
- Nodes: ${JSON.stringify(canvasNodes.map((n: any) => ({ id: n.id, type: n.type, label: n.data?.label || n.type })))}
- Edges: ${JSON.stringify(canvasEdges.map((e: any) => ({ source: e.source, target: e.target })))}

Each suggestion MUST be extremely short (under 6 words).
Provide suggestions that represent logical additions, connections, security settings, or best practices for the current nodes.
If the canvas is empty, provide 4 starter template ideas (e.g. "Create a VPC with Subnets", "Deploy a microservice cluster", "Set up a serverless pipeline", "Design a 3-tier web app").

You MUST return ONLY a valid JSON array of strings, e.g.:
["Add a Redis cache", "Connect Gateway to Backend", "Set up VPC subnets", "Add a load balancer"]

Do NOT wrap the output in markdown code blocks like \`\`\`json. Return only the raw JSON.`;

    let responseText = "";

    if (provider === "openrouter") {
      const { createOpenRouterChatCompletion } = await import("./providers/openrouter");
      const response: any = await createOpenRouterChatCompletion(apiKey, {
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        maxTokens: 200,
        stream: false
      });
      responseText = response.choices?.[0]?.message?.content || "";
    } else if (provider === "openai") {
      const { createOpenAIChatCompletion } = await import("./providers/openai");
      const response: any = await createOpenAIChatCompletion(apiKey, {
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        maxTokens: 200,
        stream: false
      });
      responseText = response.choices?.[0]?.message?.content || "";
    } else if (provider === "anthropic") {
      const { createAnthropicChatCompletion } = await import("./providers/anthropic");
      const response = await createAnthropicChatCompletion(apiKey, {
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        maxTokens: 200,
        stream: false
      });
      const data = await response.json();
      responseText = data.content?.[0]?.text || "";
    }

    // Parse the response
    responseText = responseText.trim();
    
    // Clean up code blocks if the LLM returned them despite instructions
    const jsonMatch = responseText.match(/^(?:```(?:json)?\n)?([\s\S]*?)(?:\n```)?$/);
    if (jsonMatch) {
      responseText = jsonMatch[1].trim();
    }

    try {
      const suggestions = JSON.parse(responseText);
      if (Array.isArray(suggestions)) {
        return res.json(suggestions.slice(0, 4));
      }
      throw new Error("Response was not a JSON array");
    } catch (e) {
      log.warn({ response: responseText, err: e }, "Failed to parse suggestions response");
      // Fallback suggestions
      return res.json([
        "Design a scalable Kubernetes microservices architecture",
        "Set up a high-availability Postgres cluster",
        "Build a serverless event-driven data pipeline",
        "Create a secure AWS VPC with public/private subnets"
      ]);
    }
  } catch (error: any) {
    log.error({ err: error }, "Suggestions failed");
    // Return fallback suggestions on error rather than breaking the UI
    res.json([
      "Design a scalable Kubernetes microservices architecture",
      "Set up a high-availability Postgres cluster",
      "Build a serverless event-driven data pipeline",
      "Create a secure AWS VPC with public/private subnets"
    ]);
  }
});

/**
 * GET /api/ai/providers
 * List supported AI providers
 */
router.get("/providers", isAuthenticated, async (_req: Request, res: Response) => {
  res.json([
    { id: "openai", name: "OpenAI", models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"] },
    { id: "anthropic", name: "Anthropic", models: ["claude-3-5-sonnet", "claude-3-opus"] },
    { id: "google", name: "Google AI", models: ["gemini-pro"] },
    { id: "openrouter", name: "OpenRouter", models: ["meta-llama/llama-3-8b-instruct:free", "google/gemini-2.5-flash:free", "gpt-oss-120b:free", "gpt-oss-120b"] },
  ]);
});

export default router;
