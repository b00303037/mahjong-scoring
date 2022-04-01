import { SeatStatus } from './seat-status';
import { EResults } from './result.models';
import { WinnerInfo } from './winner-info';
import { EWinds } from './wind.models';

/**
 * 紀錄
 */
export class Record {
  wind: EWinds = EWinds.East; // 圈風
  seatStatuses: Array<SeatStatus> = [];
  result: EResults = EResults.Drawn; // 結果
  winnerInfos: Array<WinnerInfo> = []; // 贏家資訊
  loserUuid: string = ''; // 輸家 id

  constructor(data: {
    wind: EWinds;
    seatStatuses: Array<SeatStatus>;
    result: EResults;
    winnerInfos: Array<WinnerInfo>;
    loserUuid: string;
  }) {
    this.wind = data.wind ?? this.wind;
    this.seatStatuses =
      data.seatStatuses.map((s) => new SeatStatus({ ...s })) ??
      this.seatStatuses;
    this.result = data.result ?? this.result;
    this.winnerInfos = data.winnerInfos ?? this.winnerInfos;
    this.loserUuid = data.loserUuid ?? this.loserUuid;
  }
}
