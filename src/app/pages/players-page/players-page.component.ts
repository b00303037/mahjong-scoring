import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';

import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';

import { PlayerService } from 'src/app/shared/services/player.service';
import { BoardService } from 'src/app/shared/services/board.service';
import { RecordService } from 'src/app/shared/services/record.service';

import { PlayerDialogComponent } from 'src/app/shared/components/player-dialog/player-dialog.component';
import {
  PlayerDialogData,
  PlayerDialogResult,
} from 'src/app/shared/components/player-dialog/player-dialog.models';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import {
  ConfirmDialogData,
  ConfirmDialogResult,
} from 'src/app/shared/components/confirm-dialog/confirm-dialog.models';

import { Player } from 'src/app/shared/models/player';

@Component({
  selector: 'app-players-page',
  templateUrl: './players-page.component.html',
  styleUrls: ['./players-page.component.scss'],
})
export class PlayersPageComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>();

  players$: Observable<Array<Player>> = this.playerService.playersSource$;

  playerUuidsInUse$: Observable<Set<string>> = combineLatest([
    this.recordService.recordsSource$,
    this.boardService.seatStatusesSource$,
  ]).pipe(
    map(([records, seatStatuses]) => {
      const set = new Set<string>();

      records.forEach((r) => {
        set.add(r.loserUuid);

        r.winnerInfos.forEach((w) => set.add(w.winnerUuid));
      });

      seatStatuses.forEach((s) => set.add(s.playerUuid));

      return set;
    })
  );

  @ViewChild(MatMenuTrigger) playerMenuTrigger!: MatMenuTrigger;

  constructor(
    private matDialog: MatDialog,
    private playerService: PlayerService,
    private boardService: BoardService,
    private recordService: RecordService
  ) {}

  ngOnInit(): void {}

  onAddPlayer(): void {
    this.matDialog
      .open(PlayerDialogComponent, { data: new PlayerDialogData() })
      .afterClosed()
      .pipe(
        filter<PlayerDialogResult>((result) => result !== undefined),
        tap((result) => this.playerService.addPlayer(result)),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  onUpdatePlayer(player: Player): void {
    this.matDialog
      .open(PlayerDialogComponent, { data: new PlayerDialogData({ player }) })
      .afterClosed()
      .pipe(
        filter<PlayerDialogResult>((result) => result !== undefined),
        tap((result) => this.playerService.updatePlayer(result)),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  onDeletePlayer(player: Player): void {
    this.playerUuidsInUse$
      .pipe(
        take(1),
        filter((playerUuidsInUse) => !playerUuidsInUse.has(player.uuid)),
        tap(() => this.onConfirmDeletePlayer(player))
      )
      .subscribe();
  }

  onConfirmDeletePlayer(player: Player): void {
    this.matDialog
      .open(ConfirmDialogComponent, {
        data: new ConfirmDialogData({
          title: '確認刪除玩家？',
          confirmButtonText: '刪除',
        }),
      })
      .afterClosed()
      .pipe(
        filter<ConfirmDialogResult>((result) => result === true),
        tap(() => this.playerService.deletePlayer(player.uuid)),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  onResetPlayers(): void {
    this.playerUuidsInUse$
      .pipe(
        take(1),
        filter((playerUuidsInUse) => playerUuidsInUse.size === 0),
        tap(() => this.onConfirmResetPlayers())
      )
      .subscribe();
  }

  onConfirmResetPlayers(): void {
    this.matDialog
      .open(ConfirmDialogComponent, {
        data: new ConfirmDialogData({
          title: '確認重置玩家？',
          confirmButtonText: '重置',
        }),
      })
      .afterClosed()
      .pipe(
        filter<ConfirmDialogResult>((result) => result === true),
        tap(() => this.playerService.resetPlayers()),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();

    this.playerService.saveToLocalStorage();
  }
}
