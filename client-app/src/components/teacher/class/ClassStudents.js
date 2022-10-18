import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getStudents, updatePoint } from "../../../api/class";
import { TextInput } from "../../../common/components/input";
import { Td, Th } from "../../../common/table";

export function ClassStudents() {
    const { classId } = useParams()
    const [pointsRes, setPointsRes] = useState({ status: "NONE" });
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const shouldFetch = useRef(true);

    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getStudents(classId).then(res =>
                setPointsRes(res)
            );
        }
    }, [classId]);

    const handleSelectedPoint = (value) => {
        if (isEditing && selectedPoint.id === value.id) {
            updatePoint(
                selectedPoint.student.id, selectedPoint.classId,
                selectedPoint.attendancePoint, selectedPoint.exercisePoint,
                selectedPoint.midtermExamPoint, selectedPoint.practicePoint
            ).then(() => {
                setPointsRes({
                    ...pointsRes,
                    data: pointsRes.data.map(v => {
                        if (selectedPoint.id === v.id) {
                            return selectedPoint;
                        } else return v;
                    })
                });
                setIsEditing(false);
            });
        } else {
            setSelectedPoint(value);
            setIsEditing(true);
        }
    }

    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Danh sách sinh viên</p>
            </div>
            <hr />
            {pointsRes.status === "SUCCESS" && pointsRes.data.length > 0 && (
                <table className="mt-6">
                    <thead>
                        <tr>
                            <Th>Mã SV</Th>
                            <Th>Họ và tên</Th>
                            <Th>Điểm CC</Th>
                            <Th>Điểm TH</Th>
                            <Th>Điểm BT</Th>
                            <Th>Điểm KT</Th>
                            <Th>Điểm Thi</Th>
                            <Th />
                        </tr>
                    </thead>
                    <tbody>
                        {pointsRes.data.map(value => {
                            return (
                                <tr key={value.student.id}>
                                    <Td className="py-3">{value.student.id}</Td>
                                    <Td className="text-start">{value.student.name}</Td>
                                    <Td>
                                        {isEditing && value.id === selectedPoint.id ? (
                                            <TextInput className="w-14 text-center"
                                                text={selectedPoint.attendancePoint ?
                                                    selectedPoint.attendancePoint : ''}
                                                onChange={e => {
                                                    setSelectedPoint({
                                                        ...selectedPoint,
                                                        attendancePoint: e.target.value
                                                    });
                                                }} />
                                        ) : (value.attendancePoint)}
                                    </Td>
                                    <Td>
                                        {isEditing && value.id === selectedPoint.id ? (
                                            <TextInput className="w-14 text-center"
                                                text={selectedPoint.practicePoint != null ?
                                                    selectedPoint.practicePoint : ''}
                                                onChange={e => {
                                                    setSelectedPoint({
                                                        ...selectedPoint,
                                                        practicePoint: e.target.value
                                                    });
                                                }} />
                                        ) : (value.practicePoint)}
                                    </Td>
                                    <Td>
                                        {isEditing && value.id === selectedPoint.id ? (
                                            <TextInput className="w-14 text-center"
                                                text={selectedPoint.exercisePoint != null ?
                                                    selectedPoint.exercisePoint : ''}
                                                onChange={e => {
                                                    setSelectedPoint({
                                                        ...selectedPoint,
                                                        exercisePoint: e.target.value
                                                    });
                                                }} />
                                        ) : (value.exercisePoint)}
                                    </Td>
                                    <Td>
                                        {isEditing && value.id === selectedPoint.id ? (
                                            <TextInput className="w-14 text-center"
                                                text={selectedPoint.midtermExamPoint != null ?
                                                    selectedPoint.midtermExamPoint : ''}
                                                onChange={e => {
                                                    setSelectedPoint({
                                                        ...selectedPoint,
                                                        midtermExamPoint: e.target.value
                                                    });
                                                }} />
                                        ) : (value.midtermExamPoint)}
                                    </Td>
                                    <Td>{value.examPoint}</Td>
                                    <Td>
                                        <Link className="text-blue-600 hover:text-blue-600 hover:underline"
                                            onClick={() => handleSelectedPoint(value)}>
                                            {isEditing && value.id === selectedPoint.id ? "Lưu" : "Sửa"}
                                        </Link>
                                    </Td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </>
    );
}