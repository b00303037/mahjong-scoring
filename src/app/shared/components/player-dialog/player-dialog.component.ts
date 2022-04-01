import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { changesValidator } from '../../validators/changes.validator';

import { AVATARS, Player } from '../../models/player';

import {
  PlayerDialogData,
  PlayerDialogResult,
  PlayerFormModel,
} from './player-dialog.models';

@Component({
  selector: 'app-player-dialog',
  templateUrl: './player-dialog.component.html',
  styleUrls: ['./player-dialog.component.scss'],
})
export class PlayerDialogComponent implements OnInit {
  playerFG = new FormGroup(
    {
      avatar: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
    },
    {
      validators: [
        changesValidator({
          target: this.data.player,
          keys: ['avatar', 'name'],
        }),
      ],
    }
  );
  playerFCs: { [key: string]: AbstractControl } = {
    avatar: this.playerFG.controls['avatar'],
    name: this.playerFG.controls['name'],
  };
  get playerFV(): PlayerFormModel {
    return this.playerFG.value;
  }

  avatarIndex: number = -1;
  avatarTotal: number = AVATARS.length;

  private _player: Player;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PlayerDialogData,
    private dialogRef: MatDialogRef<PlayerDialogComponent>
  ) {
    this._player = this.data.player ?? new Player();

    const { name, avatar } = this._player;

    this.playerFG.patchValue({ avatar, name } as Partial<PlayerFormModel>);
    this.avatarIndex = AVATARS.indexOf(avatar);
  }

  ngOnInit(): void {}

  changeAvatar(n: number): void {
    const { avatar } = this.playerFV;
    const i = AVATARS.indexOf(avatar);

    if (i !== -1) {
      const nextIndex = (i + n + AVATARS.length) % AVATARS.length;

      this.playerFCs['avatar'].setValue(AVATARS[nextIndex]);
      this.avatarIndex = nextIndex;
    }
  }

  onSubmit(): void {
    const { avatar, name } = this.playerFV;

    this._player.update({ avatar, name });

    const result: PlayerDialogResult = this._player;

    this.dialogRef.close(result);
  }
}
