import { sign, verify } from "hono/jwt"

export async function signJWT(payload: string, secret: string): Promise<string> {
  return sign({
    sub: payload,
    exp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime() / 1000,
  },
    secret);
}


export async function verifyJWT(token: string, secret: string): Promise<string | null> {
  try {
    const decoded = await verify(token, secret, 'HS256');
    if (decoded && typeof decoded.sub === "string") {
      return decoded.sub;
    }
    return null;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

const ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const HASH_ALGORITHM = "SHA-256";

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    key,
    KEY_LENGTH * 8
  );

  const hash = new Uint8Array(bits);

  return [
    "pbkdf2",
    HASH_ALGORITHM,
    ITERATIONS,
    toBase64(salt),
    toBase64(hash),
  ].join("$");
}

export async function hashApiKey(key: string): Promise<string> {
  const encoded = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function generateApiKey(): Promise<{ key: string; hash: string; prefix: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const key = "enx_" + btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const hash = await hashApiKey(key);
  const prefix = key.substring(0, 8) + "...";
  return { key, hash, prefix };
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const [
      algorithm,
      hashAlgorithm,
      iterations,
      saltB64,
      hashB64,
    ] = storedHash.split("$");

    if (algorithm !== "pbkdf2") {
      return false;
    }

    const salt = fromBase64(saltB64);
    const expectedHash = fromBase64(hashB64);

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: Number(iterations),
        hash: hashAlgorithm,
      },
      key,
      expectedHash.length * 8
    );

    const actualHash = new Uint8Array(bits);

    if (actualHash.length !== expectedHash.length) {
      return false;
    }

    let diff = 0;
    for (let i = 0; i < actualHash.length; i++) {
      diff |= actualHash[i] ^ expectedHash[i];
    }

    return diff === 0;
  } catch {
    return false;
  }
}
