import { Markup } from "telegraf";
import { IStudentDB } from "./google-sheets/google-sheets.service";
import {Context} from "./context.interface";


export function actionButtons() {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('👨🏻‍💻 Узнать по имени и фамилии', 'fromName'),
      Markup.button.callback('🆔 Узнать по ID', 'fromId'),
    ],
    {
      columns: 2
    }
  )
}

export function acceptStudentButtons() {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('💥 Узнать сколько билетиков', 'acceptStudent'),
    ],

  )
}

export function authorizationButtons() {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('🔐 Авторизоваться!', 'auth'),
    ],
  )
}

export function selectGroupButtons() {
  return Markup.keyboard(
    [
      Markup.button.callback('Группа 2 СБ 13:00', 'selectGroup1'),
      Markup.button.callback('Группа 3 СБ 15:30', 'selectGroup2'),
      Markup.button.callback('Группа 4 СБ 18:00', 'selectGroup3'),
      Markup.button.callback('Группа 5 ВС 10:30', 'selectGroup4'),
      Markup.button.callback('Группа 6 ВС 13:00', 'selectGroup5'),
      Markup.button.callback('Группа 7 ВС 15:30', 'selectGroup6'),
    ],
    {
      columns: 3,
    }
  )
}

export function selectStudentButtons(students: IStudentDB[]) {
  const buttons = students.map(student => {
    return Markup.button.callback(`👨🏻‍💻 ${student.name} | ${student.ID}`,`selectStudent`)
  })
  return Markup.keyboard(
    buttons,
    {
      columns: 2
    }
  )
}

export function updateInformationButton() {
  return Markup.keyboard(
    [
      '💫 Обновить',
    ],
  )
}

