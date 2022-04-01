import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { Player } from '../models/player';
import { SeatStatus } from '../models/seat-status';
import { EWinds, WINDS } from '../models/wind.models';
import { AppStorage } from '../models/storage';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  windSource$ = new BehaviorSubject<EWinds>(this._defaultWind());
  seatStatusesSource$ = new BehaviorSubject<Array<SeatStatus>>(
    this._defaultSeatStatuses()
  );

  initialize(data: { wind: EWinds; seatStatuses: Array<SeatStatus> }) {
    this.windSource$.next(data.wind);
    this.seatStatusesSource$.next(
      data.seatStatuses.map((s) => new SeatStatus(s))
    );
  }

  pickPlayer(player: Player): void {
    let emptySeatFlag: boolean = false;
    let emptySeatIndex: number = 0;

    const seatStatuses = this.seatStatusesSource$.getValue();
    const playerUuids = seatStatuses.reduce<Array<string>>((uuids, s, i) => {
      if (emptySeatFlag) {
        return uuids;
      }

      if (s.playerUuid.length !== 0) {
        uuids.push(s.playerUuid);
      } else {
        emptySeatFlag = true;
        emptySeatIndex = i;
      }

      return uuids;
    }, []);

    const i = playerUuids.indexOf(player.uuid);

    switch (i) {
      case -1:
        if (playerUuids.length === 4) {
          return;
        }

        seatStatuses[emptySeatIndex].playerUuid = player.uuid;

        this.seatStatusesSource$.next([...seatStatuses]);
        break;
      case emptySeatIndex - 1:
        seatStatuses[emptySeatIndex - 1].playerUuid = '';

        this.seatStatusesSource$.next([...seatStatuses]);
        break;
      case playerUuids.length - 1:
        seatStatuses[playerUuids.length - 1].playerUuid = '';

        this.seatStatusesSource$.next([...seatStatuses]);
        break;
      default:
    }
  }

  changeWind(): void {
    const wind = this.windSource$.getValue();
    const i = WINDS.indexOf(wind);

    if (i !== -1) {
      const nextIndex = (i + 1 + WINDS.length) % WINDS.length;

      this.windSource$.next(WINDS[nextIndex]);
    }
  }

  toggleReadyHand(playerUuid: string): void {
    const seatStatuses = this.seatStatusesSource$.getValue();
    const i = seatStatuses.findIndex((s) => s.playerUuid === playerUuid);

    if (i !== -1) {
      seatStatuses[i].isReadyHand = !seatStatuses[i].isReadyHand;

      this.seatStatusesSource$.next(seatStatuses);
    }
  }

  changeDealer(playerUuid: string): void {
    const seatStatuses = this.seatStatusesSource$.getValue();
    const i = seatStatuses.findIndex((s) => s.playerUuid === playerUuid);

    if (i !== -1 && !seatStatuses[i].isDealer) {
      const nextSeatStatuses = seatStatuses.map(
        (s, j) =>
          new SeatStatus({
            ...s,
            dealerRound: j === i ? 0 : -1,
          })
      );

      this.seatStatusesSource$.next(nextSeatStatuses);
    }
  }

  updateDealerRound(playerUuid: string, dealerRound: number): void {
    const seatStatuses = this.seatStatusesSource$.getValue();
    const i = seatStatuses.findIndex((s) => s.playerUuid === playerUuid);

    if (i !== -1) {
      seatStatuses[i].dealerRound = dealerRound;

      this.seatStatusesSource$.next(seatStatuses);
    }
  }

  changePlayer(playerUuid: string, nextPlayerUuid: string): void {
    const seatStatuses = this.seatStatusesSource$.getValue();
    const i = seatStatuses.findIndex((s) => s.playerUuid === playerUuid);

    if (i !== -1) {
      const j = seatStatuses.findIndex((s) => s.playerUuid === nextPlayerUuid);

      if (j !== -1) {
        seatStatuses[j].playerUuid = playerUuid;
      }
      seatStatuses[i].playerUuid = nextPlayerUuid;

      this.seatStatusesSource$.next(seatStatuses);
    }
  }

  afterDrawn(changeDealerOnDrawn: boolean): void {
    const seatStatuses = this.seatStatusesSource$.getValue();
    const dealerIndex = seatStatuses.findIndex((s) => s.isDealer);
    const isDealerOnLastSeat = dealerIndex === seatStatuses.length - 1;

    if (changeDealerOnDrawn && isDealerOnLastSeat) {
      this.changeWind();
    }

    const nextSeatStatuses = seatStatuses.map((s, i) => {
      const nextS = new SeatStatus({ ...s, isReadyHand: false });

      if (changeDealerOnDrawn) {
        const isOnNextSeat =
          i === (dealerIndex + 1 + seatStatuses.length) % seatStatuses.length;

        nextS.dealerRound = nextS.isDealer ? -1 : isOnNextSeat ? 0 : -1;
      } else {
        nextS.dealerRound = nextS.isDealer ? nextS.dealerRound + 1 : -1;
      }

      return nextS;
    });

    this.seatStatusesSource$.next(nextSeatStatuses);
  }

  afterWinning(winnerUuids: Array<string>): void {
    const seatStatuses = this.seatStatusesSource$.getValue();
    const dealerIndex = seatStatuses.findIndex((s) => s.isDealer);
    const isDealerWinner = winnerUuids.includes(
      seatStatuses[dealerIndex]?.playerUuid
    );
    const isDealerOnLastSeat = dealerIndex === seatStatuses.length - 1;

    if (isDealerOnLastSeat) {
      this.changeWind();
    }

    const nextSeatStatuses = seatStatuses.map((s, i) => {
      const nextS = new SeatStatus({ ...s, isReadyHand: false });

      if (nextS.isDealer) {
        nextS.dealerRound = isDealerWinner ? nextS.dealerRound + 1 : -1;
      } else {
        const isOnNextSeat =
          i === (dealerIndex + 1 + seatStatuses.length) % seatStatuses.length;

        nextS.dealerRound = isDealerWinner ? -1 : isOnNextSeat ? 0 : -1;
      }

      return nextS;
    });

    this.seatStatusesSource$.next(nextSeatStatuses);
  }

  afterSelfDrawn(winnerUuid: string): void {
    this.afterWinning([winnerUuid]);
  }

  resetWind(): void {
    this.windSource$.next(this._defaultWind());
  }

  resetSeatStatuses(): void {
    this.seatStatusesSource$.next(this._defaultSeatStatuses());
  }

  saveToLocalStorage(): void {
    const json = localStorage.getItem(environment.storageKey);

    if (json !== null) {
      const storage = JSON.parse(json) as AppStorage;

      storage.wind = this.windSource$.getValue();
      storage.seatStatuses = this.seatStatusesSource$.getValue();

      localStorage.setItem(environment.storageKey, JSON.stringify(storage));
    }
  }

  private _defaultWind(): EWinds {
    return EWinds.East;
  }

  private _defaultSeatStatuses(): Array<SeatStatus> {
    return WINDS.map(
      (wind, i) => new SeatStatus({ wind, dealerRound: i === 0 ? 0 : -1 })
    );
  }
}
