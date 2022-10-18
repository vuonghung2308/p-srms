import { useState } from "react";
import { getTxDetail } from "../../../api/transaction";
import { format } from "../../../ultils/time";

export default function TransactionDetail() {
    const [detail, setDetail] = useState(null);
    const [txId, setTxId] = useState('');
    const [status, setStatus] = useState({ status: "NONE" });
    const handleSearch = () => {
        setStatus({ status: "NONE" });
        getTxDetail(txId).then(res => {
            if (res.status === "SUCCESS") {
                setDetail(res.data);
                setStatus({ status: "SUCCESS" });
            } else {
                setStatus({
                    status: "FAILED",
                    message: "Không tìm thấy giao dịch"
                });
            }
            setTxId('')
        });
    }
    let content = <></>;
    if (detail) {
        content = (
            <>
                <div >
                    <p className="font-semibold text-lg mb-1">THÔNG TIN GIAO DỊCH</p><div />
                    <span className="font-semibold">Mã giao dịch: {' '}</span>
                    <span>{detail.txId}</span>
                    <div className="mt-1" />
                    <span className="font-semibold">Mã người tạo:{' '}</span>
                    <span>{detail.creator}</span>
                    <span className="ml-4 font-semibold">Thời gian tạo: {' '}</span>
                    <span>{format(detail.timestamp)}</span>
                </div>
                <div className="mt-4">
                    <p className="font-semibold text-lg mb-1">DANH SÁCH CÁC HÀNH ĐỘNG</p>
                    {detail.values.map((value, index) => (
                        <div key={index}>
                            <span className="font-semibold">Loại:{' '}</span>
                            <span>{value.isDelete ? 'Xóa' : 'Cập nhật'}</span>
                            <span className="ml-4 font-semibold">Khóa:{' '}</span>
                            <span>{value.key}</span>
                            <div className="mb-1" />
                            <span className="font-semibold">Giá trị:{' '}</span>
                            <pre className="ml-4">{JSON.stringify(value.value, undefined, 2)}</pre>
                            <hr className="my-4" />
                        </div>
                    ))}
                </div>
            </>
        );
    }
    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Tra cứu giao dịch</p>
                <div className="inline ml-6">
                    <span className="font-semibold">Mã giao dịch:</span>
                    <span className="ml-4" />
                    <input className="px-2 py-[1px] border border-gray-400 rounded bg-gray-50 focus:outline-none focus:border-red-normal"
                        value={txId} onChange={e => setTxId(e.target.value)} />
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