import { translate } from '../i18n/translations';

export class SeedCracker {
  private workers: Worker[] = [];
  private isFirstTimeState = true;
  private isRunningState = false;
  private abortRequested = false;
  private seedChunks: Int32Array[] = [];
  private totalMatchesCount = 0;
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
    return this.totalMatchesCount;
  }

  public getSingleSeed(): number | null {
    if (this.totalMatchesCount === 1) {
      for (const chunk of this.seedChunks) {
        if (chunk.length === 1) return chunk[0];
      }
    }
    return null;
  }

  public reset(): void {
    this.abortRequested = true;
    this.isRunningState = false;
    this.isFirstTimeState = true;
    this.seedChunks = [];
    this.totalMatchesCount = 0;
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

    // If cracker already narrowed to 1 seed or 0 seeds, auto-reset so next crack searches fresh for XP Seed 2
    if (!this.isFirstTimeState && (this.totalMatchesCount === 1 || this.totalMatchesCount === 0)) {
      this.isFirstTimeState = true;
      this.seedChunks = [];
      this.totalMatchesCount = 0;
    }

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
    this.seedChunks = [];
    this.totalMatchesCount = 0;

    // 4,294,967,296 total seeds, from -2,147,483,648 to 2,147,483,647
    // Chunk size: 16,777,216 (256 chunks)
    const chunkSize = 16777216;
    const totalChunks = Math.floor(this.totalSeeds / chunkSize);
    let nextChunkIdx = 0;

    return new Promise((resolve) => {
      let activeWorkers = 0;

      const scheduleWorker = (worker: Worker) => {
        if (this.abortRequested) {
          resolve({ possibleCount: this.totalMatchesCount, seed: null });
          return;
        }

        if (nextChunkIdx >= totalChunks) {
          activeWorkers--;
          if (activeWorkers === 0) {
            resolve({
              possibleCount: this.totalMatchesCount,
              seed: this.getSingleSeed(),
            });
          }
          return;
        }

        const chunkId = nextChunkIdx++;
        const startSeed = (-2147483648 + chunkId * chunkSize) | 0;

        worker.onmessage = (e: MessageEvent) => {
          if (this.abortRequested) return;

          const data = e.data;
          if (data.type === 'chunk_result') {
            const matches: Int32Array = data.matches;
            if (matches && matches.length > 0) {
              // Store directly as chunk with zero array expansion overhead
              this.seedChunks.push(matches);
              this.totalMatchesCount += matches.length;
            }

            this.seedsSearched += data.count;
            onProgress(this.seedsSearched / this.totalSeeds);

            scheduleWorker(worker);
          } else if (data.type === 'chunk_error') {
            this.seedsSearched += chunkSize;
            onProgress(this.seedsSearched / this.totalSeeds);
            scheduleWorker(worker);
          }
        };

        worker.onerror = (err) => {
          console.error('Worker error:', err);
          this.seedsSearched += chunkSize;
          onProgress(this.seedsSearched / this.totalSeeds);
          scheduleWorker(worker);
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
    const inputChunks = this.seedChunks;
    const totalSeeds = this.totalMatchesCount;

    if (totalSeeds === 0 || inputChunks.length === 0) {
      return { possibleCount: 0, seed: null };
    }

    this.seedChunks = [];
    this.totalMatchesCount = 0;

    let nextChunkIdx = 0;
    const totalChunks = inputChunks.length;
    let searchedSoFar = 0;

    return new Promise((resolve) => {
      let activeWorkers = 0;

      const scheduleWorker = (worker: Worker) => {
        if (this.abortRequested) {
          resolve({ possibleCount: this.totalMatchesCount, seed: null });
          return;
        }

        if (nextChunkIdx >= totalChunks) {
          activeWorkers--;
          if (activeWorkers === 0) {
            onProgress(1);
            resolve({
              possibleCount: this.totalMatchesCount,
              seed: this.getSingleSeed(),
            });
          }
          return;
        }

        const chunkId = nextChunkIdx++;
        const chunk = inputChunks[chunkId];

        worker.onmessage = (e: MessageEvent) => {
          if (this.abortRequested) return;

          const data = e.data;
          if (data.type === 'filter_result') {
            const matches: Int32Array = data.matches;
            if (matches && matches.length > 0) {
              this.seedChunks.push(matches);
              this.totalMatchesCount += matches.length;
            }
            searchedSoFar += data.searchedCount;
            onProgress(Math.min(1, searchedSoFar / totalSeeds));
            scheduleWorker(worker);
          } else if (data.type === 'chunk_error') {
            searchedSoFar += chunk.length;
            scheduleWorker(worker);
          }
        };

        worker.onerror = (err) => {
          console.error('Worker filter error:', err);
          searchedSoFar += chunk.length;
          scheduleWorker(worker);
        };

        worker.postMessage(
          {
            type: 'filter_chunk',
            chunkId,
            seeds: chunk,
            bookshelves,
            slot1,
            slot2,
            slot3,
          },
          [chunk.buffer]
        );
      };

      for (const worker of this.workers) {
        activeWorkers++;
        scheduleWorker(worker);
      }
    });
  }
}
