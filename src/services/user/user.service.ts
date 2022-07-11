import { Injectable } from '@nestjs/common';
import { USER_SHEET_NAME } from 'src/constants';
import { SpreadsheetService } from 'src/sheets/spreadsheet.service';

@Injectable()
export class UserService {
  private _usersPromise: Promise<IUser[]>;

  constructor(private _spreadsheetService: SpreadsheetService) {
    this._usersPromise = new Promise<IUser[]>(async (resolve) => {
      const users = await this.refreshUserCache();
      resolve(users);
    });
  }

  async registerUser(telegramName: string, telegramId: number): Promise<void> {
    console.log('Adding a user', telegramName);
    const users = await this._usersPromise;

    const userRow = users.find(
      (r) => r.name == telegramName || r.name == '@' + telegramName,
    );

    if (userRow && !userRow.telegramId) {
      userRow.telegramId = telegramId;
      userRow.save();
      this._usersPromise = new Promise<IUser[]>(async (resolve) => {
        const users = await this.refreshUserCache();
        resolve(users);
      });
    }
  }

  async getTelegramIdByName(name: string): Promise<number> {
    const users = await this._usersPromise;
    const userRow = users.find((r) => r.name == name || r.name == '@' + name);
    return userRow?.telegramId;
  }

  private async refreshUserCache(): Promise<IUser[]> {
    return await this._spreadsheetService.getRows<IUser>(USER_SHEET_NAME);
  }
}

export interface IUser {
  name: string;
  telegramId: number;
  realName: string;
  save();
}
