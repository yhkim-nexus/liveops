import { describe, it, expect } from "vitest";
import { hasMinimumRole, getRequiredRole } from "./roles";

describe("hasMinimumRole", () => {
  it("admin has access to all roles", () => {
    expect(hasMinimumRole("admin", "admin")).toBe(true);
    expect(hasMinimumRole("admin", "operator")).toBe(true);
    expect(hasMinimumRole("admin", "viewer")).toBe(true);
  });
  it("operator has access to operator and viewer", () => {
    expect(hasMinimumRole("operator", "admin")).toBe(false);
    expect(hasMinimumRole("operator", "operator")).toBe(true);
    expect(hasMinimumRole("operator", "viewer")).toBe(true);
  });
  it("viewer only has access to viewer", () => {
    expect(hasMinimumRole("viewer", "admin")).toBe(false);
    expect(hasMinimumRole("viewer", "operator")).toBe(false);
    expect(hasMinimumRole("viewer", "viewer")).toBe(true);
  });
});

describe("getRequiredRole", () => {
  it("returns null for public routes", () => {
    expect(getRequiredRole("/login")).toBeNull();
    expect(getRequiredRole("/api/auth/login")).toBeNull();
  });
  it("returns viewer for dashboard", () => {
    expect(getRequiredRole("/dashboard")).toBe("viewer");
  });
  it("returns operator for events", () => {
    expect(getRequiredRole("/events")).toBe("operator");
    expect(getRequiredRole("/events/123/edit")).toBe("operator");
  });
  it("returns admin for settings", () => {
    expect(getRequiredRole("/settings/admins")).toBe("admin");
  });
  it("returns viewer for unknown routes", () => {
    expect(getRequiredRole("/unknown")).toBe("viewer");
  });
});
