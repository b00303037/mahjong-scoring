import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { MatDialogRef } from '@angular/material/dialog';

import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';

import { PlayerService } from '../../services/player.service';
import { RuleService } from '../../services/rule.service';
import { BoardService } from '../../services/board.service';
import { groupRules } from '../../helpers/rules-grouping.helper';
import { calcSelfDrawnPoints } from '../../helpers/points-calculation.helper';

import { Player } from '../../models/player';
import { Rule } from '../../models/rule';
import { RuleGroup } from '../../models/rule-group';
import { SeatStatus } from '../../models/seat-status';

import {
  SelfDrawnRecordDialogResult,
  SelfDrawnRecordFormModel,
} from './self-drawn-record-dialog.models';

@Component({
  selector: 'app-self-drawn-record-dialog',
  templateUrl: './self-drawn-record-dialog.component.html',
  styleUrls: ['./self-drawn-record-dialog.component.scss'],
})
export class SelfDrawnRecordDialogComponent implements OnInit, OnDestroy {
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

  selfDrawnRecordFG = new FormGroup({
    winner: new FormControl(null, {
      validators: [Validators.required],
    }),
    rules: new FormControl(),
    basePoints: new FormControl(0),
    rulePoints: new FormControl(0),
    dealerPoints: new FormControl(0),
    totalPoints: new FormControl(0),
  });
  selfDrawnRecordFCs: { [key: string]: AbstractControl } = {
    winner: this.selfDrawnRecordFG.controls['winner'],
    rules: this.selfDrawnRecordFG.controls['rules'],
    basePoints: this.selfDrawnRecordFG.controls['basePoints'],
    rulePoints: this.selfDrawnRecordFG.controls['rulePoints'],
    dealerPoints: this.selfDrawnRecordFG.controls['dealerPoints'],
    totalPoints: this.selfDrawnRecordFG.controls['totalPoints'],
  };
  get selfDrawnRecordFV(): SelfDrawnRecordFormModel {
    return this.selfDrawnRecordFG.value;
  }

  isDealerWinner$ = new BehaviorSubject<boolean>(false);

  constructor(
    private dialogRef: MatDialogRef<SelfDrawnRecordDialogComponent>,
    private playerService: PlayerService,
    private ruleService: RuleService,
    private boardService: BoardService
  ) {
    const winnerInfo = this.selfDrawnRecordFG.value as SelfDrawnRecordFormModel;

    this.selfDrawnRecordFG.valueChanges
      .pipe(
        startWith<SelfDrawnRecordFormModel>(winnerInfo),
        tap((winnerInfoFV) => {
          const { basePrice, pointPrice, excludeDealerPoint } =
            this.ruleService.settingsSource$.getValue();
          const seatStatuses = this.boardService.seatStatusesSource$.getValue();

          const { winner, rules } = winnerInfoFV;
          const dealerSeatStatus = seatStatuses.find(
            (s) => s.isDealer
          ) as SeatStatus;

          this.selfDrawnRecordFG.patchValue(
            calcSelfDrawnPoints({
              basePoints: basePrice / pointPrice,
              excludeDealerPoint,
              dealerSeatStatus,
              winner,
              rules,
            }),
            {
              emitEvent: false,
            }
          );

          const isDealerWinner =
            winner !== null && winner.uuid === dealerSeatStatus.playerUuid;

          this.isDealerWinner$.next(isDealerWinner);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  ngOnInit(): void {}

  compareRule(a: Rule, b: Rule): boolean {
    return a && b ? a.uuid === b.uuid : a === b;
  }

  onSubmit(): void {
    const fv = this.selfDrawnRecordFV;

    const result: SelfDrawnRecordDialogResult = {
      winnerInfo: {
        winnerUuid: fv.winner!.uuid,
        ruleUuids: fv.rules?.map((r) => r.uuid) || [],
      },
    };

    this.dialogRef.close(result);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
