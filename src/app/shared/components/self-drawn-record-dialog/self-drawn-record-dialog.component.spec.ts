import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfDrawnRecordDialogComponent } from './self-drawn-record-dialog.component';

describe('SelfDrawnRecordDialogComponent', () => {
  let component: SelfDrawnRecordDialogComponent;
  let fixture: ComponentFixture<SelfDrawnRecordDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelfDrawnRecordDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfDrawnRecordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
