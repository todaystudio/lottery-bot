import { Controller, Get, Param } from "@nestjs/common";
import { AppService } from './app.service';
import { AppUpdate } from "./app.update";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly bot: AppUpdate
    ) {}

  @Get('add-ticket/:tgId')
  async getHello(@Param('tgId') id: string) {
    await this.bot.sendNotification(id)
    return '345dd'
  }
}
