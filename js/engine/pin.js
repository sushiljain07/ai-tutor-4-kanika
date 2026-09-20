const SALT = 'kanika-tutor-parent-pin-v1';

export async function hashPin(pin) {
  const data = new TextEncoder().encode(SALT + pin);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPin(pin, hash) {
  return (await hashPin(pin)) === hash;
}
