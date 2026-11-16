import { CRACKER_WASM_BASE64 } from './crackerWasmBase64';

let wasmInstance: WebAssembly.Instance | null = null;
let wasmMemory: WebAssembly.Memory | null = null;
let crackBlockFn: ((startSeed: number, count: number, b: number, s1: number, s2: number, s3: number) => number) | null = null;

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
      // Access wasm memory buffer (memory might have grown so access current buffer)
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
};
