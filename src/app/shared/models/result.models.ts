export enum EResults {
  Drawn = 0, // 流局
  Winning = 1, // 胡牌
  SelfDrawn = 2, // 自摸
}

export const RESULTS: Array<EResults> = [
  EResults.Drawn,
  EResults.Winning,
  EResults.SelfDrawn,
];

export const RESULTS_MAPPING = {
  0: '流局',
  1: '胡牌',
  2: '自摸',
};
