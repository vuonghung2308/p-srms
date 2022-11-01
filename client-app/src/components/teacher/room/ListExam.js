import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getExams, updatePoint } from "../../../api/exam";

export function ListExam() {
    const { roomId } = useParams();
    const [selectedExam, setSelectedExam] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [examsRes, setExamsRes] = useState({ status: "NONE" });
    const shouldFetch = useRef(true);
    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getExams(roomId).then(
                res => setExamsRes(res)
            );
        }
    }, [roomId]);
    const handleSelectedExam = (value) => {
        if (isEditing && selectedExam.point && value.code === selectedExam.code) {
            updatePoint(
                selectedExam.code,
                selectedExam.point
            ).then(() => {
                setExamsRes({
                    ...examsRes,
                    data: examsRes.data.map(v => {
                        if (selectedExam.code === v.code) {
                            return selectedExam;
                        } else return v;
                    })
                });
                setIsEditing(false);
            });
        } else {
            setSelectedExam(value);
            setIsEditing(true);
        }
    }
    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Danh sách bài thi</p>
            </div>
            <hr />
            {examsRes.status === "SUCCESS" && examsRes.data.length && (
                <table className="mt-6 w-full">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600">
                            <th className="border-4 border-white py-0.5">STT</th>
                            <th className="border-4 border-white">Mã phách</th>
                            <th className="border-4 border-white">Điểm</th>
                            <th className="border-4 border-white"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {examsRes.data.map((value, index) => (
                            <tr className="border-b" key={value.code}>
                                <td className="text-center py-0.5">{index + 1}</td>
                                <td className="text-center">{value.code}</td>
                                <td className="text-center">
                                    {isEditing && value.code === selectedExam.code ? (
                                        <input className="h-5 w-10 text-center border-b border-b-gray-400 outline-none focus:border-b-red-dark"
                                            value={selectedExam.point ? selectedExam.point : ''}
                                            onChange={e => {
                                                setSelectedExam({
                                                    ...selectedExam,
                                                    point: e.target.value
                                                });
                                            }} />
                                    ) : (value.point)}
                                </td>
                                <td >
                                    <Link className="text-center mx-auto w-[60px] flex font-semibold text-sm text-gray-500 hover:text-red-normal hover:border-red-normal rounded-lg border px-2"
                                        onClick={() => handleSelectedExam(value)}>
                                        {isEditing && value.code === selectedExam.code ? (
                                            <i className="text-xs fa-solid fa-floppy-disk my-auto"></i>
                                        ) : (
                                            <i className="text-xs fa-solid fa-pen-to-square my-auto"></i>
                                        )}
                                        <p className="ml-1.5 h-fit">
                                            {isEditing && value.code === selectedExam.code ? "Lưu" : "Sửa"}
                                        </p>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );
}