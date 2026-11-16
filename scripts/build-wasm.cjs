const fs = require('fs');
const path = require('path');
const wabtFactory = require('wabt');

async function build() {
  const wabt = await wabtFactory();

  const wat = `(module
  (memory (export "memory") 128 2048)

  ;; crack_block searches count seeds starting at startSeed.
  ;; Matches are written to memory as i32 at index (matchCount * 4).
  ;; Returns matchCount.
  (func (export "crack_block")
    (param $startSeed i32)
    (param $count i32)
    (param $bookshelves i32)
    (param $slot1 i32)
    (param $slot2 i32)
    (param $slot3 i32)
    (result i32)

    (local $i i32)
    (local $curSeed i32)
    (local $seed i64)
    (local $matchCount i32)

    ;; precomputed constants
    (local $twoShelves i32)
    (local $halfShelves i32)
    (local $shelvesPlusOne i32)
    (local $firstEarly i32)
    (local $secondEarly i32)
    (local $secondSubOne i32)
    (local $isPowerOfTwo i32)
    (local $m i32)

    ;; temp variables for PRNG
    (local $r i32)
    (local $u i32)
    (local $ench1r1 i32)
    (local $ench1r2 i32)
    (local $ench1 i32)
    (local $ench2r1 i32)
    (local $ench2r2 i32)
    (local $ench2 i32)
    (local $ench3r1 i32)
    (local $ench3r2 i32)
    (local $ench3 i32)
    (local $slot3Calc i32)

    (local.set $matchCount (i32.const 0))
    (local.set $twoShelves (i32.mul (local.get $bookshelves) (i32.const 2)))
    (local.set $halfShelves (i32.add (i32.shr_s (local.get $bookshelves) (i32.const 1)) (i32.const 1)))
    (local.set $shelvesPlusOne (i32.add (local.get $bookshelves) (i32.const 1)))
    (local.set $firstEarly (i32.add (i32.mul (local.get $slot1) (i32.const 3)) (i32.const 2)))
    (local.set $secondEarly (i32.div_s (i32.mul (local.get $slot2) (i32.const 3)) (i32.const 2)))
    (local.set $secondSubOne (i32.sub (local.get $slot2) (i32.const 1)))

    (local.set $m (i32.sub (local.get $shelvesPlusOne) (i32.const 1)))
    (local.set $isPowerOfTwo
      (i32.eqz (i32.and (local.get $shelvesPlusOne) (local.get $m)))
    )

    (local.set $i (i32.const 0))

    (block $block_exit
      (loop $main_loop
        (br_if $block_exit (i32.ge_u (local.get $i) (local.get $count)))

        (local.set $curSeed (i32.add (local.get $startSeed) (local.get $i)))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))

        ;; myRNG.setSeed(curSeed)
        ;; seed = (curSeed ^ 0x5DEECE66D) & 0xFFFFFFFFFFFF
        (local.set $seed
          (i64.and
            (i64.xor (i64.extend_i32_u (local.get $curSeed)) (i64.const 0x5deece66d))
            (i64.const 0xffffffffffff)
          )
        )

        ;; --- Slot 1, part 1 ---
        ;; seed = (seed * 0x5DEECE66D + 0xB) & 0xFFFFFFFFFFFF
        (local.set $seed
          (i64.and
            (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb))
            (i64.const 0xffffffffffff)
          )
        )
        ;; ench1r1 = (int)(seed >>> 45) + halfShelves
        (local.set $ench1r1
          (i32.add (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 45))) (local.get $halfShelves))
        )
        (br_if $main_loop (i32.gt_s (local.get $ench1r1) (local.get $firstEarly)))

        ;; --- Slot 1, part 2: nextInt(shelvesPlusOne) ---
        (local.set $seed
          (i64.and
            (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb))
            (i64.const 0xffffffffffff)
          )
        )
        (local.set $r (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 17))))
        (if (i32.eq (local.get $shelvesPlusOne) (i32.const 1))
          (then
            (local.set $ench1r2 (i32.const 0))
          )
          (else
            (if (local.get $isPowerOfTwo)
              (then
                ;; (shelvesPlusOne * r) >> 31
                (local.set $ench1r2
                  (i32.wrap_i64
                    (i64.shr_u
                      (i64.mul (i64.extend_i32_u (local.get $shelvesPlusOne)) (i64.extend_i32_u (local.get $r)))
                      (i64.const 31)
                    )
                  )
                )
              )
              (else
                (local.set $u (local.get $r))
                (local.set $ench1r2 (i32.rem_s (local.get $u) (local.get $shelvesPlusOne)))
                (block $rej_break_1
                  (loop $rej_loop_1
                    (br_if $rej_break_1
                      (i32.ge_s
                        (i32.add (i32.sub (local.get $u) (local.get $ench1r2)) (local.get $m))
                        (i32.const 0)
                      )
                    )
                    (local.set $seed
                      (i64.and
                        (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb))
                        (i64.const 0xffffffffffff)
                      )
                    )
                    (local.set $u (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 17))))
                    (local.set $ench1r2 (i32.rem_s (local.get $u) (local.get $shelvesPlusOne)))
                    (br $rej_loop_1)
                  )
                )
              )
            )
          )
        )

        (local.set $ench1 (i32.div_s (i32.add (local.get $ench1r1) (local.get $ench1r2)) (i32.const 3)))
        (if (i32.lt_s (local.get $ench1) (i32.const 1))
          (then
            (br_if $main_loop (i32.ne (local.get $slot1) (i32.const 1)))
          )
          (else
            (br_if $main_loop (i32.ne (local.get $slot1) (local.get $ench1)))
          )
        )

        ;; --- Slot 2, part 1 ---
        (local.set $seed
          (i64.and
            (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb))
            (i64.const 0xffffffffffff)
          )
        )
        (local.set $ench2r1
          (i32.add (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 45))) (local.get $halfShelves))
        )
        (br_if $main_loop (i32.gt_s (local.get $ench2r1) (local.get $secondEarly)))

        ;; --- Slot 2, part 2: nextInt(shelvesPlusOne) ---
        (local.set $seed
          (i64.and
            (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb))
            (i64.const 0xffffffffffff)
          )
        )
        (local.set $r (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 17))))
        (if (i32.eq (local.get $shelvesPlusOne) (i32.const 1))
          (then
            (local.set $ench2r2 (i32.const 0))
          )
          (else
            (if (local.get $isPowerOfTwo)
              (then
                (local.set $ench2r2
                  (i32.wrap_i64
                    (i64.shr_u
                      (i64.mul (i64.extend_i32_u (local.get $shelvesPlusOne)) (i64.extend_i32_u (local.get $r)))
                      (i64.const 31)
                    )
                  )
                )
              )
              (else
                (local.set $u (local.get $r))
                (local.set $ench2r2 (i32.rem_s (local.get $u) (local.get $shelvesPlusOne)))
                (block $rej_break_2
                  (loop $rej_loop_2
                    (br_if $rej_break_2
                      (i32.ge_s
                        (i32.add (i32.sub (local.get $u) (local.get $ench2r2)) (local.get $m))
                        (i32.const 0)
                      )
                    )
                    (local.set $seed
                      (i64.and
                        (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb))
                        (i64.const 0xffffffffffff)
                      )
                    )
                    (local.set $u (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 17))))
                    (local.set $ench2r2 (i32.rem_s (local.get $u) (local.get $shelvesPlusOne)))
                    (br $rej_loop_2)
                  )
                )
              )
            )
          )
        )

        (local.set $ench2
          (i32.div_s (i32.mul (i32.add (local.get $ench2r1) (local.get $ench2r2)) (i32.const 2)) (i32.const 3))
        )
        (br_if $main_loop (i32.ne (local.get $secondSubOne) (local.get $ench2)))

        ;; --- Slot 3, part 1 ---
        (local.set $seed
          (i64.and
            (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb))
            (i64.const 0xffffffffffff)
          )
        )
        (local.set $ench3r1
          (i32.add (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 45))) (local.get $halfShelves))
        )

        ;; --- Slot 3, part 2: nextInt(shelvesPlusOne) ---
        (local.set $seed
          (i64.and
            (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb))
            (i64.const 0xffffffffffff)
          )
        )
        (local.set $r (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 17))))
        (if (i32.eq (local.get $shelvesPlusOne) (i32.const 1))
          (then
            (local.set $ench3r2 (i32.const 0))
          )
          (else
            (if (local.get $isPowerOfTwo)
              (then
                (local.set $ench3r2
                  (i32.wrap_i64
                    (i64.shr_u
                      (i64.mul (i64.extend_i32_u (local.get $shelvesPlusOne)) (i64.extend_i32_u (local.get $r)))
                      (i64.const 31)
                    )
                  )
                )
              )
              (else
                (local.set $u (local.get $r))
                (local.set $ench3r2 (i32.rem_s (local.get $u) (local.get $shelvesPlusOne)))
                (block $rej_break_3
                  (loop $rej_loop_3
                    (br_if $rej_break_3
                      (i32.ge_s
                        (i32.add (i32.sub (local.get $u) (local.get $ench3r2)) (local.get $m))
                        (i32.const 0)
                      )
                    )
                    (local.set $seed
                      (i64.and
                        (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb))
                        (i64.const 0xffffffffffff)
                      )
                    )
                    (local.set $u (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 17))))
                    (local.set $ench3r2 (i32.rem_s (local.get $u) (local.get $shelvesPlusOne)))
                    (br $rej_loop_3)
                  )
                )
              )
            )
          )
        )

        (local.set $ench3 (i32.add (local.get $ench3r1) (local.get $ench3r2)))
        (local.set $slot3Calc
          (select (local.get $ench3) (local.get $twoShelves) (i32.gt_s (local.get $ench3) (local.get $twoShelves)))
        )
        (br_if $main_loop (i32.ne (local.get $slot3) (local.get $slot3Calc)))

        ;; --- All matched! Grow memory if needed and store curSeed ---
        (if (i32.ge_u (i32.shl (local.get $matchCount) (i32.const 2)) (i32.sub (i32.shl (memory.size) (i32.const 16)) (i32.const 64)))
          (then
            (drop (memory.grow (i32.const 64)))
          )
        )

        (i32.store
          (i32.shl (local.get $matchCount) (i32.const 2))
          (local.get $curSeed)
        )
        (local.set $matchCount (i32.add (local.get $matchCount) (i32.const 1)))

        (br $main_loop)
      )
    )

    (local.get $matchCount)
  )
)`;

  const parsed = wabt.parseWat('cracker.wat', wat);
  const binary = parsed.toBinary({}).buffer;

  // Save binary wasm
  fs.writeFileSync(path.join('src', 'cracker', 'cracker.wasm'), Buffer.from(binary));

  // Generate JS/TS module with base64 embedded wasm
  const b64 = Buffer.from(binary).toString('base64');
  fs.writeFileSync(
    path.join('src', 'cracker', 'crackerWasmBase64.ts'),
    `export const CRACKER_WASM_BASE64 = "${b64}";\n`
  );

  console.log('Successfully built cracker.wasm (' + binary.byteLength + ' bytes)');
}

build().catch(err => {
  console.error('Build wasm failed:', err);
  process.exit(1);
});
