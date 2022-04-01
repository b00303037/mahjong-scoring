import { Rule } from '../../models/rule';

export class RuleDialogData {
  rule?: Rule;

  constructor(data?: { rule?: Rule }) {
    if (data) {
      this.rule = data.rule ?? this.rule;
    }
  }
}

export interface RuleFormModel {
  name: string;
  points: number;
}

export type RuleDialogResult = Rule;
