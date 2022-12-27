import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClaim } from "../../../api/claim";
import { strDate, strHour, strTime } from "../../../ultils/time";
import useModal from "../../common/Modal/use";
import CancelClaim from "./CancelClaim";
import CreateClaim from "./CreateClaim";

export const ClaimDetail = () => {
    const { claimId } = useParams();
    const shouldFetch = useRef(true);
    const claimType = useRef(null);
    const objectId = useRef(null);
    const [claimRes, setClaimRes] = useState({ status: "NONE" });

    const {
        isShowing: isCreationShowing,
        toggle: creationToggle
    } = useModal();

    const {
        isShowing: isCancelationShowing,
        toggle: cancelationToggle
    } = useModal();

    const updateClaim = (data) => {
        setClaimRes({
            ...claimRes,
            data: {
                ...claimRes.data,
                status: data.status,
                actions: data.actions
            }
        });
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

    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getClaim(claimId).then(res => {
                setClaimRes(res);
                if (res.data) {
                    claimType.current = res.data.type;
                    objectId.current = res.data.objectId;
                }
            })
        }
    }, [claimId])
    return (
        <>
            {claimRes.status === "SUCCESS" && (
                <>
                    <div className="py-4">
                        <p className="inline text-gray-600 font-semibold text-[30px]">Thông tin yêu cầu</p>
                        {claimRes.data.status === "INITIALIZED" && (
                            <Link className="inline text-gray-600 font-semibold mx-4 hover:text-red-dark"
                                onClick={cancelationToggle}>Hủy yêu cầu</Link>
                        )}
                        {claimRes.data.status === "CANCELED" && (
                            <Link className="inline text-gray-600 font-semibold mx-4 hover:text-red-dark"
                                onClick={creationToggle}>Yêu cầu lại</Link>
                        )}
                    </div>
                    <hr />
                    {claimRes.data?.type === "COMPONENTS_POINT" && (
                        <PointClaim claim={claimRes.data} />
                    )}
                    {claimRes.data?.type === "EXAM_POINT" && (
                        <ExamClaim claim={claimRes.data} />
                    )}
                    <div className="py-4">
                        <hr />
                        <p className="font-semibold mt-4 text-xl text-gray-600">Lịch sử yêu cầu</p>
                        {claimRes.data?.actions.map((action, index) => (
                            <Action action={action} key={index} />
                        ))}
                    </div>
                    <CreateClaim
                        toggle={creationToggle}
                        isShowing={isCreationShowing}
                        claimType={claimType.current}
                        objectId={objectId.current}
                        onSuccess={handleCreationClaim} />
                    <CancelClaim
                        toggle={cancelationToggle}
                        isShowing={isCancelationShowing}
                        claimId={claimId}
                        onSuccess={handleCancelationClaim} />
                </>
            )}
        </>
    )
}


const ExamClaim = ({ claim }) => {
    return (
        <>
            <p className="font-semibold text-xl text-gray-600 mt-4">Thông tin bài thi</p>

            <table className="mt-4 mb-2 w-full">
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
                        <td className="text-center pt-1.5">{claim.room.roomName}</td>
                        <td className="text-center pt-1.5">{claim.exam.code}</td>
                        <td className="text-center pt-1.5">{strDate(claim.room.timeStart)}</td>
                        <td className="text-center pt-1.5">{strHour(claim.room.timeStart)}</td>
                        <td className="text-center pt-1.5">{claim.room.duration}</td>
                        <td className="text-center pt-1.5">{claim.exam.point}</td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

const PointClaim = ({ claim }) => {
    return (
        <>
            <>
                <div className="mt-4">
                    <p className="font-semibold mb-3 text-xl text-gray-600">Thông tin lớp học</p>
                    <div>
                        <p className="inline">Lớp học: {claim.class.id}</p>
                        <p className="inline ml-4">Học kỳ {claim.class.semester}</p>
                        <p className="inline"> năm học {claim.class.year}-{claim.class.year + 1}</p>
                    </div>
                    <div className="pt-0.5">
                        <p className="inline">Mã môn: {claim.class.subject.id}</p>
                        <p className="inline ml-4">Tên môn: {claim.class.subject.name}</p>
                        <p className="inline ml-4">Số tín: {claim.class.subject.numberOfCredit}</p>
                    </div>
                </div>
                <table className="w-full mt-4 mb-2">
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
                            <td className="text-center pt-1.5">{claim.class.subject.attendancePointRate}</td>
                            <td className="text-center pt-1.5">{claim.class.subject.practicePointRate}</td>
                            <td className="text-center pt-1.5">{claim.class.subject.exercisePointRate}</td>
                            <td className="text-center pt-1.5">{claim.class.subject.midtermExamPointRate}</td>
                            <td className="text-center pt-1.5">{claim.class.subject.finalExamPointRate}</td>

                            <td className="text-center pt-1.5">{claim.point.attendancePoint}</td>
                            <td className="text-center pt-1.5">{claim.point.practicePoint}</td>
                            <td className="text-center pt-1.5">{claim.point.exercisePoint}</td>
                            <td className="text-center pt-1.5">{claim.point.midtermExamPoint}</td>
                        </tr>
                    </tbody>
                </table>
            </>
        </>
    )
}

const Action = ({ action }) => {
    return (
        <div className="mt-3">
            <div className="flex">
                {action.action === "INITIALIZE" && (
                    <p className="text font-semibold text-gray-500">Yêu cầu phúc khảo</p>
                )}
                {action.action === "CANCEL" && (
                    <p className="text font-semibold text-gray-500">Hủy yêu cầu phúc khảo</p>
                )}
                {action.action === ("REJECT") && (
                    <p className="text font-semibold text-gray-500">Đã từ chối yêu cầu phúc khảo</p>
                )}
                {action.action === "ACCEPT" && (
                    <p className="text font-semibold text-gray-500">Tiếp nhận yêu cầu phúc khảo</p>
                )}
                {action.action === "DONE" && (
                    <p className="text font-semibold text-gray-500">Đã xử lý yêu cầu phúc khảo</p>
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