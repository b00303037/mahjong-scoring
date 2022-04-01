import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { LayoutModule } from '@angular/cdk/layout';

// @angular/material
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import {
  MatDialogConfig,
  MatDialogModule,
  MAT_DIALOG_DEFAULT_OPTIONS,
} from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  MatFormFieldDefaultOptions,
  MatFormFieldModule,
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppComponent } from './app.component';
// dialogs
import { PlayerDialogComponent } from './shared/components/player-dialog/player-dialog.component';
import { RuleDialogComponent } from './shared/components/rule-dialog/rule-dialog.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { DealerRoundDialogComponent } from './shared/components/dealer-round-dialog/dealer-round-dialog.component';
import { PlayerPickerDialogComponent } from './shared/components/player-picker-dialog/player-picker-dialog.component';
import { WinningRecordDialogComponent } from './shared/components/winning-record-dialog/winning-record-dialog.component';
import { SelfDrawnRecordDialogComponent } from './shared/components/self-drawn-record-dialog/self-drawn-record-dialog.component';
//pages
import { PlayersPageComponent } from './pages/players-page/players-page.component';
import { RulesPageComponent } from './pages/rules-page/rules-page.component';
import { PickPlayersPageComponent } from './pages/pick-players-page/pick-players-page.component';
import { BoardPageComponent } from './pages/board-page/board-page.component';
import { RecordsPageComponent } from './pages/records-page/records-page.component';
import { AnalyticsPageComponent } from './pages/analytics-page/analytics-page.component';

const FORM_FIELD_DEFAULT_OPTIONS: MatFormFieldDefaultOptions = {
  appearance: 'fill',
};
const DIALOG_DEFAULT_OPTIONS: MatDialogConfig = {
  width: '300px',
  hasBackdrop: true,
};

@NgModule({
  declarations: [
    AppComponent,
    // dialogs
    PlayerDialogComponent,
    RuleDialogComponent,
    ConfirmDialogComponent,
    DealerRoundDialogComponent,
    PlayerPickerDialogComponent,
    WinningRecordDialogComponent,
    SelfDrawnRecordDialogComponent,
    // pages
    PlayersPageComponent,
    RulesPageComponent,
    PickPlayersPageComponent,
    BoardPageComponent,
    RecordsPageComponent,
    AnalyticsPageComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    LayoutModule,
    // @angular/material
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: FORM_FIELD_DEFAULT_OPTIONS,
    },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: DIALOG_DEFAULT_OPTIONS },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
