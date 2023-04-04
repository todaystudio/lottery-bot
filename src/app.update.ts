import { Action, Ctx, Hears, Help, InjectBot, Message, On, Start, Update } from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { GoogleSheetsService, IStudent, IStudentDB } from "./google-sheets/google-sheets.service";
import {
  acceptStudentButtons,
  authorizationButtons,
  selectGroupButtons,
  selectStudentButtons,
  updateInformationButton
} from "./app.buttons";
import { Context } from "./context.interface";
import { checkLastUpdate, getHiddenPhone, replyInformationOfStudent } from "./app.reply";
import { BadRequestException, NotFoundException } from "@nestjs/common";

@Update()
export class AppUpdate {
  regex = /^👨🏻‍💻\s[A-Za-zА-Яа-я]+\s[A-Za-zА-Яа-я]+\s\|\s\d{3}$/;
  codeRegex = /\d{4}/;

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly google: GoogleSheetsService
  ) {
  }

  @Start()
  async startCommand(ctx: Context) {
    const memberId = ctx.from.id;
    const studentId = ctx.session.studentId;
    await this.google.setMetrics(ctx.session.studentId, ctx.from.id, "start")

    try {
      if (studentId && ctx.session.type !== "notAuth") {
        const student = await this.google.getStudentByIdFromDB(studentId);
        await ctx.reply(`Привет, ${ctx.from.first_name || ctx.from.username} 🔥`);
        await ctx.reply(`Ты по поводу нашего студента: ${student?.name || "null"}?`, acceptStudentButtons());
      } else {
        throw new BadRequestException("Вероятно, ты еще не авторизован 🤷🏻‍♂️");
      }
    } catch (e) {
      await this.goAuth(ctx, e)
    }
  }

  async goAuth(ctx: Context, e?: Error) {
    ctx.session.type = "notAuth";
    await ctx.reply(`Привет, ${ctx.from.first_name || ctx.from.username} 🔥`);
    if (!e) {
      await ctx.reply("Нужно авторизоваться", authorizationButtons());
      return
    }
    await ctx.reply(e.message || '🥳', authorizationButtons());
  }

  @Help()
    async getHelp(@Ctx() ctx: Context) {
    await ctx.reply('Если у тебя возникли вопросы по работе с ботом, то ты смело можешь писать сюда @todaystudio_web')
    await this.google.setMetrics(ctx.session.studentId, ctx.from.id, "help")
  }

  @Hears('/logout')
  async logout(@Ctx() ctx: Context) {
    try {
      if (ctx.session.studentId) {
        await this.google.setMetrics(ctx.session.studentId, ctx.from.id, "logout")
      }
      ctx.session = {
        type: "notAuth"
      }
      await ctx.reply('Ты успешно вышел из системы ✅', authorizationButtons())
    } catch (e) {
      await ctx.reply(e.message)
    }
  }

  @Action("auth")
  async selectGroup(@Ctx() ctx: Context) {
    ctx.deleteMessage();
    await ctx.reply("Выбери группу 🛂", selectGroupButtons());
  }


  @Hears(/Группа 7 ВС 15:30|Группа 2 СБ 13:00|Группа 3 СБ 15:30|Группа 4 СБ 18:00|Группа 5 ВС 10:30|Группа 6 ВС 13:00/)
  async selectStudent(@Message("text") msg: string, @Ctx() ctx: Context) {
    ctx.session.group = msg;
    try {
      const students = await this.google.getStudentsByGroup(msg);
      await ctx.reply("Выбери резидента 👨🏻‍💻", selectStudentButtons(students));
    } catch (e) {
      await ctx.reply(e.message);
    }
  }


  @Action("acceptStudent")
  async acceptStudent(@Ctx() ctx: Context) {
    if (!ctx.session.studentId) {
      await this.goAuth(ctx)
      return
    }
    try {
      const student: IStudent = await this.google.getRowCountByParticipantId(ctx.session.studentId);
      await replyInformationOfStudent(student, ctx);
      await this.google.setMetrics(ctx.session.studentId, ctx.from.id, "check")
    } catch (e) {
      ctx.replyWithHTML(`<b>${e.message}</b> \n
🔥<i>Делай домашку, приноси на занятия и увеличивай шансы на победу!</i>🔥
         `, updateInformationButton());
    }
  }

  @Action("fromName")
  async findFromName(@Ctx() ctx: Context) {
    await ctx.reply("Напиши свои Имя и Фамилию 🔥");
    ctx.session.type = "fromName";
  }

  @Action("fromID")
  async findFromID(@Ctx() ctx: Context) {
    await ctx.reply("Напиши свой ID 🔥");
    ctx.session.type = "fromID";
  }

  @Hears("💫 Обновить")
  async updateInformation(@Ctx() ctx: Context) {
    if (!ctx.session.studentId) return await this.goAuth(ctx)
    const {minutesLeft, isExpired} = checkLastUpdate(ctx.session.lastUpdate)
    if (ctx.session.lastUpdate && !isExpired) {
      await ctx.replyWithHTML(`
<b>Еще не время...</b>

Ты отправил слишком много запросов🥲

<i>Подожди еще ${minutesLeft} минут(-ы)</i>
      `)
      return
    }


    try {
      if (ctx.session.infoMsgId !== null) ctx.deleteMessage(ctx.session.infoMsgId).then(ctx.session.infoMsgId = null);
    } finally {
      const loadingMessage = ctx.reply("Обновляем... 💾");
      await this.acceptStudent(ctx);
      await loadingMessage.then(msg => ctx.deleteMessage(msg.message_id));
      ctx.session.lastUpdate = new Date().getTime()
      await this.google.setMetrics(ctx.session.studentId, ctx.from.id, "update")
    }

  }

  @On("text")
  async getMessage(@Message("text") message: string, @Ctx() ctx: Context) {
    if (!ctx.session.type) return;


    if (ctx.session.group && this.regex.test(message.toString())) {
      const studentId = message.split("|")[1].trim();
      ctx.session.studentId = studentId;
      try {
        const student: IStudentDB = await this.google.getStudentByIdFromDB(studentId);
        const { code, phone, hiddenPhone } = await getHiddenPhone(student.phone);

        await ctx.replyWithHTML(`
          Если этот номер тебе знаком, то введи последние четыре цифры ☎️
          <b>${hiddenPhone}</b>
        `, {
          reply_markup: {
            remove_keyboard: true
          }
        });


        ctx.session.phone = phone;
        ctx.session.code = code;
      } catch (e) {
        await ctx.reply(e.message);
      }
    }

    if (ctx.session.code && ctx.session.type === "notAuth" && this.codeRegex.test(message)) {
      const isAuth = ctx.session.code === message;
      if (isAuth) {
        ctx.deleteMessage().then(() => ctx.session.type = "auth");
        await ctx.reply("Фух... 😅 Теперь ты авторизован", acceptStudentButtons());
        await this.google.setMetrics(ctx.session.studentId, ctx.from.id, "auth")
      } else {
        await ctx.reply("Код не подошел🥲 Попробуй еще раз");
      }

    }


    if (ctx.session.type === "fromID") {
      try {
        const student: IStudent = await this.google.getRowCountByParticipantId(message);
        await replyInformationOfStudent(student, ctx);
      } catch (e) {
        await ctx.reply(e.message);
      }
    }

    if (ctx.session.type === "fromName") {
      try {
        if (message.length < 3) throw new NotFoundException("Имя не может быть меньше трех символов 🤨");
        const student: IStudent = await this.google.getRowCountByParticipantName(message);
        await replyInformationOfStudent(student, ctx);
      } catch (e) {
        await ctx.reply(e.message);
      }
    }
  }
}
