import { VersionId } from './Versions';

export const MATERIAL_NETHERITE = 0;
export const MATERIAL_DIAMOND = 1;
export const MATERIAL_GOLD = 2;
export const MATERIAL_IRON = 3;
export const MATERIAL_COPPER = 4;
export const MATERIAL_CHAIN = 5;
export const MATERIAL_STONE = 6;
export const MATERIAL_LEATHER = 7;
export const MATERIAL_MISC = 8; // Book, bow, rod, etc.

export function getMaterialIntroducedVersion(material: number): VersionId {
  switch (material) {
    case MATERIAL_COPPER:
      return VersionId.V1_21_9;
    case MATERIAL_NETHERITE:
      return VersionId.V1_16;
    default:
      return VersionId.V1_8;
  }
}
