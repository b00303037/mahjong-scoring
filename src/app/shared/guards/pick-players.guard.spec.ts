import { TestBed } from '@angular/core/testing';

import { PickPlayersGuard } from './pick-players.guard';

describe('PickPlayersGuard', () => {
  let guard: PickPlayersGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PickPlayersGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
