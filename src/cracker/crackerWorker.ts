import { CRACKER_WASM_BASE64 } from './crackerWasmBase64';

let wasmInstance: WebAssembly.Instance | null = null;
let wasmMemory: WebAssembly.Memory | null = null;
let crackBlockFn: ((startSeed: number, count: number, b: number, s1: number, s2: number, s3: number) => number) | null = null;
let filterSeedsFn: ((count: number, b: number, s1: number, s2: number, s3: number) => number) | null = null;

function initWasm(): void {
  if (wasmInstance) return;
  const binaryString = atob(CRACKER_WASM_BASE64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const mod = new WebAssembly.Module(bytes);
  wasmInstance = new WebAssembly.Instance(mod);
  wasmMemory = wasmInstance.exports.memory as WebAssembly.Memory;
  crackBlockFn = wasmInstance.exports.crack_block as any;
  filterSeedsFn = wasmInstance.exports.filter_seeds as any;
}

self.onmessage = (e: MessageEvent) => {
  const data = e.data;
  if (!data) return;

  if (data.type === 'init') {
    try {
      initWasm();
      self.postMessage({ type: 'init_done' });
    } catch (err: any) {
      console.error('Failed to init wasm in worker:', err);
    }
    return;
  }

  if (data.type === 'search_chunk') {
    try {
      if (!wasmInstance) initWasm();
      const { startSeed, count, bookshelves, slot1, slot2, slot3, chunkId } = data;
      const matchCount = crackBlockFn!(startSeed, count, bookshelves, slot1, slot2, slot3);
      const mem32 = new Int32Array(wasmMemory!.buffer, 0, matchCount);
      const copy = new Int32Array(matchCount);
      copy.set(mem32);
      (self as any).postMessage(
        {
          type: 'chunk_result',
          chunkId,
          count,
          matches: copy,
        },
        [copy.buffer]
      );
    } catch (err: any) {
      console.error('Error during search_chunk in worker:', err);
      self.postMessage({
        type: 'chunk_error',
        chunkId: data.chunkId,
        error: err.toString(),
      });
    }
    return;
  }

  if (data.type === 'filter_chunk') {
    try {
      if (!wasmInstance) initWasm();
      const { seeds, bookshelves, slot1, slot2, slot3, chunkId } = data;
      const inputSeeds: Int32Array = seeds;
      const count = inputSeeds.length;

      // Ensure memory has enough pages
      const bytesNeeded = count * 4;
      const currentBytes = wasmMemory!.buffer.byteLength;
      if (bytesNeeded > currentBytes) {
        const pagesToGrow = Math.ceil((bytesNeeded - currentBytes) / 65536) + 16;
        wasmMemory!.grow(pagesToGrow);
      }

      // Load seeds into wasm memory
      const mem32 = new Int32Array(wasmMemory!.buffer, 0, count);
      mem32.set(inputSeeds);

      // Run filter in-place in wasm
      const survivorsCount = filterSeedsFn!(count, bookshelves, slot1, slot2, slot3);
      const copy = new Int32Array(survivorsCount);
      copy.set(new Int32Array(wasmMemory!.buffer, 0, survivorsCount));

      (self as any).postMessage(
        {
          type: 'filter_result',
          chunkId,
          matches: copy,
          searchedCount: count,
        },
        [copy.buffer]
      );
    } catch (err: any) {
      console.error('Error during filter_chunk in worker:', err);
      self.postMessage({
        type: 'chunk_error',
        chunkId: data.chunkId,
        error: err.toString(),
      });
    }
    return;
  }
};
