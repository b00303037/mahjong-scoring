import { Player } from '../../models/player';

export class PlayerDialogData {
  player?: Player;

  constructor(data?: { player?: Player }) {
    if (data) {
      this.player = data.player ?? this.player;
    }
  }
}

export interface PlayerFormModel {
  avatar: string;
  name: string;
}

export type PlayerDialogResult = Player;
