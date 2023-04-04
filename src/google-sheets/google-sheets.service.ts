import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {GoogleSpreadsheet} from "google-spreadsheet";
import {SERVICE_ACCOUNT_EMAIL, SERVICE_ACCOUNT_PRIVATE_KEY} from "../config/account-file";

const SPREADSHEET_ID = "1dEEnVAjqVCwMuZ-Zv38eLcxwZ_YA03wK0L3XJ4VufiE";

export interface IStudent {
    name: string;
    id: string;
    tickets?: number;
    lastEdit?: string;
}

export interface IStudentDB {
    name: string;
    ID: string;
    phone: string;
    group: string;
}

@Injectable()
export class GoogleSheetsService {
    private doc: GoogleSpreadsheet;

    async init() {
        this.doc = new GoogleSpreadsheet(SPREADSHEET_ID);
        await this.doc.useServiceAccountAuth({
            client_email: SERVICE_ACCOUNT_EMAIL,
            private_key: SERVICE_ACCOUNT_PRIVATE_KEY
        });
        await this.doc.loadInfo();
    }

    async getRowsFromSheet(sheetIndex: number) {
        if (!this.doc) {
            await this.init();
        }
        const sheet = this.doc.sheetsByIndex[sheetIndex];
        return await sheet.getRows();
    }

    reformatToObject(rows: any, index: number): IStudentDB {
        return {
            name: rows[index].name,
            group: rows[index].group,
            phone: rows[index].phone,
            ID: rows[index].ID
        };
    }

    async getRowCountByParticipantId(studentId: string) {

        if (studentId.trim().length > 3) throw new BadRequestException("Такого ID не существует");

        const rows = await this.getRowsFromSheet(0);

        // отфильтровать строки по заданному ID участника
        const matchingRows = rows.filter((row) => row.ID === studentId);

        if (!matchingRows.length) throw new BadRequestException("Наверное, ты еще не получил билетики🫣");

        let student: IStudent = {
            name: matchingRows[0].name,
            id: matchingRows[0].ID,
            tickets: +matchingRows.length,
            lastEdit: matchingRows[matchingRows.length - 1].lastEdit
        }

        return student;
    }

    async getRowCountByParticipantName(studentName: string) {

        const rows = await this.getRowsFromSheet(0);

        // отфильтровать строки по заданному ID участника
        const searchWords = studentName.toLowerCase().split(" ");
        const matchingRows = rows.filter((row) => {
            if (!row.name) return false;
            const rowWords = row.name.toLowerCase().split(" ");
            return searchWords.every((word) => rowWords.some((rowWord) => rowWord.includes(word)));
        });
        if (!matchingRows.length) throw new NotFoundException(`Никого не нашлось 🙈`);

        let student: IStudent = {
            name: matchingRows[0].name,
            id: matchingRows[0].ID,
            tickets: +matchingRows.length,
            lastEdit: matchingRows[matchingRows.length - 1].lastEdit
        };

        return student;
    }

    async getStudentByTelegramId(id: number) {
        const rows = await this.getRowsFromSheet(1);
        const studentIndex = await rows.findIndex((row) => +row.isAuth === id);
        if (studentIndex === -1) throw new NotFoundException("Вы еще не авторизованы🥲");

        return this.reformatToObject(rows, studentIndex);
    }

    async checkAuthCode(code: string) {
        const rows = await this.getRowsFromSheet(1);
        const studentIndex = await rows.findIndex((row) => row.auth === code);
        if (studentIndex === -1) throw new NotFoundException("Код не подошел🥲");

        return this.reformatToObject(rows, studentIndex);
    }

    async getStudentsByGroup(group: string) {
        try {
            const rows = await this.getRowsFromSheet(1);
            const req = await rows.filter((row) => row.group === group);
            return req.map(student => ({
                    name: student.name,
                    ID: student.ID,
                    group: student.group,
                    phone: student.phone
                }
            ));
        } catch (e) {
            console.log(e.message);
            throw new BadRequestException("Конечно, такого не может быть, но в этой группе никого нет🤷🏻‍♂️");
        }
    }

    async getStudentByIdFromDB(id: string) {
        try {
            const rows = await this.getRowsFromSheet(1);
            const req = await rows.find((row) => row.ID === id);
            return {
                name: req.name,
                ID: req.ID,
                group: req.group,
                phone: req.phone
            }
        } catch (e) {
            console.log(e.message);
            throw new BadRequestException("Конечно, такого не может быть, но в этой группе никого нет🤷🏻‍♂️");
        }
    }

    async setMetrics(studentName: string, telegramId: number, type: 'start' | 'auth' | 'update' | 'check' | 'help' | 'logout') {
        try {
            if (!studentName || !telegramId || !type) return
            const sheet = await this.doc.sheetsByIndex[2];

            const now = new Date(); // получаем текущую дату и время
            const newRow = { // создаем объект новой строки
                studentName: studentName,
                type, telegramId,
                timestamp: now.toISOString(),
            };
            await sheet.addRow(newRow); // добавляем новую строку в таблицу
        } catch (e) {
            console.log(e)
        }
    }

}