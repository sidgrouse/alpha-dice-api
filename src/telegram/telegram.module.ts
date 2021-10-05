import {Module, OnModuleInit} from '@nestjs/common';
import {TelegramService} from './telegram.service';

@Module({
    providers: [TelegramService],
    exports: [TelegramService],
})
export class TelegramModule implements OnModuleInit {
    constructor(private readonly telegramService: TelegramService) {}

    async onModuleInit() {
        await this.telegramService.launch();
    }
}