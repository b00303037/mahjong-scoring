import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickPlayersPageComponent } from './pick-players-page.component';

describe('PickPlayersPageComponent', () => {
  let component: PickPlayersPageComponent;
  let fixture: ComponentFixture<PickPlayersPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PickPlayersPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PickPlayersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
