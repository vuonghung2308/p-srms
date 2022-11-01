import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom";
import { getInfo } from "../../../api/account";
import { getFileExcel, getPoints } from "../../../api/point"

export default function StudentPoint() {
    let shouldFetch = useRef(true);
    const [pointsRes, setPointRes] = useState(
        { status: "NONE", data: null }
    );
    const [infoRes, setInforRes] = useState(
        { status: "NONE" }
    );

    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getInfo().then(res => {
                setInforRes(res);
            })
            getPoints().then(res => {
                setPointRes(res);
            });
        }
    }, []);

    const handleExportFile = async () => {
        getFileExcel().then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = "BangDiem.xlsx";
            link.href = url;
            link.click();
            link.remove();
        })
    }

    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Bảng điểm</p>
                <Link className="inline text-gray-600 font-semibold mx-4 hover:text-red-dark"
                    onClick={handleExportFile}>Xuất bảng điểm</Link>
            </div>
            <hr />
            {pointsRes.status === "SUCCESS" && infoRes.status === "SUCCESS" && (
                <>
                    <div className="flex mt-6 ml-2">
                        <p className="font-semibold text-gray-600 text-[17px]">Họ và tên: {infoRes.data.name}</p>

                        <div className="w-[1px] mx-4 bg-gray-200"></div>
                        <p className=" font-semibold text-gray-600 text-[17px]">Mã sinh viên: {infoRes.data.id}</p>
                    </div>
                    <table className="table-auto mt-4 w-[100%] text-sm">
                        <thead>
                            <PointHeader />
                        </thead>
                        <tbody>
                            {pointsRes.data.semesters.map((semester, index) => (
                                <SemesterRow semester={semester} count={index}
                                    key={semester.year + semester.semester} />
                            ))}
                            <tr className="border-b font-semibold text-gray-800">
                                <td colSpan="3" className="pl-2 py-1">Điểm trung bình tích lũy:</td>
                                <td>{pointsRes.data.averagePoint}</td>
                            </tr>
                            <tr className="border-b font-semibold text-gray-800">
                                <td colSpan="3" className="pl-2 py-1">Tổng số tín chỉ tích lũy:</td>
                                <td>{pointsRes.data.numberOfAccumulatedCredit}</td>
                            </tr>
                        </tbody>
                    </table>
                </>
            )}
        </>
    );
}

const PointHeader = () => {
    const className = "border-4 border-white font-semibold text-gray-800 px-2 py-1";
    return (
        <tr className="bg-gray-200 text-gray-600">
            <th className={`${className}`}>STT</th>
            <th className={`${className} w-[7%]`}>Mã môn</th>
            <th className={`${className} w-[25%] text-start`}>Tên môn học</th>
            <th className={`${className}`}>TC</th>
            <th className={`${className}`}>%CC</th>
            <th className={`${className}`}>%TH</th>
            <th className={`${className}`}>%BT</th>
            <th className={`${className}`}>%KT</th>
            <th className={`${className}`}>%Thi</th>
            <th className={`${className} leading-4`}>Điểm CC</th>
            <th className={`${className} leading-4`}>Điểm TH</th>
            <th className={`${className} leading-4`}>Điểm BT</th>
            <th className={`${className} leading-4`}>Điểm KT</th>
            <th className={`${className} leading-4`}>Điểm Thi</th>
            <th className={`${className}`}>TK(10)</th>
            <th className={`${className}`}>TK(CH)</th>
            <th className={`${className}`}>KQ</th>
            <th className={`${className}`} />
        </tr>
    );
}

const PointRow = ({ point, index }) => {
    const className = "border-b px-2 py-1.5 text-center"
    return (
        <tr>
            <td className={`${className}`}>{index + 1}</td>
            <td className={`${className}`}>{point.subject.id}</td>
            <td className={`${className} text-start`}>{point.subject.name}</td>
            <td className={`${className}`}>{point.subject.numberOfCredit}</td>
            <td className={`${className}`}>{point.subject.attendancePointRate}</td>
            <td className={`${className}`}>{point.subject.practicePointRate}</td>
            <td className={`${className}`}>{point.subject.exercisePointRate}</td>
            <td className={`${className}`}>{point.subject.midtermExamPointRate}</td>
            <td className={`${className}`}>{point.subject.finalExamPointRate}</td>
            <td className={`${className}`}>{point.attendancePoint}</td>
            <td className={`${className}`}>{point.practicePoint}</td>
            <td className={`${className}`}>{point.exercisePoint}</td>
            <td className={`${className}`}>{point.midtermExamPoint}</td>
            <td className={`${className}`}>{point.examPoint}</td>
            <td className={`${className}`}>{point.numberAveragePoint}</td>
            <td className={`${className}`}>{point.letterAveragePoint}</td>
            <td className={`${className}`}>
                {!point.letterAveragePoint ? "X" :
                    point.letterAveragePoint === "F" ?
                        "Trượt" : "Đạt"
                }
            </td>
            <td className={`${className}`}>
                <Link className="text-center mx-auto w-fit flex font-semibold text-sm text-gray-500 hover:text-red-normal hover:border-red-normal rounded-lg border px-2"
                    to={point.id}>
                    <i className="my-auto text-xs fa-solid fa-eye" />
                    <p className="ml-1.5 h-fit">Xem</p>
                </Link>
            </td>
        </tr>
    );
}

const SemesterRow = ({ semester, count }) => {
    return (
        <>
            <tr>
                <td colSpan="100%" className="border-b font-semibold  text-gray-800 px-2 py-1.5">
                    Học kỳ {semester.semester} - Năm học {semester.year}-{semester.year + 1}
                </td>
            </tr>
            {semester.points.map((point, index) => (
                <PointRow point={point} index={count + index} key={point.id} />
            ))}
            <tr className="border-b font-semibold text-gray-800">
                <td colSpan="3" className="pl-2 py-1" >Điểm trung bình học kỳ: </td>
                <td>{Number(semester.averagePoint)}</td>
            </tr>
            <tr className="border-b border-gray-300 font-semibold text-gray-800">
                <td colSpan="3" className="pl-2 py-1">Số tín chỉ đạt:</td>
                <td>{semester.numberOfAccumulatedCredit}</td>
            </tr>
        </>
    );
}