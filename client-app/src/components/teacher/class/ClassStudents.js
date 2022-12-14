import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getClass, getStudents, updatePoint } from "../../../api/class";
import { PayloadContext } from "../../../common/token";
import { strTime } from "../../../ultils/time";
import useModal from "../../common/Modal/use";
import AcceptConfirm from "./AcceptConfirm";
import CancelConfirm from "./CancelConfirm";
import CreateConfirm from "./CreateConfirm";
import RejectConfirm from "./RejectConfirm";

export function ClassStudents() {
    const payload = useContext(PayloadContext);
    const [pointsRes, setPointsRes] = useState({ status: "NONE" });
    const [classRes, setClassRes] = useState({ status: "NONE" });
    const [isEditing, setIsEditing] = useState(false);
    const confirmId = useRef('');
    const { classId } = useParams();
    const {
        isShowing: isCancelationShowing,
        toggle: cancelationToggle
    } = useModal();
    const {
        isShowing: isCreationShowing,
        toggle: creationToggle
    } = useModal();
    const {
        isShowing: isAcceptanceShowing,
        toggle: acceptanceToggle
    } = useModal();
    const {
        isShowing: isRejectionShowing,
        toggle: rejectionToggle
    } = useModal();

    const shouldFetch = useRef(true);

    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getStudents(classId).then(
                res => setPointsRes(res)
            );
            getClass(classId).then(res => {
                setClassRes(res)
                if (res.data.confirm) {
                    confirmId.current = res.data.confirm.id
                }
            });
        }
    }, [classId]);

    const changePoint = (value, type, index) => {
        if (value === "" || !value) value = null;
        const newPoints = pointsRes.data.map((p, i) => {
            if (index === i) {
                const point = { ...p };
                switch (type) {
                    case "AP": point.attendancePoint = value;
                        break;
                    case "PP": point.practicePoint = value;
                        break;
                    case "EP": point.exercisePoint = value;
                        break;
                    case "MP":
                    default: point.midtermExamPoint = value;
                        break;
                }
                return point;
            } else return p;
        })
        setPointsRes({
            ...pointsRes,
            data: newPoints
        })
    }

    const handleSavePoints = () => {
        for (let i = 0; i < pointsRes.data.length; i++) {
            const point = { ...pointsRes.data[i] };
            for (const key in point) {
                if (point[key] === null) {
                    point[key] = undefined;
                }
            }
            updatePoint(
                point.student.id, point.classId,
                point.attendancePoint, point.exercisePoint,
                point.midtermExamPoint, point.practicePoint
            )
        }
    }

    const handleCancelation = (data) => {
        setClassRes({
            ...classRes,
            data: {
                ...classRes.data,
                confirm: data
            }
        });
        setTimeout(() => {
            alert("H???y y??u c???u th??nh c??ng!")
        }, 200);
        cancelationToggle();
    }

    const handleAcceptance = (data) => {
        setClassRes({
            ...classRes,
            data: {
                ...classRes.data,
                confirm: data
            }
        });
        setTimeout(() => {
            alert("X??? l?? y??u c???u th??nh c??ng!")
        }, 200);
        acceptanceToggle();
    }

    const handleRejection = (data) => {
        setClassRes({
            ...classRes,
            data: {
                ...classRes.data,
                confirm: data
            }
        });
        setTimeout(() => {
            alert("X??? l?? y??u c???u th??nh c??ng!")
        }, 200);
        rejectionToggle();
    }

    const handleCreation = (data) => {
        setClassRes({
            ...classRes,
            data: {
                ...classRes.data,
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
                <p className="inline text-gray-600 font-semibold text-[30px]">Th??ng tin l???p h???c</p>
            </div>
            <hr />
            {classRes.status === "SUCCESS" && (
                <div className="mt-3">
                    <p className="font-semibold mb-3 text-xl text-gray-600">Chi ti???t l???p h???c</p>
                    <div>
                        <p className="inline">M?? l???p: {classRes.data.id}</p>
                        <p className="inline ml-4">M?? m??n h???c: {classRes.data.subject.id}</p>
                        <p className="inline ml-4">T??n m??n h???c: {classRes.data.subject.name}</p>
                    </div>
                    <div className="pt-0.5">
                        <p className="inline">H???c k???: {classRes.data.semester}</p>
                        <p className="inline ml-4">N??m h???c: {classRes.data.year}-{classRes.data.year + 1}</p>
                        <p className="inline ml-4">Gi??o vi??n: {classRes.data.teacher.id} - {classRes.data.teacher.name}</p>
                    </div>
                    <hr className="my-3" />
                </div>

            )}
            {pointsRes.status === "SUCCESS" && pointsRes.data.length > 0 && (
                <>
                    <div className="flex">
                        <p className="font-semibold text-xl text-gray-600">B???ng ??i???m th??nh ph???n</p>
                        {classRes.data && classRes.data.teacher.id === payload.id && (
                            <>
                                {classRes.data && (classRes.data.teacher.id === payload.id &&
                                    (!classRes.data.confirm ||
                                        (classRes.data.confirm.status === "CANCELED") ||
                                        (classRes.data.confirm.status.includes("REJECTED"))
                                    )
                                ) && (
                                        <button className="w-[106px] ml-4 mr-4 flex border text-sm hover:border-red-normal px-3 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                            onClick={() => {
                                                if (isEditing) { handleSavePoints(); }
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
                                    )
                                }

                                {(!classRes.data.confirm || classRes.data.confirm.status === "CANCELED" ||
                                    classRes.data.confirm.status.includes("REJECTED")) && (
                                        <>
                                            <button className="mr-4 flex border text-sm hover:border-red-normal px-3 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                                onClick={creationToggle} >
                                                <i className="my-auto text-xs fa-solid fa-plus" />
                                                <p className="ml-2 my-auto">Y??u c???u duy???t</p>
                                            </button>
                                        </>
                                    )
                                }
                                {classRes.data.confirm?.status === "INITIALIZED" && (
                                    <>
                                        <button className="ml-4 mr-4 flex border text-sm hover:border-red-normal px-3 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                            onClick={cancelationToggle} >
                                            <i className="my-auto text-xs fa-solid fa-ban" />
                                            <p className="ml-2 my-auto">H???y y??u c???u</p>
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                        {classRes.data?.teacher.id !== payload.id && classRes.data?.confirm?.status === "INITIALIZED" && (
                            <>
                                <button className="ml-4 mr-4 flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                    onClick={rejectionToggle}>
                                    <i className="my-auto text-xs fa-solid fa-ban" />
                                    <p className="ml-2 my-auto">T??? ch???i</p>
                                </button>
                                <button className="mr-4 flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                    onClick={acceptanceToggle}>
                                    <i className="my-auto text-xs fa-solid fa-check" />
                                    <p className="ml-2 my-auto">Duy???t</p>
                                </button>
                            </>
                        )}
                    </div>
                    <table className="mt-3 w-[100%]">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600">
                                <th className="border-4 border-white py-0.5">STT</th>
                                <th className="border-4 border-white">M?? SV</th>
                                <th className="border-4 border-white">H??? v?? t??n</th>
                                <th className="border-4 border-white">??i???m CC</th>
                                <th className="border-4 border-white">??i???m TH</th>
                                <th className="border-4 border-white">??i???m BT</th>
                                <th className="border-4 border-white">??i???m KT</th>
                                <th className="border-4 border-white">??i???m Thi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pointsRes.data.map((value, index) => {
                                return (
                                    <tr className="border-b" key={value.student.id}>
                                        <td className="text-center py-0.5">{index + 1}</td>
                                        <td className="text-center">{value.student.id}</td>
                                        <td className="text-start pl-4">{value.student.name}</td>
                                        <td className="text-center">
                                            {isEditing ? (
                                                <input className="h-5 w-10 text-center border-b border-b-gray-400 outline-none focus:border-b-red-dark"
                                                    value={value.attendancePoint !== null ? value.attendancePoint : ""}
                                                    onChange={e => changePoint(e.target.value, "AP", index)} />
                                            ) : (value.attendancePoint)}
                                        </td>
                                        <td className="text-center">
                                            {isEditing ? (
                                                <input className="h-5 w-10 text-center border-b border-b-gray-400 outline-none focus:border-b-red-dark"
                                                    value={value.practicePoint !== null ? value.practicePoint : ""}
                                                    onChange={e => changePoint(e.target.value, "PP", index)} />
                                            ) : (value.practicePoint)}
                                        </td>
                                        <td className="text-center">
                                            {isEditing ? (
                                                <input className="h-5 w-10 text-center border-b border-b-gray-400 outline-none focus:border-b-red-dark"
                                                    value={value.exercisePoint !== null ? value.exercisePoint : ""}
                                                    onChange={e => changePoint(e.target.value, "EP", index)} />
                                            ) : (value.exercisePoint)}
                                        </td>
                                        <td className="text-center">
                                            {isEditing ? (
                                                <input className="h-5 w-10 text-center border-b border-b-gray-400 outline-none focus:border-b-red-dark"
                                                    value={value.midtermExamPoint !== null ? value.midtermExamPoint : ""}
                                                    onChange={e => changePoint(e.target.value, "MP", index)} />
                                            ) : (value.midtermExamPoint)}
                                        </td>
                                        <td className="text-center">{value.examPoint}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {classRes.data?.confirm?.actions.length > 0 && (
                        <>
                            <hr />
                            <p className="font-semibold mt-4 text-xl text-gray-600">L???ch s??? y??u c???u</p>
                            {classRes.data?.confirm?.actions.map((action, index) => (
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
                    <AcceptConfirm
                        toggle={acceptanceToggle}
                        isShowing={isAcceptanceShowing}
                        confirmId={confirmId.current}
                        onSuccess={handleAcceptance} />
                    <RejectConfirm
                        toggle={rejectionToggle}
                        isShowing={isRejectionShowing}
                        confirmId={confirmId.current}
                        onSuccess={handleRejection} />
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
                    <div className="flex">
                        <p className="text font-semibold text-gray-500">Y??u c???u duy???t b???ng ??i???m</p>
                        <p className="ml-2 text-sm my-auto">t???i: {action.censorName} ({action.censorId})</p>
                    </div>
                )}
                {(action.action === "ACCEPT" || action.action === "DONE") && (
                    <p className="text font-semibold text-gray-500">???? duy???t b???ng ??i???m</p>
                )}
                {action.action === "CANCEL" && (
                    <p className="text font-semibold text-gray-500">H???y y??u c???u duy???t b???ng ??i???m</p>
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