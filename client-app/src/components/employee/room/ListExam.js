import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getExams } from "../../../api/exam";
import { getRoom } from "../../../api/room";
import useModal from "../../common/Modal/use";
import AddExam from "./AddExams";
import { strTime } from "../../../ultils/time";
import RejectConfirm from "../class/RejectConfirm";
import DoneConfirm from "./DoneConfirm";

export function ListExam() {
    const { roomId } = useParams()
    const [examsRes, setExamsRes] = useState({ status: "NONE" });
    const [roomRes, setRoomRes] = useState({ status: "NONE" });
    const { isShowing, toggle } = useModal();
    const shouldFetch = useRef(true);
    const confirmId = useRef('');

    const {
        isShowing: isCompletionShowing,
        toggle: completionToggle
    } = useModal();

    const {
        isShowing: isRejectionShowing,
        toggle: rejectionToggle
    } = useModal();

    const handleAcceptanceConfirm = (data) => {
        const confirms = roomRes.data.confirms;
        setRoomRes({
            ...roomRes,
            data: {
                ...roomRes.data,
                confirms: [
                    data, ...confirms
                ]
            }
        });
        setTimeout(() => {
            alert("Xử lý yêu cầu thành công!")
        }, 200);
        completionToggle();
    }

    const handleRejectionConfirm = (data) => {
        const confirms = roomRes.data.confirms;
        setRoomRes({
            ...roomRes,
            data: {
                ...roomRes.data,
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
            getExams(roomId).then(
                res => setExamsRes(res)
            );
            getRoom(roomId).then(res => {
                setRoomRes(res)
                if (res.data.confirms) {
                    confirmId.current = res.data.confirms[0].id;
                }
            });
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
            <hr className="my-3" />

            {examsRes.status === "SUCCESS" && examsRes.data.length > 0 && (
                <>
                    <div className="my-3 flex">
                        <p className="font-semibold text-xl text-gray-600">Bảng điểm thi</p>
                        {roomRes.data && (roomRes.data.confirms && roomRes.data.confirms[0].status === "INITIALIZED") && (
                            <>
                                <button className="ml-4 mr-4 flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                    onClick={rejectionToggle}>
                                    <i className="my-auto text-xs fa-solid fa-ban" />
                                    <p className="ml-2 my-auto">Từ chối</p>
                                </button>
                                <button className="mr-4 flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                    onClick={completionToggle}>
                                    <i className="my-auto text-xs fa-solid fa-check" />
                                    <p className="ml-2 my-auto">Duyệt</p>
                                </button>
                            </>
                        )}
                    </div>
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
                    {roomRes.data && roomRes.data.confirms && (
                        roomRes.data.confirms.map((confirm, index) => (
                            <Confirm
                                confirm={confirm}
                                teacher={roomRes.data.teacher}
                                key={confirm.id + index} />
                        ))
                    )}
                    <RejectConfirm
                        toggle={rejectionToggle}
                        isShowing={isRejectionShowing}
                        confirmId={confirmId.current}
                        onSuccess={handleRejectionConfirm} />
                    <DoneConfirm
                        toggle={completionToggle}
                        isShowing={isCompletionShowing}
                        confirmId={confirmId.current}
                        onSuccess={handleAcceptanceConfirm} />
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


const Confirm = ({ teacher, confirm }) => {
    return (
        <div className="mx-4 mt-4">
            <div className="flex">
                {confirm.status === "INITIALIZED" && (
                    <p className="text font-semibold text-gray-500">Nộp bảng điểm thi</p>
                )}
                {confirm.status === "CANCELED" && (
                    <p className="text font-semibold text-gray-500">Hủy nộp bảng điểm thi</p>
                )}
                {confirm.status === "DONE" && (
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
                    {confirm.status === "DONE" && (
                        <p>{confirm.censor2.name} ({confirm.censor2.id})</p>
                    )}
                    {confirm.status === "E_REJECTED" && (
                        <p>{confirm.censor2.name} ({confirm.censor2.id})</p>
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