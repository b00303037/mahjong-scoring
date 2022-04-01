import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PlayersPageComponent } from './pages/players-page/players-page.component';
import { PickPlayersPageComponent } from './pages/pick-players-page/pick-players-page.component';
import { RulesPageComponent } from './pages/rules-page/rules-page.component';
import { BoardPageComponent } from './pages/board-page/board-page.component';
import { RecordsPageComponent } from './pages/records-page/records-page.component';
import { AnalyticsPageComponent } from './pages/analytics-page/analytics-page.component';

import { PickPlayersGuard } from './shared/guards/pick-players.guard';
import { BoardGuard } from './shared/guards/board.guard';
import { RecordsGuard } from './shared/guards/records.guard';
import { AnalyticsGuard } from './shared/guards/analytics.guard';

const routes: Routes = [
  {
    path: 'players',
    component: PlayersPageComponent,
  },
  {
    path: 'rules',
    component: RulesPageComponent,
  },
  {
    path: 'pick-players',
    canActivate: [PickPlayersGuard],
    component: PickPlayersPageComponent,
  },
  {
    path: 'board',
    canActivate: [BoardGuard],
    component: BoardPageComponent,
  },
  {
    path: 'records',
    canActivate: [RecordsGuard],
    component: RecordsPageComponent,
  },
  {
    path: 'analytics',
    canActivate: [AnalyticsGuard],
    component: AnalyticsPageComponent,
  },
  {
    path: '**',
    component: BoardPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
