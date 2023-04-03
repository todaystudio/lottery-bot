import { Hears, On, InjectBot, Start, Update, Message, Ctx } from "nestjs-telegraf";
import { Telegraf } from 'telegraf';
import { GoogleSheetsService, IStudent } from "./google-sheets/google-sheets.service";
import { actionButtons } from "./app.buttons";
import { Context } from "./context.interface";
import {replyInformationOfStudent} from "./app.reply";
import {NotFoundException} from "@nestjs/common";

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly google: GoogleSheetsService,
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply('Привет 🔥');
    await ctx.reply('Ты хочешь узнать сколько ты накопил билетиков? 🎟️', actionButtons());
  }

  @Hears('🆔 Узнать по ID')
  async getFromId(@Ctx() ctx: Context) {
    await ctx.reply('Напиши свой ID 🔥');
    ctx.session.type = 'fromID'
  }

  @Hears('👨🏻‍💻 Узнать по имени и фамилии')
  async getFromName(@Ctx() ctx: Context) {
    await ctx.reply('Напиши свои Имя и Фамилию 🔥');
    ctx.session.type = 'fromName'
  }

  @On('text')
  async getMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    if (!ctx.session.type) return;

    if (ctx.session.type === 'fromID') {
      try {
        const student: IStudent = await this.google.getRowCountByParticipantId(message);
        await replyInformationOfStudent(student, ctx)
      } catch (e) {
        await ctx.reply(e.message);
      }
    }

    if (ctx.session.type === 'fromName') {
      try {
        if (message.length < 3) throw new NotFoundException('Имя не может быть меньше трех символов 🤨')
        const student: IStudent = await this.google.getRowCountByParticipantName(message);
        await replyInformationOfStudent(student, ctx)
      } catch (e) {
        await ctx.reply(e.message);
      }
    }
  }
}
