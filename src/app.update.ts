import { Hears, On, InjectBot, Start, Update, Message, Ctx } from "nestjs-telegraf";
import { Telegraf } from 'telegraf';
import { GoogleSheetsService, IStudent } from "./google-sheets/google-sheets.service";
import { actionButtons } from "./app.buttons";
import { Context } from "./context.interface";

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
  async getId(@Ctx() ctx: Context) {
    await ctx.reply('Напиши свой ID 🔥');
    ctx.session.type = 'fromID'
  }

  @On('text')
  async getMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    console.log(ctx.session.type);
    if (!ctx.session.type) return;
    if (ctx.session.type === 'fromID') {
      try {
        const student: IStudent = await this.google.getRowCountByParticipantId(message);
        await ctx.reply(`
        👨🏻‍💻Имя: ${student.name}
        🆔ID: ${student.id}
        🎟️Билетиков: <b>${student.tickets}</b>
        `);
      } catch (e) {
        await ctx.reply(`Student hasn\'t lottery tickets yet`);
      }
    }
  }
}
