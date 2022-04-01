import { Player } from '../../models/player';
import { Rule } from '../../models/rule';
import { WinnerInfo } from '../../models/winner-info';

export type SelfDrawnRecordFormModel = WinnerInfoFormModel;

export interface WinnerInfoFormModel {
  winner: Player | null;
  rules: Array<Rule> | null;
  basePoints: number;
  rulePoints: number;
  dealerPoints: number;
  totalPoints: number;
}

export type SelfDrawnRecordDialogResult = {
  winnerInfo: WinnerInfo;
};
