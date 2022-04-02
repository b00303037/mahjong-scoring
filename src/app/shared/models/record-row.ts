import { Rule } from './rule';
import { EResults } from './result.models';
import { EWinds } from './wind.models';

export interface RecordRow {
  boardWind: EWinds;
  dealerWind: EWinds;
  result: EResults;
  [key: string]: RecordCol | EWinds | EResults;
}

interface RecordCol {
  points: number;
  wind: EWinds;
  dealerRound: number;
  isReadyHand: boolean;
  isWinner: boolean;
  isLoser: boolean;
  rules: Array<Rule>;
}
