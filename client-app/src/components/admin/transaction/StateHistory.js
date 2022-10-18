import { useState } from "react";
import { getHistory } from "../../../api/transaction";
import { format } from "../../../ultils/time";

export default function StateHistory() {
    const [history, setHistory] = useState(null);
    const [key, setKey] = useState('');
    const [status, setStatus] = useState({ status: "NONE" });
    const handleSearch = () => {
        getHistory(key).then((res) => {
            if (res.status === "SUCCESS") {
                setHistory(res.data);
                setStatus({ status: "SUCCESS" });
            } else {
                setStatus({
                    status: "FAILED",
                    message: "Không tìm thấy giao dịch"
                });
            }
            setKey('')
        });
    }
    let content = <></>;
    if (history) {
        content = (
            <>
                <p className="font-semibold text-lg mb-1">DANH SÁCH CÁC GIAO DỊCH</p><div />
                {history.map((value, index) => (
                    <div key={index}>
                        <span className="font-semibold">Mã giao dịch: {' '}</span>
                        <span>{value.txId}</span>
                        <div className="mt-1" />
                        <span className="font-semibold">Mã người tạo:{' '}</span>
                        <span>{value.creator}</span>
                        <span className="ml-4 font-semibold">Thời gian tạo: {' '}</span>
                        <span>{format(value.timestamp)}</span>
                        <span className="font-semibold ml-4">Loại:{' '}</span>
                        <span>{value.isDelete ? 'Xóa' : 'Cập nhật'}</span>
                        <div className="mb-1" />
                        <span className="font-semibold">Giá trị:{' '}</span>
                        <pre className="ml-4">{JSON.stringify(value.value, undefined, 2)}</pre>
                        <hr className="my-4" />
                    </div>
                ))}
            </>
        );
    }
    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Tra cứu lịch sử</p>
                <div className="inline ml-6">
                    <span className="font-semibold">Khóa:</span>
                    <span className="ml-4" />
                    <input className="px-2 py-[1px] border border-gray-400 rounded bg-gray-50 focus:outline-none focus:border-red-normal"
                        value={key} onChange={e => setKey(e.target.value)} />
                    <span className="ml-4" />
                    <button className="bg-red-normal hover:bg-red-dark text-white px-6 py-0.5 rounded font-semibold"
                        onClick={handleSearch}>Tìm</button>
                    <hr className="mt-4" />
                </div>
            </div>
            {content}
            {status.status === "FAILED" && (
                <p className="text-lg">{status.message}</p>
            )}
        </>
    )
}