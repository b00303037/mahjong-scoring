import { uuid } from '../helpers/uuid.helper';

/**
 * 牌型
 */
export class Rule {
  uuid: string = uuid(); // 牌型 id
  name: string = ''; // 牌型名稱
  points: number = 0; // 牌型台數
  isDefault: boolean = false; // 是否為預設牌型

  constructor(data?: { uuid?: string; name?: string; points?: number; isDefault?: boolean }) {
    if (data) {
      this.uuid = data.uuid ?? this.uuid;
      this.name = data.name ?? this.name;
      this.points = data.points ?? this.points;
      this.isDefault = data.isDefault ?? this.isDefault;
    }
  }

  update(data?: { name?: string; points?: number }) {
    if (data) {
      this.name = data.name ?? this.name;
      this.points = data.points ?? this.points;
    }
  }
}

// reference: https://www.behance.net/gallery/128691523
export const RULES: Array<Rule> = [
  // 自摸台
  new Rule({ name: '門清', points: 1, isDefault: true }),
  new Rule({ name: '門清自摸', points: 2, isDefault: true }),
  new Rule({ name: '海底撈月', points: 1, isDefault: true }),
  // 單吊台
  new Rule({ name: '偏張', points: 1, isDefault: true }),
  new Rule({ name: '崁張', points: 1, isDefault: true }),
  new Rule({ name: '獨聽', points: 1, isDefault: true }),
  // 圈風台
  new Rule({ name: '圈風刻', points: 1, isDefault: true }),
  new Rule({ name: '門風刻', points: 1, isDefault: true }),
  new Rule({ name: '雙圈風刻', points: 2, isDefault: true }),
  new Rule({ name: '雙門風刻', points: 2, isDefault: true }),
  // 三元台
  new Rule({ name: '三元刻', points: 1, isDefault: true }),
  new Rule({ name: '雙三元刻', points: 2, isDefault: true }),
  new Rule({ name: '小三元', points: 4, isDefault: true }),
  new Rule({ name: '大三元', points: 8, isDefault: true }),
  // 四喜台
  new Rule({ name: '小四喜', points: 8, isDefault: true }),
  new Rule({ name: '大四喜', points: 16, isDefault: true }),
  // 花槓
  new Rule({ name: '正花', points: 1, isDefault: true }),
  new Rule({ name: '雙正花', points: 2, isDefault: true }),
  new Rule({ name: '花槓', points: 2, isDefault: true }),
  new Rule({ name: '雙花槓', points: 4, isDefault: true }),
  // 搶槓
  new Rule({ name: '搶槓', points: 1, isDefault: true }),
  new Rule({ name: '槓上開花', points: 1, isDefault: true }),
  new Rule({ name: '七搶一', points: 8, isDefault: true }),
  new Rule({ name: '八仙過海', points: 8, isDefault: true }),
  // 特殊牌
  new Rule({ name: '全求人', points: 2, isDefault: true }),
  new Rule({ name: '平胡', points: 2, isDefault: true }),
  new Rule({ name: '對對胡', points: 4, isDefault: true }),
  // 暗刻台
  new Rule({ name: '三暗刻', points: 2, isDefault: true }),
  new Rule({ name: '四暗刻', points: 5, isDefault: true }),
  new Rule({ name: '五暗刻', points: 8, isDefault: true }),
  // 一色台
  new Rule({ name: '混一色', points: 4, isDefault: true }),
  new Rule({ name: '清一色', points: 8, isDefault: true }),
  new Rule({ name: '字一色', points: 16, isDefault: true }),
  // 天地胡
  new Rule({ name: '人胡', points: 16, isDefault: true }),
  new Rule({ name: '地胡', points: 16, isDefault: true }),
  new Rule({ name: '天胡', points: 24, isDefault: true }),
];
