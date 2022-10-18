import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getExams, updatePoint } from "../../../api/exam";
import { TextInput } from "../../../common/components/input";
import { Td, Th } from "../../../common/table";

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
                <table className="mt-6">
                    <thead>
                        <tr>
                            <Th>STT</Th>
                            <Th>Mã phách</Th>
                            <Th>Điểm</Th>
                            <Th />
                        </tr>
                    </thead>
                    <tbody>
                        {examsRes.data.map((value, index) => (
                            <tr key={value.code}>
                                <Td className="py-3">{index + 1}</Td>
                                <Td>{value.code}</Td>
                                <Td>
                                    {isEditing && value.code === selectedExam.code ? (
                                        <TextInput className="w-14 text-center"
                                            text={selectedExam.point ? selectedExam.point : ''}
                                            onChange={e => {
                                                setSelectedExam({
                                                    ...selectedExam,
                                                    point: e.target.value
                                                });
                                            }} />
                                    ) : (<p className="w-14">{value.point}</p>)}
                                </Td>
                                <Td>
                                    <Link className="text-blue-600 hover:text-blue-600 hover:underline"
                                        onClick={() => handleSelectedExam(value)}>
                                        {isEditing && value.code === selectedExam.code ? "Lưu" : "Sửa"}
                                    </Link>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );
}