import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
    const [selectedPoint, setSelectedPoint] = useState(null);
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
                if (res.data.confirms) {
                    confirmId.current = res.data.confirms[0].id
                }
            });
        }
    }, [classId]);

    const handleSelectedPoint = (value) => {
        if (isEditing && selectedPoint.id === value.id) {
            updatePoint(
                selectedPoint.student.id, selectedPoint.classId,
                selectedPoint.attendancePoint, selectedPoint.exercisePoint,
                selectedPoint.midtermExamPoint, selectedPoint.practicePoint
            ).then(() => {
                setPointsRes({
                    ...pointsRes,
                    data: pointsRes.data.map(v => {
                        if (selectedPoint.id === v.id) {
                            return selectedPoint;
                        } else return v;
                    })
                });
                setIsEditing(false);
            });
        } else {
            setSelectedPoint(value);
            setIsEditing(true);
        }
    }

    const handleCancelation = (data) => {
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
            alert("Hủy yêu cầu thành công!")
        }, 200);
        cancelationToggle();
    }

    const handleAcceptance = (data) => {
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
        acceptanceToggle();
    }

    const handleRejection = (data) => {
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

    const handleCreation = (data) => {
        const confirms = classRes.data.confirms;
        if (!confirms) {
            setClassRes({
                ...classRes,
                data: {
                    ...classRes.data,
                    confirms: [data]
                }
            })
        } else {
            setClassRes({
                ...classRes,
                data: {
                    ...classRes.data,
                    confirms: [
                        data, ...confirms
                    ]
                }
            });
        }
        setTimeout(() => {
            alert("Lưu yêu cầu thành công!")
        }, 200);
        creationToggle();
    }

    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Thông tin lớp học</p>
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
                    <div className="pt-1">
                        <p className="inline">Học kỳ: {classRes.data.semester}</p>
                        <p className="inline ml-4">Năm học: {classRes.data.year}-{classRes.data.year + 1}</p>
                        <p className="inline ml-4">Giáo viên: {classRes.data.teacher.id} - {classRes.data.teacher.name}</p>
                    </div>
                </div>

            )}
            {pointsRes.status === "SUCCESS" && pointsRes.data.length > 0 && (
                <>
                    <hr className="my-3" />
                    <div className="flex">
                        <p className="font-semibold text-xl text-gray-600">Bảng điểm thành phần</p>
                        {classRes.data && classRes.data.teacher.id === payload.id && (
                            <>
                                {(!classRes.data.confirms || classRes.data.confirms[0].status === "CANCELED" ||
                                    classRes.data.confirms[0].status.includes("REJECTED")) && (
                                        <>
                                            <button className="ml-4 mr-4 flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                                onClick={creationToggle} >
                                                <i className="my-auto text-xs fa-solid fa-plus" />
                                                <p className="ml-2 my-auto">Tạo yêu cầu</p>
                                            </button>
                                        </>
                                    )
                                }
                                {classRes.data.confirms && classRes.data.confirms[0].status === "INITIALIZED" && (
                                    <>
                                        <button className="ml-4 mr-4 flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                            onClick={cancelationToggle} >
                                            <i className="my-auto text-xs fa-solid fa-ban" />
                                            <p className="ml-2 my-auto">Hủy yêu cầu</p>
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                        {classRes.data && classRes.data.teacher.id !== payload.id && (
                            classRes.data.confirms && classRes.data.confirms[0].status === "INITIALIZED" && (
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
                            )
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
                                {classRes.data && (classRes.data.teacher.id === payload.id &&
                                    (!classRes.data.confirms ||
                                        (classRes.data.confirms && classRes.data.confirms[0].status === "CANCELED") ||
                                        (classRes.data.confirms && classRes.data.confirms[0].status.includes("REJECTED"))
                                    )
                                ) && (<th className="border-4 border-white" />)}
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
                                            {isEditing && value.id === selectedPoint.id ? (
                                                <input className="h-5 w-10 text-center border-b border-b-gray-400 outline-none focus:border-b-red-dark"
                                                    value={selectedPoint.attendancePoint ?
                                                        selectedPoint.attendancePoint : ''}
                                                    onChange={e => {
                                                        setSelectedPoint({
                                                            ...selectedPoint,
                                                            attendancePoint: e.target.value
                                                        });
                                                    }} />
                                            ) : (value.attendancePoint)}
                                        </td>
                                        <td className="text-center">
                                            {isEditing && value.id === selectedPoint.id ? (
                                                <input className="h-5 w-10 text-center border-b border-b-gray-400 outline-none focus:border-b-red-dark"
                                                    value={selectedPoint.practicePoint != null ?
                                                        selectedPoint.practicePoint : ''}
                                                    onChange={e => {
                                                        setSelectedPoint({
                                                            ...selectedPoint,
                                                            practicePoint: e.target.value
                                                        });
                                                    }} />
                                            ) : (value.practicePoint)}
                                        </td>
                                        <td className="text-center">
                                            {isEditing && value.id === selectedPoint.id ? (
                                                <input className="h-5 w-10 text-center border-b border-b-gray-400 outline-none focus:border-b-red-dark"
                                                    value={selectedPoint.exercisePoint != null ?
                                                        selectedPoint.exercisePoint : ''}
                                                    onChange={e => {
                                                        setSelectedPoint({
                                                            ...selectedPoint,
                                                            exercisePoint: e.target.value
                                                        });
                                                    }} />
                                            ) : (value.exercisePoint)}
                                        </td>
                                        <td className="text-center">
                                            {isEditing && value.id === selectedPoint.id ? (
                                                <input className="h-5 w-10 text-center border-b border-b-gray-400 outline-none focus:border-b-red-dark"
                                                    value={selectedPoint.midtermExamPoint != null ?
                                                        selectedPoint.midtermExamPoint : ''}
                                                    onChange={e => {
                                                        setSelectedPoint({
                                                            ...selectedPoint,
                                                            midtermExamPoint: e.target.value
                                                        });
                                                    }} />
                                            ) : (value.midtermExamPoint)}
                                        </td>
                                        <td className="text-center">{value.examPoint}</td>
                                        {classRes.data && (classRes.data.teacher.id === payload.id &&
                                            (!classRes.data.confirms ||
                                                (classRes.data.confirms && classRes.data.confirms[0].status === "CANCELED") ||
                                                (classRes.data.confirms && classRes.data.confirms[0].status.includes("REJECTED"))
                                            )
                                        ) && (
                                                <td >
                                                    <Link className="mx-auto w-[60px] flex font-semibold text-sm text-gray-500 hover:text-red-normal hover:border-red-normal rounded-lg border px-2"
                                                        onClick={() => handleSelectedPoint(value)}>

                                                        {isEditing && value.id === selectedPoint.id ? (
                                                            <i className="text-xs fa-solid fa-floppy-disk my-auto"></i>
                                                        ) : (
                                                            <i className="text-xs fa-solid fa-pen-to-square my-auto"></i>
                                                        )}
                                                        <p className="ml-1.5 h-fit">{isEditing && value.id === selectedPoint.id ? "Lưu" : "Sửa"}</p>
                                                    </Link>
                                                </td>
                                            )
                                        }

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {classRes.data && classRes.data.confirms && (
                        classRes.data.confirms.map((confirm, index) => (
                            <Confirm
                                confirm={confirm}
                                teacher={classRes.data.teacher}
                                key={confirm.id + index} />
                        ))
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