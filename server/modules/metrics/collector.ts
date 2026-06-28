import client from "prom-client";
import { sql } from "drizzle-orm";
import { pool } from "./db";
import { metricsRegistry } from "../../lib/metrics";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("metrics-collector");

let previousRequests = 0;
let previousAiRequests = 0;
let collectorRunning = false;

function parsePrometheusValue(metrics: string, name: string): number {
  let total = 0;
  for (const line of metrics.split("\n")) {
    if (line.startsWith("#") || !line.trim()) continue;
    if (line.startsWith(name + "{")) {
      const match = line.match(/\}\s+([\d.eE+-]+)$/);
      if (match) total += parseFloat(match[1]);
    } else if (line.startsWith(name + " ")) {
      const match = line.match(/\s+([\d.eE+-]+)$/);
      if (match) total += parseFloat(match[1]);
    }
  }
  return total;
}

export async function snapshotMetrics() {
  try {
    const metrics = await metricsRegistry.metrics();

    const totalReqs = parsePrometheusValue(metrics, "http_requests_total");
    const requestRate = totalReqs - previousRequests;
    previousRequests = totalReqs;

    // Compute average duration from histogram
    let totalDuration = 0;
    let totalCount = 0;
    for (const line of metrics.split("\n")) {
      if (line.startsWith("http_request_duration_seconds_bucket")) {
        const bucketMatch = line.match(/le="([^"]+)"/);
        const countMatch = line.match(/\}\s+([\d.eE+-]+)$/);
        if (bucketMatch && countMatch) {
          totalCount += parseFloat(countMatch[1]);
        }
      } else if (line.startsWith("http_request_duration_seconds_sum")) {
        const match = line.match(/\s+([\d.eE+-]+)$/);
        if (match) totalDuration = parseFloat(match[1]);
      }
    }
    const avgDurationMs = totalCount > 0 ? (totalDuration / totalCount) * 1000 : 0;

    const memoryMb = parsePrometheusValue(metrics, "meshwork_process_resident_memory_bytes") / (1024 * 1024);
    const cpuSeconds = parsePrometheusValue(metrics, "meshwork_process_cpu_user_seconds_total");
    const eventLoopLagMs = parsePrometheusValue(metrics, "meshwork_eventloop_lag_seconds") * 1000;
    const wsConnections = parsePrometheusValue(metrics, "websocket_connections_active");
    const wsRooms = parsePrometheusValue(metrics, "websocket_rooms_active");

    const totalAi = parsePrometheusValue(metrics, "ai_chat_requests_total");
    const aiRate = totalAi - previousAiRequests;
    previousAiRequests = totalAi;

    // Query user/workspace/team counts from DB
    const counts = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE) as new_users_today,
        (SELECT COUNT(DISTINCT email) FROM login_attempts WHERE last_attempt >= NOW() - INTERVAL '24 hours') as active_users_24h,
        (SELECT COUNT(*) FROM login_attempts WHERE last_attempt >= CURRENT_DATE) as logins_today,
        (SELECT COUNT(*) FROM workspaces) as total_workspaces,
        (SELECT COUNT(*) FROM teams) as total_teams
    `);
    const c = counts.rows[0];

    await pool.query(
      `INSERT INTO metrics_snapshots
        (captured_at, total_requests, request_rate, avg_duration_ms, memory_mb, cpu_seconds, event_loop_lag_ms, ws_connections, ws_rooms, ai_requests, total_users, new_users_today, active_users_24h, logins_today, total_workspaces, total_teams)
       VALUES (NOW(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        totalReqs,
        requestRate,
        Math.round(avgDurationMs * 100) / 100,
        Math.round(memoryMb * 10) / 10,
        Math.round(cpuSeconds * 100) / 100,
        Math.round(eventLoopLagMs * 10) / 10,
        wsConnections,
        wsRooms,
        aiRate,
        c.total_users || 0,
        c.new_users_today || 0,
        c.active_users_24h || 0,
        c.logins_today || 0,
        c.total_workspaces || 0,
        c.total_teams || 0,
      ]
    );

    log.debug({ totalReqs, requestRate, totalUsers: c.total_users, activeUsers24h: c.active_users_24h }, "Metrics snapshot saved");
  } catch (err) {
    log.error({ err }, "Failed to snapshot metrics");
  }
}

export function startCollector(intervalMs = 30000) {
  if (collectorRunning) return;
  collectorRunning = true;

  // Take first snapshot after a short delay
  setTimeout(() => {
    snapshotMetrics();
    setInterval(snapshotMetrics, intervalMs);
  }, intervalMs);

  log.info({ intervalMs }, "Metrics collector started");
}
