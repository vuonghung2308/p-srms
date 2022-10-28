import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClass, getStudents } from "../../../api/class";
import { strTime } from "../../../ultils/time";
import useModal from "../../common/Modal/use";
import HandleConfirm from "./AcceptConfirm";
import AddStudent from "./AddStudent";


export function ClassStudents() {
    const { classId } = useParams()
    const [studentsRes, setStudentsRes] = useState({ status: "NONE" });
    const [classRes, setClassRes] = useState({ status: "NONE" });
    const { isShowing, toggle } = useModal();
    let shouldFetch = useRef(true);

    const {
        isShowing: isAcceptionShowing,
        toggle: acceptionToggle
    } = useModal();

    const handleConfirm = (data) => {
        setClassRes({
            ...classRes, data: {
                ...classRes.data,
                confirm: data
            }
        })
        setTimeout(() => {
            alert("Xử lý yêu cầu thành công!")
        }, 200);
        acceptionToggle();
    }

    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getStudents(classId).then(res =>
                setStudentsRes(res)
            );
            getClass(classId).then(res =>
                setClassRes(res)
            );
        }
    }, [classId])

    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Thông tin lớp học</p>
                <Link className="inline text-gray-600 font-semibold mx-4 hover:text-red-dark"
                    onClick={toggle}>Thêm sinh viên</Link>
            </div>
            <hr />
            {classRes.status === "SUCCESS" && (
                <div className="mt-3">
                    <p className="font-semibold mb-1 text-xl text-gray-600">Chi tiết lớp học</p>
                    <div>
                        <p className="inline">Mã lớp: {classRes.data.id}</p>
                        <p className="inline ml-4">Mã môn học: {classRes.data.subject.id}</p>
                        <p className="inline ml-4">Tên môn học: {classRes.data.subject.name}</p>
                    </div>
                    <div>
                        <p className="inline">Học kỳ: {classRes.data.semester}</p>
                        <p className="inline ml-4">Năm học: {classRes.data.year}-{classRes.data.year + 1}</p>
                        <p className="inline ml-4">Tên giáo viên: {classRes.data.teacher.name}</p>
                    </div>
                </div>
            )}
            {studentsRes.status === "SUCCESS" && studentsRes.data.length > 0 && (
                <>
                    <hr className="my-3" />
                    <p className="font-semibold text-xl text-gray-600">Danh sách sinh viên</p>
                    <table className="mt-3 w-[100%]">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600">
                                <th className="border-4 border-white py-0.5">STT</th>
                                <th className="border-4 border-white">Mã SV</th>
                                <th className="border-4 border-white">Họ và tên</th>
                                <th className="border-4 border-white">Điểm CC</th>
                                <th className="border-4 border-white">Điểm TH</th>
                                <th className="border-4 border-white">Điểm BT</th>
                                <th className="border-4 border-white">Điểm KT</th>
                                <th className="border-4 border-white">Điểm Thi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentsRes.data.map((value, index) => {
                                return (
                                    <tr className="border-b" key={value.student.id}>
                                        <td className="text-center py-0.5">{index + 1}</td>
                                        <td className="text-center">{value.student.id}</td>
                                        <td className="text-start pl-4">{value.student.name}</td>
                                        <td className="text-center">{value.attendancePoint}</td>
                                        <td className="text-center">{value.practicePoint}</td>
                                        <td className="text-center">{value.exercisePoint}</td>
                                        <td className="text-center">{value.midtermExamPoint}</td>
                                        <td className="text-center">{value.examPoint}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {classRes.data && (
                        <div className="my-4">
                            <div className="flex">
                                <p className="mr-4 text-lg font-semibold text-gray-600">Xác nhận bảng điểm thành phần</p>
                                <>
                                    {(classRes.data.confirm && classRes.data.confirm.status === "ACCEPTED") && (
                                        <>
                                            <button className="h-fit my-auto flex border text-sm hover:border-red-dark px-2 text-gray-500 font-semibold rounded hover:text-red-dark"
                                                onClick={acceptionToggle} >
                                                <p className="my-auto">Xử lý yêu cầu</p>
                                                <i className="my-auto pl-2 fa-solid fa-arrow-right" />
                                            </button>
                                            <HandleConfirm
                                                toggle={acceptionToggle}
                                                isShowing={isAcceptionShowing}
                                                confirm={classRes.data.confirm}
                                                teacher={classRes.data.teacher}
                                                onSuccess={handleConfirm} />
                                        </>
                                    )}
                                </>
                            </div>
                            {classRes.data.confirm && classRes.data.confirm.status !== "CANCELED" && (
                                <div className="flex">
                                    <div className="w-[50%]">
                                        <p className="mt-2">GV yêu cầu: {classRes.data.teacher.name} - ID: {classRes.data.teacher.id}</p>
                                        <p className="mt-1">Thời gian tạo: {strTime(classRes.data.confirm.time)}</p>
                                    </div>
                                    <div className="w-[50%] ml-20">
                                        {classRes.data.confirm.status === "INITIALIZED" && (
                                            <p className="mt-1">Trạng thái: chờ duyệt</p>
                                        )}
                                        {classRes.data.confirm.status === "ACCEPTED" && (
                                            <p className="mt-1">Trạng thái: đã duyệt</p>
                                        )}
                                        {classRes.data.confirm.status === "DONE" && (
                                            <p className="mt-1">Trạng thái: đã duyệt</p>
                                        )}
                                        {classRes.data.confirm.status === "REJECTED" && (
                                            <p className="mt-1">Trạng thái: bị từ chối</p>
                                        )}
                                        <p className="mt-1">Ghi chú: {classRes.data.confirm.note}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
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