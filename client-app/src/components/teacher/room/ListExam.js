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
            alert("H???y y??u c???u th??nh c??ng!")
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
            alert("L??u y??u c???u th??nh c??ng!")
        }, 200);
        creationToggle();
    }

    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Th??ng tin ph??ng thi</p>
            </div>
            <hr />
            {roomRes.status === "SUCCESS" && (
                <div className="mt-4">
                    <p className="font-semibold mb-3 text-xl text-gray-600">Chi ti???t ph??ng thi</p>
                    <div>
                        <p className="inline">Ph??ng thi: {roomRes.data.roomName}</p>
                        <p className="inline ml-4">M??n h???c: {roomRes.data.subject.name} ({roomRes.data.subject.id})</p>
                    </div>
                    <div className="pt-0.5">
                        <p className="inline">H???c k???: {roomRes.data.semester} n??m {roomRes.data.year}-{roomRes.data.year + 1}</p>
                        <p className="inline ml-4">Gi??o vi??n:  {roomRes.data.teacher.name} ({roomRes.data.teacher.id})</p>
                    </div>
                    <div className="pt-0.5">
                        <p className="inline">Th???i gian: {new Date(roomRes.data.timeStart * 1000).toLocaleString()} ({roomRes.data.duration} ph??t)</p>
                    </div>
                    <hr className="my-4" />
                </div>
            )}
            {examsRes.status === "SUCCESS" && examsRes.data.length > 0 && (
                <>
                    <div className="my-3 flex">
                        <p className="font-semibold text-xl text-gray-600">B???ng ??i???m thi</p>

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
                                                <p className="ml-2 my-auto">L??u ??i???m</p>
                                            </>
                                        ) : (
                                            <>
                                                <i className="w-[12px] text-xs fa-solid fa-pen-to-square my-auto" />
                                                <p className="ml-2 my-auto">S???a ??i???m</p>
                                            </>
                                        )}
                                    </button>
                                    <button className="mr-4 flex border text-sm hover:border-red-normal px-3 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                        onClick={creationToggle} >
                                        <i className="my-auto text-xs fa-solid fa-check" />
                                        <p className="ml-2 my-auto">N???p b???ng ??i???m</p>
                                    </button>
                                </>
                            )
                        }
                        {roomRes.data?.confirm?.status === "INITIALIZED" && (
                            <button className="ml-4 mr-4 flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                onClick={cancelationToggle} >
                                <i className="my-auto text-xs fa-solid fa-ban" />
                                <p className="ml-2 my-auto">H???y n???p b???ng ??i???m</p>
                            </button>
                        )}
                    </div>
                    <table className="mt-3 w-full">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600">
                                <th className="border-4 border-white py-0.5">STT</th>
                                <th className="border-4 border-white">M?? b??i thi</th>
                                <th className="border-4 border-white">M?? ph??ch</th>
                                <th className="border-4 border-white">M?? sinh vi??n</th>
                                <th className="border-4 border-white">H??? v?? t??n</th>
                                <th className="border-4 border-white w-[100px]">??i???m</th>
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
                    {roomRes.data?.confirm?.actions.length > 0 && (
                        <>
                            <hr />
                            <p className="font-semibold mt-4 text-xl text-gray-600">L???ch s??? y??u c???u</p>
                            {roomRes.data?.confirm?.actions.map((action, index) => (
                                <Action action={action} key={index} />
                            ))}
                        </>
                    )}
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
        <div className="mt-3">
            <div className="flex">
                {action.action === "INITIALIZE" && (
                    <p className="text font-semibold text-gray-500">N???p b???ng ??i???m thi</p>
                )}
                {action.action === "CANCEL" && (
                    <p className="text font-semibold text-gray-500">H???y n???p b???ng ??i???m thi</p>
                )}
                {action.action === "DONE" && (
                    <p className="text font-semibold text-gray-500">???? duy???t b???ng ??i???m</p>
                )}
                {action.action.includes("REJECT") && (
                    <p className="text font-semibold text-gray-500">???? t??? ch???i b???ng ??i???m</p>
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