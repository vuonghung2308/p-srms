import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getPoint } from "../../../api/point";
import { strDate, strHour } from "../../../ultils/time";
import useModal from "../../common/Modal/use";
import CancelClaim from "./CancelClaim";
import CreateClaim from "./CreateClaim";

const PointDetail = () => {
    const { pointId } = useParams();
    const shouldFetch = useRef(true);
    const claimType = useRef(null);
    const claimId = useRef(null);
    const objectId = useRef(null);
    const [pointRes, setPointRes] = useState(
        { status: "NONE", data: null }
    );
    const {
        isShowing: isCreationShowing,
        toggle: creationToggle
    } = useModal();

    const {
        isShowing: isCancelationShowing,
        toggle: cancelationToggle
    } = useModal();

    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getPoint(pointId).then(res => {
                setPointRes(res);
            })
        }
    }, [pointId])

    const cancelPointClaim = () => {
        claimType.current = "COMPONENTS_POINT";
        claimId.current = pointRes.data.point.claim.id;
        cancelationToggle();
    }

    const cancelExamClaim = () => {
        claimType.current = "EXAM_POINT";
        claimId.current = pointRes.data.exam.claim.id;
        cancelationToggle();
    }

    const claimPoint = () => {
        claimType.current = "COMPONENTS_POINT";
        objectId.current = pointId;
        creationToggle();
    }
    const claimExam = () => {
        const examId = pointRes.data.exam.id;
        claimType.current = "EXAM_POINT";
        objectId.current = examId;
        creationToggle();
    }

    const updateClaim = (data) => {
        if (claimType.current === "EXAM_POINT") {
            setPointRes({
                ...pointRes,
                data: {
                    ...pointRes.data,
                    exam: {
                        ...pointRes.data.exam,
                        claim: data
                    }
                }
            });
        } else {
            setPointRes({
                ...pointRes,
                data: {
                    ...pointRes.data,
                    point: {
                        ...pointRes.data.point,
                        claim: data
                    }
                }
            });
        }
        setTimeout(() => {
            alert("Xử lý yêu cầu thành công!")
        }, 200);
    }
    const handleCancelationClaim = (data) => {
        updateClaim(data);
        cancelationToggle();
    }

    const handleCreationClaim = (data) => {
        updateClaim(data);
        creationToggle();
    }

    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Chi tiết điểm học phần</p>
            </div>
            <hr />
            {pointRes.data && (
                <>
                    <div className="mt-4">
                        <p className="font-semibold mb-3 text-xl text-gray-600">Thông tin lớp học</p>
                        <div>
                            <p className="inline">Mã lớp: {pointRes.data.class.id}</p>
                            <p className="inline ml-4">Mã môn: {pointRes.data.class.subject.id}</p>
                            <p className="inline ml-4">Tên môn: {pointRes.data.class.subject.name}</p>
                            <p className="inline ml-4">Số tín: {pointRes.data.class.subject.numberOfCredit}</p>
                        </div>
                        <div className="pt-1">
                            <p className="inline">Học kỳ: {pointRes.data.class.semester}</p>
                            <p className="inline ml-4">Năm học: {pointRes.data.class.year}-{pointRes.data.class.year + 1}</p>
                            <p className="inline ml-4">Giáo viên: {pointRes.data.class.teacher.id} - {pointRes.data.class.teacher.name}</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <hr />
                        <div className="flex mt-4 mb-3">
                            <p className="font-semibold text-xl text-gray-600">Điểm thành phần</p>
                            {(!pointRes.data.point.confirm || (
                                pointRes.data.point.confirm.status !== "ACCEPTED" &&
                                pointRes.data.point.confirm.status !== "DONE"
                            )) && (
                                    <>
                                        {(!pointRes.data.point.claim || pointRes.data?.point?.claim?.status === "CANCELED") && (
                                            <button className="my-auto ml-4 mr-4 h-fit py-0.5 flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                                onClick={claimPoint} >
                                                <i className="ml-1 my-auto text-xs fa-solid fa-exclamation" />
                                                <p className="ml-2 my-auto">Phúc khảo</p>
                                            </button>
                                        )}
                                        {pointRes.data?.point?.claim?.status === "INITIALIZED" && (
                                            <button className="my-auto ml-4 mr-4 h-fit py-0.5 flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                                onClick={cancelPointClaim} >
                                                <i className="ml-1 my-auto text-xs fa-solid fa-exclamation" />
                                                <p className="ml-2 my-auto">Hủy phúc khảo</p>
                                            </button>
                                        )}
                                    </>
                                )
                            }
                        </div>
                        <table className="w-full">
                            <thead className="text-gray-600 font-semibold border-b">
                                <tr>
                                    <th className="pb-1.5">%CC</th>
                                    <th className="pb-1.5">%TH</th>
                                    <th className="pb-1.5">%BT</th>
                                    <th className="pb-1.5">%KT</th>
                                    <th className="pb-1.5">%Thi</th>
                                    <th className="pb-1.5">Điểm CC</th>
                                    <th className="pb-1.5">Điểm TH</th>
                                    <th className="pb-1.5">Điểm BT</th>
                                    <th className="pb-1.5">Điểm KT</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-center pt-1.5">{pointRes.data.class.subject.attendancePointRate}</td>
                                    <td className="text-center pt-1.5">{pointRes.data.class.subject.practicePointRate}</td>
                                    <td className="text-center pt-1.5">{pointRes.data.class.subject.exercisePointRate}</td>
                                    <td className="text-center pt-1.5">{pointRes.data.class.subject.midtermExamPointRate}</td>
                                    <td className="text-center pt-1.5">{pointRes.data.class.subject.finalExamPointRate}</td>

                                    <td className="text-center pt-1.5">{pointRes.data.point.attendancePoint}</td>
                                    <td className="text-center pt-1.5">{pointRes.data.point.practicePoint}</td>
                                    <td className="text-center pt-1.5">{pointRes.data.point.exercisePoint}</td>
                                    <td className="text-center pt-1.5">{pointRes.data.point.midtermExamPoint}</td>
                                </tr>
                            </tbody>
                        </table>
                        {pointRes.data.point.confirm && (
                            <div className="mt-2 flex">
                                {(
                                    pointRes.data.point.confirm.status !== "INITIALIZED" ||
                                    pointRes.data.point.confirm.status !== "CANCELED" ||
                                    !pointRes.data.point.confirm.status.includes("REJECTED")
                                ) && (
                                        <div className="flex text-sm bg-[rgba(240,244,247,255)] font-semibold rounded-lg py-0.5 w-fit px-2.5 text-gray-600">
                                            <i className="text-xs my-auto fa-regular fa-circle-check mr-2" />
                                            <p>{pointRes.data.point.confirm.censor1.name} ({pointRes.data.point.confirm.censor1.id})</p>
                                        </div>
                                    )
                                }
                                {(pointRes.data.point.confirm.status === "DONE") && (
                                    <div className="ml-4 flex text-sm bg-[rgba(240,244,247,255)] font-semibold rounded-lg py-0.5 w-fit px-2.5 text-gray-600">
                                        <i className="text-xs my-auto fa-regular fa-circle-check mr-2" />
                                        <p>{pointRes.data.point.confirm.censor2.name} ({pointRes.data.point.confirm.censor2.id})</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {pointRes.data.exam && (
                        <div className="mt-4">
                            <hr />
                            <div className="flex mt-4 mb-3">
                                <p className="font-semibold text-xl text-gray-600">Thông tin bài thi</p>
                                {(!pointRes.data.exam.confirm || (
                                    pointRes.data.exam.confirm.status !== "ACCEPTED" &&
                                    pointRes.data.exam.confirm.status !== "DONE"
                                )) && (
                                        <>
                                            {(!pointRes.data.exam.claim || pointRes.data?.exam?.claim?.status === "CANCELED") && (
                                                <button className="my-auto ml-4 mr-4 h-fit py-0.5 flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                                    onClick={claimExam} >
                                                    <i className="ml-1 my-auto text-xs fa-solid fa-exclamation" />
                                                    <p className="ml-2 my-auto">Phúc khảo</p>
                                                </button>
                                            )}
                                            {pointRes.data?.exam?.claim?.status === "INITIALIZED" && (
                                                <button className="my-auto ml-4 mr-4 h-fit py-0.5 flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                                    onClick={cancelExamClaim} >
                                                    <i className="ml-1 my-auto text-xs fa-solid fa-exclamation" />
                                                    <p className="ml-2 my-auto">Hủy phúc khảo</p>
                                                </button>
                                            )}
                                        </>
                                    )
                                }
                            </div>

                            <table className="w-full">
                                <thead className="text-gray-600 font-semibold border-b">
                                    <tr>
                                        <th className="pb-1.5">Tên phòng</th>
                                        <th className="pb-1.5">Mã phách</th>
                                        <th className="pb-1.5">Ngày thi</th>
                                        <th className="pb-1.5">Giờ thi</th>
                                        <th className="pb-1.5">Thời gian</th>
                                        <th className="pb-1.5">Điểm</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="text-center pt-1.5">{pointRes.data.exam.room.roomName}</td>
                                        <td className="text-center pt-1.5">{pointRes.data.exam.code}</td>
                                        <td className="text-center pt-1.5">{strDate(pointRes.data.exam.room.timeStart)}</td>
                                        <td className="text-center pt-1.5">{strHour(pointRes.data.exam.room.timeStart)}</td>
                                        <td className="text-center pt-1.5">{pointRes.data.exam.room.duration}</td>
                                        <td className="text-center pt-1.5">{pointRes.data.exam.point}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {pointRes.data.point.confirm && (
                                <div className="mt-2 flex">
                                    {(pointRes.data.exam.confirm.status === "DONE") && (
                                        <div className="flex text-sm bg-[rgba(240,244,247,255)] font-semibold rounded-lg py-0.5 w-fit px-2.5 text-gray-600">
                                            <i className="text-xs my-auto fa-regular fa-circle-check mr-2" />
                                            <p>{pointRes.data.exam.confirm.censor2.name} ({pointRes.data.exam.confirm.censor2.id})</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
            <CreateClaim
                toggle={creationToggle}
                isShowing={isCreationShowing}
                claimType={claimType.current}
                objectId={objectId.current}
                onSuccess={handleCreationClaim} />
            <CancelClaim
                toggle={cancelationToggle}
                isShowing={isCancelationShowing}
                claimId={claimId.current}
                onSuccess={handleCancelationClaim} />
        </>
    )
}

export default PointDetail;