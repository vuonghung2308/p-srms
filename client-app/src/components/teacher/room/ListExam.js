import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getExams, updatePoint } from "../../../api/exam";
import { getRoom } from "../../../api/room";
import useModal from "../../common/Modal/use";
import CancelConfirm from "./CancelConfirm";
import { strTime } from "../../../ultils/time";
import CreateConfirm from "./CreateConfirm";

export function ListExam() {
    const { roomId } = useParams();
    const [isEditing, setIsEditing] = useState(false);
    const [examsRes, setExamsRes] = useState({ status: "NONE" });
    const [roomRes, setRoomRes] = useState({ status: "NONE" });
    const confirmId = useRef('');
    const {
        isShowing: isCreationShowing,
        toggle: creationToggle
    } = useModal();
    const {
        isShowing: isCancelationShowing,
        toggle: cancelationToggle
    } = useModal();
    const shouldFetch = useRef(true);
    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getExams(roomId).then(
                res => setExamsRes(res)
            );
            getRoom(roomId).then(res => {
                setRoomRes(res)
                if (res.data.confirm) {
                    confirmId.current = res.data.confirm.id;
                }
            });
        }
    }, [roomId]);

    const changePoint = (value, index) => {
        if (value === "" || !value) value = null;
        const newExams = examsRes.data.map((e, i) => {
            if (index === i) {
                const exam = { ...e, point: value };
                return exam;
            } else return e;
        })
        setExamsRes({
            ...examsRes,
            data: newExams
        })
    }

    const handleSaveExams = async () => {
        for (let i = 0; i < examsRes.data.length; i++) {
            const exam = examsRes.data[i];
            if (exam.point === null) {
                exam.point = undefined;
            }
            updatePoint(exam.id, exam.point);
        }
    }

    const handleCancelation = (data) => {
        setRoomRes({
            ...roomRes,
            data: {
                ...roomRes.data,
                confirm: data
            }
        });
        setTimeout(() => {
            alert("Hủy yêu cầu thành công!")
        }, 200);
        cancelationToggle();
    }

    const handleCreation = (data) => {
        setRoomRes({
            ...roomRes,
            data: {
                ...roomRes.data,
                confirm: data
            }
        });
        setTimeout(() => {
            alert("Lưu yêu cầu thành công!")
        }, 200);
        creationToggle();
    }

    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Thông tin phòng thi</p>
            </div>
            <hr />
            {examsRes.status === "SUCCESS" && examsRes.data.length > 0 && (
                <>
                    <div className="my-3 flex">
                        <p className="font-semibold text-xl text-gray-600">Bảng điểm thi</p>

                        {roomRes.data && (!roomRes.data.confirm ||
                            roomRes.data.confirm.status === "CANCELED" ||
                            roomRes.data.confirm.status === "E_REJECTED"
                        ) && (
                                <>
                                    <button className="w-[106px] ml-4 mr-4 flex border text-sm hover:border-red-normal px-3 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                        onClick={() => {
                                            if (isEditing) { handleSaveExams(); }
                                            setIsEditing(!isEditing)
                                        }} >
                                        {isEditing ? (
                                            <>
                                                <i className="w-[12px] text-xs fa-solid fa-floppy-disk my-auto" />
                                                <p className="ml-2 my-auto">Lưu điểm</p>
                                            </>
                                        ) : (
                                            <>
                                                <i className="w-[12px] text-xs fa-solid fa-pen-to-square my-auto" />
                                                <p className="ml-2 my-auto">Sửa điểm</p>
                                            </>
                                        )}
                                    </button>
                                    <button className="mr-4 flex border text-sm hover:border-red-normal px-3 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                        onClick={creationToggle} >
                                        <i className="my-auto text-xs fa-solid fa-check" />
                                        <p className="ml-2 my-auto">Nộp bảng điểm</p>
                                    </button>
                                </>
                            )
                        }
                        {roomRes.data?.confirm?.status === "INITIALIZED" && (
                            <button className="ml-4 mr-4 flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                onClick={cancelationToggle} >
                                <i className="my-auto text-xs fa-solid fa-ban" />
                                <p className="ml-2 my-auto">Hủy nộp bảng điểm</p>
                            </button>
                        )}
                    </div>
                    <table className="mt-3 w-full">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600">
                                <th className="border-4 border-white py-0.5">STT</th>
                                <th className="border-4 border-white">Mã bài thi</th>
                                <th className="border-4 border-white">Mã phách</th>
                                <th className="border-4 border-white">Mã sinh viên</th>
                                <th className="border-4 border-white">Họ và tên</th>
                                <th className="border-4 border-white w-[100px]">Điểm</th>
                            </tr>
                        </thead>
                        <tbody>
                            {examsRes.data.map((value, index) => (
                                <tr className="border-b" key={value.code}>
                                    <td className="text-center py-0.5">{index + 1}</td>
                                    <td className="text-center">{value.id}</td>
                                    <td className="text-center">{value.code}</td>
                                    <td className="text-center"></td>
                                    <td className="text-center"></td>
                                    <td className="text-center">
                                        {isEditing ? (
                                            <input className="h-5 w-10 text-center border-b border-b-gray-400 outline-none focus:border-b-red-dark"
                                                value={value.point ? value.point : ''}
                                                onChange={e => changePoint(e.target.value, index)} />
                                        ) : (value.point)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {roomRes.data?.confirm?.actions.map((action, index) => (
                        <Action action={action} key={index} />
                    ))}
                    <CreateConfirm
                        toggle={creationToggle}
                        isShowing={isCreationShowing}
                        onSuccess={handleCreation} />
                    <CancelConfirm
                        toggle={cancelationToggle}
                        isShowing={isCancelationShowing}
                        confirmId={confirmId.current}
                        onSuccess={handleCancelation} />
                </>
            )}
        </>
    );
}

const Action = ({ action }) => {
    return (
        <div className="mx-4 mt-4">
            <div className="flex">
                {action.action === "INITIALIZE" && (
                    <p className="text font-semibold text-gray-500">Nộp bảng điểm thi</p>
                )}
                {action.action === "CANCEL" && (
                    <p className="text font-semibold text-gray-500">Hủy nộp bảng điểm thi</p>
                )}
                {action.action === "DONE" && (
                    <p className="text font-semibold text-gray-500">Đã duyệt bảng điểm</p>
                )}
                {action.action.includes("REJECT") && (
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