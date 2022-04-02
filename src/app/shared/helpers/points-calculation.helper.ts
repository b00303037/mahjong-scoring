import { WinnerInfoFormModel } from '../components/winning-record-dialog/winning-record-dialog.models';
import { Player } from '../models/player';
import { Rule } from '../models/rule';
import { SeatStatus } from '../models/seat-status';
import { Record } from '../models/record';
import { EResults } from '../models/result.models';
import { WinnerInfo } from '../models/winner-info';

export function calcWinningPoints(data: {
  basePoints: number;
  excludeDealerPoint: boolean;
  dealerSeatStatus: SeatStatus;
  winner: Player | null;
  loser: Player | null;
  rules: Array<Rule> | null;
}): Partial<WinnerInfoFormModel> {
  const {
    basePoints,
    excludeDealerPoint,
    dealerSeatStatus,
    winner,
    loser,
    rules,
  } = data;

  const hasDealerPoints =
    (loser !== null && loser.uuid === dealerSeatStatus.playerUuid) ||
    (winner !== null && winner.uuid === dealerSeatStatus.playerUuid);

  const dealerPoints = hasDealerPoints
    ? (excludeDealerPoint ? 0 : 1) + dealerSeatStatus.dealerRound * 2
    : 0;
  const rulePoints =
    rules?.reduce<number>((total, r) => total + r.points, 0) ?? 0;
  const totalPoints =
    (basePoints ?? 0) + (dealerPoints ?? 0) + (rulePoints ?? 0);

  return {
    basePoints,
    dealerPoints,
    rulePoints,
    totalPoints,
  };
}

export function calcSelfDrawnPoints(data: {
  basePoints: number;
  excludeDealerPoint: boolean;
  dealerSeatStatus: SeatStatus;
  winner: Player | null;
  rules: Array<Rule> | null;
}): Partial<WinnerInfoFormModel> {
  const { basePoints, excludeDealerPoint, dealerSeatStatus, winner, rules } =
    data;

  const isDealerWinner =
    winner !== null && winner.uuid === dealerSeatStatus.playerUuid;

  const dealerPoints =
    (excludeDealerPoint ? 0 : 1) + dealerSeatStatus.dealerRound * 2;
  const rulePoints =
    rules?.reduce<number>((total, r) => total + r.points, 0) ?? 0;
  const totalPoints =
    ((basePoints ?? 0) + (rulePoints ?? 0)) * 3 +
    (dealerPoints ?? 0) * (isDealerWinner ? 3 : 1);

  return {
    basePoints,
    dealerPoints,
    rulePoints,
    totalPoints,
  };
}

export function sumRecordsPoints(data: {
  playerUuid: string;
  basePoints: number;
  excludeDealerPoint: boolean;
  records: Array<Record>;
  rules: Array<Rule> | null;
}): number {
  const { playerUuid, basePoints, excludeDealerPoint, records, rules } = data;

  const totalPoints = records.reduce<number>((points, record) => {
    return calcRecordPoints(
      points,
      record,
      playerUuid,
      basePoints,
      excludeDealerPoint,
      rules
    );
  }, 0);

  return totalPoints;
}

export function calcRecordPoints(
  points: number,
  record: Record,
  playerUuid: string,
  basePoints: number,
  excludeDealerPoint: boolean,
  rules: Array<Rule> | null
): number {
  const { seatStatuses, result, winnerInfos, loserUuid } = record;

  const dealerSeatStatus = seatStatuses.find((s) => s.isDealer) as SeatStatus;
  const winnerSeatStatuses = seatStatuses.filter((s) =>
    winnerInfos.find((w) => w.winnerUuid === s.playerUuid)
  );
  const loserSeatStatus = seatStatuses.find((s) => s.playerUuid === loserUuid);

  const dealerUuid = dealerSeatStatus.playerUuid;

  const isDealer = dealerUuid === playerUuid;
  const isWinner =
    winnerSeatStatuses.find((s) => s.playerUuid === playerUuid) !== undefined;
  const isLoser = loserSeatStatus?.playerUuid === playerUuid;

  switch (result) {
    case EResults.Winning:
      if (isWinner) {
        const winnerInfo = record.winnerInfos.find(
          (w) => w.winnerUuid === playerUuid
        ) as WinnerInfo;

        const hasDealerPoint =
          isDealer || loserSeatStatus?.playerUuid === dealerUuid;

        points += calcWinnerInfoPoints({
          basePoints,
          hasDealerPoint,
          excludeDealerPoint,
          dealerSeatStatus,
          winnerInfo,
          rules,
        });
      } else if (isLoser) {
        points -= record.winnerInfos.reduce<number>((total, w) => {
          const hasDealerPoint = isDealer || w.winnerUuid === dealerUuid;

          total += calcWinnerInfoPoints({
            basePoints,
            hasDealerPoint,
            excludeDealerPoint,
            dealerSeatStatus,
            winnerInfo: w,
            rules,
          });

          return total;
        }, 0);
      }
      break;
    case EResults.SelfDrawn:
      const winnerInfo = record.winnerInfos[0];

      if (isWinner) {
        const hasDealerPoint = isDealer
          ? [true, true, true]
          : [true, false, false];

        points += hasDealerPoint.reduce<number>((total, h) => {
          total += calcWinnerInfoPoints({
            basePoints,
            hasDealerPoint: h,
            excludeDealerPoint,
            dealerSeatStatus,
            winnerInfo,
            rules,
          });

          return total;
        }, 0);
      } else {
        const hasDealerPoint = isDealer || winnerInfo.winnerUuid === dealerUuid;

        points -= calcWinnerInfoPoints({
          basePoints,
          hasDealerPoint,
          excludeDealerPoint,
          dealerSeatStatus,
          winnerInfo,
          rules,
        });
      }
      break;
  }

  return points;
}

function calcWinnerInfoPoints(data: {
  basePoints: number;
  hasDealerPoint: boolean;
  excludeDealerPoint: boolean;
  dealerSeatStatus: SeatStatus;
  winnerInfo: WinnerInfo;
  rules: Array<Rule> | null;
}): number {
  const {
    basePoints,
    hasDealerPoint,
    excludeDealerPoint,
    dealerSeatStatus,
    winnerInfo,
    rules,
  } = data;

  const dealerPoints = hasDealerPoint
    ? (excludeDealerPoint ? 0 : 1) + dealerSeatStatus.dealerRound * 2
    : 0;
  const rulePoints = winnerInfo.ruleUuids.reduce<number>(
    (total, ruleUuid) =>
      (total += rules?.find((r) => r.uuid === ruleUuid)?.points ?? 0),
    0
  );

  return basePoints + dealerPoints + rulePoints;
}
