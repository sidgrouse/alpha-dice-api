import { Injectable } from '@nestjs/common';
import { UserDto } from 'src/dto/user.dto';
import { SpreadsheetService } from 'src/sheets/spreadsheet.service';

@Injectable()
export class UserService {
  private static _users: UserDto[] = [];

  constructor(private _spreadsheetService: SpreadsheetService) {}

  async addUser(name: string, telegramId: number): Promise<void> {
    console.log('Adding a user');

    const rows = await this._spreadsheetService.getRows();
    console.log('rows', rows);

    const userRow = rows.find(
      (r) => r.contact_id == name || r.contact_id == '@' + name,
    );

    console.log('existed', userRow);
    if (userRow && !userRow.telegram_id) {
      userRow.telegram_id = telegramId;
      userRow.save();
      console.log('saved');
    }

    //add user info
  }

  async getTelegramIdByName(name: string): Promise<number> {
    //TODO: add cache
    const rows = await this._spreadsheetService.getRows();

    const userRow = rows.find(
      (r) => r.contact_id == name || r.contact_id == '@' + name,
    );
    return userRow.telegram_id;
  }
}
