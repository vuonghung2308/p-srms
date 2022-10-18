import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { addStudent } from "../../../api/class";
import { searchStudent } from "../../../api/student";
import Modal from "../../common/Modal";

export default function AddStudent({ isShowing, toggle, onSuccess }) {
    const [status, setStatus] = useState({ status: "NONE" });
    const [isShowingStudents, setIsShowingStudent] = useState(false);
    const [studentRes, setStudentRes] = useState([]);
    const [studentId, setStudentId] = useState('');
    const { classId } = useParams();
    let shouldFetch = useRef(true);

    const doSearchStudent = (key) => {
        searchStudent(key).then(res =>
            setStudentRes(res)
        );
    }

    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            doSearchStudent('');
        }
    }, []);
    const handleAddStudent = async () => {
        const data = await addStudent(studentId, classId);
        if (data.status === "SUCCESS") {
            onSuccess(data.data);
            setStatus({ status: "SUCCESS" });
            setTimeout(() => {
                setStatus({ status: "NONE" })
            }, 2000);
        } else {
            setStatus({
                status: "FAILED",
                message: "Sinh viên đã có trong danh sách lớp."
            });
            setTimeout(() => {
                setStatus({ status: "NONE" })
            }, 2000);
        }
        doSearchStudent('');
        setStudentId('');
    }
    const modal = (
        <Modal isShowing={isShowing}>
            <div className="mb-4">
                <div className="flex">
                    <p className="font-semibold text-xl text-gray-600">Thêm sinh viên</p>
                    <button className="ml-auto h-6 w-6 hover:text-red-dark rounded-[50%] bg-gray-100"
                        onClick={() => toggle()}>
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>
                <div className="mt-6 flex">
                    <p className="mr-4 my-auto">Mã sinh viên:</p>
                    <div className="w-fit">
                        <input value={studentId}
                            onChange={e => {
                                doSearchStudent(e.target.value);
                                setStudentId(e.target.value);
                            }}
                            onFocus={() => setIsShowingStudent(true)}
                            onBlur={() => setIsShowingStudent(false)}
                            className="text-gray-700 rounded w-full border outline-none border-gray-400 px-2.5 py-0.5 focus:border-red-normal" />
                        {isShowingStudents && (
                            <div className='mt-0.5 bg-white absolute shadow-2xl rounded w-[204px] border'>
                                {studentRes.data.map((value, index) => (
                                    <div key={value.id}>
                                        <button className='text-start hover:bg-gray-200 w-[100%]'
                                            onMouseDown={() => {
                                                setStudentId(value.id);
                                                setStudentRes({
                                                    ...studentRes,
                                                    data: studentRes.data.filter(v =>
                                                        v.id === value.id
                                                    )
                                                })
                                            }}>
                                            <p className='py-1 px-2'>{value.id} - {value.name}</p>
                                        </button>
                                        {index !== studentRes.data.length - 1 && <hr />}
                                    </div>

                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        className="ml-auto my-auto text-white font-semibold bg-red-normal hover:bg-red-dark px-4 py-1 rounded-lg"
                        onClick={handleAddStudent}>Thêm</button>
                </div>

                {status.status === "SUCCESS" ? (
                    <p className="text-green-600 font-semibold mt-5">Thêm sinh viên thành công</p>
                ) : status.status === "FAILED" ? (
                    <p className="text-red-500 font-semibold mt-5">{status.message}</p>
                ) : (<p className="mt-3" />)}
            </div>
        </Modal>
    );
    return (<>{modal}</>);
}