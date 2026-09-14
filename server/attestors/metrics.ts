export class AttestorMetrics {
  observations = 0;
  finalized = 0;
  certificates = 0;
  readProofs = 0;
  messageAttestations = 0;
  relays = 0;
  relayFailures = 0;
  faults = 0;
  slashes = 0;
  rewardsAtomic = 0n;

  recordReward(amount: bigint) { this.rewardsAtomic += amount; }
  toJSON() {
    return {
      observations: this.observations,
      finalized: this.finalized,
      certificates: this.certificates,
      readProofs: this.readProofs,
      messageAttestations: this.messageAttestations,
      relays: this.relays,
      relayFailures: this.relayFailures,
      faults: this.faults,
      slashes: this.slashes,
      rewardsAtomic: this.rewardsAtomic.toString(),
    };
  }
}
