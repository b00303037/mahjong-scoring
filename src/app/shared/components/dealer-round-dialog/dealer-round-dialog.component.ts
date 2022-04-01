import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { changesValidator } from '../../validators/changes.validator';

import {
  DealerRoundDialogData,
  DealerRoundDialogResult,
  DealerRoundFormModel,
} from './dealer-round-dialog.models';

@Component({
  selector: 'app-dealer-round-dialog',
  templateUrl: './dealer-round-dialog.component.html',
  styleUrls: ['./dealer-round-dialog.component.scss'],
})
export class DealerRoundDialogComponent implements OnInit {
  dealerRoundFG = new FormGroup(
    {
      dealerRound: new FormControl(0, [
        Validators.required,
        Validators.min(0),
        Validators.max(99),
      ]),
    },
    {
      validators: [
        changesValidator({
          target: { dealerRound: this.data.dealerRound },
          keys: ['dealerRound'],
        }),
      ],
    }
  );
  dealerRoundFCs: { [key: string]: AbstractControl } = {
    dealerRound: this.dealerRoundFG.controls['dealerRound'],
  };
  get dealerRoundFV(): DealerRoundFormModel {
    return this.dealerRoundFG.value;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DealerRoundDialogData,
    private dialogRef: MatDialogRef<DealerRoundDialogComponent>
  ) {
    const { dealerRound } = this.data;

    this.dealerRoundFG.patchValue({
      dealerRound,
    } as Partial<DealerRoundFormModel>);
  }

  ngOnInit(): void {}

  onSubmit(): void {
    const { dealerRound } = this.dealerRoundFV;

    const result: DealerRoundDialogResult = dealerRound;

    this.dialogRef.close(result);
  }
}
