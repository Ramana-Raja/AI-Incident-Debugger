import { expect, test, describe } from "vitest";
import { searchLogs, getMetrics, getRecentDeployments, getServiceStatus, simulateRemediation } from "../src/tools";

describe("Agent Tools", () => {
  test("searchLogs returns logs for valid service", async () => {
    const result = await searchLogs.execute!({ service: "checkout-service", timeRange: "1h" }, { toolCallId: "1", messages: [] });
    expect(Array.isArray(result)).toBe(true);
  });

  test("searchLogs returns error for invalid service", async () => {
    const result = await searchLogs.execute!({ service: "unknown-service", timeRange: "1h" }, { toolCallId: "2", messages: [] });
    expect((result as any).error).toBeDefined();
  });

  test("getMetrics returns metrics for valid service", async () => {
    const result = await getMetrics.execute!({ service: "checkout-service", metric: "error_rate", timeRange: "1h" }, { toolCallId: "3", messages: [] });
    expect(Array.isArray(result)).toBe(true);
  });

  test("simulateRemediation updates simulated state", async () => {
    const result = await simulateRemediation.execute!({ service: "payment-service", action: "rollback" }, { toolCallId: "4", messages: [] });
    expect((result as any).success).toBe(true);
    
    // Check status reflects remediation
    const status = await getServiceStatus.execute!({ service: "payment-service" }, { toolCallId: "5", messages: [] });
    expect((status as any).state).toBe("healthy");
  });
});
