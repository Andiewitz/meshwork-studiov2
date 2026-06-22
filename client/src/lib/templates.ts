export interface TemplateDefinition {
  id: string;
  title: string;
  description: string;
  category: "Featured" | "Cloud Architectures" | "Full-Stack" | "Data Pipelines";
  nodes: any[];
  edges: any[];
}

export const PRELOADED_TEMPLATES: TemplateDefinition[] = [
  // ==========================================
  // FEATURED
  // ==========================================
  {
    id: "modern-saas-stack",
    title: "Modern SaaS",
    description: "Full-stack template with Next.js frontend, FastAPI backend, Postgres, and Redis caching.",
    category: "Featured",
    nodes: [
      { id: "n1", type: "app", position: { x: 100, y: 200 }, data: { label: "Next.js Frontend", type: "app" } },
      { id: "n2", type: "gateway", position: { x: 350, y: 200 }, data: { label: "API Gateway", type: "gateway" } },
      { id: "n3", type: "microservice", position: { x: 600, y: 150 }, data: { label: "FastAPI Backend", type: "microservice" } },
      { id: "n4", type: "cache", position: { x: 850, y: 100 }, data: { label: "Redis Cache", type: "cache" } },
      { id: "n5", type: "database", position: { x: 850, y: 250 }, data: { label: "PostgreSQL", type: "database" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", animated: true },
      { id: "e2", source: "n2", target: "n3", animated: true },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n3", target: "n5" },
    ],
  },
  {
    id: "microservices-k8s",
    title: "K8s Microservice",
    description: "Highly scalable Kubernetes architecture with event streaming.",
    category: "Featured",
    nodes: [
      { id: "n1", type: "loadBalancer", position: { x: 100, y: 250 }, data: { label: "Load Balancer", type: "loadBalancer" } },
      { id: "n2", type: "k8s-service", position: { x: 300, y: 100 }, data: { label: "Auth Service", type: "k8s-service" } },
      { id: "n3", type: "k8s-service", position: { x: 300, y: 250 }, data: { label: "Order Service", type: "k8s-service" } },
      { id: "n4", type: "k8s-service", position: { x: 300, y: 400 }, data: { label: "Inventory Service", type: "k8s-service" } },
      { id: "n5", type: "bus", position: { x: 550, y: 250 }, data: { label: "Kafka Event Bus", type: "bus" } },
      { id: "n6", type: "database", position: { x: 800, y: 250 }, data: { label: "Primary DB", type: "database" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", animated: true },
      { id: "e2", source: "n1", target: "n3", animated: true },
      { id: "e3", source: "n1", target: "n4", animated: true },
      { id: "e4", source: "n2", target: "n5" },
      { id: "e5", source: "n3", target: "n5" },
      { id: "e6", source: "n4", target: "n5" },
      { id: "e7", source: "n5", target: "n6", animated: true },
    ],
  },
  {
    id: "data-lake-analytics",
    title: "Data Analytics",
    description: "Modern data stack using S3, Snowflake, and business intelligence tools.",
    category: "Featured",
    nodes: [
      { id: "n1", type: "api", position: { x: 100, y: 200 }, data: { label: "External Sources", type: "api" } },
      { id: "n2", type: "worker", position: { x: 350, y: 200 }, data: { label: "Airflow ELT", type: "worker" } },
      { id: "n3", type: "storage", position: { x: 600, y: 100 }, data: { label: "S3 Raw Data", type: "storage" } },
      { id: "n4", type: "snowflake", position: { x: 850, y: 200 }, data: { label: "Snowflake DWH", type: "snowflake" } },
      { id: "n5", type: "grafana", position: { x: 1100, y: 200 }, data: { label: "BI Dashboards", type: "grafana" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", animated: true },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4", animated: true },
      { id: "e4", source: "n4", target: "n5", animated: true },
    ],
  },

  // ==========================================
  // CLOUD ARCHITECTURES
  // ==========================================
  {
    id: "multi-region-vpc",
    title: "Multi-Region HA",
    description: "Deploy a highly available architecture across multiple regions with automatic failover.",
    category: "Cloud Architectures",
    nodes: [
      { id: "n1", type: "route53", position: { x: 100, y: 250 }, data: { label: "Global DNS", type: "route53" } },
      { id: "n2", type: "region", position: { x: 300, y: 100 }, data: { label: "US East (Primary)", type: "region" }, width: 300, height: 200 },
      { id: "n3", type: "region", position: { x: 300, y: 400 }, data: { label: "EU West (Failover)", type: "region" }, width: 300, height: 200 },
      { id: "n4", type: "loadBalancer", parentId: "n2", position: { x: 20, y: 50 }, data: { label: "ALB", type: "loadBalancer" } },
      { id: "n5", type: "server", parentId: "n2", position: { x: 150, y: 50 }, data: { label: "Auto Scaling Group", type: "server" } },
      { id: "n6", type: "database", parentId: "n2", position: { x: 150, y: 130 }, data: { label: "RDS Master", type: "database" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n4", animated: true },
      { id: "e2", source: "n4", target: "n5" },
      { id: "e3", source: "n5", target: "n6" },
      { id: "e4", source: "n1", target: "n3", animated: true, style: { strokeDasharray: "5,5" } },
    ],
  },
  {
    id: "serverless-api",
    title: "Serverless API",
    description: "Fully managed serverless API with Lambda functions and DynamoDB.",
    category: "Cloud Architectures",
    nodes: [
      { id: "n1", type: "user", position: { x: 100, y: 200 }, data: { label: "Client Apps", type: "user" } },
      { id: "n2", type: "gateway", position: { x: 300, y: 200 }, data: { label: "API Gateway", type: "gateway" } },
      { id: "n3", type: "logic", position: { x: 550, y: 100 }, data: { label: "Auth Lambda", type: "logic" } },
      { id: "n4", type: "logic", position: { x: 550, y: 300 }, data: { label: "Data Lambda", type: "logic" } },
      { id: "n5", type: "database", position: { x: 800, y: 200 }, data: { label: "DynamoDB", type: "database" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", animated: true },
      { id: "e2", source: "n2", target: "n3", animated: true },
      { id: "e3", source: "n2", target: "n4", animated: true },
      { id: "e4", source: "n3", target: "n5" },
      { id: "e5", source: "n4", target: "n5" },
    ],
  },
  {
    id: "event-driven",
    title: "Event Pipeline",
    description: "Serverless data pipeline using SQS, Lambda, and S3 with built-in monitoring.",
    category: "Cloud Architectures",
    nodes: [
      { id: "n1", type: "app", position: { x: 100, y: 200 }, data: { label: "Producer App", type: "app" } },
      { id: "n2", type: "queue", position: { x: 350, y: 200 }, data: { label: "SQS Queue", type: "queue" } },
      { id: "n3", type: "logic", position: { x: 600, y: 200 }, data: { label: "Processor Lambda", type: "logic" } },
      { id: "n4", type: "storage", position: { x: 850, y: 100 }, data: { label: "Processed Bucket", type: "storage" } },
      { id: "n5", type: "datadog", position: { x: 850, y: 300 }, data: { label: "Monitoring", type: "datadog" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", animated: true },
      { id: "e2", source: "n2", target: "n3", animated: true },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n3", target: "n5", style: { strokeDasharray: "5,5" } },
    ],
  },

  // ==========================================
  // FULL-STACK
  // ==========================================
  {
    id: "mern-stack",
    title: "MERN Stack",
    description: "Classic MongoDB, Express, React, Node.js full-stack application.",
    category: "Full-Stack",
    nodes: [
      { id: "n1", type: "user", position: { x: 100, y: 200 }, data: { label: "Browser Client", type: "user" } },
      { id: "n2", type: "app", position: { x: 350, y: 200 }, data: { label: "React SPA", type: "app" } },
      { id: "n3", type: "server", position: { x: 600, y: 200 }, data: { label: "Node.js + Express", type: "server" } },
      { id: "n4", type: "database", position: { x: 850, y: 200 }, data: { label: "MongoDB Atlas", type: "database" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3", animated: true },
      { id: "e3", source: "n3", target: "n4" },
    ],
  },
  {
    id: "jamstack-cms",
    title: "Jamstack CMS",
    description: "Modern static site generation paired with a headless CMS via CDN.",
    category: "Full-Stack",
    nodes: [
      { id: "n1", type: "cdn", position: { x: 100, y: 200 }, data: { label: "Cloudflare CDN", type: "cdn" } },
      { id: "n2", type: "app", position: { x: 350, y: 200 }, data: { label: "Static Frontend", type: "app" } },
      { id: "n3", type: "api", position: { x: 600, y: 100 }, data: { label: "Headless CMS", type: "api" } },
      { id: "n4", type: "github_actions", position: { x: 600, y: 300 }, data: { label: "CI/CD Build", type: "github_actions" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3", animated: true },
      { id: "e3", source: "n4", target: "n2", animated: true },
    ],
  },
  {
    id: "nextjs-app-router",
    title: "NextJS Auth0",
    description: "Next.js App Router with PostgreSQL database and Auth0 identity.",
    category: "Full-Stack",
    nodes: [
      { id: "n1", type: "user", position: { x: 100, y: 200 }, data: { label: "Web Client", type: "user" } },
      { id: "n2", type: "app", position: { x: 350, y: 200 }, data: { label: "Next.js App Router", type: "app" } },
      { id: "n3", type: "auth0", position: { x: 600, y: 100 }, data: { label: "Auth0 Identity", type: "auth0" } },
      { id: "n4", type: "database", position: { x: 600, y: 300 }, data: { label: "PostgreSQL DB", type: "database" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", animated: true },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n2", target: "n4", animated: true },
    ],
  },

  // ==========================================
  // DATA PIPELINES
  // ==========================================
  {
    id: "real-time-streaming",
    title: "Streaming Pipe",
    description: "High-throughput streaming pipeline using Kafka, Clickhouse, and Grafana.",
    category: "Data Pipelines",
    nodes: [
      { id: "n1", type: "api", position: { x: 100, y: 200 }, data: { label: "Telemetry API", type: "api" } },
      { id: "n2", type: "bus", position: { x: 350, y: 200 }, data: { label: "Apache Kafka", type: "bus" } },
      { id: "n3", type: "clickhouse", position: { x: 600, y: 200 }, data: { label: "Clickhouse DB", type: "clickhouse" } },
      { id: "n4", type: "grafana", position: { x: 850, y: 200 }, data: { label: "Grafana Dashboards", type: "grafana" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", animated: true },
      { id: "e2", source: "n2", target: "n3", animated: true },
      { id: "e3", source: "n3", target: "n4" },
    ],
  },
  {
    id: "batch-processing",
    title: "Batch Processing",
    description: "Daily batch processing pipeline pulling from S3 into Snowflake.",
    category: "Data Pipelines",
    nodes: [
      { id: "n1", type: "database", position: { x: 100, y: 200 }, data: { label: "App DB (MySQL)", type: "database" } },
      { id: "n2", type: "storage", position: { x: 350, y: 200 }, data: { label: "S3 Data Lake", type: "storage" } },
      { id: "n3", type: "worker", position: { x: 600, y: 200 }, data: { label: "Spark Cluster", type: "worker" } },
      { id: "n4", type: "snowflake", position: { x: 850, y: 200 }, data: { label: "Snowflake", type: "snowflake" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3", animated: true },
      { id: "e3", source: "n3", target: "n4", animated: true },
    ],
  },
  {
    id: "log-analytics",
    title: "Log Analytics",
    description: "Centralized logging with Elasticsearch and Kibana for fast operational insights.",
    category: "Data Pipelines",
    nodes: [
      { id: "n1", type: "microservice", position: { x: 100, y: 100 }, data: { label: "App Service 1", type: "microservice" } },
      { id: "n2", type: "microservice", position: { x: 100, y: 300 }, data: { label: "App Service 2", type: "microservice" } },
      { id: "n3", type: "worker", position: { x: 350, y: 200 }, data: { label: "Logstash/Vector", type: "worker" } },
      { id: "n4", type: "search", position: { x: 600, y: 200 }, data: { label: "Elasticsearch", type: "search" } },
      { id: "n5", type: "grafana", position: { x: 850, y: 200 }, data: { label: "Kibana", type: "grafana" } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n3", animated: true },
      { id: "e2", source: "n2", target: "n3", animated: true },
      { id: "e3", source: "n3", target: "n4", animated: true },
      { id: "e4", source: "n4", target: "n5" },
    ],
  },
];
