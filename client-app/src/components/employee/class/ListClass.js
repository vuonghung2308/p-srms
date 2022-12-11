import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getClasses } from "../../../api/class";
import useModal from "../../common/Modal/use";
import CreateClass from "./CreateClass";

export function ListClass() {
    const [classesRes, setClassesRes] = useState({ status: "NONE" });
    const { isShowing, toggle } = useModal();
    const shouldFetch = useRef(true);

    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getClasses().then(res =>
                setClassesRes(res)
            );
        }
    }, [])

    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Danh sách lớp học</p>
                <Link className="inline text-gray-600 font-semibold mx-4 hover:text-red-dark"
                    onClick={toggle}>Thêm lớp</Link>
            </div>
            <hr />

            {classesRes.status === "SUCCESS" && classesRes.data.length > 0 && (
                <table className="mt-6 w-[100%]">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600">
                            <th className="border-4 border-white py-0.5">STT</th>
                            <th className="border-4 border-white">Mã lớp</th>
                            <th className="border-4 border-white">Mã môn học</th>
                            <th className="border-4 border-white">Tên môn học</th>
                            <th className="border-4 border-white">Mã giảng viên</th>
                            <th className="border-4 border-white">Tên giảng viên</th>
                            <th className="border-4 border-white">Số tín chỉ</th>
                            <th className="border-4 border-white">Năm học</th>
                            <th className="border-4 border-white">Kỳ học</th>
                            <th className="border-4 border-white"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {classesRes.data.map((value, index) => {
                            return (
                                <tr className="border-b" key={value.id}>
                                    <td className="text-center py-0.5">{index + 1}</td>
                                    <td className="text-center">{value.id}</td>
                                    <td className="text-center">{value.subject.id}</td>
                                    <td className="pl-4">{value.subject.name}</td>
                                    <td className="text-center">{value.teacher.id}</td>
                                    <td className="pl-4">{value.teacher.name}</td>
                                    <td className="text-center">{value.subject.numberOfCredit}</td>
                                    <td className="text-center">{value.year}-{value.year + 1}</td>
                                    <td className="text-center">{value.semester}</td>
                                    <td >
                                        <Link className="mx-auto w-fit flex font-semibold text-sm text-gray-500 hover:text-red-normal hover:border-red-normal rounded-lg border px-2"
                                            to={`${value.id}`}>
                                            <p className="h-fit">Chi tiết</p>
                                            <i className="fa-solid fa-caret-down my-auto ml-1" />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
            <CreateClass
                isShowing={isShowing} toggle={toggle}
                onSuccess={(data) => {
                    setClassesRes({
                        ...classesRes,
                        data: [data, ...classesRes.data]
                    });
                }} />
        </>
    );
}