import {IStudent} from "./google-sheets/google-sheets.service";
import {Context} from "./context.interface";
import {Markup} from 'telegraf'
import { updateInformationButton } from "./app.buttons";
import { inlineKeyboard } from "telegraf/typings/markup";

export interface IHiddenPhone {
    code: string;
    phone: string,
    hiddenPhone: string
}

export function getMainMenu() {
    return Markup.keyboard([
        ['Мои задачи', 'Добавить задачу'],
        ['Смотивируй меня']
    ]).resize()
}

export function replyInformationOfStudent(student: IStudent, ctx: Context) {
    ctx.deleteMessage()
    ctx.replyWithHTML(`
<b>👨🏻‍💻 Имя:</b> ${student.name}
<b>🆔 ID:</b> ${student.id}
<b>🎟️ Билетиков:</b> ${student.tickets} \n
<i>Последнее обновление: ${student.lastEdit}</i> 
    `, updateInformationButton()).then(msg => {
        ctx.session.infoMsgId = msg.message_id
    })

}

export function getHiddenPhone(phone: string): IHiddenPhone {
    let hiddenStr = '';
    const regex = /^(\d*)(\d{4})$/;
    const hiddenPhone = phone.replace(regex, (match, p1, p2) => {
        hiddenStr = p2;
        return p1 + '****';
    });
    return {code: hiddenStr, phone: phone, hiddenPhone: hiddenPhone}
}

export function checkLastUpdate(lastUpdate: number) {
    const now = new Date().getTime();
    const diffInSeconds = (now - lastUpdate) / 1000;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const minutesLeft = 5 - diffInMinutes;
    const isExpired = diffInMinutes >= 5;

    return { minutesLeft, isExpired };
}