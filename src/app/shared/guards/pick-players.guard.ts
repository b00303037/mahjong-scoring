import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PlayerService } from '../services/player.service';
import { BoardService } from '../services/board.service';

@Injectable({
  providedIn: 'root',
})
export class PickPlayersGuard implements CanActivate {
  constructor(
    private router: Router,
    private playerService: PlayerService,
    private boardService: BoardService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return combineLatest([
      this.playerService.playersSource$,
      this.boardService.seatStatusesSource$,
    ]).pipe(
      map(([players, seatStatuses]) => {
        if (players.length < 4) {
          return this.router.parseUrl('/players');
        } else if (
          seatStatuses.length === 4 &&
          seatStatuses.every((s) => s.playerUuid.length !== 0)
        ) {
          return this.router.parseUrl('/board');
        }
        return true;
      })
    );
  }
}
