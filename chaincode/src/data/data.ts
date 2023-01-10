import * as ledger from "../ledger/common";
import { Context } from "fabric-contract-api";
import { Account } from "../vo/account";
import { Class } from "../vo/class";
import { Student } from "../vo/student";
import { Subject } from "../vo/subject";
import { Teacher } from "../vo/teacher";
import { Employee } from "../vo/employee";
import { Admin } from "../vo/admin";
import { BaseContract } from "../contract/contract";

const listStudent: Student[] = [
    {
        id: 'S1', name: 'Vương Mạnh Hùng', address: 'Nam Định',
        dateOfBirth: new Date("2000-8-23").getTime() / 1000,
        class: "D18CNPM04", email: "hungvm@gmail.com", major: "Công nghệ phần mềm",
        faculty: "Công nghệ thông tin 1", phone: "0857865006"
    },
    {
        id: 'S2', name: 'Nguyễn Văn Tùng', address: 'Hà Nội',
        dateOfBirth: new Date("2000-12-2").getTime() / 1000,
        class: "D18CNPM04", email: "tungnv@gmail.com", major: "Công nghệ phần mềm",
        faculty: "Công nghệ thông tin 1", phone: "0957865106"
    }
];

const listTeacher: Teacher[] = [
    {
        id: 'T1', name: 'Đào Thị Quỳnh', address: 'Ninh Bình',
        dateOfBirth: new Date("1989-1-2").getTime() / 1000,
        email: "quynhdt@gmail.com", phone: "0357865106",
        faculty: "Công nghệ thông tin 1"
    },
    {
        id: 'T2', name: 'Nguyễn Văn Kim', address: 'Hà Nội',
        dateOfBirth: new Date("1982-12-3").getTime() / 1000,
        email: "kimnv@gmail.com", phone: "0157865106",
        faculty: "Công nghệ thông tin 1"
    }
];

const listEmployee: Employee[] = [
    {
        id: 'E1', name: 'Trần Kim Anh', address: 'Hà Nam',
        dateOfBirth: new Date("1992-1-2").getTime() / 1000,
        email: "quynhdt@gmail.com", phone: "0357865106",
        position: "Phòng khảo thí"
    },
    {
        id: 'E2', name: 'Hoàng Văn Khoa', address: 'Thái Bình',
        dateOfBirth: new Date("1982-3-2").getTime() / 1000,
        email: "quynhdt@gmail.com", phone: "0357865106",
        position: "Phòng khảo thí"
    }
];

const listAdmin: Admin[] = [
    {
        id: 'A1', name: 'Vương Mạnh Hùng', address: 'Nam Định',
        dateOfBirth: new Date("2000-12-2").getTime() / 1000,
        email: "quynhdt@gmail.com", phone: "0357865106"
    }
];

const listAccount: Account[] = [
    {
        id: 'S1',
        password: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
        type: 'STUDENT'
    },
    {
        id: 'S2',
        password: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
        type: 'STUDENT'
    },
    {
        id: 'E1',
        password: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
        type: 'EMPLOYEE'
    },
    {
        id: 'E2',
        password: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
        type: 'EMPLOYEE'
    },
    {
        id: 'T1',
        password: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
        type: 'TEACHER'
    },
    {
        id: 'T2',
        password: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
        type: 'TEACHER'
    },
    {
        id: 'A1',
        password: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
        type: 'ADMIN'
    }
];

const listClass: Class[] = [
    {
        id: 'D18-022', subjectId: 'BAS1203', year: 2022,
        semester: 'I', teacherId: 'T1'
    },
    {
        id: 'D18-023', subjectId: 'BAS1201', year: 2022,
        semester: 'I', teacherId: 'T2'
    },
];

const listSubject: Subject[] = [
    {
        id: 'BAS1203', name: 'Giải tích 1',
        numberOfCredit: 3, attendancePointRate: 10,
        midtermExamPointRate: 10, practicePointRate: 0,
        exercisePointRate: 10, finalExamPointRate: 70,
    },
    {
        id: 'BAS1201', name: 'Đại số',
        numberOfCredit: 3, attendancePointRate: 10,
        midtermExamPointRate: 10, practicePointRate: 0,
        exercisePointRate: 10, finalExamPointRate: 70,
    },
    {
        id: 'INT1154', name: 'Tin học cơ sở 1',
        numberOfCredit: 3, attendancePointRate: 10,
        midtermExamPointRate: 10, practicePointRate: 10,
        exercisePointRate: 0, finalExamPointRate: 70,
    },
];

export const initLedger = async (
    ctx: Context, contract: BaseContract
): Promise<any> => {
    for (const admin of listAdmin) {
        admin.docType = 'ADMIN'
        await ledger.putState(
            ctx, contract, admin.id,
            admin, admin.docType
        );
    }

    for (const student of listStudent) {
        student.docType = 'STUDENT'
        await ledger.putState(
            ctx, contract, student.id,
            student, student.docType
        );
    }

    for (const teacher of listTeacher) {
        teacher.docType = 'TEACHER'
        await ledger.putState(
            ctx, contract, teacher.id,
            teacher, teacher.docType
        );
    }

    for (const employee of listEmployee) {
        employee.docType = 'EMPLOYEE'
        await ledger.putState(
            ctx, contract, employee.id,
            employee, employee.docType
        );
    }

    for (const account of listAccount) {
        account.docType = 'ACCOUNT'
        await ledger.putState(
            ctx, contract, account.id,
            account, account.docType
        );
    }

    for (const cls of listClass) {
        cls.docType = 'CLASS'
        await ledger.putState(
            ctx, contract, cls.id,
            cls, cls.docType
        );
    }

    for (const subject of listSubject) {
        subject.docType = 'SUBJECT'
        await ledger.putState(
            ctx, contract, subject.id,
            subject, subject.docType
        );
    }
}