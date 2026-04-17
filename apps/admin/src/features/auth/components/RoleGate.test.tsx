import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleGate } from "./RoleGate";

vi.mock("../hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../hooks/use-auth";
const mockUseAuth = vi.mocked(useAuth);

describe("RoleGate", () => {
  it("renders children when user has sufficient role", () => {
    mockUseAuth.mockReturnValue({
      user: { userId: "1", email: "a@a.com", name: "A", role: "admin" },
      isLoading: false,
      isAuthenticated: true,
      can: () => true,
      logout: vi.fn(),
    });
    render(
      <RoleGate role="operator">
        <p>Secret</p>
      </RoleGate>
    );
    expect(screen.getByText("Secret")).toBeInTheDocument();
  });

  it("renders fallback when user lacks role", () => {
    mockUseAuth.mockReturnValue({
      user: { userId: "1", email: "a@a.com", name: "A", role: "viewer" },
      isLoading: false,
      isAuthenticated: true,
      can: (r) => r === "viewer",
      logout: vi.fn(),
    });
    render(
      <RoleGate role="operator" fallback={<p>No access</p>}>
        <p>Secret</p>
      </RoleGate>
    );
    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
    expect(screen.getByText("No access")).toBeInTheDocument();
  });

  it("renders nothing when no fallback and insufficient role", () => {
    mockUseAuth.mockReturnValue({
      user: { userId: "1", email: "a@a.com", name: "A", role: "viewer" },
      isLoading: false,
      isAuthenticated: true,
      can: (r) => r === "viewer",
      logout: vi.fn(),
    });
    const { container } = render(
      <RoleGate role="admin">
        <p>Admin only</p>
      </RoleGate>
    );
    expect(container.innerHTML).toBe("");
  });
});
