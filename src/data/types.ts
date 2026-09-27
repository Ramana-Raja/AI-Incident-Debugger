export interface LogEntry {
  timestamp: string;
  severity: "error" | "warn" | "info";
  message: string;
}

export interface MetricDataPoint {
  timestamp: string;
  value: number;
}

export interface Deployment {
  id: string;
  version: string;
  timestamp: string;
  status: "success" | "failed" | "in_progress";
}

export interface ServiceStatus {
  service: string;
  state: "healthy" | "degraded" | "down";
  uptime: number;
}

export interface IncidentData {
  logs: LogEntry[];
  metrics: Record<string, MetricDataPoint[]>;
  deployments: Deployment[];
  status: ServiceStatus;
}