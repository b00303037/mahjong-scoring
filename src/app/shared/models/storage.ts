import { Player } from './player';
import { Settings } from './settings';
import { Rule, RULES } from './rule';
import { SeatStatus } from './seat-status';
import { EWinds, WINDS } from './wind.models';
import { Record } from './record';

export class AppStorage {
  // for PlayerService
  players: Array<Player> = [];
  // for RuleService
  settings: Settings = new Settings();
  rules: Array<Rule> = [...RULES];
  // for BoardService
  wind: EWinds = EWinds.East;
  seatStatuses: Array<SeatStatus> = WINDS.map(
    (wind, i) => new SeatStatus({ wind, dealerRound: i === 0 ? 0 : -1 })
  );
  // for RecordService
  records: Array<Record> = [];

  constructor(json: string | null) {
    if (json !== null) {
      const { players, rules, settings, wind, seatStatuses, records } =
        JSON.parse(json) as AppStorage;

      this.players = players;
      this.rules = rules;
      this.settings = settings;
      this.wind = wind;
      this.seatStatuses = seatStatuses;
      this.records = records;
    }
  }
}
