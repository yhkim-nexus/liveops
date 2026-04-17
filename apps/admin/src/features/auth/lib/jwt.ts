import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "../types/auth";

const SECRET_KEY = process.env.SESSION_SECRET ?? "liveops-dev-secret-key-change-in-production";
const encodedKey = new TextEncoder().encode(SECRET_KEY);

async function getCryptoKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encodedKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  const key = await getCryptoKey();
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const key = await getCryptoKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
