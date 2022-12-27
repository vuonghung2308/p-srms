import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClass, getStudents } from "../../../api/class";
import { strTime } from "../../../ultils/time";
import useModal from "../../common/Modal/use";
import DoneConfirm from "./DoneConfirm";
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
        setClassRes({
            ...classRes,
            data: {
                ...classRes.data,
                confirm: data
            }
        });
        setTimeout(() => {
            alert("Xử lý yêu cầu thành công!")
        }, 200);
        acceptanceToggle();
    }

    const handleRejectionConfirm = (data) => {
        setClassRes({
            ...classRes,
            data: {
                ...classRes.data,
                confirm: data
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
                if (res.data.confirm) {
                    confirmId.current = res.data.confirm.id
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
                    <p className="font-semibold mb-3 text-xl text-gray-600">Chi tiết lớp học</p>
                    <div>
                        <p className="inline">Mã lớp: {classRes.data.id}</p>
                        <p className="inline ml-4">Mã môn học: {classRes.data.subject.id}</p>
                        <p className="inline ml-4">Tên môn học: {classRes.data.subject.name}</p>
                    </div>
                    <div className="pt-0.5">
                        <p className="inline">Học kỳ: {classRes.data.semester}</p>
                        <p className="inline ml-4">Năm học: {classRes.data.year}-{classRes.data.year + 1}</p>
                        <p className="inline ml-4">Giáo viên: {classRes.data.teacher.id} - {classRes.data.teacher.name}</p>
                    </div>
                    <hr className="my-3" />
                </div>
                
            )}

            {studentsRes.status === "SUCCESS" && studentsRes.data.length > 0 && (
                <>
                    <div className="flex">
                        <p className="font-semibold text-xl text-gray-600">Bảng điểm thành phần</p>
                        {classRes.data?.confirm?.status === "ACCEPTED" && (
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
                    {classRes.data?.confirm?.actions.length > 0 && (
                        <>
                            <hr />
                            <p className="font-semibold mt-4 text-xl text-gray-600">Lịch sử yêu cầu</p>
                            {classRes.data?.confirm?.actions.map((action, index) => (
                                <Action action={action} key={index} />
                            ))}
                        </>
                    )}
                    <RejectConfirm
                        toggle={rejectionToggle}
                        isShowing={isRejectionShowing}
                        confirmId={confirmId.current}
                        onSuccess={handleRejectionConfirm} />
                    <DoneConfirm
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

const Action = ({ action }) => {
    return (
        <div className="mt-3">
            <div className="flex">
                {action.action === "INITIALIZE" && (
                    <div className="flex">
                        <p className="text font-semibold text-gray-500">Yêu cầu duyệt bảng điểm</p>
                        <p className="ml-2 text-sm my-auto">tới: {action.censorName} ({action.censorId})</p>
                    </div>
                )}
                {action.action === "CANCEL" && (
                    <p className="text font-semibold text-gray-500">Hủy yêu cầu duyệt bảng điểm</p>
                )}
                {(action.action === "ACCEPT" || action.action === "DONE") && (
                    <p className="text font-semibold text-gray-500">Đã duyệt bảng điểm</p>
                )}
                {action.action === "REJECT" && (
                    <p className="text font-semibold text-gray-500">Đã từ chối bảng điểm</p>
                )}

                <div className="ml-auto my-auto flex text-sm rounded-lg py-0.5 w-fit px-2.5 text-gray-500">
                    <i className="text-xs my-auto mr-2 fa-regular fa-clock" />
                    <p>{strTime(action.time)}</p>
                </div>
            </div>
            <div className="flex mt-2">
                <div className="flex text-sm bg-[rgba(240,244,247,255)] font-semibold rounded-lg py-0.5 w-fit px-2.5 text-gray-600">
                    <i className="text-xs my-auto fa-solid fa-user mr-2" />
                    <p>{action.actorName} ({action.actorId})</p>
                </div>
                <div className="ml-4 flex text-sm bg-[rgba(240,244,247,255)] font-semibold rounded-lg py-0.5 w-fit px-2.5 text-gray-500">
                    <i className="text-xs my-auto mr-2 fa-regular fa-note-sticky"></i>
                    <p>{action.note}</p>
                </div>
            </div>
            <div className=" mt-4 rounded-lg bg-[#f2f3f5] w-full h-[2px]" />
        </div>
    )
}