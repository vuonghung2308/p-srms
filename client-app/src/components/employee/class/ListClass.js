import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getClasses } from "../../../api/class";
import { Td, Th } from "../../../common/table";
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
                <table className="mt-6">
                    <thead>
                        <tr>
                            <Th>STT</Th>
                            <Th>Mã lớp</Th>
                            <Th>Mã môn học</Th>
                            <Th>Tên môn học</Th>
                            <Th>Số tín chỉ</Th>
                            <Th>Năm học</Th>
                            <Th>Kỳ học</Th>
                            <Th></Th>
                        </tr>
                    </thead>
                    <tbody>
                        {classesRes.data.map((value, index) => {
                            return (
                                <tr key={value.id}>
                                    <Td>{index + 1}</Td>
                                    <Td>{value.id}</Td>
                                    <Td>{value.subject.id}</Td>
                                    <Td>{value.subject.name}</Td>
                                    <Td>{value.subject.numberOfCredit}</Td>
                                    <Td>{value.year}-{value.year + 1}</Td>
                                    <Td>{value.semester}</Td>
                                    <Td><Link className="text-blue-600 hover:text-blue-600 hover:underline" to={`${value.id}`}>Chi tiết</Link></Td>
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