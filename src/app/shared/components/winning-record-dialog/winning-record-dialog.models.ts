import { Player } from '../../models/player';
import { Rule } from '../../models/rule';
import { WinnerInfo } from '../../models/winner-info';

export interface WinningRecordFormModel {
  loser: Player | null;
  hasMultiWinners: boolean;
  winnerInfos: Array<WinnerInfoFormModel>;
}

export interface WinnerInfoFormModel {
  winner: Player | null;
  rules: Array<Rule> | null;
  basePoints: number;
  rulePoints: number;
  dealerPoints: number;
  totalPoints: number;
}

export type WinningRecordDialogResult = {
  winnerInfos: Array<WinnerInfo>;
  loserUuid: string;
};
