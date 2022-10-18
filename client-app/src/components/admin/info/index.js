import { useEffect, useRef, useState } from "react";
import { getInfo } from "../../../api/account";

export default function AdminInfo() {
    const [infoRes, setInforRes] = useState({ status: "NONE" });
    const shouldFetch = useRef(true);

    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getInfo().then(res =>
                setInforRes(res)
            )
        }
    }, [])

    return (
        <>
            <p className="block text-gray-600 font-semibold text-[30px] my-4">Tài khoản của tôi</p>
            <hr />
            {infoRes.status === "SUCCESS" && (
                <>
                    <div className="mt-2">
                        <span>Họ và tên: </span>
                        <span className="ml-1">{infoRes.data.name}</span>
                    </div>
                    <div className="mt-1">
                        <span>Địa chỉ:</span>
                        <span className="ml-1">{infoRes.data.address}</span>
                    </div>
                </>
            )}
        </>
    )
}