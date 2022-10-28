import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClass, getStudents } from "../../../api/class";
import { Td, Th } from "../../../common/table";
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
                    {classRes.data && classRes.data.confirm &&
                        classRes.data.confirm.censor1 &&
                        classRes.data.confirm.status === "ACCEPTED" && (
                            <>
                                <button onClick={acceptionToggle}>Xử lý</button>
                                <HandleConfirm
                                    toggle={acceptionToggle}
                                    isShowing={isAcceptionShowing}
                                    confirm={classRes.data.confirm}
                                    onSuccess={handleConfirm} />
                            </>
                        )
                    }
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