import { calculateMerkleRoot } from "../merkle";

export const VECTOR_LEAVES = Array.from({ length: 30 }, (_, index) => `leaf-${String(index + 1).padStart(2, "0")}`);

export function merkleVectorRoot(leaf: string): string {
  return calculateMerkleRoot(leaf, []);
}

export const vector_01 = () => merkleVectorRoot("leaf-01");
export const vector_02 = () => merkleVectorRoot("leaf-02");
export const vector_03 = () => merkleVectorRoot("leaf-03");
export const vector_04 = () => merkleVectorRoot("leaf-04");
export const vector_05 = () => merkleVectorRoot("leaf-05");
export const vector_06 = () => merkleVectorRoot("leaf-06");
export const vector_07 = () => merkleVectorRoot("leaf-07");
export const vector_08 = () => merkleVectorRoot("leaf-08");
export const vector_09 = () => merkleVectorRoot("leaf-09");
export const vector_10 = () => merkleVectorRoot("leaf-10");
export const vector_11 = () => merkleVectorRoot("leaf-11");
export const vector_12 = () => merkleVectorRoot("leaf-12");
export const vector_13 = () => merkleVectorRoot("leaf-13");
export const vector_14 = () => merkleVectorRoot("leaf-14");
export const vector_15 = () => merkleVectorRoot("leaf-15");
export const vector_16 = () => merkleVectorRoot("leaf-16");
export const vector_17 = () => merkleVectorRoot("leaf-17");
export const vector_18 = () => merkleVectorRoot("leaf-18");
export const vector_19 = () => merkleVectorRoot("leaf-19");
export const vector_20 = () => merkleVectorRoot("leaf-20");
export const vector_21 = () => merkleVectorRoot("leaf-21");
export const vector_22 = () => merkleVectorRoot("leaf-22");
export const vector_23 = () => merkleVectorRoot("leaf-23");
export const vector_24 = () => merkleVectorRoot("leaf-24");
export const vector_25 = () => merkleVectorRoot("leaf-25");
export const vector_26 = () => merkleVectorRoot("leaf-26");
export const vector_27 = () => merkleVectorRoot("leaf-27");
export const vector_28 = () => merkleVectorRoot("leaf-28");
export const vector_29 = () => merkleVectorRoot("leaf-29");
export const vector_30 = () => merkleVectorRoot("leaf-30");
