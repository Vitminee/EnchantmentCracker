import { VersionId, isBeforeVersion } from './Versions';
import * as Items from './Items';
import { JavaRandom } from '../cracker/JavaRandom';

export const PROTECTION = "protection";
export const FIRE_PROTECTION = "fire_protection";
export const FEATHER_FALLING = "feather_falling";
export const BLAST_PROTECTION = "blast_protection";
export const PROJECTILE_PROTECTION = "projectile_protection";
export const RESPIRATION = "respiration";
export const AQUA_AFFINITY = "aqua_affinity";
export const THORNS = "thorns";
export const DEPTH_STRIDER = "depth_strider";
export const SHARPNESS = "sharpness";
export const SMITE = "smite";
export const BANE_OF_ARTHROPODS = "bane_of_arthropods";
export const KNOCKBACK = "knockback";
export const FIRE_ASPECT = "fire_aspect";
export const LOOTING = "looting";
export const EFFICIENCY = "efficiency";
export const SILK_TOUCH = "silk_touch";
export const UNBREAKING = "unbreaking";
export const FORTUNE = "fortune";
export const POWER = "power";
export const PUNCH = "punch";
export const FLAME = "flame";
export const INFINITY = "infinity";
export const LUCK_OF_THE_SEA = "luck_of_the_sea";
export const LURE = "lure";

// 1.9
export const FROST_WALKER = "frost_walker";
export const MENDING = "mending";

// 1.11
export const BINDING_CURSE = "binding_curse";
export const VANISHING_CURSE = "vanishing_curse";

// 1.11.1
export const SWEEPING = "sweeping";

// 1.13
export const LOYALTY = "loyalty";
export const IMPALING = "impaling";
export const RIPTIDE = "riptide";
export const CHANNELING = "channeling";

// 1.14
export const MULTISHOT = "multishot";
export const QUICK_CHARGE = "quick_charge";
export const PIERCING = "piercing";

// 1.16
export const SOUL_SPEED = "soul_speed";

// 1.21
export const DENSITY = "density";
export const BREACH = "breach";
export const WIND_BURST = "wind_burst";

// 1.21.11
export const LUNGE = "lunge";

export const TABLE_ENCHANTMENTS: readonly string[] = [
  PROTECTION,
  FIRE_PROTECTION,
  FEATHER_FALLING,
  BLAST_PROTECTION,
  PROJECTILE_PROTECTION,
  RESPIRATION,
  AQUA_AFFINITY,
  THORNS,
  DEPTH_STRIDER,
  SHARPNESS,
  SMITE,
  BANE_OF_ARTHROPODS,
  KNOCKBACK,
  FIRE_ASPECT,
  LOOTING,
  SWEEPING,
  EFFICIENCY,
  SILK_TOUCH,
  UNBREAKING,
  FORTUNE,
  POWER,
  PUNCH,
  FLAME,
  INFINITY,
  LUCK_OF_THE_SEA,
  LURE,
  LOYALTY,
  IMPALING,
  RIPTIDE,
  CHANNELING,
  MULTISHOT,
  QUICK_CHARGE,
  PIERCING,
  DENSITY,
  BREACH,
  LUNGE,
];

const DAMAGE_ENCHANTMENTS = new Set<string>([
  SHARPNESS,
  SMITE,
  BANE_OF_ARTHROPODS,
  DENSITY,
  BREACH,
]);

const PROTECTION_ENCHANTMENTS = new Set<string>([
  PROTECTION,
  BLAST_PROTECTION,
  FIRE_PROTECTION,
  PROJECTILE_PROTECTION,
]);

type CompatibilityFunction = (enchA: string, enchB: string, version: VersionId) => boolean;

const COMPATIBILITY_FUNCTIONS: CompatibilityFunction[] = [
  (enchA, enchB) => enchA !== enchB,
  (enchA, enchB, version) => isBeforeVersion(version, VersionId.V1_11_1) || enchA !== INFINITY || enchB !== MENDING,
  (enchA, enchB) => !DAMAGE_ENCHANTMENTS.has(enchA) || !DAMAGE_ENCHANTMENTS.has(enchB),
  (enchA, enchB) => enchA !== DEPTH_STRIDER || enchB !== FROST_WALKER,
  (enchA, enchB) => enchA !== SILK_TOUCH || enchB !== LOOTING,
  (enchA, enchB) => enchA !== SILK_TOUCH || enchB !== FORTUNE,
  (enchA, enchB) => enchA !== SILK_TOUCH || enchB !== LUCK_OF_THE_SEA,
  (enchA, enchB) => enchA !== RIPTIDE || enchB !== LOYALTY,
  (enchA, enchB) => enchA !== RIPTIDE || enchB !== CHANNELING,
  (enchA, enchB) => enchA !== MULTISHOT || enchB !== PIERCING,
  (enchA, enchB, version) => version === VersionId.V1_14 || !PROTECTION_ENCHANTMENTS.has(enchA) || !PROTECTION_ENCHANTMENTS.has(enchB),
];

export function canApply(enchantment: string, item: string, primary: boolean): boolean {
  if (Items.BOOK === item) {
    return true;
  }

  switch (enchantment) {
    case PROTECTION:
    case FIRE_PROTECTION:
    case BLAST_PROTECTION:
    case PROJECTILE_PROTECTION:
      return Items.isArmor(item);
    case THORNS:
      return primary ? Items.isChestplate(item) : Items.isArmor(item);
    case FEATHER_FALLING:
    case DEPTH_STRIDER:
    case FROST_WALKER:
    case SOUL_SPEED:
      return Items.isBoots(item);
    case RESPIRATION:
    case AQUA_AFFINITY:
      return Items.isHelmet(item);
    case BINDING_CURSE:
      return Items.isArmor(item) || Items.PUMPKIN === item || Items.ELYTRA === item || Items.SKULL === item;
    case SHARPNESS:
    case SMITE:
    case BANE_OF_ARTHROPODS:
      return Items.isSword(item) || Items.isSpear(item) || (!primary && (Items.isAxe(item) || Items.MACE === item));
    case FIRE_ASPECT:
      return Items.isSword(item) || Items.isSpear(item) || (!primary && Items.MACE === item);
    case KNOCKBACK:
    case LOOTING:
      return Items.isSword(item) || Items.isSpear(item);
    case SWEEPING:
      return Items.isSword(item);
    case EFFICIENCY:
      return Items.isTool(item) || (!primary && Items.SHEARS === item);
    case SILK_TOUCH:
    case FORTUNE:
      return Items.isTool(item);
    case POWER:
    case PUNCH:
    case FLAME:
    case INFINITY:
      return Items.BOW === item;
    case LUCK_OF_THE_SEA:
    case LURE:
      return Items.FISHING_ROD === item;
    case UNBREAKING:
    case MENDING:
      return Items.hasDurability(item);
    case VANISHING_CURSE:
      return Items.hasDurability(item) || Items.PUMPKIN === item || Items.SKULL === item;
    case LOYALTY:
    case IMPALING:
    case RIPTIDE:
    case CHANNELING:
      return Items.TRIDENT === item;
    case MULTISHOT:
    case QUICK_CHARGE:
    case PIERCING:
      return Items.CROSSBOW === item;
    case DENSITY:
    case BREACH:
    case WIND_BURST:
      return Items.MACE === item;
    case LUNGE:
      return Items.isSpear(item);
    default:
      throw new Error("Unknown enchantment: " + enchantment);
  }
}

export function getMaxLevel(enchantment: string): number {
  switch (enchantment) {
    case SHARPNESS:
    case SMITE:
    case BANE_OF_ARTHROPODS:
    case EFFICIENCY:
    case POWER:
    case IMPALING:
    case DENSITY:
      return 5;
    case PROTECTION:
    case FIRE_PROTECTION:
    case BLAST_PROTECTION:
    case PROJECTILE_PROTECTION:
    case FEATHER_FALLING:
    case PIERCING:
    case BREACH:
      return 4;
    case THORNS:
    case DEPTH_STRIDER:
    case RESPIRATION:
    case LOOTING:
    case SWEEPING:
    case FORTUNE:
    case LUCK_OF_THE_SEA:
    case LURE:
    case UNBREAKING:
    case LOYALTY:
    case RIPTIDE:
    case QUICK_CHARGE:
    case SOUL_SPEED:
    case WIND_BURST:
    case LUNGE:
      return 3;
    case FROST_WALKER:
    case KNOCKBACK:
    case FIRE_ASPECT:
    case PUNCH:
      return 2;
    case AQUA_AFFINITY:
    case BINDING_CURSE:
    case SILK_TOUCH:
    case FLAME:
    case INFINITY:
    case MENDING:
    case VANISHING_CURSE:
    case CHANNELING:
    case MULTISHOT:
      return 1;
    default:
      throw new Error("Unknown enchantment: " + enchantment);
  }
}

export function getMinEnchantability(enchantment: string, level: number): number {
  switch (enchantment) {
    case PROTECTION: return 1 + (level - 1) * 11;
    case FIRE_PROTECTION: return 10 + (level - 1) * 8;
    case FEATHER_FALLING: return 5 + (level - 1) * 6;
    case BLAST_PROTECTION: return 5 + (level - 1) * 8;
    case PROJECTILE_PROTECTION: return 3 + (level - 1) * 6;
    case RESPIRATION: return level * 10;
    case AQUA_AFFINITY: return 1;
    case THORNS: return 10 + (level - 1) * 20;
    case DEPTH_STRIDER: return level * 10;
    case FROST_WALKER: return level * 10;
    case BINDING_CURSE: return 25;
    case SHARPNESS: return 1 + (level - 1) * 11;
    case SMITE: return 5 + (level - 1) * 8;
    case BANE_OF_ARTHROPODS: return 5 + (level - 1) * 8;
    case KNOCKBACK: return 5 + (level - 1) * 20;
    case FIRE_ASPECT: return 10 + (level - 1) * 20;
    case LOOTING: return 15 + (level - 1) * 9;
    case SWEEPING: return 5 + (level - 1) * 9;
    case EFFICIENCY: return 1 + (level - 1) * 10;
    case SILK_TOUCH: return 15;
    case UNBREAKING: return 5 + (level - 1) * 8;
    case FORTUNE: return 15 + (level - 1) * 9;
    case POWER: return 1 + (level - 1) * 10;
    case PUNCH: return 12 + (level - 1) * 20;
    case FLAME: return 20;
    case INFINITY: return 20;
    case LUCK_OF_THE_SEA: return 15 + (level - 1) * 9;
    case LURE: return 15 + (level - 1) * 9;
    case MENDING: return 25;
    case VANISHING_CURSE: return 25;
    case LOYALTY: return 5 + level * 7;
    case IMPALING: return 1 + (level - 1) * 8;
    case RIPTIDE: return 10 + level * 7;
    case CHANNELING: return 25;
    case MULTISHOT: return 20;
    case QUICK_CHARGE: return 12 + (level - 1) * 20;
    case PIERCING: return 1 + (level - 1) * 10;
    case SOUL_SPEED: return level * 10;
    case DENSITY: return 5 + (level - 1) * 8;
    case BREACH: return 15 + (level - 1) * 9;
    case WIND_BURST: return 15 + (level - 1) * 9;
    case LUNGE: return 5 + (level - 1) * 8;
    default:
      throw new Error("Unknown enchantment: " + enchantment);
  }
}

export function getMaxEnchantability(enchantment: string, level: number): number {
  switch (enchantment) {
    case PROTECTION: return 1 + level * 11;
    case FIRE_PROTECTION: return 10 + level * 8;
    case FEATHER_FALLING: return 5 + level * 6;
    case BLAST_PROTECTION: return 5 + level * 8;
    case PROJECTILE_PROTECTION: return 3 + level * 6;
    case RESPIRATION: return 30 + level * 10;
    case AQUA_AFFINITY: return 41;
    case THORNS: return 40 + level * 20;
    case DEPTH_STRIDER: return 15 + level * 10;
    case FROST_WALKER: return 15 + level * 10;
    case BINDING_CURSE: return 50;
    case SHARPNESS: return 21 + (level - 1) * 11;
    case SMITE: return 25 + (level - 1) * 8;
    case BANE_OF_ARTHROPODS: return 25 + (level - 1) * 8;
    case KNOCKBACK: return 55 + (level - 1) * 20;
    case FIRE_ASPECT: return 40 + level * 20;
    case LOOTING: return 65 + (level - 1) * 9;
    case SWEEPING: return 20 + (level - 1) * 9;
    case EFFICIENCY: return 50 + level * 10;
    case SILK_TOUCH: return 65;
    case UNBREAKING: return 55 + (level - 1) * 8;
    case FORTUNE: return 65 + (level - 1) * 9;
    case POWER: return 16 + (level - 1) * 10;
    case PUNCH: return 37 + (level - 1) * 20;
    case FLAME: return 50;
    case INFINITY: return 50;
    case LUCK_OF_THE_SEA: return 65 + (level - 1) * 9;
    case LURE: return 65 + (level - 1) * 9;
    case MENDING: return 75;
    case VANISHING_CURSE: return 50;
    case LOYALTY: return 50;
    case IMPALING: return 21 + (level - 1) * 8;
    case RIPTIDE: return 50;
    case CHANNELING: return 50;
    case MULTISHOT: return 50;
    case QUICK_CHARGE: return 50;
    case PIERCING: return 50;
    case SOUL_SPEED: return 15 + level * 10;
    case DENSITY: return 25 + (level - 1) * 8;
    case BREACH: return 65 + (level - 1) * 9;
    case WIND_BURST: return 65 + (level - 1) * 9;
    case LUNGE: return 25 + (level - 1) * 8;
    default:
      throw new Error("Unknown enchantment: " + enchantment);
  }
}

export function getWeight(enchantment: string, version: VersionId): number {
  switch (enchantment) {
    case PROTECTION:
    case SHARPNESS:
    case EFFICIENCY:
    case POWER:
    case PIERCING:
      return version === VersionId.V1_14 ? 30 : 10;
    case FIRE_PROTECTION:
    case FEATHER_FALLING:
    case PROJECTILE_PROTECTION:
    case SMITE:
    case BANE_OF_ARTHROPODS:
    case KNOCKBACK:
    case UNBREAKING:
    case LOYALTY:
    case QUICK_CHARGE:
    case DENSITY:
    case LUNGE:
      return version === VersionId.V1_14 ? 10 : 5;
    case BLAST_PROTECTION:
    case RESPIRATION:
    case AQUA_AFFINITY:
    case DEPTH_STRIDER:
    case FROST_WALKER:
    case FIRE_ASPECT:
    case LOOTING:
    case SWEEPING:
    case FORTUNE:
    case PUNCH:
    case FLAME:
    case LUCK_OF_THE_SEA:
    case LURE:
    case MENDING:
    case IMPALING:
    case RIPTIDE:
    case MULTISHOT:
    case BREACH:
    case WIND_BURST:
      return version === VersionId.V1_14 ? 3 : 2;
    case THORNS:
    case BINDING_CURSE:
    case SILK_TOUCH:
    case INFINITY:
    case VANISHING_CURSE:
    case CHANNELING:
    case SOUL_SPEED:
      return 1;
    default:
      throw new Error("Unknown enchantment: " + enchantment);
  }
}

export function getIntroducedVersion(enchantment: string): VersionId {
  switch (enchantment) {
    case FROST_WALKER:
    case MENDING:
      return VersionId.V1_9;
    case BINDING_CURSE:
    case VANISHING_CURSE:
      return VersionId.V1_11;
    case SWEEPING:
      return VersionId.V1_11_1;
    case LOYALTY:
    case IMPALING:
    case RIPTIDE:
    case CHANNELING:
      return VersionId.V1_13;
    case MULTISHOT:
    case QUICK_CHARGE:
    case PIERCING:
      return VersionId.V1_14;
    case SOUL_SPEED:
      return VersionId.V1_16;
    case DENSITY:
    case BREACH:
    case WIND_BURST:
      return VersionId.V1_21;
    case LUNGE:
      return VersionId.V1_21_11;
    default:
      return VersionId.V1_8;
  }
}

export function getMaxLevelInTable(enchantment: string, item: string): number {
  const enchantability = Items.getEnchantability(item);
  if (enchantability === 0 || !TABLE_ENCHANTMENTS.includes(enchantment) || !canApply(enchantment, item, true)) {
    return 0;
  } else {
    let level = 30 + 1 + Math.floor(enchantability / 4) + Math.floor(enchantability / 4);
    level += Math.round(level * 0.15);
    for (let maxLevel = getMaxLevel(enchantment); maxLevel >= 1; maxLevel--) {
      if (level >= getMinEnchantability(enchantment, maxLevel)) {
        return maxLevel;
      }
    }
    return 0;
  }
}

export function areCompatible(enchA: string, enchB: string, version: VersionId): boolean {
  for (const func of COMPATIBILITY_FUNCTIONS) {
    if (!func(enchA, enchB, version)) return false;
    if (!func(enchB, enchA, version)) return false;
  }
  return true;
}

export function calcEnchantmentTableLevel(rand: JavaRandom, slot: number, bookshelves: number, item: string): number {
  if (Items.getEnchantability(item) === 0) {
    return 0;
  }

  const level = rand.nextInt(8) + 1 + (bookshelves >> 1) + rand.nextInt(bookshelves + 1);

  switch (slot) {
    case 0:
      return Math.max(Math.floor(level / 3), 1);
    case 1:
      return Math.floor((level * 2) / 3) + 1;
    case 2:
      return Math.max(level, bookshelves * 2);
    default:
      throw new Error("Invalid slot: " + slot);
  }
}

export interface EnchantmentInstance {
  enchantment: string;
  level: number;
}

export function getEnchantmentsInTable(
  rand: JavaRandom,
  xpSeed: number,
  item: string,
  slot: number,
  levels: number,
  version: VersionId
): EnchantmentInstance[] {
  rand.setSeed(xpSeed + slot);

  const list = addRandomEnchantments(rand, item, levels, version);
  if (Items.BOOK === item && list.length > 1) {
    list.splice(rand.nextInt(list.length), 1);
  }

  return list;
}

export function getHighestAllowedEnchantments(
  level: number,
  item: string,
  version: VersionId
): EnchantmentInstance[] {
  const allowedEnchantments: EnchantmentInstance[] = [];

  if (isBeforeVersion(version, Items.getIntroducedVersion(item))) {
    return allowedEnchantments;
  }

  for (const enchantment of TABLE_ENCHANTMENTS) {
    if (isBeforeVersion(version, getIntroducedVersion(enchantment))) {
      continue;
    }

    if (canApply(enchantment, item, true)) {
      for (let enchLvl = getMaxLevel(enchantment); enchLvl >= 1; enchLvl--) {
        if (
          level >= getMinEnchantability(enchantment, enchLvl) &&
          level <= getMaxEnchantability(enchantment, enchLvl)
        ) {
          allowedEnchantments.push({ enchantment, level: enchLvl });
          break;
        }
      }
    }
  }
  return allowedEnchantments;
}

export function addRandomEnchantments(
  rand: JavaRandom,
  item: string,
  level: number,
  version: VersionId
): EnchantmentInstance[] {
  const enchantability = Items.getEnchantability(item);
  const enchantments: EnchantmentInstance[] = [];

  if (enchantability > 0) {
    level =
      level +
      1 +
      rand.nextInt(Math.floor(enchantability / 4) + 1) +
      rand.nextInt(Math.floor(enchantability / 4) + 1);

    const percentChange = (rand.nextFloat() + rand.nextFloat() - 1) * 0.15;
    level += Math.round(level * percentChange);
    if (level < 1) {
      level = 1;
    }

    let allowedEnchantments = getHighestAllowedEnchantments(level, item, version);

    if (allowedEnchantments.length > 0) {
      let inst = weightedRandom(rand, allowedEnchantments, it => getWeight(it.enchantment, version));
      if (inst) {
        enchantments.push(inst);
      }

      while (rand.nextInt(50) <= level) {
        if (version === VersionId.V1_14) {
          level = Math.floor((level * 4) / 5) + 1;
          allowedEnchantments = getHighestAllowedEnchantments(level, item, version);
        }

        // Remove incompatible enchantments
        for (const ench of enchantments) {
          const target = ench.enchantment;
          allowedEnchantments = allowedEnchantments.filter(it => areCompatible(it.enchantment, target, version));
        }

        if (allowedEnchantments.length === 0) {
          break;
        }

        inst = weightedRandom(rand, allowedEnchantments, it => getWeight(it.enchantment, version));
        if (inst) {
          enchantments.push(inst);
        }

        level = Math.floor(level / 2);
      }
    }
  }

  return enchantments;
}

function weightedRandom<T>(
  rand: JavaRandom,
  list: T[],
  weightExtractor: (item: T) => number
): T | null {
  let totalWeight = 0;
  for (const item of list) {
    totalWeight += weightExtractor(item);
  }
  if (totalWeight <= 0) {
    return null;
  }
  let weight = rand.nextInt(totalWeight);
  for (const item of list) {
    weight -= weightExtractor(item);
    if (weight < 0) {
      return item;
    }
  }
  return null;
}
