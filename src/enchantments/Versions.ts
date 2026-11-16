export enum VersionId {
  V1_8 = 0,
  V1_9 = 1,
  V1_11 = 2,
  V1_11_1 = 3,
  V1_13 = 4,
  V1_14 = 5,
  V1_14_3 = 6,
  V1_16 = 7,
  V1_21 = 8,
  V1_21_9 = 9,
  V1_21_11 = 10,
}

export interface VersionInfo {
  id: VersionId;
  name: string;
}

export const VERSIONS: VersionInfo[] = [
  { id: VersionId.V1_8, name: "1.8 - 1.8.9" },
  { id: VersionId.V1_9, name: "1.9 - 1.10.2" },
  { id: VersionId.V1_11, name: "1.11" },
  { id: VersionId.V1_11_1, name: "1.11.1 - 1.12.2" },
  { id: VersionId.V1_13, name: "1.13 - 1.13.2" },
  { id: VersionId.V1_14, name: "1.14 - 1.14.2" },
  { id: VersionId.V1_14_3, name: "1.14.3 - 1.15.2" },
  { id: VersionId.V1_16, name: "1.16 - 1.20.6" },
  { id: VersionId.V1_21, name: "1.21 - 1.21.8" },
  { id: VersionId.V1_21_9, name: "1.21.9 - 1.21.10" },
  { id: VersionId.V1_21_11, name: "1.21.11 - latest" },
];

export function isBeforeVersion(a: VersionId, b: VersionId): boolean {
  return a < b;
}

export function isAfterVersion(a: VersionId, b: VersionId): boolean {
  return a > b;
}

export function latestVersion(): VersionId {
  return VersionId.V1_21_11;
}
