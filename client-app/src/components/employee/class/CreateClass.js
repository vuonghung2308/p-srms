import { useEffect, useRef, useState } from "react";
import { createClass } from "../../../api/class";
import { searchSubject } from "../../../api/subject";
import { searchTeacher } from "../../../api/teacher";
import Modal from "../../common/Modal";

const CreateClass = ({ isShowing, toggle, onSuccess }) => {
    const [classId, setClassId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [semester, setSemester] = useState('I');
    const [status, setStatus] = useState({ status: "NONE" });
    const [year, setYear] = useState(new Date().getFullYear());
    const [isShowingSubjects, setIsShowingSubject] = useState(false);
    const [isShowingTeachers, setIsShowingTeacher] = useState(false);
    const [subjectRes, setSubjectRes] = useState([]);
    const [teacherRes, setTeacherRes] = useState([]);
    let shouldFetch = useRef(true);

    const doSearchSubject = (key) => {
        searchSubject(key).then(res =>
            setSubjectRes(res)
        );
    }

    const doSearchTeacher = (key) => {
        searchTeacher(key).then(res =>
            setTeacherRes(res)
        );
    }

    useEffect(() => {
        if (shouldFetch.current) {
            shouldFetch.current = false;
            doSearchSubject('');
            doSearchTeacher('');
        }
    }, []);

    const handleAddClass = () => {
        createClass(
            classId, subjectId, year,
            semester, teacherId
        ).then(response => {
            if (response.status === "SUCCESS") {
                onSuccess(response.data);
                setStatus({ status: "SUCCESS" });
                setTimeout(() => {
                    setStatus({ status: "NONE" })
                }, 2000)
            } else {
                setStatus({
                    status: "FAILED",
                    message: "Mã lớp đã tồn tại."
                });
                setTimeout(() => {
                    setStatus({ status: "NONE" })
                }, 2000)
            }
        })
    }
    const modal = (
        <Modal isShowing={isShowing}>
            <div className="flex">
                <p className="font-semibold text-xl text-gray-600">Thêm lớp học</p>
                <button className="ml-auto h-6 w-6 hover:text-red-dark rounded-[50%] bg-gray-100"
                    onClick={() => toggle()}>
                    <i className="fa-solid fa-xmark" />
                </button>
            </div>

            <div className="mt-6">
                <div className="float-left w-[48%]">
                    <div className="flex">
                        <p className="my-auto">Mã lớp:</p>
                        <input
                            className=" ml-auto text-gray-700 rounded-lg border outline-none border-gray-400 px-2.5 py-1 focus:border-red-normal"
                            value={classId} onChange={e =>
                                setClassId(e.target.value)
                            } />
                    </div>

                    <div className="flex mt-3" >
                        <p className="my-auto">Mã giáo viên:</p>
                        <div className="ml-auto">
                            <input
                                value={teacherId} onChange={e => {
                                    doSearchTeacher(e.target.value);
                                    setTeacherId(e.target.value);
                                }}
                                onFocus={() => setIsShowingTeacher(true)}
                                onBlur={() => setIsShowingTeacher(false)}
                                className="text-gray-700 rounded-lg w-full border outline-none border-gray-400 px-2.5 py-1 focus:border-red-normal" />
                            {isShowingTeachers && (
                                <div className='mt-0.5 bg-white absolute shadow-lg rounded-lg w-[204px] border'>
                                    {teacherRes.data.map((value, index) => (
                                        <div key={value.id}>
                                            <button className='text-start hover:bg-gray-200 w-[100%]'
                                                onMouseDown={() => {
                                                    setTeacherId(value.id);
                                                    setTeacherRes({
                                                        ...teacherRes,
                                                        data: teacherRes.data.filter(v =>
                                                            v.id === value.id
                                                        )
                                                    })
                                                }}>
                                                <p className='py-1 px-2'>{value.id} - {value.name}</p>
                                            </button>
                                            {index !== teacherRes.data.length - 1 && <hr />}
                                        </div>

                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="float-right w-[48%]">
                    <div className="flex">
                        <p className="my-auto">Mã môn học:</p>
                        <div className="ml-auto">
                            <input value={subjectId}
                                onChange={e => {
                                    doSearchSubject(e.target.value);
                                    setSubjectId(e.target.value);
                                }}
                                onFocus={() => setIsShowingSubject(true)}
                                onBlur={() => setIsShowingSubject(false)}
                                className="text-gray-700 rounded-lg w-full border outline-none border-gray-400 px-2.5 py-1 focus:border-red-normal" />
                            {isShowingSubjects && (
                                <div className='mt-0.5 bg-white absolute shadow-lg rounded-lg w-[204px] border'>
                                    {subjectRes.data.map((value, index) => (
                                        <div key={value.id}>
                                            <button className='text-start hover:bg-gray-200 w-[100%]'
                                                onMouseDown={() => {
                                                    setSubjectId(value.id);
                                                    setSubjectRes({
                                                        ...subjectRes,
                                                        data: subjectRes.data.filter(v =>
                                                            v.id === value.id
                                                        )
                                                    })
                                                }}>
                                                <p className='py-1 px-2'>{value.id} - {value.name}</p>
                                            </button>
                                            {index !== subjectRes.data.length - 1 && <hr />}
                                        </div>

                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex mt-3">
                        <p className="my-auto">Năm học:</p>
                        <div className="ml-auto">
                            <input
                                type="number" value={year} onChange={e => setYear(e.target.value)}
                                className="w-20 text-gray-700 rounded-lg border outline-none border-gray-400 pl-2.5 py-1 focus:border-red-normal" />
                            <div className="w-20 inline-block ml-1.5 mr-9">{" - "}{year && (Number(year) + 1)}</div>
                        </div>
                    </div>
                </div>
                <div className="clear-both" />
                <div className="mt-3">
                    <span className="mr-12">Kỳ học:</span>
                    <select value={semester} onChange={e => setSemester(e.target.value)}
                        className="border rounded-lg px-2 py-1 ml-3 text-gray-700  outline-none border-gray-400  focus:border-red-normal">
                        <option value="I">I</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                        <option value="IV">IV</option>
                    </select>
                </div>
            </div>
            <div className="mt-4">
                <hr />
                {status.status === "SUCCESS" ? (
                    <p className="text-green-600 font-semibold mt-2">Thêm lớp thành công</p>
                ) : status.status === "FAILED" ? (
                    <p className="text-red-500 font-semibold mt-2">{status.message}</p>
                ) : (<p className="mt-2" />)}
                <div className="block text-end">
                    <button className="mr-4 text-gray-600 border border-gray-300 hover:border-red-dark hover:text-red-dark font-semibold py-2 px-4 rounded-lg mt-2"
                        onClick={toggle}>Hủy</button>
                    <button className="text-white bg-red-normal hover:bg-red-dark font-semibold py-2 px-4 rounded-lg mt-2"
                        onClick={handleAddClass}>Tiếp tục</button>
                </div>
            </div>
        </Modal>
    )
    return (<div >{modal}</div>);
}

export default CreateClass;