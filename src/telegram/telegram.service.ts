import { Telegraf } from 'telegraf';
import {Injectable} from '@nestjs/common';
import { User } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class TelegramService {
    private bot: Telegraf<any>;

    constructor() {
        const botToken: string = '1865828167:AAGQj5oBLMYfUOHnHiX5JJiKZRSEsXNS_LY';

        this.bot = new Telegraf(botToken);
        this.bot.start(ctx => ctx.reply('Welcome'));
        this.bot.help((ctx) => ctx.reply('Send me a sticker'));
    }

    public async launch(): Promise<void> {
        const botInfo: User = await this.bot.telegram.getMe();
        console.log('me', botInfo);
        this.bot.launch();
    }
}