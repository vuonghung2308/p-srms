import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClass, getStudents, updatePoint } from "../../../api/class";
import { PayloadContext } from "../../../common/token";
import useModal from "../../common/Modal/use";
import CancelConfirm from "./CancelConfirm";
import CreateConfirm from "./CreateConfirm";

export function ClassStudents() {
    const payload = useContext(PayloadContext);
    const { classId } = useParams()
    const [pointsRes, setPointsRes] = useState({ status: "NONE" });
    const [classRes, setClassRes] = useState({ status: "NONE" });
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const {
        isShowing: isCancelationShowing,
        toggle: cancelationToggle
    } = useModal();
    const {
        isShowing: isCreationShowing,
        toggle: creationToggle
    } = useModal();

    const shouldFetch = useRef(true);

    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getStudents(classId).then(
                res => setPointsRes(res)
            );
            getClass(classId).then(
                res => setClassRes(res)
            );
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

    const handleCancelationSuccess = (data) => {
        setClassRes({
            ...classRes, data: {
                ...classRes.data,
                confirm: data
            }
        })
        setTimeout(() => {
            alert("Hủy yêu cầu thành công!")
        }, 200);
        cancelationToggle();
    }

    const handleReject = () => {
        // confirm(classId).then(res => {
        //     setClassRes({
        //         ...classRes,
        //         data: {
        //             ...classRes.data,
        //             status: "CONFIRMED"
        //         }
        //     })
        // });
    }

    const handleCreationSuccess = (data) => {
        setClassRes({
            ...classRes, data: {
                ...classRes.data,
                confirm: data
            }
        })
        setTimeout(() => {
            alert("Lưu yêu cầu thành công!")
        }, 200);
        creationToggle();
    }

    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Thông tin lớp học</p>
                {classRes.status === "SUCCESS" && (classRes.data.teacher.id === payload.id ? (
                    (!classRes.data.confirm || classRes.data.confirm.status === "CANCELED") ? (
                        <>
                            <Link className="inline text-gray-600 font-semibold mx-4 hover:text-red-dark"
                                onClick={creationToggle}>
                                Yêu cầu phê duyệt
                            </Link>
                            <CreateConfirm
                                toggle={creationToggle}
                                isShowing={isCreationShowing}
                                onSuccess={handleCreationSuccess}
                                id={classRes.data.censor ? classRes.data.censor.id : ''} />
                        </>
                    ) : (
                        <>
                            <Link className="inline text-gray-600 font-semibold mx-4 hover:text-red-dark"
                                onClick={cancelationToggle}>
                                Hủy yêu cầu
                            </Link>
                            <CancelConfirm
                                toggle={cancelationToggle}
                                isShowing={isCancelationShowing}
                                onSuccess={handleCancelationSuccess}
                                confirm={classRes.data.confirm} />
                        </>
                    )
                ) : (
                    classRes.data.confirm.status === "REQUESTED" && (
                        <>
                            <Link className="inline text-gray-600 font-semibold mx-4 hover:text-red-dark"
                            >
                                Phê duyệt
                            </Link>
                            <Link className="inline text-gray-600 font-semibold mx-4 hover:text-red-dark"
                                onClick={handleReject}>
                                Từ chối
                            </Link>
                        </>
                    )
                ))}

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
                    {classRes.data.status && (
                        <div className="pt-1">
                            <p className="inline">
                                Bảng điểm: {
                                    classRes.data.status === "REQUESTED" ?
                                        "đang yêu cầu duyệt" :
                                        classRes.data.status === "CONFIRMED" ?
                                            "đã duyệt" : "đã từ chối"
                                }
                            </p>
                            <p className="inline ml-4">Người duyệt: {classRes.data.censor.id} - {classRes.data.censor.name}</p>
                        </div>
                    )}
                </div>

            )}
            {pointsRes.status === "SUCCESS" && pointsRes.data.length > 0 && (
                <>
                    <hr className="my-3" />
                    <p className="font-semibold text-xl text-gray-600">Danh sách sinh viên</p>
                    <table className="mt-3 w-[100%]">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600">
                                <th className="border-4 border-white py-0.5">Mã SV</th>
                                <th className="border-4 border-white">Họ và tên</th>
                                <th className="border-4 border-white">Điểm CC</th>
                                <th className="border-4 border-white">Điểm TH</th>
                                <th className="border-4 border-white">Điểm BT</th>
                                <th className="border-4 border-white">Điểm KT</th>
                                <th className="border-4 border-white">Điểm Thi</th>
                                {classRes.data && (classRes.data.teacher.id === payload.id &&
                                    (classRes.data.confirm === null ||
                                        classRes.data.confirm.status === "CANCELED"
                                    )
                                ) && (<th className="border-4 border-white" />)}
                            </tr>
                        </thead>
                        <tbody>
                            {pointsRes.data.map(value => {
                                return (
                                    <tr className="border-b" key={value.student.id}>
                                        <td className="text-center py-0.5">{value.student.id}</td>
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
                                            (classRes.data.confirm === null ||
                                                classRes.data.confirm.status === "CANCELED"
                                            )
                                        ) && (
                                                <td className="text-center">
                                                    <Link className="text-blue-600 hover:text-blue-600 hover:underline"
                                                        onClick={() => handleSelectedPoint(value)}>
                                                        {isEditing && value.id === selectedPoint.id ? "Lưu" : "Sửa"}
                                                    </Link>
                                                </td>
                                            )
                                        }

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </>
            )}
        </>
    );
}