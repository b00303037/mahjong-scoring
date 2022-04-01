import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { Player } from '../models/player';
import { AppStorage } from '../models/storage';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  playersSource$ = new BehaviorSubject<Array<Player>>(this._defaultPlayers());

  initialize(data: { players: Array<Player> }): void {
    if (data.players.length > 0) {
      this.playersSource$.next(data.players.map((p) => new Player(p)));
    }
  }

  addPlayer(player: Player): void {
    const players = this.playersSource$.getValue();

    this.playersSource$.next([...players, player]);
  }

  updatePlayer(player: Player): void {
    const players = this.playersSource$.getValue();
    const i = players.findIndex((p) => p.uuid === player.uuid);

    if (i !== -1) {
      players[i] = player;

      this.playersSource$.next([...players]);
    }
  }

  deletePlayer(uuid: string): void {
    const players = this.playersSource$.getValue();
    const i = players.findIndex((p) => p.uuid === uuid);

    if (i !== -1) {
      players.splice(i, 1);

      this.playersSource$.next([...players]);
    }
  }

  resetPlayers(): void {
    this.playersSource$.next(this._defaultPlayers());
  }

  saveToLocalStorage(): void {
    const json = localStorage.getItem(environment.storageKey);

    if (json !== null) {
      const storage = JSON.parse(json) as AppStorage;

      storage.players = this.playersSource$.getValue();

      localStorage.setItem(environment.storageKey, JSON.stringify(storage));
    }
  }

  private _defaultPlayers(): Array<Player> {
    return [];
  }
}
