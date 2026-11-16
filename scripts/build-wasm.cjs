const fs = require('fs');
const path = require('path');
const wabtFactory = require('wabt');

async function build() {
  const wabt = await wabtFactory();

  const wat = `(module
  (memory (export "memory") 128 2048)

  (func $check_single_seed (export "check_single_seed")
    (param $curSeed i32)
    (param $bookshelves i32)
    (param $slot1 i32)
    (param $slot2 i32)
    (param $slot3 i32)
    (result i32)

    (local $seed i64)
    (local $twoShelves i32)
    (local $halfShelves i32)
    (local $shelvesPlusOne i32)
    (local $firstEarly i32)
    (local $secondEarly i32)
    (local $secondSubOne i32)
    (local $isPowerOfTwo i32)
    (local $m i32)

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

    (local.set $twoShelves (i32.mul (local.get $bookshelves) (i32.const 2)))
    (local.set $halfShelves (i32.add (i32.shr_s (local.get $bookshelves) (i32.const 1)) (i32.const 1)))
    (local.set $shelvesPlusOne (i32.add (local.get $bookshelves) (i32.const 1)))
    (local.set $firstEarly (i32.add (i32.mul (local.get $slot1) (i32.const 3)) (i32.const 2)))
    (local.set $secondEarly (i32.div_s (i32.mul (local.get $slot2) (i32.const 3)) (i32.const 2)))
    (local.set $secondSubOne (i32.sub (local.get $slot2) (i32.const 1)))

    (local.set $m (i32.sub (local.get $shelvesPlusOne) (i32.const 1)))
    (local.set $isPowerOfTwo (i32.eqz (i32.and (local.get $shelvesPlusOne) (local.get $m))))

    ;; seed = (curSeed ^ 0x5DEECE66D) & 0xFFFFFFFFFFFF
    (local.set $seed
      (i64.and (i64.xor (i64.extend_i32_u (local.get $curSeed)) (i64.const 0x5deece66d)) (i64.const 0xffffffffffff))
    )

    ;; Slot 1, part 1
    (local.set $seed (i64.and (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb)) (i64.const 0xffffffffffff)))
    (local.set $ench1r1 (i32.add (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 45))) (local.get $halfShelves)))
    (if (i32.gt_s (local.get $ench1r1) (local.get $firstEarly)) (then (return (i32.const 0))))

    ;; Slot 1, part 2
    (local.set $seed (i64.and (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb)) (i64.const 0xffffffffffff)))
    (local.set $r (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 17))))
    (if (i32.eq (local.get $shelvesPlusOne) (i32.const 1))
      (then (local.set $ench1r2 (i32.const 0)))
      (else
        (if (local.get $isPowerOfTwo)
          (then (local.set $ench1r2 (i32.wrap_i64 (i64.shr_u (i64.mul (i64.extend_i32_u (local.get $shelvesPlusOne)) (i64.extend_i32_u (local.get $r))) (i64.const 31)))))
          (else
            (local.set $u (local.get $r))
            (local.set $ench1r2 (i32.rem_s (local.get $u) (local.get $shelvesPlusOne)))
            (block $rej_1
              (loop $rej_l_1
                (br_if $rej_1 (i32.ge_s (i32.add (i32.sub (local.get $u) (local.get $ench1r2)) (local.get $m)) (i32.const 0)))
                (local.set $seed (i64.and (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb)) (i64.const 0xffffffffffff)))
                (local.set $u (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 17))))
                (local.set $ench1r2 (i32.rem_s (local.get $u) (local.get $shelvesPlusOne)))
                (br $rej_l_1)
              )
            )
          )
        )
      )
    )
    (local.set $ench1 (i32.div_s (i32.add (local.get $ench1r1) (local.get $ench1r2)) (i32.const 3)))
    (if (i32.lt_s (local.get $ench1) (i32.const 1))
      (then (if (i32.ne (local.get $slot1) (i32.const 1)) (then (return (i32.const 0)))))
      (else (if (i32.ne (local.get $slot1) (local.get $ench1)) (then (return (i32.const 0)))))
    )

    ;; Slot 2, part 1
    (local.set $seed (i64.and (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb)) (i64.const 0xffffffffffff)))
    (local.set $ench2r1 (i32.add (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 45))) (local.get $halfShelves)))
    (if (i32.gt_s (local.get $ench2r1) (local.get $secondEarly)) (then (return (i32.const 0))))

    ;; Slot 2, part 2
    (local.set $seed (i64.and (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb)) (i64.const 0xffffffffffff)))
    (local.set $r (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 17))))
    (if (i32.eq (local.get $shelvesPlusOne) (i32.const 1))
      (then (local.set $ench2r2 (i32.const 0)))
      (else
        (if (local.get $isPowerOfTwo)
          (then (local.set $ench2r2 (i32.wrap_i64 (i64.shr_u (i64.mul (i64.extend_i32_u (local.get $shelvesPlusOne)) (i64.extend_i32_u (local.get $r))) (i64.const 31)))))
          (else
            (local.set $u (local.get $r))
            (local.set $ench2r2 (i32.rem_s (local.get $u) (local.get $shelvesPlusOne)))
            (block $rej_2
              (loop $rej_l_2
                (br_if $rej_2 (i32.ge_s (i32.add (i32.sub (local.get $u) (local.get $ench2r2)) (local.get $m)) (i32.const 0)))
                (local.set $seed (i64.and (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb)) (i64.const 0xffffffffffff)))
                (local.set $u (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 17))))
                (local.set $ench2r2 (i32.rem_s (local.get $u) (local.get $shelvesPlusOne)))
                (br $rej_l_2)
              )
            )
          )
        )
      )
    )
    (local.set $ench2 (i32.div_s (i32.mul (i32.add (local.get $ench2r1) (local.get $ench2r2)) (i32.const 2)) (i32.const 3)))
    (if (i32.ne (local.get $secondSubOne) (local.get $ench2)) (then (return (i32.const 0))))

    ;; Slot 3, part 1
    (local.set $seed (i64.and (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb)) (i64.const 0xffffffffffff)))
    (local.set $ench3r1 (i32.add (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 45))) (local.get $halfShelves)))

    ;; Slot 3, part 2
    (local.set $seed (i64.and (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb)) (i64.const 0xffffffffffff)))
    (local.set $r (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 17))))
    (if (i32.eq (local.get $shelvesPlusOne) (i32.const 1))
      (then (local.set $ench3r2 (i32.const 0)))
      (else
        (if (local.get $isPowerOfTwo)
          (then (local.set $ench3r2 (i32.wrap_i64 (i64.shr_u (i64.mul (i64.extend_i32_u (local.get $shelvesPlusOne)) (i64.extend_i32_u (local.get $r))) (i64.const 31)))))
          (else
            (local.set $u (local.get $r))
            (local.set $ench3r2 (i32.rem_s (local.get $u) (local.get $shelvesPlusOne)))
            (block $rej_3
              (loop $rej_l_3
                (br_if $rej_3 (i32.ge_s (i32.add (i32.sub (local.get $u) (local.get $ench3r2)) (local.get $m)) (i32.const 0)))
                (local.set $seed (i64.and (i64.add (i64.mul (local.get $seed) (i64.const 0x5deece66d)) (i64.const 0xb)) (i64.const 0xffffffffffff)))
                (local.set $u (i32.wrap_i64 (i64.shr_u (local.get $seed) (i64.const 17))))
                (local.set $ench3r2 (i32.rem_s (local.get $u) (local.get $shelvesPlusOne)))
                (br $rej_l_3)
              )
            )
          )
        )
      )
    )
    (local.set $ench3 (i32.add (local.get $ench3r1) (local.get $ench3r2)))
    (local.set $slot3Calc (select (local.get $ench3) (local.get $twoShelves) (i32.gt_s (local.get $ench3) (local.get $twoShelves))))
    (if (i32.ne (local.get $slot3) (local.get $slot3Calc)) (then (return (i32.const 0))))

    (i32.const 1)
  )

  ;; crack_block searches count seeds starting at startSeed.
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
    (local $matchCount i32)

    (local.set $matchCount (i32.const 0))
    (local.set $i (i32.const 0))

    (block $block_exit
      (loop $main_loop
        (br_if $block_exit (i32.ge_u (local.get $i) (local.get $count)))

        (local.set $curSeed (i32.add (local.get $startSeed) (local.get $i)))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))

        (if (call $check_single_seed (local.get $curSeed) (local.get $bookshelves) (local.get $slot1) (local.get $slot2) (local.get $slot3))
          (then
            (if (i32.ge_u (i32.shl (local.get $matchCount) (i32.const 2)) (i32.sub (i32.shl (memory.size) (i32.const 16)) (i32.const 64)))
              (then (drop (memory.grow (i32.const 64))))
            )
            (i32.store (i32.shl (local.get $matchCount) (i32.const 2)) (local.get $curSeed))
            (local.set $matchCount (i32.add (local.get $matchCount) (i32.const 1)))
          )
        )

        (br $main_loop)
      )
    )

    (local.get $matchCount)
  )

  ;; filter_seeds filters an array of seeds in memory in-place
  (func (export "filter_seeds")
    (param $count i32)
    (param $bookshelves i32)
    (param $slot1 i32)
    (param $slot2 i32)
    (param $slot3 i32)
    (result i32)

    (local $i i32)
    (local $survivors i32)
    (local $s i32)

    (local.set $i (i32.const 0))
    (local.set $survivors (i32.const 0))

    (block $exit
      (loop $loop
        (br_if $exit (i32.ge_u (local.get $i) (local.get $count)))

        (local.set $s (i32.load (i32.shl (local.get $i) (i32.const 2))))
        (if (call $check_single_seed (local.get $s) (local.get $bookshelves) (local.get $slot1) (local.get $slot2) (local.get $slot3))
          (then
            (i32.store (i32.shl (local.get $survivors) (i32.const 2)) (local.get $s))
            (local.set $survivors (i32.add (local.get $survivors) (i32.const 1)))
          )
        )

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop)
      )
    )

    (local.get $survivors)
  )
)`;

  const parsed = wabt.parseWat('cracker.wat', wat);
  const binary = parsed.toBinary({}).buffer;

  fs.writeFileSync(path.join('src', 'cracker', 'cracker.wasm'), Buffer.from(binary));

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
