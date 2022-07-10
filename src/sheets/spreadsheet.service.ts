import { Injectable } from '@nestjs/common';
import { getEnvironmentData } from 'worker_threads';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SpreadsheetService {
  constructor(private _configService: ConfigService) {}

  public async getRows<TModel>(sheetTitle: string): Promise<TModel[]> {
    const doc = new GoogleSpreadsheet(
      this._configService.get('SPREADSHEET_ID'),
    );
    const serviceEmail =
      this._configService.get('SERVICE_ACCOUNT_EMAIL') ||
      getEnvironmentData('SERVICE_ACCOUNT_EMAIL').toString();
    const servicePrivateKey = (
      this._configService.get('SERVICE_ACCOUNT_PRIVATE_KEY') ||
      getEnvironmentData('SERVICE_ACCOUNT_PRIVATE_KEY').toString()
    ).replace(/\\n/g, '\n');

    await doc.useServiceAccountAuth({
      client_email: serviceEmail,
      private_key: servicePrivateKey,
    });

    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle[sheetTitle]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const ret = await sheet.getRows(); // can pass in { limit, offset }
    return ret as TModel[];
  }
}
