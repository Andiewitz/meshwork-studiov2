# Mosh (Meshwork AI) Architecture & Security

**Mosh** (formerly Meshwork AI) is the embedded cloud architecture co-pilot inside Meshwork Studio. It interprets natural language prompts and translates them directly into structural canvas modifications (ReactFlow nodes and edges) using state-of-the-art LLMs.

## 🏗️ System Architecture

Mosh operates on a **Bring Your Own Key (BYOK)** architecture by default, interfacing securely with providers like OpenRouter, OpenAI, Anthropic, and Google.

### Request Flow
1. **Frontend (ReactFlow):** 
   - User types a prompt into the `AiChatDrawer`.
   - The current canvas state (nodes, edges, dimensions) is serialized.
   - A `POST /api/ai/chat` request is fired containing the provider, model, message history, and the structural JSON of the current canvas.
2. **Backend (Express):**
   - **Authentication:** Validates the user session.
   - **Key Retrieval:** The system queries the `user_api_keys` table for an active key for the requested provider. If missing, it falls back to a global environment variable (e.g., `OPENROUTER_API_KEY`).
   - **Key Decryption:** If a user key is found, it is decrypted in memory using AES-256-GCM.
   - **Upstream Request:** The backend formats the system prompt and sends the request to the upstream LLM provider.
3. **Response Streaming (SSE):**
   - The backend streams the LLM response back to the client using Server-Sent Events (SSE).
   - The frontend parses the streaming Markdown. If the LLM generates a JSON code block with canvas modifications, it is intercepted and passed to the `canvas-utils` to automatically draw nodes and connections on the screen.

### 4. Resilience & Rate Limiting
Because external LLMs frequently rate limit or temporarily drop connections, Mosh implements a robust client-side retry mechanism:
- If a request fails (e.g., HTTP 429 Too Many Requests), the AI engine enters a retry loop with **exponential backoff** (e.g., waiting 2s, 4s, 8s).
- During generations, Mosh uses a "pseudo-node" (a visual loading indicator placed spatially on the canvas) to indicate where new architecture will appear, providing immediate feedback while the system retries requests in the background.

## 🔐 Security Model (BYOK)

Because users supply their own highly sensitive API keys (which can incur severe financial costs if leaked), Mosh employs a zero-trust, defense-in-depth storage model.

### 1. AES-256-GCM Encryption
API keys are never stored in plaintext. They are encrypted before database insertion using **AES-256-GCM**, an authenticated encryption algorithm.
- **Master Key:** The server requires an `ENCRYPTION_KEY` environment variable (32-byte Base64 string).
- **IV (Initialization Vector):** A cryptographically random 16-byte IV is generated *for every single encryption operation*.
- **Auth Tag:** GCM generates a 16-byte authentication tag ensuring the ciphertext cannot be tampered with.

### 2. Database Schema (`user_api_keys`)
When a key is stored, the database records:
- `encrypted_key`: The ciphertext (Base64)
- `iv`: The random initialization vector used (Base64)
- `auth_tag`: The GCM authentication tag (Base64)
- `key_hint`: Only the last 4 characters of the plaintext key (e.g., `...a1b2`) for UI identification.

### 3. In-Memory Decryption
Keys are decrypted strictly on-the-fly inside the `POST /api/ai/chat` request handler. 
- The plaintext key exists in Node.js RAM only for the duration of the external HTTP request.
- It is never logged, printed, or returned to the client.

## 🧠 System Prompt & Ground Truth

Mosh relies on a heavily engineered **System Prompt** to understand Meshwork Studio's proprietary node structure. 

### The Ground Truth Injector
Because node types, categories, and dimensions frequently update, the prompt dynamically injects `nodeTypesList` and `dimensions.ts` data at runtime. Mosh uses this to:
- Guarantee it only requests valid `type` strings (e.g., `genericNode`, `databaseNode`).
- Accurately calculate X/Y coordinates to prevent nodes from overlapping on the canvas.

### The Feedback Loop
Mosh has full context of the *current* canvas. When modifying an architecture, Mosh reads the existing JSON layout and calculates topological insertions, ensuring new services route correctly to existing API gateways or databases.
