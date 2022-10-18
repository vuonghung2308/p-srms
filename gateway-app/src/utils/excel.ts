import ExcelJS from "exceljs";

export const getWorkbook = (data: any): ExcelJS.Workbook => {

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Bảng điểm"); const headers = [
        "STT", "Mã môn", "Tên môn", "TC", "%CC",
        "%KT", "%TH", "%BT", "%Thi", "Điểm CC",
        "Điểm KT", "Điểm TH", "Điểm BT", "Điểm Thi",
        "TK(10)", "TK(CH)", "KQ"
    ];
    let currentRowIndex = 1;
    sheet.getRow(currentRowIndex).values = ["BẢNG ĐIỂM SINH VIÊN"]
    alignRowCenter(sheet, currentRowIndex);
    sheet.mergeCells(currentRowIndex++, 1, currentRowIndex - 1, headers.length)
    sheet.getRow(currentRowIndex).values = [`Họ và tên: ${data.student.name}`]
    sheet.mergeCells(currentRowIndex++, 1, currentRowIndex - 1, headers.length)
    sheet.getRow(currentRowIndex).values = [`Mã sinh viên: ${data.student.id}`]
    sheet.mergeCells(currentRowIndex++, 1, currentRowIndex - 1, headers.length)

    sheet.getRow(currentRowIndex++).values = headers;
    alignRowCenter(sheet, currentRowIndex - 1);
    alignCellLeft(sheet, currentRowIndex - 1, 2)
    alignCellLeft(sheet, currentRowIndex - 1, 3);
    sheet.getColumn(3).width = 20
    data.semesters.forEach((semester: any, sIndex: number) => {
        sheet.mergeCells(currentRowIndex, 1, currentRowIndex, headers.length)
        const row = sheet.getRow(currentRowIndex++);
        row.getCell(1).value = `Học kỳ ${semester.semester} - Năm học ${semester.year}-${semester.year + 1}`
        semester.points.forEach((point: any, pIndex: number) => {
            const subject = point.subject;
            const previousPointCount = sIndex === 0 ?
                0 : data.semesters[sIndex - 1].points.length;
            const values = [
                previousPointCount + pIndex + 1, subject.id, subject.name,
                subject.numberOfCredit, subject.attendancePointRate,
                subject.midtermExamPointRate, subject.practicePointRate,
                subject.exercisePointRate, subject.finalExamPointRate,
                point.attendancePoint, point.midtermExamPoint,
                point.practicePoint, point.exercisePoint, point.examPoint,
                point.numberAveragePoint, point.letterAveragePoint,
                !point.letterAveragePoint ? 'X' : point.letterAveragePoint
                    === 'F' ? 'Trượt' : 'Đạt'
            ]
            sheet.getRow(currentRowIndex++).values = values;
            sheet.getRow(currentRowIndex - 1).alignment = {
                vertical: 'middle', horizontal: 'center'
            };
            alignRowCenter(sheet, currentRowIndex - 1);
            alignCellLeft(sheet, currentRowIndex - 1, 2)
            alignCellLeft(sheet, currentRowIndex - 1, 3);
        })

        sheet.getRow(currentRowIndex).values = [
            "Điểm trung bình học kỳ hệ 4:", , ,
            Number(semester.averagePoint)
        ]
        alignCellLeft(sheet, currentRowIndex, 4);
        sheet.mergeCells(
            currentRowIndex++, 1,
            currentRowIndex - 1, 3
        );
        sheet.getRow(currentRowIndex).values = [
            "Số tín chỉ đạt:", , ,
            semester.numberOfAccumulatedCredit
        ]
        alignCellLeft(sheet, currentRowIndex, 4);
        sheet.mergeCells(
            currentRowIndex++, 1,
            currentRowIndex - 1, 3
        );
    })
    sheet.getRow(currentRowIndex).values = [
        "Điểm trung bình tích lũy:", , ,
        Number(data.averagePoint)
    ];
    alignCellLeft(sheet, currentRowIndex, 4);
    sheet.mergeCells(
        currentRowIndex++, 1,
        currentRowIndex - 1, 3
    );
    sheet.getRow(currentRowIndex).values = [
        "Số tín tích lỹ:", , ,
        data.numberOfAccumulatedCredit
    ];
    alignCellLeft(sheet, currentRowIndex, 4);
    sheet.mergeCells(
        currentRowIndex++, 1,
        currentRowIndex - 1, 3
    );
    return workbook;
}

const alignCellLeft = (
    sheet: ExcelJS.Worksheet,
    row: number, col: number
) => {
    sheet.getRow(row).getCell(col).alignment = {
        vertical: 'middle', horizontal: 'left'
    };
}

const alignCellCenter = (
    sheet: ExcelJS.Worksheet,
    row: number, col: number
) => {
    sheet.getRow(row).getCell(col).alignment = {
        vertical: 'middle', horizontal: 'center'
    };
}

const alignRowCenter = (sheet: ExcelJS.Worksheet, row: number) => {
    sheet.getRow(row).alignment = {
        vertical: 'middle', horizontal: 'center'
    };
}