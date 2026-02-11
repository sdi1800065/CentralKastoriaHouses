const ADMIN_SESSION_KEY = "ckh-admin-session-v1";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

const PASSWORD_HASH_HEX =
  "34644875fb42bf22e37b73c0a0ee2bc77993f18bde16a21d7b7638ba7236c596";
const PASSWORD_SALT = "ckh-admin-v1-salt";
const PASSWORD_ITERATIONS = 150000;

type AdminSession = {
  expiresAt: number;
};

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

async function hashPassword(password: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    return "";
  }

  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(PASSWORD_SALT),
      iterations: PASSWORD_ITERATIONS,
    },
    keyMaterial,
    256,
  );

  return toHex(new Uint8Array(bits));
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const normalized = password.trim();
  if (!normalized) {
    return false;
  }

  try {
    const hashedInput = await hashPassword(normalized);
    return timingSafeEqual(hashedInput, PASSWORD_HASH_HEX);
  } catch {
    return false;
  }
}

export function isAdminSessionValid(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const raw = window.sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) {
    return false;
  }

  try {
    const parsed = JSON.parse(raw) as AdminSession;
    const valid = typeof parsed?.expiresAt === "number" && parsed.expiresAt > Date.now();
    if (!valid) {
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
    return valid;
  } catch {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    return false;
  }
}

export function startAdminSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  const session: AdminSession = {
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };

  window.sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function endAdminSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
