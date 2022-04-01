import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { Settings } from '../models/settings';
import { Rule, RULES } from '../models/rule';
import { AppStorage } from '../models/storage';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RuleService {
  settingsSource$ = new BehaviorSubject<Settings>(this._defaultSettings());
  rulesSource$ = new BehaviorSubject<Array<Rule>>(this._defaultRules());

  initialize(data: { settings: Settings; rules: Array<Rule> }) {
    this.settingsSource$.next(new Settings(data.settings));

    if (data.rules.length > 0) {
      this.rulesSource$.next(data.rules.map((r) => new Rule(r)));
    }
  }

  updateSettings(data?: {
    isDarkMode?: boolean;
    basePrice?: number;
    pointPrice?: number;
    changeDealerOnDrawn?: boolean;
    excludeDealerPoint?: boolean;
    recordReadyHand?: boolean;
  }): void {
    if (data) {
      const settings = this.settingsSource$.getValue();

      settings.update(data);

      this.settingsSource$.next(settings);
    }
  }

  addRule(rule: Rule): void {
    const rules = this.rulesSource$.getValue();

    this.rulesSource$.next([...rules, rule]);
  }

  updateRule(rule: Rule): void {
    const rules = this.rulesSource$.getValue();
    const i = rules.findIndex((r) => r.uuid === rule.uuid);

    if (i !== -1) {
      rules[i] = rule;

      this.rulesSource$.next([...rules]);
    }
  }

  deleteRule(uuid: string): void {
    const rules = this.rulesSource$.getValue();
    const i = rules.findIndex((r) => r.uuid === uuid);

    // TODO && !rules[i].isDefault
    if (i !== -1) {
      rules.splice(i, 1);

      this.rulesSource$.next([...rules]);
    }
  }

  resetSettings(): void {
    this.settingsSource$.next(this._defaultSettings());
  }

  resetRules(): void {
    this.rulesSource$.next(this._defaultRules());
  }

  saveToLocalStorage(): void {
    const json = localStorage.getItem(environment.storageKey);

    if (json !== null) {
      const storage = JSON.parse(json) as AppStorage;

      storage.settings = this.settingsSource$.getValue();
      storage.rules = this.rulesSource$.getValue();

      localStorage.setItem(environment.storageKey, JSON.stringify(storage));
    }
  }

  private _defaultSettings(): Settings {
    return new Settings();
  }

  private _defaultRules(): Array<Rule> {
    return [...RULES];
  }
}
