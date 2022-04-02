import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';

import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';

import { RuleService } from 'src/app/shared/services/rule.service';
import { RecordService } from 'src/app/shared/services/record.service';
import { basePointPriceValidator } from 'src/app/shared/validators/base-point-price.validator';

import { RuleDialogComponent } from 'src/app/shared/components/rule-dialog/rule-dialog.component';
import {
  RuleDialogData,
  RuleDialogResult,
} from 'src/app/shared/components/rule-dialog/rule-dialog.models';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import {
  ConfirmDialogData,
  ConfirmDialogResult,
} from 'src/app/shared/components/confirm-dialog/confirm-dialog.models';

import { Rule } from 'src/app/shared/models/rule';

import { SettingsFormModel } from './rules-page.models';

@Component({
  selector: 'app-rules-page',
  templateUrl: './rules-page.component.html',
  styleUrls: ['./rules-page.component.scss'],
})
export class RulesPageComponent implements OnInit, AfterViewInit, OnDestroy {
  destroyed$ = new Subject<void>();

  settingsFG = new FormGroup(
    {
      basePrice: new FormControl(0, [Validators.required, Validators.min(0)]),
      pointPrice: new FormControl(0, [Validators.required, Validators.min(0)]),
      changeDealerOnDrawn: new FormControl(false, [Validators.required]),
      excludeDealerPoint: new FormControl(false, [Validators.required]),
      recordReadyHand: new FormControl(false, [Validators.required]),
    },
    {
      validators: [basePointPriceValidator],
    }
  );
  settingsFCs: { [key: string]: AbstractControl } = {
    basePrice: this.settingsFG.controls['basePrice'],
    pointPrice: this.settingsFG.controls['pointPrice'],
    changeDealerOnDrawn: this.settingsFG.controls['changeDealerOnDrawn'],
    excludeDealerPoint: this.settingsFG.controls['excludeDealerPoint'],
    recordReadyHand: this.settingsFG.controls['recordReadyHand'],
  };
  get settingsFV(): SettingsFormModel {
    return this.settingsFG.value;
  }
  get validSettingsFV(): Partial<SettingsFormModel> {
    const keys: Array<string> = [
      'basePrice',
      'pointPrice',
      'changeDealerOnDrawn',
      'excludeDealerPoint',
      'recordReadyHand',
    ];

    return keys.reduce<{ [key: string]: boolean | number }>((fv, key) => {
      if (this.settingsFCs[key].valid) {
        fv[key] = this.settingsFCs[key].value;
      }
      return fv;
    }, {});
  }

  rules: Array<Rule> = [];
  displayedColumns: Array<string> = [
    'name', // 名稱
    'points', // 台數
    'edit', // 編輯
    'delete', // 刪除
  ];

  ruleUuidsInUse$: Observable<Set<string>> =
    this.recordService.recordsSource$.pipe(
      map((records) => {
        const set = new Set<string>();

        records.forEach((r) => {
          set.add(r.loserUuid);

          r.winnerInfos.forEach((w) => set.add(w.winnerUuid));
        });

        console.log('ruleUuidsInUse', set);

        return set;
      })
    );

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private matDialog: MatDialog,
    private ruleService: RuleService,
    private recordService: RecordService
  ) {
    const {
      basePrice,
      pointPrice,
      changeDealerOnDrawn,
      excludeDealerPoint,
      recordReadyHand,
    } = this.ruleService.settingsSource$.getValue();

    this.settingsFG.patchValue({
      basePrice,
      pointPrice,
      changeDealerOnDrawn,
      excludeDealerPoint,
      recordReadyHand,
    } as Partial<SettingsFormModel>);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    combineLatest([this.ruleService.rulesSource$, this.sort.sortChange])
      .pipe(
        map(([rules, sort]) => {
          if (!sort.active || sort.direction === '') {
            return [...rules];
          }

          return [...rules].sort((a, b) => this.compareRule(a, b, sort));
        }),
        tap((rules) => (this.rules = rules)),
        takeUntil(this.destroyed$)
      )
      .subscribe();

    setTimeout(() => {
      this.sort.sort({
        id: 'points',
        start: 'asc',
        disableClear: true,
      });
    });
  }

  onAddRule(): void {
    this.matDialog
      .open(RuleDialogComponent, { data: new RuleDialogData() })
      .afterClosed()
      .pipe(
        filter<RuleDialogResult>((result) => result !== undefined),
        tap((result) => {
          this.ruleService.addRule(result);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  onUpdateRule(rule: Rule): void {
    this.matDialog
      .open(RuleDialogComponent, { data: new RuleDialogData({ rule }) })
      .afterClosed()
      .pipe(
        filter<RuleDialogResult>((result) => result !== undefined),
        tap((result) => {
          this.ruleService.updateRule(result);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  onDeleteRule(rule: Rule): void {
    this.ruleUuidsInUse$
      .pipe(
        take(1),
        filter((ruleUuidsInUse) => !ruleUuidsInUse.has(rule.uuid)),
        tap(() => this.onConfirmDeleteRule(rule))
      )
      .subscribe();
  }

  onConfirmDeleteRule(rule: Rule): void {
    this.matDialog
      .open(ConfirmDialogComponent, {
        data: new ConfirmDialogData({
          title: '確認刪除牌型？',
          confirmButtonText: '刪除',
        }),
      })
      .afterClosed()
      .pipe(
        filter<ConfirmDialogResult>((result) => result === true),
        tap(() => this.ruleService.deleteRule(rule.uuid)),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  onResetRules(): void {
    this.ruleUuidsInUse$
      .pipe(
        take(1),
        filter((ruleUuidsInUse) => ruleUuidsInUse.size === 0),
        tap(() => this.onConfirmResetRules())
      )
      .subscribe();
  }

  onConfirmResetRules(): void {
    this.matDialog
      .open(ConfirmDialogComponent, {
        data: new ConfirmDialogData({
          title: '確認重置牌型？',
          confirmButtonText: '重置',
        }),
      })
      .afterClosed()
      .pipe(
        filter<ConfirmDialogResult>((result) => result === true),
        tap(() => {
          this.ruleService.resetRules();
          this.ruleService.saveToLocalStorage();
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();

    this.ruleService.updateSettings(this.validSettingsFV);
    this.ruleService.saveToLocalStorage();
  }

  private compareRule(a: Rule, b: Rule, sort: Sort): number {
    const isAscFactor = sort.direction === 'asc' ? 1 : -1;

    switch (sort.active) {
      case 'points':
        return isAscFactor * (a.points - b.points);
      default:
        return 0;
    }
  }
}
