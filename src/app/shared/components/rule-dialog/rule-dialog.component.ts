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
  RuleDialogData,
  RuleDialogResult,
  RuleFormModel,
} from './rule-dialog.models';

import { Rule } from '../../models/rule';

@Component({
  selector: 'app-rule-dialog',
  templateUrl: './rule-dialog.component.html',
  styleUrls: ['./rule-dialog.component.scss'],
})
export class RuleDialogComponent implements OnInit {
  ruleFG = new FormGroup(
    {
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(12),
      ]),
      points: new FormControl(0, [Validators.required]),
    },
    {
      validators: [
        changesValidator({
          target: this.data.rule,
          keys: ['name', 'points'],
        }),
      ],
    }
  );
  ruleFCs: { [key: string]: AbstractControl } = {
    name: this.ruleFG.controls['name'],
    points: this.ruleFG.controls['points'],
  };
  get ruleFV(): RuleFormModel {
    return this.ruleFG.value;
  }

  private _rule: Rule;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: RuleDialogData,
    private dialogRef: MatDialogRef<RuleDialogComponent>
  ) {
    this._rule = this.data.rule ?? new Rule();

    const { name, points } = this._rule;

    this.ruleFG.patchValue({ name, points } as Partial<RuleFormModel>);
  }

  ngOnInit(): void {}

  onSubmit(): void {
    const { name, points } = this.ruleFV;

    this._rule.update({ name, points });

    const result: RuleDialogResult = this._rule;

    this.dialogRef.close(result);
  }
}
