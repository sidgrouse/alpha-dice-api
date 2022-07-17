import { Injectable } from '@nestjs/common';
import { HELP_SHEET_NAME } from 'src/constants';
import { SpreadsheetService } from 'src/sheets/spreadsheet.service';
import { IHelp } from './help.interface';

@Injectable()
export class HelpService {
  private _helpCommandsPromise: Promise<IHelp[]>;

  constructor(private _spreadsheetService: SpreadsheetService) {
    this._helpCommandsPromise = new Promise<IHelp[]>(async (resolve) => {
      const users = await this.getHelpSheets();
      resolve(users);
    });
  }

  public async getHelpCommands(): Promise<IHelp[]> {
    // add cash invalidation

    return await this._helpCommandsPromise;
  }

  private async getHelpSheets(): Promise<IHelp[]> {
    return await this._spreadsheetService.getRows<IHelp>(HELP_SHEET_NAME);
  }
}
