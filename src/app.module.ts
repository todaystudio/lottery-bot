import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';
import * as dotenv from 'dotenv'
import { AppService } from './app.service';
import { AppUpdate } from './app.update';
import { GoogleSheetsModule } from './google-sheets/google-sheets.module';
import { GoogleSheetsService } from "./google-sheets/google-sheets.service";

dotenv.config();

const sessions = new LocalSession({database: 'session_db.json'})

@Module({
  imports: [
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: process.env.TG_TOKEN
    }),
    GoogleSheetsModule
  ],
  providers: [AppService, AppUpdate, GoogleSheetsService],
})
export class AppModule {

}
