import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { addExam } from "../../../api/room";
import { searchStudent } from "../../../api/student";
import ReactDOM from 'react-dom';

export default function AddExam({ isShowing, toggle, onSuccess }) {
    const [status, setStatus] = useState({ status: "NONE" });
    const [studentId, setStudentId] = useState('');
    const [isShowingStudents, setIsShowingStudent] = useState(false);
    const [studentRes, setStudentRes] = useState([]);
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

    const { roomId } = useParams();
    const handleAddExam = async () => {
        addExam(roomId, studentId).then(res => {
            if (res.status === "SUCCESS") {
                onSuccess(res.data);
                setStatus({
                    status: "SUCCESS",
                    examCode: res.data.code
                });
                setTimeout(() => {
                    setStatus({ status: "NONE" });
                }, 2000);
            } else {
                setStatus({
                    status: "FAILED",
                    message: "Sinh viên đã có trong danh sách phòng thi."
                });
                setTimeout(() => {
                    setStatus({ status: "NONE" })
                }, 2000);
            }
            doSearchStudent('');
            setStudentId('');
        });
    }

    if (isShowing) {
        return ReactDOM.createPortal(
            <div className='block fixed top-0 left-0 w-[100%] h-[100%] bg-[rgba(0,0,0,0.2)] pt-[100px] text-gray-700'>
                <div className={`bg-[#fefefe] w-[400px] mx-auto py-4 px-6 border rounded-xl shadow-2xl`}>
                    <div className="my-4 mx-4">
                        <div className="flex">
                            <p className="font-semibold text-xl text-gray-600">Thêm sinh viên</p>
                            <button className="ml-auto h-6 w-6 hover:text-red-dark rounded-[50%] bg-gray-100"
                                onClick={() => {
                                    toggle()
                                }}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>
                        <p className="mr-4 mt-3">Mã sinh viên:</p>
                        <div className="w-full mt-1">
                            <input value={studentId}
                                onChange={e => {
                                    doSearchStudent(e.target.value);
                                    setStudentId(e.target.value);
                                }}
                                placeholder="B18DCCN261"
                                onFocus={() => setIsShowingStudent(true)}
                                onBlur={() => setIsShowingStudent(false)}
                                className=" text-gray-700 rounded-lg w-full border outline-none border-gray-400 px-2.5 py-1 focus:border-red-normal" />
                            {isShowingStudents && (
                                <div className='mt-0.5 bg-white absolute shadow-xl rounded-lg w-[318px] border'>
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
                        <p className="mt-2.5">Chú thích</p>
                        <textarea rows={3} type="text" className="text-gray-600 block rounded-lg w-full border outline-none border-gray-400 px-2.5 py-1.5 focus:border-red-normal mt-1 resize-none"
                            placeholder="Chú thích thêm" value={''} onChange={e => console.log(e.target.value)} />
                        {status.status === "FAILED" ? (
                            <p className="text-sm text-red-500 font-semibold mt-1 ml-1">
                                {status.message}
                            </p>
                        ) : (<p className="mt-1" />)}

                        <div className="block text-end">
                            <button className="mr-4 text-gray-600 border border-gray-300 hover:border-red-dark hover:text-red-dark font-semibold py-2 px-4 rounded-lg mt-5"
                                onClick={toggle}>Hủy</button>
                            <button className="text-white bg-red-normal hover:bg-red-dark font-semibold py-2 px-4 rounded-lg mt-5"
                                onClick={handleAddExam}>Tiếp tục</button>
                        </div>
                    </div>
                </div>
            </div>, document.body
        )
    }
}