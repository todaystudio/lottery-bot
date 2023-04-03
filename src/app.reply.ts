import {IStudent} from "./google-sheets/google-sheets.service";
import {Context} from "./context.interface";

export function replyInformationOfStudent(student: IStudent, ctx: Context) {
    ctx.replyWithHTML(`
<b>👨🏻‍💻 Имя:</b> ${student.name}
<b>🆔 ID:</b> ${student.id}
<b>🎟️ Билетиков:</b> ${student.tickets} \n
<i>Последнее обновление: ${student.lastEdit}</i> 
    `)
}
