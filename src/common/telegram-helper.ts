export class TelegramHelper {
  // eslint-disable-next-line prettier/prettier
  private static charsToEscape = [];

  public static escape(value: string): string {
    return value.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  }
}
