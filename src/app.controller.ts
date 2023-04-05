import { Controller, Get, Param } from "@nestjs/common";
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('add-ticket/:tgId')
  getHello(@Param('tgId') id: string) {
    return id.toString()
  }
}
