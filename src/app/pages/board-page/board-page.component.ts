import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';

import { PlayerService } from 'src/app/shared/services/player.service';
import { RuleService } from 'src/app/shared/services/rule.service';
import { BoardService } from 'src/app/shared/services/board.service';
import { RecordService } from 'src/app/shared/services/record.service';
import { sumRecordPoints } from 'src/app/shared/helpers/points-calculation.helper';

import { DealerRoundDialogComponent } from 'src/app/shared/components/dealer-round-dialog/dealer-round-dialog.component';
import {
  DealerRoundDialogData,
  DealerRoundDialogResult,
} from 'src/app/shared/components/dealer-round-dialog/dealer-round-dialog.models';
import { PlayerPickerDialogComponent } from 'src/app/shared/components/player-picker-dialog/player-picker-dialog.component';
import {
  PlayerPickerDialogData,
  PlayerPickerDialogResult,
} from 'src/app/shared/components/player-picker-dialog/player-picker-dialog.models';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import {
  ConfirmDialogData,
  ConfirmDialogResult,
} from 'src/app/shared/components/confirm-dialog/confirm-dialog.models';
import { WinningRecordDialogComponent } from 'src/app/shared/components/winning-record-dialog/winning-record-dialog.component';
import { WinningRecordDialogResult } from 'src/app/shared/components/winning-record-dialog/winning-record-dialog.models';
import { SelfDrawnRecordDialogComponent } from 'src/app/shared/components/self-drawn-record-dialog/self-drawn-record-dialog.component';
import { SelfDrawnRecordDialogResult } from 'src/app/shared/components/self-drawn-record-dialog/self-drawn-record-dialog.models';

import { Player } from 'src/app/shared/models/player';
import { BoardSeat } from 'src/app/shared/models/board-seat';
import {
  EWinds,
  WINDS,
  WINDS_MAPPING,
} from 'src/app/shared/models/wind.models';
import { Record } from 'src/app/shared/models/record';
import { EResults } from 'src/app/shared/models/result.models';

@Component({
  selector: 'app-board-page',
  templateUrl: './board-page.component.html',
  styleUrls: ['./board-page.component.scss'],
})
export class BoardPageComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>();

  boardSeats$: Observable<Array<BoardSeat>> = combineLatest([
    this.playerService.playersSource$,
    this.ruleService.settingsSource$,
    this.ruleService.rulesSource$,
    this.boardService.seatStatusesSource$,
    this.recordService.recordsSource$,
  ]).pipe(
    debounceTime(300),
    map(([players, settings, rules, seatStatuses, records]) => {
      const boardSeats: Array<BoardSeat> = seatStatuses.map((s) => {
        const { basePrice, pointPrice, excludeDealerPoint } = settings;
        const basePoints = basePrice / pointPrice;

        const boardSeat = {
          player: players.find((p) => p.uuid === s.playerUuid) as Player,
          seatStatus: s,
          points: sumRecordPoints({
            playerUuid: s.playerUuid,
            basePoints,
            excludeDealerPoint,
            records,
            rules,
          }),
        };

        return boardSeat;
      });

      return boardSeats;
    })
  );
  pointPrice$: Observable<number> = this.ruleService.settingsSource$.pipe(
    map((settings) => settings.pointPrice)
  );
  recordReadyHand$: Observable<boolean> = this.ruleService.settingsSource$.pipe(
    map((settings) => settings.recordReadyHand)
  );
  boardWind$: Observable<EWinds> = this.boardService.windSource$;
  dealerWind$: Observable<EWinds | undefined> =
    this.boardService.seatStatusesSource$.pipe(
      map((seatStatuses) => seatStatuses.find((s) => s.isDealer)?.wind)
    );
  records$: Observable<Array<Record>> = this.recordService.recordsSource$;

  seatOrders = [1, 3, 4, 2];

  WINDS = WINDS;
  WINDS_MAPPING = WINDS_MAPPING;

  get results(): typeof EResults {
    return EResults;
  }

  constructor(
    private router: Router,
    private matDialog: MatDialog,
    private playerService: PlayerService,
    private ruleService: RuleService,
    private boardService: BoardService,
    private recordService: RecordService
  ) {}

  ngOnInit(): void {}

  changeWind(): void {
    this.boardService.changeWind();
  }

  toggleReadyHand(boardSeat: BoardSeat): void {
    this.boardService.toggleReadyHand(boardSeat.player.uuid);
  }

  onChangeOrUpdateDealer(boardSeat: BoardSeat): void {
    const playerUuid = boardSeat.player.uuid;

    if (!boardSeat.seatStatus.isDealer) {
      this.boardService.changeDealer(playerUuid);
    } else {
      this.matDialog
        .open(DealerRoundDialogComponent, {
          data: new DealerRoundDialogData({
            dealerRound: boardSeat.seatStatus.dealerRound,
          }),
        })
        .afterClosed()
        .pipe(
          filter<DealerRoundDialogResult>((result) => result !== undefined),
          tap((result) =>
            this.boardService.updateDealerRound(playerUuid, result)
          ),
          takeUntil(this.destroyed$)
        )
        .subscribe();
    }
  }

  onChangePlayer(player: Player): void {
    const playerUuid = player.uuid;

    this.matDialog
      .open(PlayerPickerDialogComponent, {
        data: new PlayerPickerDialogData({
          playerUuid,
        }),
      })
      .afterClosed()
      .pipe(
        filter<PlayerPickerDialogResult>((result) => result !== undefined),
        tap((result) =>
          this.boardService.changePlayer(playerUuid, result.uuid)
        ),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  onDeleteLastRecord(): void {
    this.onConfirmDeleteLastRecord();
  }

  onConfirmDeleteLastRecord(): void {
    this.matDialog
      .open(ConfirmDialogComponent, {
        data: new ConfirmDialogData({
          title: '確認回復上一筆紀錄？',
          confirmButtonText: '回復',
        }),
      })
      .afterClosed()
      .pipe(
        filter<ConfirmDialogResult>((result) => result === true),
        tap(() => {
          const deleted = this.recordService.deleteLastRecord();

          if (deleted) {
            const { wind, seatStatuses } = deleted;

            this.boardService.windSource$.next(wind);
            this.boardService.seatStatusesSource$.next(seatStatuses);

            this.boardService.saveToLocalStorage();
            this.recordService.saveToLocalStorage();
          }
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  onResetBoard(): void {
    this.onConfirmResetBoard();
  }

  onConfirmResetBoard(): void {
    this.matDialog
      .open(ConfirmDialogComponent, {
        data: new ConfirmDialogData({
          title: '確認重置牌桌？',
          confirmButtonText: '重置',
        }),
      })
      .afterClosed()
      .pipe(
        filter<ConfirmDialogResult>((result) => result === true),
        tap(() => {
          this.boardService.resetSeatStatuses();
          this.boardService.resetWind();

          this.router.navigate(['/pick-players']);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  onAddRecord(result?: EResults): void {
    switch (result) {
      case EResults.Drawn:
        this.onAddDrawnRecord();
        break;
      case EResults.Winning:
        this.onAddWinningRecord();
        break;
      case EResults.SelfDrawn:
        this.onAddSelfDrawnRecord();
        break;
    }
  }

  onAddDrawnRecord(): void {
    this.matDialog
      .open(ConfirmDialogComponent, {
        data: new ConfirmDialogData({
          title: '新增一筆流局紀錄',
          confirmButtonText: '新增',
        }),
      })
      .afterClosed()
      .pipe(
        filter<ConfirmDialogResult>((result) => result === true),
        tap(() => this.boardService.saveToLocalStorage()),
        tap(() => {
          const wind = this.boardService.windSource$.getValue();
          const seatStatuses = this.boardService.seatStatusesSource$.getValue();

          this.recordService.addDrawnRecord({
            wind,
            seatStatuses,
          });
          this.recordService.saveToLocalStorage();

          const settings = this.ruleService.settingsSource$.getValue();

          this.boardService.afterDrawn(settings.changeDealerOnDrawn);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  onAddWinningRecord(): void {
    this.matDialog
      .open(WinningRecordDialogComponent, {
        width: '600px',
        maxWidth: 'calc(100vw - 16px)',
      })
      .afterClosed()
      .pipe(
        filter<WinningRecordDialogResult>((result) => result !== undefined),
        tap(() => this.boardService.saveToLocalStorage()),
        tap((result) => {
          const wind = this.boardService.windSource$.getValue();
          const seatStatuses = this.boardService.seatStatusesSource$.getValue();
          const { winnerInfos, loserUuid } = result;

          this.recordService.addWinningRecord({
            wind,
            seatStatuses,
            winnerInfos,
            loserUuid,
          });
          this.recordService.saveToLocalStorage();

          const winnerUuids = winnerInfos.map((w) => w.winnerUuid);

          this.boardService.afterWinning(winnerUuids);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  onAddSelfDrawnRecord(): void {
    this.matDialog
      .open(SelfDrawnRecordDialogComponent, {
        width: '600px',
        maxWidth: 'calc(100vw - 16px)',
      })
      .afterClosed()
      .pipe(
        filter<SelfDrawnRecordDialogResult>((result) => result !== undefined),
        tap(() => this.boardService.saveToLocalStorage()),
        tap((result) => {
          const wind = this.boardService.windSource$.getValue();
          const seatStatuses = this.boardService.seatStatusesSource$.getValue();
          const { winnerInfo } = result;

          this.recordService.addSelfDrawnRecord({
            wind,
            seatStatuses,
            winnerInfos: [winnerInfo],
          });
          this.recordService.saveToLocalStorage();

          this.boardService.afterSelfDrawn(winnerInfo.winnerUuid);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();

    this.boardService.saveToLocalStorage();
    this.recordService.saveToLocalStorage();
  }
}
