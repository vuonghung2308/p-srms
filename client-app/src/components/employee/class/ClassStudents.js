import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getStudents } from "../../../api/class";
import { Td, Th } from "../../../common/table";
import useModal from "../../common/Modal/use";
import AddStudent from "./AddStudent";


export function ClassStudents() {
    const { classId } = useParams()
    const [studentsRes, setStudentsRes] = useState({ status: "NONE" });
    const { isShowing, toggle } = useModal();
    let shouldFetch = useRef(true);

    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getStudents(classId).then(res =>
                setStudentsRes(res)
            );
        }
    }, [classId])

    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Danh sách lớp</p>
                <Link className="inline text-gray-600 font-semibold mx-4 hover:text-red-dark"
                    onClick={toggle}>Thêm sinh viên</Link>
            </div>
            <hr />
            {studentsRes.status === "SUCCESS" && studentsRes.data.length > 0 && (
                <table className="mt-4">
                    <thead>
                        <tr>
                            <Th>STT</Th>
                            <Th>Mã SV</Th>
                            <Th>Tên SV</Th>
                            <Th>Điểm CC</Th>
                            <Th>Điểm TH</Th>
                            <Th>Điểm BT</Th>
                            <Th>Điểm KT</Th>
                            <Th>Điểm Thi</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentsRes.data.map((value, index) => {
                            return (
                                <tr key={value.student.id}>
                                    <Td>{index + 1}</Td>
                                    <Td>{value.student.id}</Td>
                                    <Td>{value.student.name}</Td>
                                    <Td>{value.attendancePoint}</Td>
                                    <Td>{value.practicePoint}</Td>
                                    <Td>{value.exercisePoint}</Td>
                                    <Td>{value.midtermExamPoint}</Td>
                                    <Td>{value.examPoint}</Td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
            <AddStudent
                isShowing={isShowing} toggle={toggle}
                onSuccess={(data) => {
                    setStudentsRes({
                        ...studentsRes,
                        data: [data, ...studentsRes.data]
                    });
                }} />
        </>
    );
}