import { uuid } from '../helpers/uuid.helper';

/**
 * 玩家
 */
export class Player {
  uuid: string = uuid(); // 玩家 id
  avatar: string = this._randomAvatar(); // 玩家頭像
  name: string = ''; // 玩家名稱

  constructor(data?: { uuid?: string; avatar?: string; name?: string }) {
    if (data) {
      this.uuid = data.uuid ?? this.uuid;
      this.avatar = data.avatar ?? this.avatar;
      this.name = data.name ?? this.name;
    }
  }

  update(data?: { avatar?: string; name?: string }): void {
    if (data) {
      this.avatar = data.avatar ?? this.avatar;
      this.name = data.name ?? this.name;
    }
  }

  private _randomAvatar(): string {
    const i = Math.floor(Math.random() * AVATARS.length);

    return AVATARS[i];
  }
}

export const AVATARS: Array<string> = [
  '🐻', // Bear
  '🐗', // Boar
  '🐱', // Cat
  '🐮', // Cow
  '🐶', // Dog
  '🐸', // Frog
  '🦊', // Fox
  '🦒', // Giraffe
  '🐹', // Hamster
  '🐨', // Koala
  '🦁', // Lion
  '🐵', // Monkey
  '🐭', // Mouse
  '🐼', // Panda
  '🐷', // Pig
  '🐰', // Rabbit
  '🦝', // Raccoon
  '🐯', // Tiger
  '🐺', // Wolf
  // '🐔', // Chicken
  // '🐲', // Dragon
  // '🐴', // Horse
  // '🦄', // Unicorn
  // '🦓', // Zebra
];
