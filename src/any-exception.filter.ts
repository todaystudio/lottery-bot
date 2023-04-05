import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import {InjectBot} from "nestjs-telegraf";
import {Telegraf} from "telegraf";
import {Context} from "./context.interface";

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
    ) {}

    async sendError(err) {
        await this.bot.launch()
        await this.bot.telegram.sendMessage(449631108, err)
    }

    catch(exception: any, host: ArgumentsHost) {

        this.sendError(exception).then(() => console.error(exception))
    }
}