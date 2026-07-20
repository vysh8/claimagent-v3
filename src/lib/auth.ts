export const SESSION_COOKIE = "claimagent_session";

async function sessionToken(): Promise<string> {
  const secret = process.env.ACCESS_PASSCODE ?? "";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("authed"));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function checkPasscode(input: string): boolean {
  const expected = process.env.ACCESS_PASSCODE ?? "";
  return expected.length > 0 && input === expected;
}

export async function validSessionValue(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  return value === (await sessionToken());
}

export async function makeSessionValue(): Promise<string> {
  return sessionToken();
}
