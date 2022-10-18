import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getExams } from "../../../api/exam";
import { Td, Th } from "../../../common/table";
import useModal from "../../common/Modal/use";
import AddExam from "./AddExams";

export function ListExam() {
    const { roomId } = useParams()
    const [examsRes, setExamsRes] = useState({ status: "NONE" });
    const { isShowing, toggle } = useModal();
    const shouldFetch = useRef(true);
    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getExams(roomId).then(
                res => setExamsRes(res)
            );
        }
    }, [roomId])

    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Danh sách bài thi</p>
                <Link className="inline text-gray-600 font-semibold mx-4 hover:text-red-dark"
                    onClick={toggle}>Thêm bài thi</Link>
            </div>
            <hr />
            {examsRes.status === "SUCCESS" && examsRes.data.length > 0 && (
                <>
                    <table className="mt-4">
                        <thead>
                            <tr>
                                <Th>STT</Th>
                                <Th>Mã phách</Th>
                                <Th>Mã sinh viên</Th>
                                <Th>Họ và tên</Th>
                                <Th>Điểm</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {examsRes.data.map((value, index) => (
                                <tr key={value.code}>
                                    <Td>{index + 1}</Td>
                                    <Td>{value.code}</Td>
                                    <Td>{value.student.id}</Td>
                                    <Td>{value.student.name}</Td>
                                    <Td>{value.point}</Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
            <AddExam
                isShowing={isShowing} toggle={toggle}
                onSuccess={(data) => {
                    setExamsRes({
                        ...examsRes,
                        data: [data, ...examsRes.data]
                    });
                }} />
        </>
    );
}