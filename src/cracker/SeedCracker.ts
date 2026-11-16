import { translate } from '../i18n/translations';
import { JavaRandom } from './JavaRandom';
import * as Enchantments from '../enchantments/Enchantments';

export class SeedCracker {
  private workers: Worker[] = [];
  private isFirstTimeState = true;
  private isRunningState = false;
  private abortRequested = false;
  private possibleSeeds: number[] = [];
  private seedsSearched = 0;
  private totalSeeds = 4294967296;

  constructor() {
    this.initWorkers();
  }

  private initWorkers() {
    const threadCount = Math.max(1, (navigator.hardwareConcurrency || 4) - 1);
    for (let i = 0; i < threadCount; i++) {
      const worker = new Worker(new URL('./crackerWorker.ts', import.meta.url), { type: 'module' });
      worker.postMessage({ type: 'init' });
      this.workers.push(worker);
    }
  }

  public isFirstTime(): boolean {
    return this.isFirstTimeState;
  }

  public isRunning(): boolean {
    return this.isRunningState;
  }

  public getPossibleSeedsCount(): number {
    return this.possibleSeeds.length;
  }

  public getSingleSeed(): number | null {
    return this.possibleSeeds.length === 1 ? this.possibleSeeds[0] : null;
  }

  public reset(): void {
    this.abortRequested = true;
    this.isRunningState = false;
    this.isFirstTimeState = true;
    this.possibleSeeds = [];
    this.seedsSearched = 0;
  }

  public getRemainingSeedsText(val: number): string {
    const keys = [
      'enchCrack.remaining',
      'enchCrack.remaining.thousand',
      'enchCrack.remaining.million',
      'enchCrack.remaining.billion',
    ];

    let factor = 1.0 / 1000;
    let n = val;
    let suffix = -1;
    while (n > 0) {
      n = Math.floor(n / 1000);
      factor *= 1000;
      suffix++;
    }

    if (suffix < 0) suffix = 0;
    if (suffix >= keys.length) suffix = keys.length - 1;

    let significand = val / factor;
    let multiplier = 1;
    while (significand < 100) {
      significand *= 10;
      multiplier *= 10;
    }
    significand = Math.round(significand);
    significand /= multiplier;

    return translate(keys[suffix], significand.toLocaleString());
  }

  public async crack(
    bookshelves: number,
    slot1: number,
    slot2: number,
    slot3: number,
    onProgress: (progress: number) => void
  ): Promise<{ possibleCount: number; seed: number | null }> {
    this.abortRequested = false;
    this.isRunningState = true;

    if (this.isFirstTimeState) {
      this.isFirstTimeState = false;
      const res = await this.firstInput(bookshelves, slot1, slot2, slot3, onProgress);
      this.isRunningState = false;
      return res;
    } else {
      const res = await this.addInput(bookshelves, slot1, slot2, slot3, onProgress);
      this.isRunningState = false;
      return res;
    }
  }

  private async firstInput(
    bookshelves: number,
    slot1: number,
    slot2: number,
    slot3: number,
    onProgress: (progress: number) => void
  ): Promise<{ possibleCount: number; seed: number | null }> {
    this.seedsSearched = 0;
    this.possibleSeeds = [];

    // 4,294,967,296 total seeds, from -2,147,483,648 to 2,147,483,647
    // Chunk size: 16,777,216 (256 chunks)
    const chunkSize = 16777216;
    const totalChunks = Math.floor(this.totalSeeds / chunkSize);
    let nextChunkIdx = 0;

    return new Promise((resolve) => {
      let activeWorkers = 0;
      let completedChunks = 0;

      const scheduleWorker = (worker: Worker) => {
        if (this.abortRequested) {
          return;
        }

        if (nextChunkIdx >= totalChunks) {
          activeWorkers--;
          if (activeWorkers === 0) {
            resolve({
              possibleCount: this.possibleSeeds.length,
              seed: this.possibleSeeds.length === 1 ? this.possibleSeeds[0] : null,
            });
          }
          return;
        }

        const chunkId = nextChunkIdx++;
        // Start seed for this chunk in signed 32-bit int
        const startSeed = (-2147483648 + chunkId * chunkSize) | 0;

        worker.onmessage = (e: MessageEvent) => {
          if (this.abortRequested) return;

          const data = e.data;
          if (data.type === 'chunk_result') {
            const matches: Int32Array = data.matches;
            for (let i = 0; i < matches.length; i++) {
              this.possibleSeeds.push(matches[i]);
            }

            this.seedsSearched += data.count;
            completedChunks++;
            onProgress(this.seedsSearched / this.totalSeeds);

            scheduleWorker(worker);
          }
        };

        worker.postMessage({
          type: 'search_chunk',
          chunkId,
          startSeed,
          count: chunkSize,
          bookshelves,
          slot1,
          slot2,
          slot3,
        });
      };

      for (const worker of this.workers) {
        activeWorkers++;
        scheduleWorker(worker);
      }
    });
  }

  private async addInput(
    bookshelves: number,
    slot1: number,
    slot2: number,
    slot3: number,
    onProgress: (progress: number) => void
  ): Promise<{ possibleCount: number; seed: number | null }> {
    const total = this.possibleSeeds.length;
    const nextPossible: number[] = [];
    const rand = new JavaRandom();

    for (let i = 0; i < total; i++) {
      if (this.abortRequested) break;

      if (i % 250000 === 0) {
        onProgress(i / total);
        // Yield to allow UI updates
        await new Promise((r) => setTimeout(r, 0));
      }

      const s = this.possibleSeeds[i];
      rand.setSeed(s);
      if (Enchantments.calcEnchantmentTableLevel(rand, 0, bookshelves, 'dummy') === slot1) {
        if (Enchantments.calcEnchantmentTableLevel(rand, 1, bookshelves, 'dummy') === slot2) {
          if (Enchantments.calcEnchantmentTableLevel(rand, 2, bookshelves, 'dummy') === slot3) {
            nextPossible.push(s);
          }
        }
      }
    }

    this.possibleSeeds = nextPossible;
    onProgress(1);

    return {
      possibleCount: this.possibleSeeds.length,
      seed: this.possibleSeeds.length === 1 ? this.possibleSeeds[0] : null,
    };
  }
}
