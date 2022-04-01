import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { RecordService } from 'src/app/shared/services/record.service';

import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import {
  ConfirmDialogData,
  ConfirmDialogResult,
} from 'src/app/shared/components/confirm-dialog/confirm-dialog.models';

import { Record } from 'src/app/shared/models/record';

@Component({
  selector: 'app-records-page',
  templateUrl: './records-page.component.html',
  styleUrls: ['./records-page.component.scss'],
})
export class RecordsPageComponent implements OnInit {
  destroyed$ = new Subject<void>();

  records$: Observable<Array<Record>> = this.recordService.recordsSource$;

  constructor(
    private matDialog: MatDialog,
    private router: Router,
    private recordService: RecordService
  ) {}

  ngOnInit(): void {}

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
