import {Module, OnModuleInit} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {TelegramService} from './telegram.service';

@Module({
    imports: [ConfigModule.forRoot({envFilePath: 'development.env'})],
    providers: [TelegramService],
    exports: [TelegramService],
})
export class TelegramModule implements OnModuleInit {
    constructor(private readonly telegramService: TelegramService) {}

    async onModuleInit() {
        await this.telegramService.launch();
    }
}