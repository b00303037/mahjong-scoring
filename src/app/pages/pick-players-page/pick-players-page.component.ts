import { Component, OnDestroy, OnInit } from '@angular/core';

import { map, Observable } from 'rxjs';

import { PlayerService } from 'src/app/shared/services/player.service';
import { BoardService } from 'src/app/shared/services/board.service';

import { Player } from 'src/app/shared/models/player';
import { WINDS, WINDS_MAPPING } from 'src/app/shared/models/wind.models';

@Component({
  selector: 'app-pick-players-page',
  templateUrl: './pick-players-page.component.html',
  styleUrls: ['./pick-players-page.component.scss'],
})
export class PickPlayersPageComponent implements OnInit, OnDestroy {
  players$: Observable<Array<Player>> = this.playerService.playersSource$;
  pickedPlayerUuids$: Observable<Array<string>> =
    this.boardService.seatStatusesSource$.pipe(
      map((seatStatuses) =>
        seatStatuses.reduce<Array<string>>((uuids, s) => {
          if (s.playerUuid.length !== 0) {
            uuids.push(s.playerUuid);
          }

          return uuids;
        }, [])
      )
    );

  WINDS = WINDS;
  WINDS_MAPPING = WINDS_MAPPING;

  constructor(
    private playerService: PlayerService,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {}

  onPickPlayer(player: Player): void {
    this.boardService.pickPlayer(player);
  }

  onResetPickedPlayers(): void {
    this.boardService.resetSeatStatuses();

    this.boardService.saveToLocalStorage();
  }

  ngOnDestroy(): void {
    this.boardService.saveToLocalStorage();
  }
}
