export type AttestorChainProfile = { chainId: string; displayName: string; maturityDelaySeconds: number; supportsMerkleProof: boolean; supportsContinuityProof: boolean; supportsMessageInbox: boolean };

export const attestorChainProfiles: AttestorChainProfile[] = [
  { chainId: "ethereum-sepolia", displayName: "Ethereum Sepolia", maturityDelaySeconds: 120, supportsMerkleProof: true, supportsContinuityProof: true, supportsMessageInbox: false },
  { chainId: "ethereum-mainnet", displayName: "Ethereum Mainnet", maturityDelaySeconds: 900, supportsMerkleProof: true, supportsContinuityProof: true, supportsMessageInbox: false },
  { chainId: "polygon-amoy", displayName: "Polygon Amoy", maturityDelaySeconds: 120, supportsMerkleProof: true, supportsContinuityProof: true, supportsMessageInbox: false },
];

export function getChainProfile(chainId: string): AttestorChainProfile | undefined { return attestorChainProfiles.find(p => p.chainId === chainId); }
