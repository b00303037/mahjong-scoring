import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Breakpoints, MediaMatcher } from '@angular/cdk/layout';

import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { PlayerService } from './shared/services/player.service';
import { RuleService } from './shared/services/rule.service';
import { BoardService } from './shared/services/board.service';
import { RecordService } from './shared/services/record.service';

import { AppStorage } from './shared/models/storage';
import { Settings } from './shared/models/settings';
import { Record } from './shared/models/record';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit, OnDestroy {
  destroyed$ = new Subject<void>();

  mobileQuery: MediaQueryList = this.media.matchMedia(Breakpoints.XSmall);

  isDarkMode$: Observable<boolean> = this.ruleService.settingsSource$.pipe(
    map((settings) => settings.isDarkMode)
  );
  isBoardReady$: Observable<boolean> =
    this.boardService.seatStatusesSource$.pipe(
      map((seatStatuses) =>
        seatStatuses.every((s) => s.playerUuid.length !== 0)
      )
    );
  records$: BehaviorSubject<Array<Record>> = this.recordService.recordsSource$;

  private _mobileQueryListener = () => this.changeDetectorRef.detectChanges();

  @ViewChild(MatSidenav) sidenav!: MatSidenav;
  @ViewChild(MatSidenavContent) sidenavContent!: MatSidenavContent;

  constructor(
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private playerService: PlayerService,
    private ruleService: RuleService,
    private boardService: BoardService,
    private recordService: RecordService
  ) {
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

    const json: string | null = localStorage.getItem(environment.storageKey);
    const storage: AppStorage = new AppStorage(json);
    const { players, settings, rules, wind, seatStatuses, records } = storage;

    this.playerService.initialize({ players });
    this.ruleService.initialize({ settings, rules });
    this.boardService.initialize({ wind, seatStatuses });
    this.recordService.initialize({ records });

    if (json === null) {
      localStorage.setItem(environment.storageKey, JSON.stringify(storage));
    }
  }

  ngAfterViewInit(): void {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        tap(() => {
          this.sidenavContent.scrollTo({ top: 0 });

          if (this.mobileQuery.matches) {
            this.sidenav.close();
          }
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();

    setTimeout(() => {
      this.mobileQuery.matches ? this.sidenav.close() : this.sidenav.open();
    });

    if (this.ruleService.settingsSource$.getValue().isDarkMode) {
      document.body.classList.add('dark');
    }
  }

  toggleDarkMode(): void {
    document.body.classList.toggle('dark');

    const isDarkMode = document.body.classList.contains('dark');

    this.ruleService.updateSettings({ isDarkMode });
    this.ruleService.saveToLocalStorage();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();

    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  printLocalStorageSize(): void {
    var _lsTotal = 0,
      _xLen,
      _x;

    for (_x in localStorage) {
      if (!localStorage.hasOwnProperty(_x)) {
        continue;
      }
      _xLen = (localStorage[_x].length + _x.length) * 2;
      _lsTotal += _xLen;
      console.log(
        _x.substring(0, 50) + ' = ' + (_xLen / 1024).toFixed(2) + ' KB'
      );
    }
    console.log('Total = ' + (_lsTotal / 1024).toFixed(2) + ' KB');
  }

  // @HostListener('window:beforeunload', ['$event'])
  // onWindowClose(event: BeforeUnloadEvent): void {
  //   const storage: AppStorage = {
  //     players: this.playerService.playersSource$.getValue(),
  //     settings: this.ruleService.settingsSource$.getValue(),
  //     rules: this.ruleService.rulesSource$.getValue(),
  //     pickedPlayerUuids: this.boardService.pickedPlayerUuidsSource$.getValue(),
  //     seatStatuses: this.boardService.seatStatusesSource$.getValue(),
  //     records: this.recordService.recordsSource$.getValue(),
  //   };

  //   localStorage.setItem(environment.storageKey, JSON.stringify(storage));

  //   event.preventDefault();
  //   event.returnValue = false;
  // }
}
