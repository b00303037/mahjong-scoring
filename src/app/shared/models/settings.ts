/**
 * 牌桌設定
 */
export class Settings {
  isDarkMode: boolean = false; // 是否為暗色模式
  basePrice: number = 100; // 底
  pointPrice: number = 50; // 台
  changeDealerOnDrawn: boolean = false; // 是否流局時過莊
  excludeDealerPoint: boolean = false; // 是否不算莊家台，只算連莊台
  recordReadyHand: boolean = false; // 是否記錄聽牌

  constructor(data?: {
    isDarkMode?: boolean;
    basePrice?: number;
    pointPrice?: number;
    changeDealerOnDrawn?: boolean;
    excludeDealerPoint?: boolean;
    recordReadyHand?: boolean;
  }) {
    this.update(data);
  }

  update(data?: {
    isDarkMode?: boolean;
    basePrice?: number;
    pointPrice?: number;
    changeDealerOnDrawn?: boolean;
    excludeDealerPoint?: boolean;
    recordReadyHand?: boolean;
  }): void {
    if (data) {
      this.isDarkMode = data.isDarkMode ?? this.isDarkMode;
      this.basePrice = data.basePrice ?? this.basePrice;
      this.pointPrice = data.pointPrice ?? this.pointPrice;
      this.changeDealerOnDrawn =
        data.changeDealerOnDrawn ?? this.changeDealerOnDrawn;
      this.excludeDealerPoint =
        data.excludeDealerPoint ?? this.excludeDealerPoint;
      this.recordReadyHand = data.recordReadyHand ?? this.recordReadyHand;
    }
  }
}
