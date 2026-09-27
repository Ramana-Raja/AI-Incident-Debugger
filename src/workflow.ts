import { WorkflowEntrypoint, WorkflowStep, type WorkflowEvent } from "cloudflare:workers";
import type { InvestigationParams, InvestigationResult } from "./types";
import {
  queryLogs,
  queryMetrics,
  queryRecentDeployments,
  queryServiceStatus,
  applyRemediation
} from "./tools";

export class InvestigationWorkflow extends WorkflowEntrypoint<Env, InvestigationParams> {
  async run(event: WorkflowEvent<InvestigationParams>, step: WorkflowStep): Promise<InvestigationResult> {
    const { service, description } = event.payload;

    const parsedService = await step.do("parse-incident", { retries: { limit: 3, delay: "2 seconds", backoff: "exponential" } }, async () => {
      return service;
    });

    const logs = await step.do("search-logs", { retries: { limit: 3, delay: "2 seconds" } }, async () => {
      return queryLogs(parsedService, "1h");
    });

    const metricsError = await step.do("get-metrics-error", { retries: { limit: 3, delay: "2 seconds" } }, async () => {
      return queryMetrics(parsedService, "error_rate", "1h");
    });

    const metricsLatency = await step.do("get-metrics-latency", { retries: { limit: 3, delay: "2 seconds" } }, async () => {
      return queryMetrics(parsedService, "latency_p99", "1h");
    });

    const deployments = await step.do("check-deployments", { retries: { limit: 3, delay: "2 seconds" } }, async () => {
      return queryRecentDeployments(parsedService);
    });

    const status = await step.do("check-service-status", { retries: { limit: 3, delay: "2 seconds" } }, async () => {
      return queryServiceStatus(parsedService);
    });

    const evidence = await step.do("correlate-evidence", { retries: { limit: 3, delay: "2 seconds" } }, async () => {
      return [
        `Logs: ${JSON.stringify(logs).substring(0, 200)}`,
        `Error Metrics: ${JSON.stringify(metricsError).substring(0, 200)}`,
        `Latency Metrics: ${JSON.stringify(metricsLatency).substring(0, 200)}`,
        `Deployments: ${JSON.stringify(deployments).substring(0, 200)}`,
        `Status: ${JSON.stringify(status).substring(0, 200)}`
      ];
    });

    const diagnosis = await step.do("generate-diagnosis", { retries: { limit: 3, delay: "2 seconds" }, timeout: "2 minutes" }, async () => {
      const response = await this.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        prompt: `Diagnose the incident for ${parsedService}. Description: ${description}. Evidence: ${JSON.stringify(evidence)}`
      });
      return (response as { response?: string })?.response || String(response);
    });

    const remediation = await step.do("generate-remediation", { retries: { limit: 3, delay: "2 seconds" }, timeout: "2 minutes" }, async () => {
      const response = await this.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        prompt: `Suggest a remediation plan (choose from rollback, restart, scale_up, flush_connections, increase_pool_size) for ${parsedService} based on diagnosis: ${diagnosis}`
      });
      return (response as { response?: string })?.response || String(response);
    });

    const approval = await step.waitForEvent("await-approval", {
      type: "remediation-decision",
      timeout: "24 hours"
    });

    const payload = approval.payload as { approved?: boolean } | null;

    if (payload?.approved) {
      await step.do("execute-remediation", { retries: { limit: 3, delay: "2 seconds" } }, async () => {
        const actions = ["rollback", "restart", "scale_up", "flush_connections", "increase_pool_size"];
        const action = actions.find(a => remediation.toLowerCase().includes(a)) || "restart";
        return applyRemediation(parsedService, action);
      });

      await step.do("generate-report", { retries: { limit: 3, delay: "2 seconds" } }, async () => {
        return "Remediation executed successfully.";
      });

      return {
        diagnosis,
        evidence,
        remediation,
        status: "approved",
        timeline: []
      };
    } else {
      await step.do("generate-rejection-report", { retries: { limit: 3, delay: "2 seconds" } }, async () => {
        return "Remediation was rejected by the user.";
      });

      return {
        diagnosis,
        evidence,
        remediation,
        status: "rejected",
        timeline: []
      };
    }
  }
}
