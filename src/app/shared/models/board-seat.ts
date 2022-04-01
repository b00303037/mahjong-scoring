import { Player } from './player';
import { SeatStatus } from './seat-status';

export interface BoardSeat {
  player: Player;
  seatStatus: SeatStatus;
  points: number;
}
