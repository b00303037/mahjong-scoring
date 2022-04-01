import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerPickerDialogComponent } from './player-picker-dialog.component';

describe('PlayerPickerDialogComponent', () => {
  let component: PlayerPickerDialogComponent;
  let fixture: ComponentFixture<PlayerPickerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerPickerDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerPickerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
