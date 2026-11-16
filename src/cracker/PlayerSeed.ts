export function calculatePlayerSeed(xpSeed1Hex: string, xpSeed2Hex: string): string | null {
  const xpSeed1 = parseInt(xpSeed1Hex, 16);
  const xpSeed2 = parseInt(xpSeed2Hex, 16);
  if (isNaN(xpSeed1) || isNaN(xpSeed2)) {
    return null;
  }

  const MULTIPLIER = 0x5DEECE66Dn;
  const ADDEND = 0xBn;
  const MASK_48 = (1n << 48n) - 1n;
  const HIGH_MASK = 0x0000ffffffff0000n;

  // Convert signed 32-bit int to unsigned 64-bit BigInt
  const u1 = BigInt(xpSeed1 >>> 0);
  const u2 = BigInt(xpSeed2 >>> 0);

  const seed1High = (u1 << 16n) & HIGH_MASK;
  const seed2High = (u2 << 16n) & HIGH_MASK;

  for (let seed1Low = 0n; seed1Low < 65536n; seed1Low++) {
    const candidate = seed1High | seed1Low;
    const nextSeed = (candidate * MULTIPLIER + ADDEND) & MASK_48;
    if ((nextSeed & HIGH_MASK) === seed2High) {
      return nextSeed.toString(16).toUpperCase().padStart(12, '0');
    }
  }

  return null;
}
