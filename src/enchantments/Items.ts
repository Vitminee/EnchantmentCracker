import { VersionId } from './Versions';

export const LEATHER_HELMET = "leather_helmet";
export const LEATHER_CHESTPLATE = "leather_chestplate";
export const LEATHER_LEGGINGS = "leather_leggings";
export const LEATHER_BOOTS = "leather_boots";
export const IRON_HELMET = "iron_helmet";
export const IRON_CHESTPLATE = "iron_chestplate";
export const IRON_LEGGINGS = "iron_leggings";
export const IRON_BOOTS = "iron_boots";
export const CHAINMAIL_HELMET = "chainmail_helmet";
export const CHAINMAIL_CHESTPLATE = "chainmail_chestplate";
export const CHAINMAIL_LEGGINGS = "chainmail_leggings";
export const CHAINMAIL_BOOTS = "chainmail_boots";
export const GOLDEN_HELMET = "golden_helmet";
export const GOLDEN_CHESTPLATE = "golden_chestplate";
export const GOLDEN_LEGGINGS = "golden_leggings";
export const GOLDEN_BOOTS = "golden_boots";
export const DIAMOND_HELMET = "diamond_helmet";
export const DIAMOND_CHESTPLATE = "diamond_chestplate";
export const DIAMOND_LEGGINGS = "diamond_leggings";
export const DIAMOND_BOOTS = "diamond_boots";
export const WOODEN_SWORD = "wooden_sword";
export const STONE_SWORD = "stone_sword";
export const IRON_SWORD = "iron_sword";
export const GOLDEN_SWORD = "golden_sword";
export const DIAMOND_SWORD = "diamond_sword";
export const WOODEN_PICKAXE = "wooden_pickaxe";
export const STONE_PICKAXE = "stone_pickaxe";
export const IRON_PICKAXE = "iron_pickaxe";
export const GOLDEN_PICKAXE = "golden_pickaxe";
export const DIAMOND_PICKAXE = "diamond_pickaxe";
export const WOODEN_AXE = "wooden_axe";
export const STONE_AXE = "stone_axe";
export const IRON_AXE = "iron_axe";
export const GOLDEN_AXE = "golden_axe";
export const DIAMOND_AXE = "diamond_axe";
export const WOODEN_SHOVEL = "wooden_shovel";
export const STONE_SHOVEL = "stone_shovel";
export const IRON_SHOVEL = "iron_shovel";
export const GOLDEN_SHOVEL = "golden_shovel";
export const DIAMOND_SHOVEL = "diamond_shovel";
export const WOODEN_HOE = "wooden_hoe";
export const STONE_HOE = "stone_hoe";
export const IRON_HOE = "iron_hoe";
export const GOLDEN_HOE = "golden_hoe";
export const DIAMOND_HOE = "diamond_hoe";
export const CARROT_ON_A_STICK = "carrot_on_a_stick";
export const FISHING_ROD = "fishing_rod";
export const FLINT_AND_STEEL = "flint_and_steel";
export const SHEARS = "shears";
export const BOW = "bow";
export const BOOK = "book";
export const PUMPKIN = "pumpkin";
export const SKULL = "skull";

// 1.9
export const ELYTRA = "elytra";
export const SHIELD = "shield";

// 1.13
export const TRIDENT = "trident";
export const TURTLE_HELMET = "turtle_helmet";

// 1.14
export const CROSSBOW = "crossbow";

// 1.16
export const NETHERITE_HELMET = "netherite_helmet";
export const NETHERITE_CHESTPLATE = "netherite_chestplate";
export const NETHERITE_LEGGINGS = "netherite_leggings";
export const NETHERITE_BOOTS = "netherite_boots";
export const NETHERITE_SWORD = "netherite_sword";
export const NETHERITE_PICKAXE = "netherite_pickaxe";
export const NETHERITE_AXE = "netherite_axe";
export const NETHERITE_SHOVEL = "netherite_shovel";
export const NETHERITE_HOE = "netherite_hoe";

// 1.21
export const MACE = "mace";

// 1.21.9
export const COPPER_HELMET = "copper_helmet";
export const COPPER_CHESTPLATE = "copper_chestplate";
export const COPPER_LEGGINGS = "copper_leggings";
export const COPPER_BOOTS = "copper_boots";
export const COPPER_SWORD = "copper_sword";
export const COPPER_PICKAXE = "copper_pickaxe";
export const COPPER_AXE = "copper_axe";
export const COPPER_SHOVEL = "copper_shovel";
export const COPPER_HOE = "copper_hoe";

// 1.21.11
export const NETHERITE_SPEAR = "netherite_spear";
export const DIAMOND_SPEAR = "diamond_spear";
export const GOLDEN_SPEAR = "golden_spear";
export const IRON_SPEAR = "iron_spear";
export const COPPER_SPEAR = "copper_spear";
export const STONE_SPEAR = "stone_spear";
export const WOODEN_SPEAR = "wooden_spear";

export const ITEM_GRID: (string | null)[][][] = [
  // 0: Netherite
  [
    [NETHERITE_SWORD, NETHERITE_PICKAXE, NETHERITE_AXE, NETHERITE_SHOVEL, NETHERITE_HOE],
    [NETHERITE_SPEAR, NETHERITE_HELMET, NETHERITE_CHESTPLATE, NETHERITE_LEGGINGS, NETHERITE_BOOTS],
  ],
  // 1: Diamond
  [
    [DIAMOND_SWORD, DIAMOND_PICKAXE, DIAMOND_AXE, DIAMOND_SHOVEL, DIAMOND_HOE],
    [DIAMOND_SPEAR, DIAMOND_HELMET, DIAMOND_CHESTPLATE, DIAMOND_LEGGINGS, DIAMOND_BOOTS],
  ],
  // 2: Gold
  [
    [GOLDEN_SWORD, GOLDEN_PICKAXE, GOLDEN_AXE, GOLDEN_SHOVEL, GOLDEN_HOE],
    [GOLDEN_SPEAR, GOLDEN_HELMET, GOLDEN_CHESTPLATE, GOLDEN_LEGGINGS, GOLDEN_BOOTS],
  ],
  // 3: Iron
  [
    [IRON_SWORD, IRON_PICKAXE, IRON_AXE, IRON_SHOVEL, IRON_HOE],
    [IRON_SPEAR, IRON_HELMET, IRON_CHESTPLATE, IRON_LEGGINGS, IRON_BOOTS],
  ],
  // 4: Copper
  [
    [COPPER_SWORD, COPPER_PICKAXE, COPPER_AXE, COPPER_SHOVEL, COPPER_HOE],
    [COPPER_SPEAR, COPPER_HELMET, COPPER_CHESTPLATE, COPPER_LEGGINGS, COPPER_BOOTS],
  ],
  // 5: Chain
  [
    [IRON_SWORD, IRON_PICKAXE, IRON_AXE, IRON_SHOVEL, IRON_HOE],
    [IRON_SPEAR, CHAINMAIL_HELMET, CHAINMAIL_CHESTPLATE, CHAINMAIL_LEGGINGS, CHAINMAIL_BOOTS],
  ],
  // 6: Stone
  [
    [STONE_SWORD, STONE_PICKAXE, STONE_AXE, STONE_SHOVEL, STONE_HOE],
    [STONE_SPEAR, TURTLE_HELMET, LEATHER_CHESTPLATE, LEATHER_LEGGINGS, LEATHER_BOOTS],
  ],
  // 7: Leather
  [
    [WOODEN_SWORD, WOODEN_PICKAXE, WOODEN_AXE, WOODEN_SHOVEL, WOODEN_HOE],
    [WOODEN_SPEAR, LEATHER_HELMET, LEATHER_CHESTPLATE, LEATHER_LEGGINGS, LEATHER_BOOTS],
  ],
  // 8: Misc
  [
    [BOW, FISHING_ROD, CROSSBOW, TRIDENT, MACE],
    [BOOK, null, null, null, null],
  ],
];

export function isArmor(item: string): boolean {
  if (
    item.endsWith("_helmet") ||
    item.endsWith("_chestplate") ||
    item.endsWith("_leggings") ||
    item.endsWith("_boots")
  ) {
    return (
      item === LEATHER_HELMET ||
      item === LEATHER_CHESTPLATE ||
      item === LEATHER_LEGGINGS ||
      item === LEATHER_BOOTS ||
      item === IRON_HELMET ||
      item === IRON_CHESTPLATE ||
      item === IRON_LEGGINGS ||
      item === IRON_BOOTS ||
      item === CHAINMAIL_HELMET ||
      item === CHAINMAIL_CHESTPLATE ||
      item === CHAINMAIL_LEGGINGS ||
      item === CHAINMAIL_BOOTS ||
      item === GOLDEN_HELMET ||
      item === GOLDEN_CHESTPLATE ||
      item === GOLDEN_LEGGINGS ||
      item === GOLDEN_BOOTS ||
      item === DIAMOND_HELMET ||
      item === DIAMOND_CHESTPLATE ||
      item === DIAMOND_LEGGINGS ||
      item === DIAMOND_BOOTS ||
      item === TURTLE_HELMET ||
      item === NETHERITE_HELMET ||
      item === NETHERITE_CHESTPLATE ||
      item === NETHERITE_LEGGINGS ||
      item === NETHERITE_BOOTS ||
      item === COPPER_HELMET ||
      item === COPPER_CHESTPLATE ||
      item === COPPER_LEGGINGS ||
      item === COPPER_BOOTS
    );
  }
  return false;
}

export function isHelmet(item: string): boolean {
  return isArmor(item) && item.endsWith("_helmet");
}

export function isChestplate(item: string): boolean {
  return isArmor(item) && item.endsWith("_chestplate");
}

export function isLeggings(item: string): boolean {
  return isArmor(item) && item.endsWith("_leggings");
}

export function isBoots(item: string): boolean {
  return isArmor(item) && item.endsWith("_boots");
}

export function isSword(item: string): boolean {
  if (item.endsWith("_sword")) {
    return (
      item === WOODEN_SWORD ||
      item === STONE_SWORD ||
      item === IRON_SWORD ||
      item === GOLDEN_SWORD ||
      item === DIAMOND_SWORD ||
      item === NETHERITE_SWORD ||
      item === COPPER_SWORD
    );
  }
  return false;
}

export function isSpear(item: string): boolean {
  if (item.endsWith("_spear")) {
    return (
      item === WOODEN_SPEAR ||
      item === STONE_SPEAR ||
      item === IRON_SPEAR ||
      item === GOLDEN_SPEAR ||
      item === DIAMOND_SPEAR ||
      item === NETHERITE_SPEAR ||
      item === COPPER_SPEAR
    );
  }
  return false;
}

export function isAxe(item: string): boolean {
  if (item.endsWith("_axe")) {
    return (
      item === WOODEN_AXE ||
      item === STONE_AXE ||
      item === IRON_AXE ||
      item === GOLDEN_AXE ||
      item === DIAMOND_AXE ||
      item === NETHERITE_AXE ||
      item === COPPER_AXE
    );
  }
  return false;
}

export function isTool(item: string): boolean {
  if (isAxe(item)) {
    return true;
  }
  if (
    item.endsWith("_pickaxe") ||
    item.endsWith("_shovel") ||
    item.endsWith("_hoe")
  ) {
    return (
      item === WOODEN_PICKAXE ||
      item === STONE_PICKAXE ||
      item === IRON_PICKAXE ||
      item === GOLDEN_PICKAXE ||
      item === DIAMOND_PICKAXE ||
      item === NETHERITE_PICKAXE ||
      item === COPPER_PICKAXE ||
      item === WOODEN_SHOVEL ||
      item === STONE_SHOVEL ||
      item === IRON_SHOVEL ||
      item === GOLDEN_SHOVEL ||
      item === DIAMOND_SHOVEL ||
      item === NETHERITE_SHOVEL ||
      item === COPPER_SHOVEL ||
      item === WOODEN_HOE ||
      item === STONE_HOE ||
      item === IRON_HOE ||
      item === GOLDEN_HOE ||
      item === DIAMOND_HOE ||
      item === NETHERITE_HOE ||
      item === COPPER_HOE
    );
  }
  return false;
}

export function hasDurability(item: string): boolean {
  return (
    isArmor(item) ||
    isTool(item) ||
    isSword(item) ||
    isSpear(item) ||
    item === BOW ||
    item === CARROT_ON_A_STICK ||
    item === ELYTRA ||
    item === FISHING_ROD ||
    item === FLINT_AND_STEEL ||
    item === SHEARS ||
    item === SHIELD ||
    item === TRIDENT ||
    item === CROSSBOW ||
    item === MACE
  );
}

export function getEnchantability(item: string): number {
  if (isArmor(item)) {
    if (item.startsWith("leather_")) return 15;
    if (item.startsWith("iron_")) return 9;
    if (item.startsWith("chainmail_")) return 12;
    if (item.startsWith("golden_")) return 25;
    if (item.startsWith("diamond_")) return 10;
    if (item.startsWith("turtle_")) return 9;
    if (item.startsWith("netherite_")) return 15;
    if (item.startsWith("copper_")) return 8;
  }
  if (isSword(item) || isSpear(item) || isTool(item)) {
    if (item.startsWith("wooden_")) return 15;
    if (item.startsWith("stone_")) return 5;
    if (item.startsWith("iron_")) return 14;
    if (item.startsWith("golden_")) return 22;
    if (item.startsWith("diamond_")) return 10;
    if (item.startsWith("netherite_")) return 15;
    if (item.startsWith("copper_")) return 13;
  }
  if (item === BOW) return 1;
  if (item === FISHING_ROD) return 1;
  if (item === TRIDENT) return 1;
  if (item === CROSSBOW) return 1;
  if (item === MACE) return 15;
  if (item === BOOK) return 1;
  return 0;
}

export function getIntroducedVersion(item: string): VersionId {
  switch (item) {
    case ELYTRA:
    case SHIELD:
      return VersionId.V1_9;
    case TRIDENT:
    case TURTLE_HELMET:
      return VersionId.V1_13;
    case CROSSBOW:
      return VersionId.V1_14;
    case NETHERITE_HELMET:
    case NETHERITE_CHESTPLATE:
    case NETHERITE_LEGGINGS:
    case NETHERITE_BOOTS:
    case NETHERITE_SWORD:
    case NETHERITE_PICKAXE:
    case NETHERITE_AXE:
    case NETHERITE_SHOVEL:
    case NETHERITE_HOE:
      return VersionId.V1_16;
    case MACE:
      return VersionId.V1_21;
    case COPPER_HELMET:
    case COPPER_CHESTPLATE:
    case COPPER_LEGGINGS:
    case COPPER_BOOTS:
    case COPPER_SWORD:
    case COPPER_PICKAXE:
    case COPPER_AXE:
    case COPPER_SHOVEL:
    case COPPER_HOE:
      return VersionId.V1_21_9;
    case NETHERITE_SPEAR:
    case DIAMOND_SPEAR:
    case GOLDEN_SPEAR:
    case IRON_SPEAR:
    case COPPER_SPEAR:
    case STONE_SPEAR:
    case WOODEN_SPEAR:
      return VersionId.V1_21_11;
    default:
      return VersionId.V1_8;
  }
}
