import { AccountContract } from './contract/account.contract';
import { ClaimContract } from './contract/claim.contract';
import { ClassContract } from './contract/class.contract';
import { ConfirmContract } from './contract/confirm.contract';
import { ExamContract } from './contract/exam.contract';
import { LegerContract } from './contract/ledger.contract';
import { PointContract } from './contract/point.contract';
import { RoomContract } from './contract/room.contract';
import { StudentContract } from './contract/student.contract';
import { SubjectContract } from './contract/subject.contract';
import { TeacherContract } from './contract/teacher.contract';
import { TransactionContract } from './contract/transaction.contract';

export {
    TransactionContract, StudentContract,
    AccountContract, SubjectContract,
    ClassContract, PointContract,
    RoomContract, ExamContract,
    TeacherContract, LegerContract,
    ClaimContract, ConfirmContract
}

export const contracts: any[] = [
    StudentContract, AccountContract,
    TransactionContract, SubjectContract,
    ClassContract, PointContract,
    RoomContract, ExamContract,
    TeacherContract, LegerContract,
    ClaimContract, ConfirmContract
];