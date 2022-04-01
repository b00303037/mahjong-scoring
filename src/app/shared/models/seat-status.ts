import { EWinds } from './wind.models';

/**
 * 座位狀態
 */
export class SeatStatus {
  wind: EWinds;
  playerUuid: string = '';
  dealerRound: number = -1;
  isReadyHand: boolean = false;

  get isDealer(): boolean {
    return this.dealerRound !== -1;
  }

  constructor(data: {
    wind: EWinds;
    playerUuid?: string;
    dealerRound?: number;
    isReadyHand?: boolean;
  }) {
    this.wind = data.wind;
    this.playerUuid = data.playerUuid ?? this.playerUuid;
    this.dealerRound = data.dealerRound ?? this.dealerRound;
    this.isReadyHand = data.isReadyHand ?? this.isReadyHand;
  }
}
