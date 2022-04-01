import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealerRoundDialogComponent } from './dealer-round-dialog.component';

describe('DealerRoundDialogComponent', () => {
  let component: DealerRoundDialogComponent;
  let fixture: ComponentFixture<DealerRoundDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DealerRoundDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DealerRoundDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
