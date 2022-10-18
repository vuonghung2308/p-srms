import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getRooms } from "../../../api/room";
import { Td, Th } from "../../../common/table";

export function ListRoom() {
    const [roomsRes, setRoomsRes] = useState({ status: "NONE" });
    const shouldFetch = useRef(true);
    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            getRooms().then(res =>
                setRoomsRes(res)
            );
        }
    }, [])

    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Danh sách phòng thi</p>
            </div>
            <hr />
            {roomsRes.status === "SUCCESS" && roomsRes.data.length > 0 && (
                <table className="mt-6">
                    <thead>
                        <tr>
                            <Th>Mã môn học</Th>
                            <Th>Năm học</Th>
                            <Th>Kỳ học</Th>
                            <Th>Tên phòng</Th>
                            <Th>Thời gian bắt đầu</Th>
                            <Th>Thời gian làm</Th>
                            <Th></Th>
                        </tr>
                    </thead>
                    <tbody>
                        {roomsRes.data.map(value => {
                            return (
                                <tr key={value.id}>
                                    <Td>{value.subjectId}</Td>
                                    <Td>{value.year}-{value.year + 1}</Td>
                                    <Td>{value.semester}</Td>
                                    <Td>{value.roomName}</Td>
                                    <Td>{new Date(value.timeStart * 1000).toLocaleString()}</Td>
                                    <Td>{value.duration}</Td>
                                    <Td><Link className="text-blue-600 hover:text-blue-600 hover:underline" to={`${value.id}`}>Chi tiết</Link></Td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </>
    );
}