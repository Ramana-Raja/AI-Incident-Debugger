import type { IncidentData } from "./types";

const now = new Date().getTime();

function generateTimestamps(count: number, intervalMinutes: number) {
  return Array.from({ length: count }).map((_, i) => 
    new Date(now - (count - i) * intervalMinutes * 60000).toISOString()
  );
}

const timestamps = generateTimestamps(10, 5);

export const incidents: Record<string, IncidentData> = {
  "checkout-service": {
    status: { service: "checkout-service", state: "degraded", uptime: 99.9 },
    deployments: [
      { id: "dep-1", version: "v2.1.0", timestamp: timestamps[0], status: "success" }
    ],
    metrics: {
      "error_rate": timestamps.map((ts, i) => ({ timestamp: ts, value: i > 5 ? 0.05 + (i * 0.01) : 0.01 })),
      "connection_pool": timestamps.map((ts, i) => ({ timestamp: ts, value: i > 5 ? 100 : 40 })),
      "latency_p99": timestamps.map((ts, i) => ({ timestamp: ts, value: i > 5 ? 1200 : 150 }))
    },
    logs: [
      { timestamp: timestamps[6], severity: "warn", message: "Connection pool approaching capacity" },
      { timestamp: timestamps[7], severity: "error", message: "Timeout acquiring connection from pool" },
      { timestamp: timestamps[8], severity: "error", message: "Timeout acquiring connection from pool" },
      { timestamp: timestamps[9], severity: "error", message: "Timeout acquiring connection from pool - request aborted" }
    ]
  },
  "payment-service": {
    status: { service: "payment-service", state: "down", uptime: 95.5 },
    deployments: [
      { id: "dep-1", version: "v1.8.1", timestamp: timestamps[0], status: "success" },
      { id: "dep-2", version: "v1.8.2", timestamp: timestamps[6], status: "success" }
    ],
    metrics: {
      "error_rate": timestamps.map((ts, i) => ({ timestamp: ts, value: i >= 6 ? 0.8 : 0.01 })),
      "latency_p99": timestamps.map((ts, i) => ({ timestamp: ts, value: 200 })),
      "cpu_usage": timestamps.map((ts, i) => ({ timestamp: ts, value: 45 }))
    },
    logs: [
      { timestamp: timestamps[6], severity: "info", message: "Starting service payment-service v1.8.2" },
      { timestamp: timestamps[7], severity: "error", message: "Failed to load payment gateway provider plugin" },
      { timestamp: timestamps[8], severity: "error", message: "NullPointerException in GatewayLoader" },
      { timestamp: timestamps[9], severity: "error", message: "NullPointerException in GatewayLoader" }
    ]
  },
  "order-service": {
    status: { service: "order-service", state: "degraded", uptime: 98.2 },
    deployments: [
      { id: "dep-1", version: "v3.0.0", timestamp: timestamps[0], status: "success" }
    ],
    metrics: {
      "error_rate": timestamps.map((ts, i) => ({ timestamp: ts, value: i > 4 ? 0.3 : 0.01 })),
      "latency_p99": timestamps.map((ts, i) => ({ timestamp: ts, value: i > 4 ? 5000 : 200 })),
      "cpu_usage": timestamps.map((ts, i) => ({ timestamp: ts, value: 30 }))
    },
    logs: [
      { timestamp: timestamps[5], severity: "warn", message: "Upstream inventory-service taking too long to respond" },
      { timestamp: timestamps[6], severity: "error", message: "Timeout waiting for inventory-service" },
      { timestamp: timestamps[7], severity: "error", message: "Timeout waiting for inventory-service" },
      { timestamp: timestamps[8], severity: "warn", message: "Circuit breaker opened for inventory-service" },
      { timestamp: timestamps[9], severity: "error", message: "Request failed: Circuit breaker open" }
    ]
  }
};