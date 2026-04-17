// @vitest-environment node
import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "./jwt";
import type { SessionPayload } from "../types/auth";

describe("JWT encrypt/decrypt", () => {
  const payload: SessionPayload = {
    userId: "user-1",
    email: "admin@liveops.dev",
    name: "김관리",
    role: "admin",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  };

  it("encrypts and decrypts a session payload", async () => {
    const token = await encrypt(payload);
    expect(typeof token).toBe("string");
    const decrypted = await decrypt(token);
    expect(decrypted).not.toBeNull();
    expect(decrypted!.userId).toBe("user-1");
    expect(decrypted!.role).toBe("admin");
  });

  it("returns null for invalid token", async () => {
    const result = await decrypt("invalid");
    expect(result).toBeNull();
  });
});
