import { useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import { acceptConfirm, rejectConfirm } from "../../../api/confirm";
import { strTime } from "../../../ultils/time"

export default function HandleConfirm({
    isShowing, toggle, onSuccess, confirm
}) {
    const [status, setStatus] = useState({ status: "NONE" });
    const [note, setNote] = useState("");

    useEffect(() => {
        if (note.length !== 0 || !isShowing) {
            setStatus({ status: "NONE" });
        }
    }, [note, isShowing])

    const isNoteEmpty = () => {
        if (note.length === 0) {
            setStatus({
                status: "FAILED",
                message: "Ghi chú không được bỏ trống."
            })
            return true;
        }
        return false;
    }

    const handleConfirmRejection = async () => {
        if (isNoteEmpty()) return;
        rejectConfirm(confirm.id, note).then(res => {
            if (res.status === "SUCCESS") {
                onSuccess(res.data);
            } else {
                setStatus(res.data);
            }
        })
    }

    const handleConfirmAcception = async () => {
        if (isNoteEmpty()) return;
        acceptConfirm(confirm.id, note).then(res => {
            if (res.status === "SUCCESS") {
                onSuccess(res.data);
            } else {
                setStatus(res.data);
            }
        })
    }

    if (isShowing) {
        return ReactDOM.createPortal(
            <div className='block fixed top-0 left-0 w-[100%] h-[100%] bg-[rgba(0,0,0,0.2)] pt-[100px] text-gray-700'>
                <div className={`bg-[#fefefe] w-[400px] mx-auto py-4 px-6 border rounded-xl shadow-2xl`}>
                    <div className="my-4 mx-4">
                        <div className="flex">
                            <p className="mx-1 font-semibold text-xl text-gray-600">Duyệt bảng điểm</p>
                            <button className="ml-auto h-6 w-6 hover:text-red-dark rounded-[50%] bg-gray-100"
                                onClick={() => {
                                    toggle()
                                }}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>
                        <div className="mt-4 mx-1">
                            <p className="mt-1">GV yêu cầu: {confirm.censor1.id} - {confirm.censor1.name}</p>
                            <p className="mt-1">Ngày yêu cầu: {strTime(confirm.time)}</p>
                            <p className="mt-1">Ghi chú: {confirm.note}</p>
                        </div>

                        <textarea rows={3} type="text" className="text-gray-600 block rounded-lg w-full border outline-none border-gray-400 px-2.5 py-1.5 focus:border-red-normal mt-4 resize-none"
                            placeholder="Chú thích thêm" value={note} onChange={e => setNote(e.target.value)} />

                        {status.status === "FAILED" && (
                            <p className="text-red-500 font-semibold mt-2 ml-1 -mb-2">
                                {status.message}
                            </p>
                        )}

                        <div className="block text-end mt-4">
                            <button className="mr-4 text-gray-600 border border-gray-300 hover:border-red-dark hover:text-red-dark font-semibold py-2 px-4 rounded-lg"
                                onClick={handleConfirmRejection}>Từ chối</button>
                            <button className="text-white bg-red-normal hover:bg-red-dark font-semibold py-2 px-4 rounded-lg"
                                onClick={handleConfirmAcception}>Xác nhận</button>
                        </div>

                    </div>
                </div>
            </div>, document.body
        )
    };
}