import { JavaRandom } from '../cracker/JavaRandom';
import * as Enchantments from './Enchantments';
import { VersionId } from './Versions';

export interface CalculationResult {
  timesNeeded: number; // -2: impossible, -1: no dummy, >= 0: items to throw
  bookshelvesNeeded: number;
  slot: number; // 0, 1, or 2 (displayed as 1, 2, or 3)
}

export function calculateEnchantment(
  playerSeedHex: string,
  item: string,
  maxShelves: number,
  playerLevel: number,
  wantedEnch: Enchantments.EnchantmentInstance[],
  unwantedEnch: Enchantments.EnchantmentInstance[],
  version: VersionId
): CalculationResult {
  let seed = BigInt('0x' + playerSeedHex);
  const MULTIPLIER = 0x5DEECE66Dn;
  const ADDEND = 0xBn;
  const MASK = (1n << 48n) - 1n;

  let timesNeeded = -2;
  let bookshelvesNeeded = 0;
  let slot = 0;
  const enchantLevels = [0, 0, 0];

  const rand = new JavaRandom();

  outerLoop: for (let i = -1; i <= 64 * 32; i++) {
    let xpSeed: number;
    if (i === -1) {
      xpSeed = Number(seed >> 16n);
    } else {
      const advanced = (seed * MULTIPLIER + ADDEND) & MASK;
      xpSeed = Number(advanced >> 16n);
    }

    for (bookshelvesNeeded = 0; bookshelvesNeeded <= maxShelves; bookshelvesNeeded++) {
      rand.setSeed(xpSeed);

      for (slot = 0; slot < 3; slot++) {
        let level = Enchantments.calcEnchantmentTableLevel(rand, slot, bookshelvesNeeded, item);
        if (level < slot + 1) {
          level = 0;
        }
        enchantLevels[slot] = level;
      }

      slotLoop: for (slot = 0; slot < 3; slot++) {
        const list = Enchantments.getEnchantmentsInTable(
          rand,
          xpSeed,
          item,
          slot,
          enchantLevels[slot],
          version
        );

        if (enchantLevels[slot] === 0) {
          continue slotLoop;
        } else if (i === -1) {
          if (playerLevel < enchantLevels[slot]) {
            continue slotLoop;
          }
        } else if (playerLevel < enchantLevels[slot] + 1) {
          continue slotLoop;
        }

        // Wanted enchantments check
        for (const inst of wantedEnch) {
          let found = false;
          for (const inst2 of list) {
            if (inst.enchantment !== inst2.enchantment) continue;
            if (inst.level > inst2.level) continue slotLoop;
            found = true;
            break;
          }
          if (!found) continue slotLoop;
        }

        // Unwanted enchantments check
        for (const inst of unwantedEnch) {
          for (const inst2 of list) {
            if (inst.enchantment === inst2.enchantment) {
              continue slotLoop;
            }
          }
        }

        timesNeeded = i;
        break outerLoop;
      }
    }

    // Simulate an item throw
    if (i !== -1) {
      for (let j = 0; j < 4; j++) {
        seed = (seed * MULTIPLIER + ADDEND) & MASK;
      }
    }
  }

  return {
    timesNeeded,
    bookshelvesNeeded,
    slot,
  };
}

export function applyEnchantmentDone(
  playerSeedHex: string,
  playerLevel: number,
  timesNeeded: number,
  chosenSlot: number
): { newSeedHex: string; newLevel: number } {
  let curSeed = BigInt('0x' + playerSeedHex);
  const MULTIPLIER = 0x5DEECE66Dn;
  const ADDEND = 0xBn;
  const MASK = (1n << 48n) - 1n;

  if (timesNeeded !== -1) {
    // items thrown
    for (let i = 0; i < timesNeeded; i++) {
      for (let j = 0; j < 4; j++) {
        curSeed = (curSeed * MULTIPLIER + ADDEND) & MASK;
      }
    }
    // dummy enchantment
    curSeed = (curSeed * MULTIPLIER + ADDEND) & MASK;
  }
  // actual enchantment
  curSeed = (curSeed * MULTIPLIER + ADDEND) & MASK;

  let newLevel = playerLevel;
  if (timesNeeded !== -1) {
    newLevel--;
  }
  newLevel -= (chosenSlot + 1);

  const hex = curSeed.toString(16).toUpperCase().padStart(12, '0');
  return {
    newSeedHex: hex,
    newLevel: Math.max(0, newLevel),
  };
}
