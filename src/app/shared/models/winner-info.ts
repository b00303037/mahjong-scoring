/**
 * 贏家資訊
 */
export interface WinnerInfo {
  winnerUuid: string; // 贏家 id
  ruleUuids: Array<string>; // 牌型 id
}
