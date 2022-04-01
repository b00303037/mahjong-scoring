export class DealerRoundDialogData {
  dealerRound: number = 0;

  constructor(data?: { dealerRound?: number }) {
    if (data) {
      this.dealerRound = data.dealerRound ?? this.dealerRound;
    }
  }
}

export interface DealerRoundFormModel {
  dealerRound: number;
}

export type DealerRoundDialogResult = number;
