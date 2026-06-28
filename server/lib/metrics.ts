import client from "prom-client";

// Collect default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({
  prefix: "meshwork_",
  labels: { app: "meshwork-studio" },
});

// Custom Metrics

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status_code"],
});

export const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "path"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export const websocketConnectionsActive = new client.Gauge({
  name: "websocket_connections_active",
  help: "Number of currently active WebSocket connections",
});

export const websocketRoomsActive = new client.Gauge({
  name: "websocket_rooms_active",
  help: "Number of currently active WebSocket rooms (workspaces)",
});

export const aiChatRequestsTotal = new client.Counter({
  name: "ai_chat_requests_total",
  help: "Total number of AI chat requests",
  labelNames: ["provider", "model", "status"],
});

export const aiChatDurationSeconds = new client.Histogram({
  name: "ai_chat_duration_seconds",
  help: "Duration of AI chat generation in seconds",
  labelNames: ["provider"],
  buckets: [0.5, 1, 2, 5, 10, 20, 60],
});

export const metricsRegistry = client.register;
