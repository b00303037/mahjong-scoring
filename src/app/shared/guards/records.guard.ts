import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RecordService } from '../services/record.service';

@Injectable({
  providedIn: 'root',
})
export class RecordsGuard implements CanActivate {
  constructor(private recordService: RecordService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.recordService.recordsSource$.pipe(
      map((records) => records.length > 0)
    );
  }
}
