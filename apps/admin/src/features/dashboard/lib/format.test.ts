import { describe, it, expect } from "vitest";
import { formatCompactNumber, formatCurrency, formatPercent, formatChangeRate } from "./format";

describe("formatCompactNumber", () => {
  it("formats thousands as K", () => {
    expect(formatCompactNumber(12400)).toBe("12.4K");
  });
  it("formats millions as M", () => {
    expect(formatCompactNumber(1500000)).toBe("1.5M");
  });
  it("formats small numbers as-is", () => {
    expect(formatCompactNumber(999)).toBe("999");
  });
});

describe("formatCurrency", () => {
  it("formats with dollar sign and compact notation", () => {
    expect(formatCurrency(24500)).toBe("$24.5K");
  });
  it("formats small amounts without compact", () => {
    expect(formatCurrency(500)).toBe("$500");
  });
});

describe("formatPercent", () => {
  it("formats percentage with one decimal", () => {
    expect(formatPercent(42.35)).toBe("42.4%");
  });
});

describe("formatChangeRate", () => {
  it("formats positive change with ▲", () => {
    expect(formatChangeRate(5.2, "percent")).toBe("▲ +5.2%");
  });
  it("formats negative change with ▼", () => {
    expect(formatChangeRate(-1.2, "pp")).toBe("▼ -1.2pp");
  });
  it("formats zero change with —", () => {
    expect(formatChangeRate(0, "percent")).toBe("— 0%");
  });
});
