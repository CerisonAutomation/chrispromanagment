/**
 * @fileoverview Structured telemetry — uptime, call counts, error rates, per-tool stats.
 * Logs to stderr in a structured line format; never touches stdout (MCP protocol channel).
 */

interface ToolStat {
  calls: number;
  errors: number;
  totalMs: number;
  lastCalledAt: number;
}

class Telemetry {
  private startTime = Date.now();
  private toolStats = new Map<string, ToolStat>();
  private totalCalls = 0;
  private totalErrors = 0;

  start(tool: string): () => void {
    const t0 = Date.now();
    return (isError = false) => {
      const ms = Date.now() - t0;
      this.totalCalls++;
      if (isError) this.totalErrors++;
      const stat = this.toolStats.get(tool) ?? { calls: 0, errors: 0, totalMs: 0, lastCalledAt: 0 };
      stat.calls++;
      if (isError) stat.errors++;
      stat.totalMs += ms;
      stat.lastCalledAt = Date.now();
      this.toolStats.set(tool, stat);
      const uptime = ((Date.now() - this.startTime) / 1000).toFixed(1);
      const status = isError ? "ERR" : "OK ";
      process.stderr.write(`[puck-mcp] ${uptime}s | ${status} | ${tool} | ${ms}ms\n`);
    };
  }

  snapshot() {
    const uptime = Date.now() - this.startTime;
    const tools: Record<string, { calls: number; errors: number; avgMs: number }> = {};
    for (const [name, s] of this.toolStats) {
      tools[name] = { calls: s.calls, errors: s.errors, avgMs: s.calls ? Math.round(s.totalMs / s.calls) : 0 };
    }
    return {
      uptimeMs: uptime,
      uptimeHuman: `${Math.floor(uptime / 3600000)}h ${Math.floor((uptime % 3600000) / 60000)}m ${Math.floor((uptime % 60000) / 1000)}s`,
      totalCalls: this.totalCalls,
      totalErrors: this.totalErrors,
      errorRate: this.totalCalls ? `${((this.totalErrors / this.totalCalls) * 100).toFixed(1)}%` : "0%",
      tools,
    };
  }
}

export const telemetry = new Telemetry();
