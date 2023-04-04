import {Context as ContextTelegraf} from 'telegraf'

export interface Context extends ContextTelegraf {
  session: {
    type?: 'fromName' | 'fromID' | 'notAuth' | 'toAuth' | 'auth',
    studentId?: string
    group?: string,
    code?: string,
    phone?: string
    infoMsgId?: number
    lastUpdate?: number
  }
}