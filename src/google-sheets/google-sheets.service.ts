import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { SERVICE_ACCOUNT_EMAIL, SERVICE_ACCOUNT_PRIVATE_KEY } from "../config/account-file";

const SPREADSHEET_ID = '1dEEnVAjqVCwMuZ-Zv38eLcxwZ_YA03wK0L3XJ4VufiE';

export interface IStudent {
  name: string
  id: string
  tickets?: number
  lastEdit?: string
}

@Injectable()
export class GoogleSheetsService {
  async getRowCountByParticipantId(studentId: string) {

    if (studentId.trim().length > 3) throw new BadRequestException('Такого ID не существует')

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

    if (!matchingRows.length) throw new BadRequestException('Такой студент не найден')

    let student: IStudent = {
      name: matchingRows[0].name,
      id: matchingRows[0].ID,
      tickets: +matchingRows.length,
      lastEdit: matchingRows[matchingRows.length - 1].lastEdit
    }

    return student
  }

  async getRowCountByParticipantName(studentName: string) {


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
    const searchWords = studentName.toLowerCase().split(' ');
    const matchingRows = rows.filter((row) => {
      if (!row.name) return false
      console.log(row.name)
      const rowWords = row.name.toLowerCase().split(' ');
      return searchWords.every((word) => rowWords.some((rowWord) => rowWord.includes(word)));
    });
    if (!matchingRows.length) throw new NotFoundException(`Никого не нашлось 🙈`)

    let student: IStudent = {
      name: matchingRows[0].name,
      id: matchingRows[0].ID,
      tickets: +matchingRows.length,
      lastEdit: matchingRows[matchingRows.length - 1].lastEdit
    }

    return student
  }
}
