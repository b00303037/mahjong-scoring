import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { changesValidator } from '../../validators/changes.validator';
import { PlayerService } from '../../services/player.service';

import {
  PlayerPickerDialogData,
  PlayerPickerDialogResult,
  PlayerPickerFormModel,
} from './player-picker-dialog.models';

import { Player } from '../../models/player';

@Component({
  selector: 'app-player-picker-dialog',
  templateUrl: './player-picker-dialog.component.html',
  styleUrls: ['./player-picker-dialog.component.scss'],
})
export class PlayerPickerDialogComponent implements OnInit {
  players$: Observable<Array<Player>> = this.playerService.playersSource$;

  playerPickerFG = new FormGroup(
    {
      playerUuid: new FormControl('', [Validators.required]),
    },
    {
      validators: this.data?.playerUuid
        ? [
            changesValidator({
              target: { playerUuid: this.data.playerUuid },
              keys: ['playerUuid'],
            }),
          ]
        : [],
    }
  );
  playerPickerFCs: { [key: string]: AbstractControl } = {
    playerUuid: this.playerPickerFG.controls['playerUuid'],
  };
  get playerPickerFV(): PlayerPickerFormModel {
    return this.playerPickerFG.value;
  }

  playerIndex: number = -1;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PlayerPickerDialogData,
    private dialogRef: MatDialogRef<PlayerPickerDialogComponent>,
    private playerService: PlayerService
  ) {
    const players = this.playerService.playersSource$.getValue();
    const playerUuid = this.data?.playerUuid || players[0].uuid;

    this.playerPickerFG.patchValue({
      playerUuid,
    } as Partial<PlayerPickerFormModel>);
    this.playerIndex = players.findIndex((p) => p.uuid === playerUuid);
  }

  ngOnInit(): void {}

  changePlayer(n: number): void {
    const players = this.playerService.playersSource$.getValue();
    const { playerUuid } = this.playerPickerFV;

    const i = players.findIndex((p) => p.uuid === playerUuid);

    if (i !== -1) {
      const nextIndex = (i + n + players.length) % players.length;

      this.playerPickerFCs['playerUuid'].setValue(players[nextIndex].uuid);
      this.playerIndex = nextIndex;
    }
  }

  onSubmit(): void {
    const players = this.playerService.playersSource$.getValue();

    const result: PlayerPickerDialogResult = players[this.playerIndex];

    this.dialogRef.close(result);
  }
}
