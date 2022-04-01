import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { Record } from '../models/record';
import { EWinds } from '../models/wind.models';
import { SeatStatus } from '../models/seat-status';
import { EResults } from '../models/result.models';
import { WinnerInfo } from '../models/winner-info';
import { AppStorage } from '../models/storage';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  recordsSource$ = new BehaviorSubject<Array<Record>>(this._defaultRecords());

  initialize(data: { records: Array<Record> }): void {
    if (data.records.length > 0) {
      this.recordsSource$.next(data.records.map((r) => new Record(r)));
    }
  }

  addRecord(record: Record): void {
    const records = this.recordsSource$.getValue();

    this.recordsSource$.next([...records, record]);
  }

  deleteLastRecord():
    | {
        seatStatuses: Array<SeatStatus>;
        wind: EWinds;
      }
    | undefined {
    const records = this.recordsSource$.getValue();

    if (records.length > 0) {
      const { seatStatuses, wind } = records.splice(records.length - 1, 1)[0];

      this.recordsSource$.next([...records]);

      return {
        seatStatuses,
        wind,
      };
    }

    return;
  }

  addDrawnRecord(data: {
    wind: EWinds;
    seatStatuses: Array<SeatStatus>;
  }): void {
    const record = new Record({
      wind: data.wind,
      seatStatuses: [...data.seatStatuses],
      result: EResults.Drawn,
      winnerInfos: [],
      loserUuid: '',
    });

    this.addRecord(record);
  }

  addWinningRecord(data: {
    wind: EWinds;
    seatStatuses: Array<SeatStatus>;
    winnerInfos: Array<WinnerInfo>;
    loserUuid: string;
  }): void {
    const record = new Record({
      wind: data.wind,
      seatStatuses: [...data.seatStatuses],
      result: EResults.Winning,
      winnerInfos: [...data.winnerInfos],
      loserUuid: data.loserUuid,
    });

    this.addRecord(record);
  }

  addSelfDrawnRecord(data: {
    wind: EWinds;
    seatStatuses: Array<SeatStatus>;
    winnerInfos: Array<WinnerInfo>;
  }): void {
    const record = new Record({
      wind: data.wind,
      seatStatuses: [...data.seatStatuses],
      result: EResults.SelfDrawn,
      winnerInfos: [...data.winnerInfos],
      loserUuid: '',
    });

    this.addRecord(record);
  }

  reset(): void {
    this.recordsSource$.next(this._defaultRecords());
  }

  saveToLocalStorage(): void {
    const json = localStorage.getItem(environment.storageKey);

    if (json !== null) {
      const storage = JSON.parse(json) as AppStorage;

      storage.records = this.recordsSource$.getValue();

      localStorage.setItem(environment.storageKey, JSON.stringify(storage));
    }
  }

  private _defaultRecords(): Array<Record> {
    return [];
  }
}
