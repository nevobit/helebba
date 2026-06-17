export function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export function isUrl(input: string): boolean {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

export function isUUID(input: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input);
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  const head = user[0] ?? '';
  return `${head}***@${domain}`;
}

export function maskCard(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  const masked = '*'.repeat(Math.max(0, digits.length - 4)) + digits.slice(-4);
  return masked.replace(/(.{4})/g, '$1 ').trim();
}

// export async function generateToken(length = 32): Promise<string> {
//     const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     const out: string[] = [];

//     const crypto = typeof globalThis !== "undefined" && typeof globalThis.crypto !== "undefined" ? globalThis.crypto : undefined;

//     if (crypto && typeof crypto.getRandomValues === "function") {
//         const buf = new Uint8Array(length);
//         crypto.getRandomValues(buf);
//         for (let i = 0; i < length; i++) {
//             out.push(alphabet.charAt(buf[i]! % alphabet.length));
//         }
//         return out.join("");
//     }

//     try {
//         const { randomBytes } = await import("node:crypto");
//         const buf = randomBytes(length);
//         for (let i = 0; i < length; i++) {
//             out.push(alphabet.charAt(buf[i]! % alphabet.length));
//         }
//         return out.join("");
//     } catch {
//         for (let i = 0; i < length; i++) {
//             out.push(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
//         }
//         return out.join("");
//     }
// }
