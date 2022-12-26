import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClaim } from "../../../api/claim";
import { strTime } from "../../../ultils/time";
import useModal from "../../common/Modal/use";
import AcceptClaim from "./AcceptClaim";
import DoneClaim from "./DoneClaim";
import RejectClaim from "./RejectClaim";

export const ClaimDetail = () => {
    const { claimId } = useParams();
    const shouldFetch = useRef(true);
    const [claimRes, setClaimRes] = useState({ status: "NONE" });

    const {
        isShowing: isAcceptanceShowing,
        toggle: acceptanceToggle
    } = useModal();

    const {
        isShowing: isRejectionShowing,
        toggle: rejectionToggle
    } = useModal();

    const {
        isShowing: isDoneShowing,
        toggle: doneToggle
    } = useModal();

    const updateClaim = (data) => {
        const newPoint = data.point ? data.point : claimRes.data.point
        const newExam = data.exam ? data.exam : claimRes.data.exam
        setClaimRes({
            ...claimRes,
            data: {
                ...claimRes.data,
                status: data.status,
                actions: data.actions,
                point: newPoint,
                exam: newExam
            }
        });
        setTimeout(() => {
            alert("Xử lý yêu cầu thành công!")
        }, 200);
    }
    const handleAcceptanceClaim = (data) => {
        updateClaim(data);
        acceptanceToggle();
    }

    const handleRejectionClaim = (data) => {
        updateClaim(data);
        rejectionToggle();
    }

    const handleDoneClaim = (data) => {
        updateClaim(data);
        doneToggle();
    }

    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getClaim(claimId).then(setClaimRes)
        }
    }, [claimId])
    return (
        <>
            {claimRes.status === "SUCCESS" && (
                <>
                    <div className="py-4">
                        <p className="inline text-gray-600 font-semibold text-[30px]">Thông tin yêu cầu</p>
                        {claimRes.data.status === "INITIALIZED" && (
                            <>
                                <Link className="inline text-gray-600 font-semibold mx-4 hover:text-red-dark"
                                    onClick={acceptanceToggle}>Tiếp nhận</Link>
                                <Link className="inline text-gray-600 font-semibold hover:text-red-dark"
                                    onClick={rejectionToggle}>Từ chối</Link>
                            </>
                        )}
                        {claimRes.data.status === "ACCEPTED" && (
                            <>
                                <Link className="inline text-gray-600 font-semibold mx-4 hover:text-red-dark"
                                    onClick={doneToggle}>Xử lý</Link>
                            </>
                        )}
                    </div>
                    <hr />
                    <div className="mt-4">
                        <p className="font-semibold mb-3 text-xl text-gray-600">Thông tin lớp học</p>
                        <div>
                            <p className="inline">Lớp học: {claimRes.data.class.id}</p>
                            <p className="inline ml-4">Học kỳ {claimRes.data.class.semester}</p>
                            <p className="inline"> năm học {claimRes.data.class.year}-{claimRes.data.class.year + 1}</p>
                        </div>
                        <div className="pt-1">
                            <p className="inline">Mã môn: {claimRes.data.class.subject.id}</p>
                            <p className="inline ml-4">Tên môn: {claimRes.data.class.subject.name}</p>
                            <p className="inline ml-4">Số tín: {claimRes.data.class.subject.numberOfCredit}</p>
                        </div>
                    </div>
                    <p className="mt-1">Điểm thành phần sinh viên {claimRes.data.student.name} - {claimRes.data.student.id}:</p>
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
                                <td className="text-center pt-1.5">{claimRes.data.class.subject.attendancePointRate}</td>
                                <td className="text-center pt-1.5">{claimRes.data.class.subject.practicePointRate}</td>
                                <td className="text-center pt-1.5">{claimRes.data.class.subject.exercisePointRate}</td>
                                <td className="text-center pt-1.5">{claimRes.data.class.subject.midtermExamPointRate}</td>
                                <td className="text-center pt-1.5">{claimRes.data.class.subject.finalExamPointRate}</td>

                                <td className="text-center pt-1.5">{claimRes.data.point.attendancePoint}</td>
                                <td className="text-center pt-1.5">{claimRes.data.point.practicePoint}</td>
                                <td className="text-center pt-1.5">{claimRes.data.point.exercisePoint}</td>
                                <td className="text-center pt-1.5">{claimRes.data.point.midtermExamPoint}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="py-4">
                        <hr />
                        <p className="font-semibold mt-4 text-xl text-gray-600">Lịch sử yêu cầu</p>
                        {claimRes.data?.actions.map((action, index) => (
                            <Action action={action} key={index} />
                        ))}
                    </div>
                    <AcceptClaim
                        toggle={acceptanceToggle}
                        isShowing={isAcceptanceShowing}
                        claimId={claimId}
                        onSuccess={handleAcceptanceClaim} />
                    <RejectClaim
                        toggle={rejectionToggle}
                        isShowing={isRejectionShowing}
                        claimId={claimId}
                        onSuccess={handleRejectionClaim} />
                    <DoneClaim
                        isShowing={isDoneShowing}
                        toggle={doneToggle}
                        claimId={claimId}
                        onSuccess={handleDoneClaim}
                        point={claimRes.data.point} />
                </>
            )}
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