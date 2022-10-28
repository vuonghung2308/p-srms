import { useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import { cancelConfirm } from "../../../api/confirm";
import { strTime } from "../../../ultils/time"

export default function CancelConfirm({
    isShowing, toggle, onSuccess, confirm
}) {
    const [status, setStatus] = useState({ status: "NONE" });
    const [note, setNote] = useState("");

    useEffect(() => {
        if (note.length !== 0 || !isShowing) {
            setStatus({ status: "NONE" });
        }
    }, [note, isShowing])

    const handleConfirmCancelation = async () => {
        if (note.length === 0) {
            setStatus({
                status: "FAILED",
                message: "Ghi chú không được bỏ trống."
            })
            return;
        }
        cancelConfirm(confirm.id, note).then(res => {
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
                            <p className="mx-1 font-semibold text-xl text-gray-600">Hủy yêu cầu xác nhận</p>
                            <button className="ml-auto h-6 w-6 hover:text-red-dark rounded-[50%] bg-gray-100"
                                onClick={() => {
                                    toggle()
                                }}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>
                        <div className="mt-4 mx-1">
                            <p className="mt-1">GV xác nhận: {confirm.censor1.id} - {confirm.censor1.name}</p>
                            <p className="mt-1">Ngày yêu cầu: {strTime(confirm.time)}</p>
                            <p className="mt-1">Ghi chú: {confirm.note}</p>
                        </div>

                        <textarea rows={3} type="text" className="text-gray-600 block rounded-lg w-full border outline-none border-gray-400 px-2.5 py-1.5 focus:border-red-normal mt-4 resize-none"
                            placeholder="Ghi chú (lý do hủy)" value={note} onChange={e => setNote(e.target.value)} />

                        <button className="w-full text-gray-600 border border-gray-300 hover:border-red-dark hover:text-red-dark font-semibold py-2 px-6 rounded-lg mt-5"
                            onClick={handleConfirmCancelation}>Xác nhận</button>

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