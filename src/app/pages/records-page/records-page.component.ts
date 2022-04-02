import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { PlayerService } from 'src/app/shared/services/player.service';
import { RuleService } from 'src/app/shared/services/rule.service';
import { RecordService } from 'src/app/shared/services/record.service';
import { calcRecordPoints } from 'src/app/shared/helpers/points-calculation.helper';

import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import {
  ConfirmDialogData,
  ConfirmDialogResult,
} from 'src/app/shared/components/confirm-dialog/confirm-dialog.models';

import { Player } from 'src/app/shared/models/player';
import { Settings } from 'src/app/shared/models/settings';
import { Rule } from 'src/app/shared/models/rule';
import { SeatStatus } from 'src/app/shared/models/seat-status';
import { Record } from 'src/app/shared/models/record';
import { RecordRow } from 'src/app/shared/models/record-row';
import { WINDS_MAPPING } from 'src/app/shared/models/wind.models';
import { EResults, RESULTS_MAPPING } from 'src/app/shared/models/result.models';

@Component({
  selector: 'app-records-page',
  templateUrl: './records-page.component.html',
  styleUrls: ['./records-page.component.scss'],
})
export class RecordsPageComponent implements OnInit, AfterViewInit {
  destroyed$ = new Subject<void>();

  players$: Observable<Array<Player>> = this.playerService.playersSource$.pipe(
    tap((players) => {
      setTimeout(() => {
        this.displayedColumns = [
          'winds',
          ...players.map((p) => p.uuid),
          'result',
        ];

        console.log(this.displayedColumns);
      });
    })
  );
  records$: Observable<Array<Record>> = this.recordService.recordsSource$;

  recordRows: Array<RecordRow> = [];
  displayedColumns: Array<string> = [];

  WINDS_MAPPING = WINDS_MAPPING;
  RESULTS_MAPPING = RESULTS_MAPPING;

  get results(): typeof EResults {
    return EResults;
  }

  constructor(
    private matDialog: MatDialog,
    private router: Router,
    private playerService: PlayerService,
    private ruleService: RuleService,
    private recordService: RecordService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    combineLatest([
      this.ruleService.settingsSource$,
      this.ruleService.rulesSource$,
      this.recordService.recordsSource$,
    ])
      .pipe(
        map(([settings, rules, records]) =>
          records.map((r) => this.getRecordRow(settings, rules, r))
        ),
        tap((recordRows) =>
          setTimeout(() => {
            this.recordRows = recordRows;

            console.log(this.recordRows);
          })
        ),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  getRecordRow(
    settings: Settings,
    rules: Array<Rule>,
    record: Record
  ): RecordRow {
    const { wind, seatStatuses, result, winnerInfos, loserUuid } = record;
    const { basePrice, pointPrice, excludeDealerPoint } = settings;
    const basePoints = basePrice / pointPrice;

    const winnerSeatStatuses = seatStatuses.filter((s) =>
      winnerInfos.find((w) => w.winnerUuid === s.playerUuid)
    );
    const dealerSeatStatus = seatStatuses.find((s) => s.isDealer) as SeatStatus;
    const loserSeatStatus = seatStatuses.find(
      (s) => s.playerUuid === loserUuid
    );

    const row: RecordRow = {
      result,
      boardWind: wind,
      dealerWind: dealerSeatStatus.wind,
    };
    seatStatuses.forEach((s) => {
      const winnerInfo = winnerInfos.find((w) => w.winnerUuid === s.playerUuid);

      const isWinner =
        winnerSeatStatuses.find((w) => w.playerUuid === s.playerUuid) !==
        undefined;
      const isLoser = loserSeatStatus?.playerUuid === s.playerUuid;

      row[s.playerUuid] = {
        points: calcRecordPoints(
          0,
          record,
          s.playerUuid,
          basePoints,
          excludeDealerPoint,
          rules
        ),
        wind: s.wind,
        dealerRound: s.dealerRound,
        isReadyHand: s.isReadyHand,
        isWinner,
        isLoser,
        rules: (winnerInfo?.ruleUuids ?? []).map((ruleUuid) =>
          rules.find((r) => r.uuid === ruleUuid)
        ) as Array<Rule>,
      };
    });

    return row;
  }

  onResetRecords(): void {
    this.onConfirmResetRecords();
  }

  onConfirmResetRecords(): void {
    this.matDialog
      .open(ConfirmDialogComponent, {
        data: new ConfirmDialogData({
          title: '確認重置紀錄？',
          confirmButtonText: '重置',
        }),
      })
      .afterClosed()
      .pipe(
        filter<ConfirmDialogResult>((result) => result === true),
        tap(() => {
          this.recordService.reset();

          this.router.navigate(['/board']);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();

    this.recordService.saveToLocalStorage();
  }
}
