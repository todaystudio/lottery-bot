import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppUpdate } from './app.update';
import { GoogleSheetsModule } from './google-sheets/google-sheets.module';
import { GoogleSheetsService } from "./google-sheets/google-sheets.service";

const sessions = new LocalSession({database: 'session_db.json'})

@Module({
  imports: [
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: '6006418989:AAE62Om_GKRa3575D5K3IwZ1wcR_j_sn1E0'
    }),
    GoogleSheetsModule
  ],
  providers: [AppService, AppUpdate, GoogleSheetsService],
})
export class AppModule {}
