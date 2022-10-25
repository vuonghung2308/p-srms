import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { changePassword } from '../../../api/account';

const Password = ({ isShowing, toggle, onSuccess }) => {
    const [status, setStatus] = useState({ status: "NONE" });
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [conPassword, setConPassword] = useState("")

    useEffect(() => {
        setOldPassword("")
        setNewPassword("")
        setConPassword("")
    }, [])

    useEffect(() => {
        if (oldPassword.length !== 0) {
            setStatus({ status: "NONE" })
        }
        if (conPassword !== newPassword) {
            setStatus({
                status: "FAILED",
                message: "Mật khẩu mới không khớp"
            })
        } else setStatus({ status: "NONE" })
    }, [oldPassword, newPassword, conPassword])


    const handleChangePassword = async () => {
        if (oldPassword.length === 0) {
            setStatus({
                status: "FAILED",
                message: "Mật khẩu cũ không được bỏ trống."
            })
            return
        }
        const result = await changePassword(oldPassword, newPassword);
        if (result.status === "FAILED") {
            if (result.error.param === "oldPassword") {
                setStatus({
                    status: "FAILED",
                    message: "Mật khẩu cũ không chính xác."
                })
            } else {
                setStatus({
                    status: "FAILED",
                    message: "Có lỗi, vui lòng thử lại sau."
                })
            }
        } else {
            onSuccess()
            setOldPassword("")
            setNewPassword("")
            setConPassword("")
        }
    }

    if (isShowing) {
        return ReactDOM.createPortal(
            <>
                <div className='block fixed top-0 left-0 w-[100%] h-[100%] bg-[rgba(0,0,0,0.2)] pt-[100px] text-gray-700'>
                    <div className={`bg-[#fefefe] w-[400px] mx-auto py-4 px-6 border rounded-xl shadow-2xl`}>
                        <div className="my-4 mx-4">
                            <div className="flex">
                                <p className="font-semibold text-xl text-gray-600">Đổi mật khẩu</p>
                                <button className="ml-auto h-6 w-6 hover:text-red-dark rounded-[50%] bg-gray-100"
                                    onClick={() => toggle()}>
                                    <i className="fa-solid fa-xmark" />
                                </button>
                            </div>
                            <div>
                                <p className="mt-4">Mật khẩu hiện tại</p>
                                <input type="password" className="text-gray-600 block rounded-lg w-full border outline-none border-gray-400 px-2.5 py-1.5 focus:border-red-normal mt-1"
                                    placeholder="Nhập mật khẩu cũ" value={oldPassword} onChange={e => setOldPassword(text => e.target.value)} />

                                <p className="mt-3">Mật khẩu mới</p>
                                <input type="password" className="text-gray-600 block rounded-lg w-full border outline-none border-gray-400 px-2.5 py-1.5 focus:border-red-normal mt-1"
                                    placeholder="Nhập mật khẩu mới" value={newPassword} onChange={e => setNewPassword(e.target.value)} />

                                <p className="mt-3">Xác nhận mật khẩu mới</p>
                                <input type="password" className="text-gray-600 block rounded-lg w-full border outline-none border-gray-400 px-2.5 py-1.5 focus:border-red-normal mt-1"
                                    placeholder="Nhập lại mật khẩu mới" value={conPassword} onChange={e => setConPassword(e.target.value)} />
                            </div>
                            <button className="w-full bg-red-normal hover:bg-red-dark text-white font-semibold py-2 rounded-lg mt-6"
                                onClick={handleChangePassword}>Lưu</button>

                            {status.status === "SUCCESS" ? (
                                <p className="text-green-600 font-semibold mt-3">Thêm sinh viên thành công</p>
                            ) : status.status === "FAILED" ? (
                                <p className="text-red-500 font-semibold mt-3">{status.message}</p>
                            ) : (<p className="mt-6" />)}
                            {/* <div className='mp-6 '/> */}
                        </div>
                    </div>
                </div>
            </>, document.body
        )
    };
}

export default Password;