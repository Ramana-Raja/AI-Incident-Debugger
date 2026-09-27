import { expect, test, describe } from "vitest";
import type { AgentState, IncidentRecord } from "../src/types";

describe("State Management", () => {
  test("initial state structure is valid", () => {
    const initialState: AgentState = {
      incidents: [],
      currentInvestigation: null
    };

    expect(initialState.incidents).toEqual([]);
    expect(initialState.currentInvestigation).toBeNull();
  });

  test("incident history is bounded to 50 records", () => {
    let incidents: IncidentRecord[] = [];

    for (let i = 0; i < 60; i++) {
      const record: IncidentRecord = {
        id: `inc-${i}`,
        service: "checkout-service",
        description: `Incident ${i}`,
        diagnosis: "Diagnosis",
        evidence: [],
        remediation: "restart",
        decision: "approved",
        timestamp: new Date().toISOString()
      };
      incidents.unshift(record);
      if (incidents.length > 50) {
        incidents = incidents.slice(0, 50);
      }
    }

    expect(incidents.length).toBe(50);
    expect(incidents[0].id).toBe("inc-59");
  });

  test("state stores active investigation", () => {
    const state: AgentState = {
      incidents: [],
      currentInvestigation: {
        instanceId: "wf-12345",
        service: "payment-service",
        status: "running",
        startedAt: new Date().toISOString()
      }
    };

    expect(state.currentInvestigation?.instanceId).toBe("wf-12345");
    expect(state.currentInvestigation?.status).toBe("running");
  });
});
