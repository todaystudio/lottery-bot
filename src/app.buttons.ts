import { Markup } from "telegraf";

export function actionButtons() {
  return Markup.keyboard(
    [
      Markup.button.callback('👨🏻‍💻 Узнать по имени и фамилии', 'fromName'),
      Markup.button.callback('🆔 Узнать по ID', 'fromId'),
    ],
    {
      columns: 2
    }
  )
}