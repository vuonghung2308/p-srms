import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClass, getStudents } from "../../../api/class";
import { strTime } from "../../../ultils/time";
import useModal from "../../common/Modal/use";
import AcceptConfirm from "./AcceptConfirm";
import AddStudent from "./AddStudent";
import RejectConfirm from "./RejectConfirm";


export function ClassStudents() {
    const { classId } = useParams()
    const [studentsRes, setStudentsRes] = useState({ status: "NONE" });
    const [classRes, setClassRes] = useState({ status: "NONE" });
    const { isShowing, toggle } = useModal();
    const confirmId = useRef('');
    let shouldFetch = useRef(true);

    const {
        isShowing: isAcceptionShowing,
        toggle: acceptanceToggle
    } = useModal();

    const {
        isShowing: isRejectionShowing,
        toggle: rejectionToggle
    } = useModal();

    const handleAcceptanceConfirm = (data) => {
        const confirms = classRes.data.confirms;
        setClassRes({
            ...classRes,
            confirms: [
                ...confirms, data
            ]
        });
        setTimeout(() => {
            alert("Xử lý yêu cầu thành công!")
        }, 200);
        acceptanceToggle();
    }

    const handleRejectionConfirm = (data) => {
        const confirms = classRes.data.confirms;
        setClassRes({
            ...classRes,
            data: {
                ...classRes.data,
                confirms: [
                    data, ...confirms
                ]
            }
        });
        setTimeout(() => {
            alert("Xử lý yêu cầu thành công!")
        }, 200);
        rejectionToggle();
    }

    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getStudents(classId).then(res =>
                setStudentsRes(res)
            );
            getClass(classId).then(res => {
                setClassRes(res)
                if (res.data.confirms) {
                    confirmId.current = res.data.confirms[0].id
                }
            });
        }
    }, [classId]);

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
                    <div className="flex">
                        <p className="font-semibold text-xl text-gray-600">Bảng điểm thành phần</p>
                        {classRes.data && classRes.data.confirms && classRes.data.confirms[0].status === "ACCEPTED" && (
                            <>
                                <button className="ml-4 mr-4 flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                    onClick={rejectionToggle}>
                                    <i className="my-auto text-xs fa-solid fa-ban" />
                                    <p className="ml-2 my-auto">Từ chối</p>
                                </button>
                                <button className="mr-4 flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                    onClick={acceptanceToggle}>
                                    <i className="my-auto text-xs fa-solid fa-check" />
                                    <p className="ml-2 my-auto">Duyệt</p>
                                </button>
                            </>
                        )}
                    </div>
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
                    {classRes.data && classRes.data.confirms && (
                        classRes.data.confirms.map((confirm, index) => (
                            <Confirm
                                confirm={confirm} teacher={classRes.data.teacher} key={confirm.id + index}
                                isLast={index === classRes.data.confirms.length - 1}
                                onAcceptClicked={acceptanceToggle} onRejectClicked={rejectionToggle} />
                        ))
                    )}
                    <RejectConfirm
                        toggle={rejectionToggle}
                        isShowing={isRejectionShowing}
                        confirmId={confirmId.current}
                        onSuccess={handleRejectionConfirm} />
                    <AcceptConfirm
                        toggle={acceptanceToggle}
                        isShowing={isAcceptionShowing}
                        confirmId={confirmId.current}
                        onSuccess={handleAcceptanceConfirm} />
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

const Confirm = ({ teacher, confirm }) => {
    return (
        <div className="mx-4 mt-4">
            <div className="flex">
                {confirm.status === "INITIALIZED" && (
                    <div className="flex">
                        <p className="text font-semibold text-gray-500">Yêu cầu duyệt bảng điểm</p>
                        <p className="ml-2 text-sm my-auto">tới: {confirm.censor1.name} ({confirm.censor1.id})</p>
                    </div>
                )}
                {confirm.status === "CANCELED" && (
                    <p className="text font-semibold text-gray-500">Hủy yêu cầu duyệt bảng điểm</p>
                )}
                {confirm.status === "ACCEPTED" && (
                    <p className="text font-semibold text-gray-500">Đã duyệt bảng điểm</p>
                )}
                {confirm.status.includes("REJECTED") && (
                    <p className="text font-semibold text-gray-500">Đã từ chối bảng điểm</p>
                )}

                <div className="ml-auto my-auto flex text-sm rounded-lg py-0.5 w-fit px-2.5 text-gray-500">
                    <i className="text-xs my-auto mr-2 fa-regular fa-clock" />
                    <p>{strTime(confirm.time)}</p>
                </div>
            </div>
            <div className="flex mt-2">
                <div className="flex text-sm bg-[rgba(240,244,247,255)] font-semibold rounded-lg py-0.5 w-fit px-2.5 text-gray-600">
                    <i className="text-xs my-auto fa-solid fa-user mr-2" />
                    {(confirm.status === "INITIALIZED" || confirm.status === "CANCELED") && (
                        <p>{teacher.name} ({teacher.id})</p>
                    )}
                    {confirm.status === "ACCEPTED" && (
                        <p>{confirm.censor1.name} ({confirm.censor1.id})</p>
                    )}
                    {confirm.status === "E_REJECTED" && (
                        <p>{confirm.censor2.name} ({confirm.censor2.id})</p>
                    )}
                    {confirm.status === "T_REJECTED" && (
                        <p>{confirm.censor1.name} ({confirm.censor1.id})</p>
                    )}
                </div>
                <div className="ml-4 flex text-sm bg-[rgba(240,244,247,255)] font-semibold rounded-lg py-0.5 w-fit px-2.5 text-gray-500">
                    <i className="text-xs my-auto mr-2 fa-regular fa-note-sticky"></i>
                    <p>{confirm.note}</p>
                </div>
            </div>
            <div className=" mt-4 rounded-lg bg-[#f2f3f5] w-full h-[2px]" />
        </div>
    )
}