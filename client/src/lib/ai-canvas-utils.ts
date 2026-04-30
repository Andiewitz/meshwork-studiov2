import type { Node, Edge } from "@xyflow/react";

/** Maps common AI hallucinations to valid Meshwork types */
const TYPE_ALIASES: Record<string, string> = {
  // database variants
  postgres: "database", postgresql: "database", mongo: "database",
  mongodb: "database", mysql: "database", dynamodb: "database",
  redis: "cache", elasticache: "cache", memcached: "cache",
  // gateway variants
  "api-gateway": "gateway", apigw: "gateway", "api_gateway": "gateway",
  nginx: "loadBalancer", alb: "loadBalancer", elb: "loadBalancer", haproxy: "loadBalancer",
  // compute
  lambda: "logic", "aws-lambda": "logic", "azure-function": "logic",
  service: "microservice", docker: "microservice", container: "microservice",
  // messaging
  kafka: "bus", kinesis: "bus", rabbitmq: "queue", sqs: "queue", celery: "queue",
  // storage
  s3: "storage", blob: "storage", gcs: "storage",
  // networking
  cloudfront: "cdn", fastly: "cdn", akamai: "cdn",
  // frontend
  react: "app", vue: "app", angular: "app", nextjs: "app", nuxt: "app",
  // text
  text: "annotation",
};

/** Exact sizes from dimensions.ts */
const NODE_SIZES: Record<string, { w: number; h: number }> = {
  server: { w: 168, h: 96 }, database: { w: 144, h: 120 },
  storage: { w: 144, h: 120 }, microservice: { w: 168, h: 72 },
  cache: { w: 144, h: 120 }, worker: { w: 168, h: 72 },
  logic: { w: 120, h: 72 }, user: { w: 96, h: 96 },
  app: { w: 168, h: 72 }, search: { w: 144, h: 120 },
  gateway: { w: 192, h: 72 }, loadBalancer: { w: 192, h: 72 },
  cdn: { w: 192, h: 72 }, bus: { w: 192, h: 72 },
  queue: { w: 192, h: 72 }, route53: { w: 192, h: 72 },
  nats: { w: 192, h: 72 }, socketio: { w: 144, h: 72 },
  github_actions: { w: 168, h: 72 }, jenkins: { w: 168, h: 72 },
  gitlab: { w: 168, h: 72 }, argocd: { w: 168, h: 72 },
  vault: { w: 168, h: 72 }, auth0: { w: 168, h: 72 },
  waf: { w: 168, h: 72 }, prometheus: { w: 168, h: 72 },
  grafana: { w: 168, h: 72 }, datadog: { w: 168, h: 72 },
  stripe: { w: 168, h: 72 }, twilio: { w: 168, h: 72 },
  shopify: { w: 168, h: 72 }, annotation: { w: 160, h: 48 },
  note: { w: 192, h: 192 }, vpc: { w: 408, h: 312 },
  region: { w: 600, h: 408 }, "k8s-namespace": { w: 408, h: 312 },
  "k8s-pod": { w: 144, h: 96 }, "k8s-deployment": { w: 192, h: 96 },
  "k8s-service": { w: 168, h: 72 }, "k8s-ingress": { w: 168, h: 72 },
  "k8s-configmap": { w: 168, h: 72 }, "k8s-secret": { w: 168, h: 72 },
  "k8s-pvc": { w: 168, h: 96 }, "k8s-job": { w: 144, h: 72 },
  "k8s-cronjob": { w: 168, h: 96 }, "k8s-hpa": { w: 168, h: 96 },
  influxdb: { w: 144, h: 120 }, snowflake: { w: 144, h: 120 },
  clickhouse: { w: 144, h: 120 }, api: { w: 168, h: 72 },
};

const VALID_TYPES = new Set(Object.keys(NODE_SIZES));

export function validateAndRepairCanvas(raw: any): { nodes: Node[]; edges: Edge[] } | null {
  if (!raw || !Array.isArray(raw.nodes) || !Array.isArray(raw.edges)) return null;

  const seenIds = new Set<string>();

  const nodes: Node[] = raw.nodes.map((n: any, i: number) => {
    // Resolve type alias
    let type = (n.type || "server") as string;
    if (TYPE_ALIASES[type.toLowerCase()]) type = TYPE_ALIASES[type.toLowerCase()];
    if (!VALID_TYPES.has(type)) type = "server"; // last resort fallback

    // Enforce correct size
    const dim = NODE_SIZES[type] || { w: 168, h: 72 };
    const existingW = n.style?.width;
    const existingH = n.style?.height;
    const width = typeof existingW === "number" && existingW >= 48 ? existingW : dim.w;
    const height = typeof existingH === "number" && existingH >= 24 ? existingH : dim.h;

    // Deduplicate IDs
    let id = n.id || `node-${i}`;
    if (seenIds.has(id)) id = `${id}-${i}`;
    seenIds.add(id);

    // Ensure position exists and is on-screen
    const x = typeof n.position?.x === "number" ? n.position.x : i * 220 + 100;
    const y = typeof n.position?.y === "number" ? n.position.y : 100;

    return {
      id,
      type,
      position: { x, y },
      data: {
        label: n.data?.label || type,
        category: n.data?.category || "Compute",
        ...(n.data?.provider ? { provider: n.data.provider } : {}),
        ...(n.data?.accentColor ? { accentColor: n.data.accentColor } : {}),
        ...(n.data?.note ? { note: n.data.note } : {}),
      },
      style: { width, height },
      ...(n.parentId ? { parentId: n.parentId, extent: "parent" as const } : {}),
    };
  });

  const nodeIds = new Set(nodes.map((n) => n.id));

  const edges: Edge[] = raw.edges
    .filter((e: any) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e: any, i: number) => {
      const hasDash = e.style?.strokeDasharray;
      const hasArrow = e.markerEnd != null;
      return {
        id: e.id || `edge-${i}`,
        source: e.source,
        target: e.target,
        type: e.type || "smoothstep",
        style: {
          stroke: e.style?.stroke || "#555",
          strokeWidth: e.style?.strokeWidth || 1.5,
          ...(hasDash ? { strokeDasharray: e.style.strokeDasharray } : {}),
        },
        ...(hasArrow ? { markerEnd: { type: "arrowclosed", color: e.style?.stroke || "#555" } } : {}),
        ...(e.label ? { label: e.label, labelStyle: { fill: "#888", fontSize: 11 } } : {}),
      };
    });

  return { nodes, edges };
}
