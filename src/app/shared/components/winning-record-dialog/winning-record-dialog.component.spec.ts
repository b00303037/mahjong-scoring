import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinningRecordDialogComponent } from './winning-record-dialog.component';

describe('WinningRecordDialogComponent', () => {
  let component: WinningRecordDialogComponent;
  let fixture: ComponentFixture<WinningRecordDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WinningRecordDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WinningRecordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
