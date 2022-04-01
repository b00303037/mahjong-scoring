import { Player } from '../../models/player';

export class PlayerPickerDialogData {
  playerUuid?: string;

  constructor(data?: { playerUuid?: string }) {
    if (data) {
      this.playerUuid = data.playerUuid ?? this.playerUuid;
    }
  }
}

export interface PlayerPickerFormModel {
  playerUuid: string;
}

export type PlayerPickerDialogResult = Player;
