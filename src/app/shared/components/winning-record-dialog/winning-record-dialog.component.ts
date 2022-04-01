import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { MatDialogRef } from '@angular/material/dialog';

import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';

import { PlayerService } from '../../services/player.service';
import { RuleService } from '../../services/rule.service';
import { BoardService } from '../../services/board.service';
import { groupRules } from '../../helpers/rules-grouping.helper';
import { calcWinningPoints } from '../../helpers/points-calculation.helper';

import { Player } from '../../models/player';
import { Rule } from '../../models/rule';
import { RuleGroup } from '../../models/rule-group';
import { SeatStatus } from '../../models/seat-status';

import {
  WinnerInfoFormModel,
  WinningRecordDialogResult,
  WinningRecordFormModel,
} from './winning-record-dialog.models';

@Component({
  selector: 'app-winning-record-dialog',
  templateUrl: './winning-record-dialog.component.html',
  styleUrls: ['./winning-record-dialog.component.scss'],
})
export class WinningRecordDialogComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>();

  playersOnBoard$: Observable<Array<Player>> = combineLatest([
    this.playerService.playersSource$,
    this.boardService.seatStatusesSource$,
  ]).pipe(
    map(([players, seatStatuses]) =>
      seatStatuses.map(
        (s) => players.find((p) => p.uuid === s.playerUuid) as Player
      )
    )
  );
  ruleGroups$: Observable<Array<RuleGroup>> =
    this.ruleService.rulesSource$.pipe(map((rules) => groupRules(rules)));

  winningRecordFG = new FormGroup({
    loser: new FormControl(null, [Validators.required]),
    hasMultiWinners: new FormControl(false),
    winnerInfos: new FormArray([]),
  });
  winningRecordFCs: { [key: string]: AbstractControl } = {
    loser: this.winningRecordFG.controls['loser'],
    hasMultiWinners: this.winningRecordFG.controls['hasMultiWinners'],
  };
  winnerInfosFA: FormArray = this.winningRecordFG.controls[
    'winnerInfos'
  ] as FormArray;
  winnerInfosFGs: Array<FormGroup> = this.winnerInfosFA
    .controls as Array<FormGroup>;
  get winningRecordFV(): WinningRecordFormModel {
    return this.winningRecordFG.value;
  }

  selectedWinnerUuids$: Observable<Array<string | undefined>> =
    this.winnerInfosFA.valueChanges.pipe(
      map((winnerInfos: Array<WinnerInfoFormModel>) =>
        winnerInfos.map((w) => w.winner?.uuid)
      )
    );

  private subs: Array<Subscription> = [];

  constructor(
    private dialogRef: MatDialogRef<WinningRecordDialogComponent>,
    private playerService: PlayerService,
    private ruleService: RuleService,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {
    this.winningRecordFCs['hasMultiWinners'].valueChanges
      .pipe(
        tap((hasMultiWinners: boolean) => {
          if (!hasMultiWinners) {
            for (let i = this.winnerInfosFA.length - 1; i > 0; i--) {
              this.removeWinnerInfoFG(i);
            }
          }
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();

    this.addWinnerInfoFG();
  }

  addWinnerInfoFG(): void {
    this.winnerInfosFA.push(
      new FormGroup({
        winner: new FormControl(null, {
          validators: [Validators.required],
        }),
        rules: new FormControl(),
        basePoints: new FormControl(0),
        rulePoints: new FormControl(0),
        dealerPoints: new FormControl(0),
        totalPoints: new FormControl(0),
      })
    );

    const index = this.winnerInfosFGs.length - 1;
    const loser = this.winningRecordFCs['loser'].value as Player | null;
    const winnerInfo = this.winnerInfosFGs[index].value as WinnerInfoFormModel;

    this.subs.push(
      combineLatest([
        this.winningRecordFCs['loser'].valueChanges.pipe(
          startWith<Player | null>(loser)
        ),
        this.winnerInfosFGs[index].valueChanges.pipe(
          startWith<WinnerInfoFormModel>(winnerInfo)
        ),
      ])
        .pipe(
          tap(([loser, winnerInfoFV]) => {
            const { basePrice, pointPrice, excludeDealerPoint } =
              this.ruleService.settingsSource$.getValue();
            const seatStatuses =
              this.boardService.seatStatusesSource$.getValue();

            const { winner, rules } = winnerInfoFV;
            const dealerSeatStatus = seatStatuses.find(
              (s) => s.isDealer
            ) as SeatStatus;

            this.winnerInfosFGs[index].patchValue(
              calcWinningPoints({
                basePoints: basePrice / pointPrice,
                excludeDealerPoint,
                dealerSeatStatus,
                winner,
                loser,
                rules,
              }),
              {
                emitEvent: false,
              }
            );

            if (
              loser !== null &&
              winner !== null &&
              loser.uuid === winner.uuid
            ) {
              setTimeout(() => {
                this.winnerInfosFGs[index].patchValue({
                  winner: null,
                } as Partial<WinnerInfoFormModel>);
              });
            }
          }),
          takeUntil(this.destroyed$)
        )
        .subscribe()
    );
  }

  removeWinnerInfoFG(index: number, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.winnerInfosFA.removeAt(index);
    this.subs[index].unsubscribe();

    this.subs.splice(index, 1);
  }

  compareRule(a: Rule, b: Rule): boolean {
    return a && b ? a.uuid === b.uuid : a === b;
  }

  onSubmit(): void {
    const { loser, winnerInfos } = this.winningRecordFV;

    const result: WinningRecordDialogResult = {
      winnerInfos: winnerInfos.map((w) => ({
        winnerUuid: w.winner!.uuid,
        ruleUuids: w.rules?.map((r) => r.uuid) ?? [],
      })),
      loserUuid: loser!.uuid,
    };

    this.dialogRef.close(result);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
