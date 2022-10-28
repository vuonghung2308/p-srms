import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactDOM from 'react-dom';
import { searchTeacher } from "../../../api/teacher";
import { strTime } from "../../../ultils/time"
import { createConfirm } from "../../../api/confirm";

export default function CancelConfirm({
    isShowing, toggle, onSuccess, confirm
}) {
    const [status, setStatus] = useState({ status: "NONE" });
    // const [isShowingTeachers, setIsShowingTeachers] = useState(false);
    // const [teacherRes, setTeacherRes] = useState([]);
    // const [teacherId, setTeacherId] = useState("id");
    // const [note, setNote] = useState("");
    // const { classId } = useParams();

    // const doSearchTeacher = (key) => {
    //     searchTeacher(key).then(res =>
    //         setTeacherRes(res)
    //     );
    // }

    useEffect(() => {
    }, [isShowing])

    // useEffect(() => {
    //     if (teacherId.length !== 0 && note.length !== 0) {
    //         setStatus({ status: "NONE" })
    //     }
    // }, [teacherId, note])

    // const handleRequest = async () => {
    //     if (teacherId.length === 0 || note.length === 0) {
    //         setStatus({
    //             status: "FAILED",
    //             message: "Mã giáo viên hoặc ghi chú bị bỏ trống."
    //         });
    //         return;
    //     }
    //     createConfirm(classId, teacherId, note, "COMPONENTS_POINT").then(res => {
    //         if (res.status === "SUCCESS") {
    //             setStatus({ status: "SUCCESS" })
    //             onSuccess(res.data)
    //         } else {
    //             setStatus({
    //                 status: "FAILED",
    //                 message: "Cập nhật thất bại."
    //             })
    //         }
    //     })
    // }

    if (isShowing) {
        return ReactDOM.createPortal(
            <div className='block fixed top-0 left-0 w-[100%] h-[100%] bg-[rgba(0,0,0,0.2)] pt-[100px] text-gray-700'>
                <div className={`bg-[#fefefe] w-[400px] mx-auto py-4 px-6 border rounded-xl shadow-2xl`}>
                    <div className="my-4 mx-4">
                        <div className="flex">
                            <p className="font-semibold text-xl text-gray-600">Phê duyệt bảng điểm</p>
                            <button className="ml-auto h-6 w-6 hover:text-red-dark rounded-[50%] bg-gray-100"
                                onClick={() => {
                                    toggle()
                                }}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>
                        <div className="mt-4">
                            <p className="mt-1">Giáo viên xác nhận: {confirm.censorId1}</p>
                            <p className="mt-1">Ngày yêu cầu: {strTime(confirm.time)}</p>
                            <p className="mt-1">Ghi chú: {confirm.note}</p>
                        </div>

                        <button className="block ml-auto text-gray-600 border border-gray-300 hover:border-red-dark hover:text-red-dark font-semibold py-2 px-6 rounded-lg mt-5"
                            onClick={() => { }}>Hủy yêu cầu</button>

                        {status.status === "FAILED" ? (
                            <p className="text-red-500 font-semibold mt-3">
                                {status.message}
                            </p>
                        ) : (<p className="mt-3" />)}
                    </div>
                </div>
            </div>, document.body
        )
    };
}