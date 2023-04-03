import { Injectable } from "@nestjs/common";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { SERVICE_ACCOUNT_EMAIL, SERVICE_ACCOUNT_PRIVATE_KEY } from "../config/account-file";

const SPREADSHEET_ID = '1dEEnVAjqVCwMuZ-Zv38eLcxwZ_YA03wK0L3XJ4VufiE';

export interface IStudent {
  name: string
  id: string
  tickets?: number
}

@Injectable()
export class GoogleSheetsService {
  async getRowCountByParticipantId(studentId: string) {

    if (studentId.trim().length > 3) return

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: SERVICE_ACCOUNT_PRIVATE_KEY,
    });

    await doc.loadInfo(); // загрузить информацию о документе
    const sheet = doc.sheetsByIndex[0]; // выбрать первую страницу

    // получить все строки в виде массива объектов
    const rows = await sheet.getRows();

    // отфильтровать строки по заданному ID участника
    const matchingRows = rows.filter((row) => row.ID === studentId);

    if (!matchingRows.length) throw Error(`Student not found`)

    let student: IStudent = {
      name: matchingRows[0].name,
      id: matchingRows[0].ID,
      tickets: +matchingRows.length
    }

    return student
  }
}
