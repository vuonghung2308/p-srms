import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getClaims } from "../../../api/claim";

export const ListClaim = () => {
    const shouldFetch = useRef(true);
    const [claimsRes, setClaimRes] = useState({ status: "NONE" });
    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getClaims().then(setClaimRes)
        }
    }, [])
    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Danh sách phúc khảo</p>
            </div>
            <hr />
            {claimsRes.data?.length > 0 && (
                <table className="mt-6 w-[100%]">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600">
                            <th className="border-4 border-white py-0.5">STT</th>
                            <th className="border-4 border-white">Mã sinh viên</th>
                            <th className="border-4 border-white">Tên sinh viên</th>
                            <th className="border-4 border-white">Mã Lớp</th>
                            <th className="border-4 border-white">Tên môn học</th>
                            <th className="border-4 border-white">Năm học</th>
                            <th className="border-4 border-white">Kỳ học</th>
                            <th className="border-4 border-white"></th>
                        </tr>
                    </thead>
                    <tbody>{claimsRes.data.map(Claim)}</tbody>
                </table>
            )}
        </>
    )
}

const Claim = (claim, index) => {
    return (
        <tr className="border-b">
            <td className="text-center py-0.5">{index + 1}</td>
            <td className="text-center">{claim.student.id}</td>
            <td className="pl-4">{claim.student.name}</td>
            <td className="text-center">{claim.class.id}</td>
            <td className="pl-4">{claim.class.subject.name}</td>
            <td className="text-center">{claim.class.year}-{claim.class.year + 1}</td>
            <td className="text-center">{claim.class.semester}</td>
            <td >
                <Link className="mx-auto w-fit flex font-semibold text-sm text-gray-500 hover:text-red-normal hover:border-red-normal rounded-lg border px-2"
                    to={`${claim.id}`}>
                    <p className="h-fit">Chi tiết</p>
                    <i className="fa-solid fa-caret-down my-auto ml-1" />
                </Link>
            </td>
        </tr>
    )
}