import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getRooms } from "../../../api/room";
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

            {roomsRes.status === "SUCCESS" && roomsRes.data.length > 0 && (
                <table className="mt-6 w-[100%]">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600">
                            <th className="border-4 border-white py-0.5">STT</th>
                            <th className="border-4 border-white">Mã môn học</th>
                            <th className="border-4 border-white">Tên môn học</th>
                            <th className="border-4 border-white">Năm học</th>
                            <th className="border-4 border-white">Kỳ học</th>
                            <th className="border-4 border-white">Tên phòng</th>
                            <th className="border-4 border-white">Thời gian bắt đầu</th>
                            <th className="border-4 border-white">Thời gian làm</th>
                            <th className="border-4 border-white"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {roomsRes.data.map((value, index) => {
                            return (
                                <tr className="border-b" key={value.id}>
                                    <td className="text-center py-0.5">{index + 1}</td>
                                    <td className="text-center">{value.subject.id}</td>
                                    <td className="pl-4">{value.subject.name}</td>
                                    <td className="text-center">{value.year}-{value.year + 1}</td>
                                    <td className="text-center">{value.semester}</td>
                                    <td className="text-center">{value.roomName}</td>
                                    <td className="text-center">{strTime(value.timeStart)}</td>
                                    <td className="text-center">{value.duration}</td>
                                    <td className="text-center">
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