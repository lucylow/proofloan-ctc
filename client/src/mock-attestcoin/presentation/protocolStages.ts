export const PROTOCOL_STAGES = [
  ["Source block located", "Fetch the mined source transaction."],
  ["Block attestation available", "Wait until the source block can be proven."],
  ["Proof generated", "Receive Merkle and continuity proof material."],
  ["Creditcoin verified", "Validate the proof with the Block Prover."],
  ["Facts admitted", "Only verified fields enter the evidence boundary."],
] as const;

export function stageIndexForProofStatus(status: string) {
  if (status === "queued") return 0;
  if (status === "delayed" || status === "attesting") return 1;
  if (status === "proven" || status === "partial") return 2;
  if (status === "rejected") return 3;
  if (status === "verified") return 4;
  return 0;
}
