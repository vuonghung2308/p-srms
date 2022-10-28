import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactDOM from 'react-dom';
import { searchTeacher } from "../../../api/teacher";
import { createConfirm } from "../../../api/confirm";

export default function CreateConfirm({
    isShowing, toggle, onSuccess, id
}) {
    const [status, setStatus] = useState({ status: "NONE" });
    const [isShowingTeachers, setIsShowingTeachers] = useState(false);
    const [teacherRes, setTeacherRes] = useState([]);
    const [teacherId, setTeacherId] = useState(id);
    const [note, setNote] = useState("");
    const { classId } = useParams();

    const doSearchTeacher = (key) => {
        searchTeacher(key).then(res =>
            setTeacherRes(res)
        );
    }

    useEffect(() => {
        if (isShowing === false) {
            setStatus({ status: "NONE" })
            setTeacherId(id)
        }
        if (isShowing === true) {
            doSearchTeacher(id);
        }
    }, [isShowing, id])

    useEffect(() => {
        if (teacherId.length !== 0 && note.length !== 0) {
            setStatus({ status: "NONE" })
        }
    }, [teacherId, note])

    const handleRequest = async () => {
        if (teacherId.length === 0 || note.length === 0) {
            setStatus({
                status: "FAILED",
                message: "Mã giáo viên hoặc ghi chú bị bỏ trống."
            });
            return;
        }
        createConfirm(classId, teacherId, note, "COMPONENTS_POINT").then(res => {
            if (res.status === "SUCCESS") {
                setStatus({ status: "SUCCESS" })
                onSuccess(res.data)
            } else {
                setStatus({
                    status: "FAILED",
                    message: "Cập nhật thất bại."
                })
            }
        })
    }

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
                        <div>
                            <p className="mt-4">Mã giảng viên</p>
                            <input type="text" className="text-gray-600 block rounded-lg w-full border outline-none border-gray-400 px-2.5 py-1.5 focus:border-red-normal mt-1"
                                placeholder="T00234" value={teacherId}
                                onChange={e => {
                                    doSearchTeacher(e.target.value);
                                    setTeacherId(e.target.value);
                                }}
                                onFocus={() => setIsShowingTeachers(true)}
                                onBlur={() => setIsShowingTeachers(false)} />

                            {isShowingTeachers && teacherRes.data && teacherRes.data.length !== 0 && (
                                <div className='mt-0.5 bg-white absolute shadow-lg rounded w-[318px] border border-gray-300'>
                                    {teacherRes.data.map((value, index) => (
                                        <div key={value.id}>
                                            <button className='text-start hover:bg-gray-200 w-[100%]'
                                                onMouseDown={() => {
                                                    setTeacherId(value.id);
                                                    setTeacherRes({
                                                        ...teacherRes,
                                                        data: teacherRes.data.filter(v =>
                                                            v.id === value.id
                                                        )
                                                    })
                                                }}>
                                                <p className='py-1 px-2'>{value.id} - {value.name}</p>
                                            </button>
                                            {index !== teacherRes.data.length - 1 && <hr className="mx-4" />}
                                        </div>

                                    ))}
                                </div>
                            )}

                            <p className="mt-3">Chú thích</p>
                            <textarea rows={3} type="text" className="text-gray-600 block rounded-lg w-full border outline-none border-gray-400 px-2.5 py-1.5 focus:border-red-normal mt-1 resize-none"
                                placeholder="Xin phê duyệt bảng điểm" value={note} onChange={e => setNote(e.target.value)} />
                        </div>
                        <button className="w-full bg-red-normal hover:bg-red-dark text-white font-semibold py-2 rounded-lg mt-6"
                            onClick={handleRequest}>Lưu</button>

                        {status.status === "FAILED" ? (
                            <p className="text-red-500 font-semibold mt-3">{status.message}</p>
                        ) : (<p className="mt-6" />)}
                    </div>
                </div>
            </div>, document.body
        )
    };
}