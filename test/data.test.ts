import { expect, test, describe } from "vitest";
import { incidents } from "../src/data/incidents";

describe("Simulated Data", () => {
  test("returns deterministic results", () => {
    const data = incidents["checkout-service"];
    expect(data).toBeDefined();
    expect(data.status.service).toBe("checkout-service");
    expect(data.logs.length).toBeGreaterThan(0);
    expect(data.metrics["error_rate"]).toBeDefined();
  });

  test("contains all three required scenarios", () => {
    expect(incidents["checkout-service"]).toBeDefined();
    expect(incidents["payment-service"]).toBeDefined();
    expect(incidents["order-service"]).toBeDefined();
  });
});
