import type { Express, Request, Response } from "express";
import { pool } from "./db";
import { createMetricsTable } from "./db";
import { startCollector } from "./collector";
import { createChildLogger } from "../../lib/logger";

const log = createChildLogger("metrics-module");

export const MetricsModule = {
  async initialize(app: Express) {
    await createMetricsTable();
    startCollector(30000); // snapshot every 30s

    // Query stored metrics history
    app.get("/api/v1/metrics/history", async (req: Request, res: Response) => {
      try {
        const limit = Math.min(parseInt(req.query.limit as string) || 120, 1440);
        const result = await pool.query(
          `SELECT
             captured_at as "capturedAt",
             total_requests as "totalRequests",
             request_rate as "requestRate",
             avg_duration_ms as "avgDurationMs",
             memory_mb as "memoryMb",
             cpu_seconds as "cpuSeconds",
             event_loop_lag_ms as "eventLoopLagMs",
             ws_connections as "wsConnections",
             ws_rooms as "wsRooms",
             ai_requests as "aiRequests",
             total_users as "totalUsers",
             new_users_today as "newUsersToday",
             active_users_24h as "activeUsers24h",
             logins_today as "loginsToday",
             total_workspaces as "totalWorkspaces",
             total_teams as "totalTeams"
           FROM metrics_snapshots
           ORDER BY captured_at DESC
           LIMIT $1`,
          [limit]
        );
        res.json(result.rows.reverse()); // oldest first for charts
      } catch (err) {
        log.error({ err }, "Failed to query metrics history");
        res.status(500).json({ message: "Failed to query metrics history" });
      }
    });

    // Summary stats (latest snapshot + aggregates)
    app.get("/api/v1/metrics/summary", async (_req: Request, res: Response) => {
      try {
        const result = await pool.query(`
          SELECT
            (SELECT total_requests FROM metrics_snapshots ORDER BY captured_at DESC LIMIT 1) as "totalRequests",
            (SELECT SUM(request_rate) FROM metrics_snapshots WHERE captured_at > NOW() - INTERVAL '1 hour') as "requestsLastHour",
            (SELECT AVG(avg_duration_ms) FROM metrics_snapshots WHERE captured_at > NOW() - INTERVAL '1 hour') as "avgDurationLastHour",
            (SELECT AVG(memory_mb) FROM metrics_snapshots WHERE captured_at > NOW() - INTERVAL '1 hour') as "avgMemoryLastHour",
            (SELECT MAX(event_loop_lag_ms) FROM metrics_snapshots WHERE captured_at > NOW() - INTERVAL '1 hour') as "maxLagLastHour",
            (SELECT SUM(ai_requests) FROM metrics_snapshots WHERE captured_at > NOW() - INTERVAL '1 hour') as "aiRequestsLastHour",
            (SELECT COUNT(*) FROM metrics_snapshots) as "totalSnapshots",
            (SELECT MIN(captured_at) FROM metrics_snapshots) as "firstSnapshot",
            (SELECT MAX(captured_at) FROM metrics_snapshots) as "lastSnapshot",
            (SELECT total_users FROM metrics_snapshots ORDER BY captured_at DESC LIMIT 1) as "totalUsers",
            (SELECT new_users_today FROM metrics_snapshots ORDER BY captured_at DESC LIMIT 1) as "newUsersToday",
            (SELECT active_users_24h FROM metrics_snapshots ORDER BY captured_at DESC LIMIT 1) as "activeUsers24h",
            (SELECT logins_today FROM metrics_snapshots ORDER BY captured_at DESC LIMIT 1) as "loginsToday",
            (SELECT total_workspaces FROM metrics_snapshots ORDER BY captured_at DESC LIMIT 1) as "totalWorkspaces",
            (SELECT total_teams FROM metrics_snapshots ORDER BY captured_at DESC LIMIT 1) as "totalTeams"
        `);
        res.json(result.rows[0]);
      } catch (err) {
        log.error({ err }, "Failed to query metrics summary");
        res.status(500).json({ message: "Failed to query metrics summary" });
      }
    });

    // Cleanup old snapshots (keep last 7 days)
    app.post("/api/v1/metrics/cleanup", async (_req: Request, res: Response) => {
      try {
        const result = await pool.query(
          `DELETE FROM metrics_snapshots WHERE captured_at < NOW() - INTERVAL '7 days'`
        );
        res.json({ deleted: result.rowCount });
      } catch (err) {
        log.error({ err }, "Failed to cleanup metrics");
        res.status(500).json({ message: "Failed to cleanup metrics" });
      }
    });

    log.info("Metrics module initialized");
  },
};
