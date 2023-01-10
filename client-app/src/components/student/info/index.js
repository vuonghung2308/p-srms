import { useEffect, useRef, useState } from "react";
import { getInfo } from "../../../api/account";

export default function StudentInfo() {
    let shouldFetch = useRef(true);
    const [infoRes, setInforRes] = useState(
        { status: "NONE" }
    );

    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getInfo().then(res => {
                setInforRes(res);
            })
        }
    }, []);

    return (
        <>
            <p className="block text-gray-600 font-semibold text-[30px] my-4">Tài khoản của tôi</p>
            <hr />
            {infoRes.status === "SUCCESS" && (
                <>
                    <div className="flex">
                        <div className="flex-1">
                            <div className="mt-3">
                                <span className="font-semibold">Họ và tên: </span>
                                <span className="">{infoRes.data.name}</span>
                            </div>
                            <div className="mt-1">
                                <span className="font-semibold">Ngày sinh: </span>
                                <span className="">{new Date(infoRes.data.dateOfBirth * 1000).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-1">
                                <span className="font-semibold">Chuyên ngành: </span>
                                <span className="">{infoRes.data.major}</span>
                            </div>
                            <div className="mt-1">
                                <span className="font-semibold">Khoa: </span>
                                <span className="">{infoRes.data.faculty}</span>
                            </div>
                        </div>
                        <div className="flex-1 ml-10">
                            <div className="mt-3">
                                <span className="font-semibold">Lớp: </span>
                                <span className="">{infoRes.data.class}</span>
                            </div>
                            <div className="mt-1">
                                <span className="font-semibold">Địa chỉ: </span>
                                <span className="">{infoRes.data.address}</span>
                            </div>
                            <div className="mt-1">
                                <span className="font-semibold">Email: </span>
                                <span className="">{infoRes.data.email}</span>
                            </div>
                            <div className="mt-1">
                                <span className="font-semibold">Số điện thoại: </span>
                                <span className="">{infoRes.data.phone}</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}