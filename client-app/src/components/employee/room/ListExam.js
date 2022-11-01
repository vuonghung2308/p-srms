import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getExams } from "../../../api/exam";
import { getRoom } from "../../../api/room";
import useModal from "../../common/Modal/use";
import AddExam from "./AddExams";

export function ListExam() {
    const { roomId } = useParams()
    const [examsRes, setExamsRes] = useState({ status: "NONE" });
    const [roomRes, setRoomRes] = useState({ status: "NONE" });
    const { isShowing, toggle } = useModal();
    const shouldFetch = useRef(true);
    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getExams(roomId).then(
                res => setExamsRes(res)
            );
            getRoom(roomId).then(
                res => setRoomRes(res)
            )
        }
    }, [roomId])

    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Thông tin bài phòng thi</p>
                <Link className="inline text-gray-600 font-semibold mx-4 hover:text-red-dark"
                    onClick={toggle}>Thêm bài thi</Link>
            </div>
            <hr />
            {roomRes.status === "SUCCESS" && (
                <div className="mt-3">
                    <p className="font-semibold mb-1 text-xl text-gray-600">Chi tiết phòng thi</p>
                    <div>
                        <p className="inline">Mã phòng thi: {roomRes.data.id}</p>
                        <p className="inline ml-4">Mã môn học: {roomRes.data.subject.id}</p>
                        <p className="inline ml-4">Tên môn học: {roomRes.data.subject.name}</p>
                    </div>
                    <div>
                        <p className="inline">Học kỳ: {roomRes.data.semester}</p>
                        <p className="inline ml-4">Năm học: {roomRes.data.year}-{roomRes.data.year + 1}</p>
                        <p className="inline ml-4">Mã giáo viên: {roomRes.data.teacher.id}</p>
                        <p className="inline ml-4">Tên giáo viên: {roomRes.data.teacher.name}</p>
                    </div>
                    <div>
                        <p className="inline">Thời gian bắt đầu: {new Date(roomRes.data.timeStart * 1000).toLocaleString()}</p>
                        <p className="inline ml-4">Thời gian làm bài: {roomRes.data.duration} phút</p>
                    </div>
                </div>
            )}
            {examsRes.status === "SUCCESS" && examsRes.data.length > 0 && (
                <>
                    <hr className="my-3" />
                    <p className="font-semibold text-xl text-gray-600">Danh sách bài thi</p>
                    <table className="mt-4 w-[100%]">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600">
                                <th className="border-4 border-white py-0.5">STT</th>
                                <th className="border-4 border-white">Mã bài thi</th>
                                <th className="border-4 border-white">Mã phách</th>
                                <th className="border-4 border-white">Mã sinh viên</th>
                                <th className="border-4 border-white">Họ và tên</th>
                                <th className="border-4 border-white">Điểm số</th>
                            </tr>
                        </thead>
                        <tbody>
                            {examsRes.data.map((value, index) => (
                                <tr className="border-b" key={value.code}>
                                    <td className="text-center py-0.5">{index + 1}</td>
                                    <td className="text-center">{value.id}</td>
                                    <td className="text-center">{value.code}</td>
                                    <td className="text-center">{value.student.id}</td>
                                    <td className="pl-4">{value.student.name}</td>
                                    <td className="text-center">{value.point}</td>
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