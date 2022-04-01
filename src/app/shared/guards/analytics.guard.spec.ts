import { TestBed } from '@angular/core/testing';

import { AnalyticsGuard } from './analytics.guard';

describe('AnalyticsGuard', () => {
  let guard: AnalyticsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AnalyticsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
