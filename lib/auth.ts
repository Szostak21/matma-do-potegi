function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

export function verifyAdminSecret(secret: string | null | undefined): boolean {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || !secret) {
    return false;
  }

  const candidates = [secret, secret.replace(/ /g, "+")];

  for (const candidate of candidates) {
    if (constantTimeEqual(candidate, adminSecret)) {
      return true;
    }
  }

  return false;
}

export function assertAdminSecret(secret: string | null | undefined): void {
  if (!verifyAdminSecret(secret)) {
    throw new Error("Unauthorized");
  }
}
