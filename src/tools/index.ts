import { tool } from "ai";
import { z } from "zod";
import { incidents } from "../data/incidents";
import type { LogEntry, MetricDataPoint, Deployment, ServiceStatus } from "../data/types";

const simulatedState: Record<string, { remediated: boolean; action: string }> = {};

export function queryLogs(service: string, _timeRange?: string, severity?: string, filter?: string): LogEntry[] | { error: string } {
  const data = incidents[service];
  if (!data) return { error: `Service ${service} not found.` };
  let logs = data.logs;
  if (severity) logs = logs.filter(l => l.severity === severity);
  if (filter) logs = logs.filter(l => l.message.includes(filter));
  return logs;
}

export function queryMetrics(service: string, metric: string, _timeRange?: string): MetricDataPoint[] | { error: string } {
  const data = incidents[service];
  if (!data) return { error: `Service ${service} not found.` };
  const metrics = data.metrics[metric];
  if (!metrics) return { error: `Metric ${metric} not available for ${service}.` };
  return metrics;
}

export function queryRecentDeployments(service: string): Deployment[] | { error: string } {
  const data = incidents[service];
  if (!data) return { error: `Service ${service} not found.` };
  return data.deployments;
}

export function queryServiceStatus(service: string): ServiceStatus | { error: string } {
  const data = incidents[service];
  if (!data) return { error: `Service ${service} not found.` };
  if (simulatedState[service]?.remediated) {
    return { service, state: "healthy", uptime: 100.0 };
  }
  return data.status;
}

export function applyRemediation(service: string, action: string) {
  const data = incidents[service];
  if (!data) return { error: `Service ${service} not found.` };

  simulatedState[service] = { remediated: true, action };

  return {
    success: true,
    message: `Successfully simulated ${action} on ${service}.`,
    beforeState: data.status.state,
    afterState: "healthy" as const
  };
}

export const searchLogs = tool({
  description: "Search logs for a specific service",
  inputSchema: z.object({
    service: z.string().describe("The name of the service to search logs for"),
    timeRange: z.enum(["1h", "6h", "24h"]).describe("Time range to search"),
    severity: z.enum(["error", "warn", "info"]).optional().describe("Filter by severity"),
    filter: z.string().optional().describe("Text filter to apply to log messages")
  }),
  execute: async ({ service, timeRange, severity, filter }) => {
    return queryLogs(service, timeRange, severity, filter);
  }
});

export const getMetrics = tool({
  description: "Get metrics for a specific service",
  inputSchema: z.object({
    service: z.string().describe("The name of the service"),
    metric: z.enum(["error_rate", "latency_p99", "cpu_usage", "memory_usage", "connection_pool", "request_rate"]).describe("The metric to retrieve"),
    timeRange: z.enum(["1h", "6h", "24h"]).describe("Time range")
  }),
  execute: async ({ service, metric, timeRange }) => {
    return queryMetrics(service, metric, timeRange);
  }
});

export const getRecentDeployments = tool({
  description: "Get recent deployments for a specific service",
  inputSchema: z.object({
    service: z.string().describe("The name of the service")
  }),
  execute: async ({ service }) => {
    return queryRecentDeployments(service);
  }
});

export const getServiceStatus = tool({
  description: "Get the current health status of a service",
  inputSchema: z.object({
    service: z.string().describe("The name of the service")
  }),
  execute: async ({ service }) => {
    return queryServiceStatus(service);
  }
});

export const simulateRemediation = tool({
  description: "Simulate a remediation action on a service",
  inputSchema: z.object({
    service: z.string().describe("The name of the service"),
    action: z.enum(["rollback", "restart", "scale_up", "flush_connections", "increase_pool_size"]).describe("The remediation action to simulate")
  }),
  execute: async ({ service, action }) => {
    return applyRemediation(service, action);
  }
});
