import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getRooms } from "../../../api/room";
import { Td, Th } from "../../../common/table";
import { strTime } from "../../../ultils/time";
import useModal from "../../common/Modal/use";
import CreateRoom from "./CreateRoom";

export function ListRoom() {
    const [roomsRes, setRoomsRes] = useState({ status: "NONE" });
    const { isShowing, toggle } = useModal();
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
                <Link className="inline text-gray-600 font-semibold mx-4 hover:text-red-dark"
                    onClick={toggle}>Thêm phòng</Link>
            </div>
            <hr />

            {roomsRes.status === "SUCCESS" && roomsRes.data.length >0 && (
                <table className="mt-6 w-[100%]">
                    <thead>
                        <tr>
                            <Th>STT</Th>
                            <Th>Mã môn học</Th>
                            <Th>Tên môn học</Th>
                            <Th>Mã giảng viên</Th>
                            <Th>Tên giảng viên</Th>
                            <Th>Năm học</Th>
                            <Th>Kỳ học</Th>
                            <Th>Tên phòng</Th>
                            <Th>Thời gian bắt đầu</Th>
                            <Th>Thời gian làm</Th>
                            <Th></Th>
                        </tr>
                    </thead>
                    <tbody>
                        {roomsRes.data.map((value, index) => {
                            return (
                                <tr key={value.id}>
                                    <Td>{index + 1}</Td>
                                    <Td>{value.subject.id}</Td>
                                    <Td>{value.subject.name}</Td>
                                    <Td>{value.teacher.id}</Td>
                                    <Td>{value.teacher.name}</Td>
                                    <Td>{value.year}-{value.year + 1}</Td>
                                    <Td>{value.semester}</Td>
                                    <Td>{value.roomName}</Td>
                                    <Td>{strTime(value.timeStart)}</Td>
                                    <Td>{value.duration}</Td>
                                    <Td><Link className="text-blue-600 hover:text-blue-600 hover:underline" to={`${value.id}`}>Chi tiết</Link></Td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
            <CreateRoom
                isShowing={isShowing} toggle={toggle}
                onSuccess={data => {
                    setRoomsRes({
                        ...roomsRes,
                        data: [data, ...roomsRes.data]
                    });
                }} />
        </>
    );

}