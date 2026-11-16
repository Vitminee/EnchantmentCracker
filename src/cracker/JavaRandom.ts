export class JavaRandom {
  private seed: bigint = 0n;
  private static readonly MULTIPLIER = 0x5DEECE66Dn;
  private static readonly ADDEND = 0xBn;
  private static readonly MASK = (1n << 48n) - 1n;

  constructor(seed?: number | bigint) {
    if (seed !== undefined) {
      this.setSeed(seed);
    }
  }

  setSeed(seed: number | bigint): void {
    const s = BigInt.asIntN(64, BigInt(seed));
    this.seed = (s ^ JavaRandom.MULTIPLIER) & JavaRandom.MASK;
  }

  next(bits: number): number {
    this.seed = (this.seed * JavaRandom.MULTIPLIER + JavaRandom.ADDEND) & JavaRandom.MASK;
    return Number(this.seed >> BigInt(48 - bits));
  }

  nextInt(bound?: number): number {
    if (bound === undefined) {
      return this.next(32);
    }
    if (bound <= 0) {
      throw new Error("bound must be positive");
    }
    if ((bound & -bound) === bound) {
      // power of 2
      return Number((BigInt(bound) * BigInt(this.next(31))) >> 31n);
    }
    let bits: number;
    let val: number;
    do {
      bits = this.next(31);
      val = bits % bound;
    } while (bits - val + (bound - 1) < 0);
    return val;
  }

  nextFloat(): number {
    return this.next(24) / (1 << 24);
  }
}
