import {
  ATC_MINTED_ATOMIC,
  addAtomic,
  type AtcMetricsSnapshot,
} from "@shared/atc";

export class AtcMetricsStore {
  private quotesIssued = 0;
  private readQuotesIssued = 0;
  private actionsPrepared = 0;
  private actionsSettled = 0;
  private reservedFees = 0;
  private paidVolumeAtomic = "0";
  private burnedVolumeAtomic = "0";
  private operatorRewardsAtomic = "0";
  private treasuryVolumeAtomic = "0";

  recordReadQuote() {
    this.quotesIssued += 1;
    this.readQuotesIssued += 1;
  }

  recordActionQuote() {
    this.quotesIssued += 1;
  }

  recordPrepare() {
    this.actionsPrepared += 1;
    this.reservedFees += 1;
  }

  recordSettlement(input: {
    totalAtomic: string;
    burnAtomic: string;
    operatorRewardAtomic: string;
    treasuryAtomic: string;
  }) {
    this.actionsSettled += 1;
    if (this.reservedFees > 0) this.reservedFees -= 1;
    this.paidVolumeAtomic = addAtomic(this.paidVolumeAtomic, input.totalAtomic);
    this.burnedVolumeAtomic = addAtomic(this.burnedVolumeAtomic, input.burnAtomic);
    this.operatorRewardsAtomic = addAtomic(this.operatorRewardsAtomic, input.operatorRewardAtomic);
    this.treasuryVolumeAtomic = addAtomic(this.treasuryVolumeAtomic, input.treasuryAtomic);
  }

  snapshot(): AtcMetricsSnapshot {
    return {
      quotesIssued: this.quotesIssued,
      readQuotesIssued: this.readQuotesIssued,
      actionsPrepared: this.actionsPrepared,
      actionsSettled: this.actionsSettled,
      reservedFees: this.reservedFees,
      paidVolumeAtomic: this.paidVolumeAtomic,
      burnedVolumeAtomic: this.burnedVolumeAtomic,
      operatorRewardsAtomic: this.operatorRewardsAtomic,
      treasuryVolumeAtomic: this.treasuryVolumeAtomic,
      mintedAtomic: ATC_MINTED_ATOMIC,
    };
  }
}
