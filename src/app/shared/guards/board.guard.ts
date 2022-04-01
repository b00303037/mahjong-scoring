import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BoardService } from '../services/board.service';

@Injectable({
  providedIn: 'root',
})
export class BoardGuard implements CanActivate {
  constructor(private router: Router, private boardService: BoardService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.boardService.seatStatusesSource$.pipe(
      map((seatStatuses) => {
        if (seatStatuses.length !== 4) {
          this.boardService.resetSeatStatuses();

          return this.router.parseUrl('/players');
        } else if (seatStatuses.some((s) => s.playerUuid.length === 0)) {
          return this.router.parseUrl('/pick-players');
        }
        return true;
      })
    );
  }
}
