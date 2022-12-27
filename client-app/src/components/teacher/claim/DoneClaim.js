import { useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import { doneClaim } from "../../../api/claim";

export default function DoneClaim({
    isShowing, toggle, onSuccess, claimId, point
}) {
    const [status, setStatus] = useState({ status: "NONE" });
    const [note, setNote] = useState("");
    const [aPoint, setAPoint] = useState()
    const [ePoint, setEPoint] = useState()
    const [mPoint, setMPoint] = useState()
    const [pPoint, setPPoint] = useState()


    useEffect(() => {
        if (note.length !== 0 || !isShowing) {
            setStatus({ status: "NONE" })
        }
        if (!isShowing) {
            setAPoint(point.attendancePoint);
            setEPoint(point.exercisePoint);
            setMPoint(point.midtermExamPoint);
            setPPoint(point.practicePoint);
            setNote("")
        }
    }, [note, isShowing, point])

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

    const handleRequest = async () => {
        if (isNoteEmpty()) return;
        const _aPoint = aPoint ? aPoint : undefined;
        const _pPoint = pPoint ? pPoint : undefined;
        const _mPoint = mPoint ? mPoint : undefined;
        const _ePoint = ePoint ? ePoint : undefined;
        doneClaim(
            claimId, note, undefined,
            _aPoint, _pPoint, _mPoint, _ePoint
        ).then(res => {
            if (res.status === "SUCCESS") {
                onSuccess(res.data);
            } else {
                setStatus(res.data);
            }
        });
    }

    if (isShowing) {
        return ReactDOM.createPortal(
            <div className='block fixed top-0 left-0 w-[100%] h-[100%] bg-[rgba(0,0,0,0.2)] pt-[100px] text-gray-700'>
                <div className={`bg-[#fefefe] w-[400px] mx-auto py-4 px-6 border rounded-xl shadow-2xl`}>
                    <div className="my-4 mx-4">
                        <div className="flex">
                            <p className="font-semibold text-xl text-gray-600">Xử lý yêu cầu</p>
                            <button className="ml-auto h-6 w-6 hover:text-red-dark rounded-[50%] bg-gray-100"
                                onClick={() => { toggle() }}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <div className="mt-4 flex">
                            <div className="flex-1">
                                <div>
                                    <p className="w-20 inline-block">Điểm CC: </p>
                                    <input className="h-5 w-12 text-center border-b border-b-gray-400 outline-none focus:border-b-red-dark"
                                        value={aPoint} onChange={e => setAPoint(e.target.value)} />
                                </div>
                                <div className="mt-1">
                                    <p className="w-20 inline-block">Điểm BT: </p>
                                    <input className="h-5 w-12 text-center border-b border-b-gray-400 outline-none focus:border-b-red-dark"
                                        value={ePoint} onChange={e => setEPoint(e.target.value)} />
                                </div>
                            </div>
                            <div className="flex-1 ml-2">
                                <div>
                                    <p className="w-20 inline-block">Điểm TH: </p>
                                    <input className="h-5 w-12 text-center border-b border-b-gray-400 outline-none focus:border-b-red-dark"
                                        value={pPoint} onChange={e => setPPoint(e.target.value)} />
                                </div>
                                <div className="mt-1">
                                    <p className="w-20 inline-block">Điểm KT: </p>
                                    <input className="h-5 w-12 text-center border-b border-b-gray-400 outline-none focus:border-b-red-dark"
                                        value={mPoint} onChange={e => setMPoint(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <textarea rows={3} type="text" className="text-gray-600 block rounded-lg w-full border outline-none border-gray-400 px-2.5 py-1.5 focus:border-red-normal mt-6 resize-none"
                            placeholder="Ghi chú thêm" value={note} onChange={e => setNote(e.target.value)} />
                        {status.status === "FAILED" ? (
                            <p className="text-sm text-red-500 font-semibold mt-1 ml-1">
                                {status.message}
                            </p>
                        ) : (<p className="mt-1" />)}

                        <div className="block text-end">
                            <button className="mr-4 text-gray-600 border border-gray-300 hover:border-red-dark hover:text-red-dark font-semibold py-2 px-4 rounded-lg mt-5"
                                onClick={toggle}>Hủy</button>
                            <button className="text-white bg-red-normal hover:bg-red-dark font-semibold py-2 px-4 rounded-lg mt-5"
                                onClick={handleRequest}>Tiếp tục</button>
                        </div>
                    </div>
                </div>
            </div>, document.body
        )
    };
}