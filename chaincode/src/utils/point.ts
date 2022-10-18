import { Point } from "../vo/point";
import { Subject } from "../vo/subject";

export const calculateAveragePoint = (point: Point) => {
    const subject: Subject = point['cls']['subject'];
    const result = point.attendancePoint * subject.attendancePointRate +
        point.exercisePoint * subject.exercisePointRate +
        point.practicePoint * subject.practicePointRate +
        point.midtermExamPoint * subject.midtermExamPointRate +
        point['examPoint'] * subject.finalExamPointRate;

    const number = Number((result / 100).toFixed(1));
    const letter = getLetterAveragePoint(number);
    point['numberAveragePoint'] = number;
    point['letterAveragePoint'] = letter;
}

const getLetterAveragePoint = (average: number): string => {
    let letter: string;
    switch (true) {
        case (average >= 9.0): letter = "A+"; break;
        case (average >= 8.5): letter = "A"; break;
        case (average >= 8.0): letter = "B+"; break;
        case (average >= 7.0): letter = "B"; break;
        case (average >= 6.5): letter = "C+"; break;
        case (average >= 5.5): letter = "C"; break;
        case (average >= 5.0): letter = "D+"; break;
        case (average >= 4.0): letter = "D"; break;
        default: letter = "F"; break;
    }
    return letter;
}

export const getNumberAveragePoint = (letter: string): number => {
    let number = 0;
    switch (letter) {
        case "A+": number = 4; break;
        case "A": number = 3.7; break;
        case "B+": number = 3.5; break;
        case "B": number = 3; break;
        case "C+": number = 2.5; break;
        case "C": number = 2; break;
        case "D+": number = 1.5; break;
        case "D": number = 1; break;
        case "F": number = 0; break;
    }
    return number;
}