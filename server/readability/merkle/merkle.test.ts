import { describe, expect, it } from "vitest";
import { DeterministicProofBuilder } from "../proof-builder";
import { PreviewBlockProver } from "../asc";
import { fixtureReadabilityQuery, fixtureSourceEvent } from "../fixtures";
import { hashInner, hashLeaf, MERKLE_HASHING, ZERO_HASH } from "./hash";
import { buildTransactionTree, KeccakMerkleTree } from "./tree";
import { assessMerkleProof, assessPreviewMerkleInclusion, verifyMerkleProof } from "./verify";
import { PREVIEW_TREE_WIDTH, buildPreviewLeaves, previewTreeIndex } from "./preview";

const leaves = ["0xaa", "0xbb", "0xcc", "0xdd"];

describe("readability merkle hashing", () => {
  it("domain-separates leaves from inner nodes", () => {
    const leaf = hashLeaf("0xaa");
    const inner = hashInner(leaf, leaf);
    expect(leaf).toMatch(/^0x[0-9a-f]{64}$/);
    expect(inner).toMatch(/^0x[0-9a-f]{64}$/);
    expect(leaf).not.toBe(inner);
    expect(ZERO_HASH).toHaveLength(66);
  });
});

describe("readability merkle tree", () => {
  it("builds a sibling path that reconstructs the root", () => {
    const proof = buildTransactionTree(leaves, 2);
    expect(proof.leafCount).toBe(4);
    expect(proof.transactionIndex).toBe(2);
    expect(proof.depth).toBe(2);
    expect(proof.siblings.length).toBe(2);
    expect(verifyMerkleProof(leaves[2], proof.siblings, proof.merkleRoot)).toBe(true);
  });

  it("rejects a tampered encoded transaction", () => {
    const proof = buildTransactionTree(leaves, 1);
    expect(verifyMerkleProof("0xee", proof.siblings, proof.merkleRoot)).toBe(false);
  });

  it("rejects a tampered sibling", () => {
    const proof = buildTransactionTree(leaves, 0);
    const siblings = proof.siblings.map((sibling, index) =>
      index === 0 ? { ...sibling, hash: ZERO_HASH } : sibling,
    );
    expect(verifyMerkleProof(leaves[0], siblings, proof.merkleRoot)).toBe(false);
  });

  it("throws when the target index is out of range", () => {
    expect(() => new KeccakMerkleTree(leaves).getProof(4)).toThrow(/out of range/);
  });

  it("rejects an empty transaction set as a typed proof error", () => {
    expect(() => new KeccakMerkleTree([])).toThrow(/empty transaction set/);
  });

  it("uses empty siblings for a single-leaf tree", () => {
    const proof = buildTransactionTree(["0xabc123"], 0);
    expect(proof.siblings).toEqual([]);
    expect(proof.merkleRoot).toBe(hashLeaf("0xabc123"));
    expect(verifyMerkleProof("0xabc123", [], proof.merkleRoot)).toBe(true);
  });
});

describe("preview merkle inclusion", () => {
  it("emits a verifiable USC-style path from DeterministicProofBuilder", async () => {
    const event = fixtureSourceEvent();
    const bundle = await new DeterministicProofBuilder().build(fixtureReadabilityQuery(), event);
    expect(bundle.hashing).toBe(MERKLE_HASHING);
    expect(bundle.leafCount).toBe(PREVIEW_TREE_WIDTH);
    expect(bundle.txIndex).toBe(previewTreeIndex(event));
    expect(bundle.siblings?.length).toBeGreaterThan(0);
    expect(bundle.merkleRoot).toBe(bundle.proofRoot);
    const inclusion = assessPreviewMerkleInclusion(bundle);
    expect(inclusion.valid).toBe(true);
    expect(inclusion.educational).toBe(true);
    expect(await new PreviewBlockProver().verify(bundle)).toBe(true);
  });

  it("fails inclusion when preview siblings are stripped", async () => {
    const bundle = await new DeterministicProofBuilder().build(
      fixtureReadabilityQuery(),
      fixtureSourceEvent(),
    );
    const stripped = { ...bundle, siblings: [] };
    const inclusion = assessPreviewMerkleInclusion(stripped);
    expect(inclusion.valid).toBe(false);
    expect(await new PreviewBlockProver().verify(stripped)).toBe(false);
  });

  it("places the source payload at the preview tree index", () => {
    const event = fixtureSourceEvent({ transactionIndex: 11 });
    const previewLeaves = buildPreviewLeaves(event);
    expect(previewLeaves).toHaveLength(PREVIEW_TREE_WIDTH);
    expect(previewLeaves[previewTreeIndex(event)]).toBe(event.data);
    expect(previewLeaves.filter(leaf => leaf === event.data)).toHaveLength(1);
  });

  it("flags sibling depth that does not match the claimed leaf count", () => {
    const proof = buildTransactionTree(leaves, 0);
    const assessment = assessMerkleProof({
      encodedTransaction: leaves[0],
      merkleRoot: proof.merkleRoot,
      siblings: proof.siblings.slice(0, 1),
      leafCount: 4,
      txIndex: 0,
    });
    expect(assessment.valid).toBe(false);
    expect(assessment.reason).toMatch(/Sibling depth/);
  });
});
