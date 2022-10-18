import { useState } from 'react';
import ReactDOM from 'react-dom';

const Password = ({ isShowing, toggle, onSuccess }) => {
    const [status] = useState({ status: "NONE" });

    const handleChangePassword = async () => {
        onSuccess()
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
                                    placeholder="Nhập mật khẩu cũ" />

                                <p className="mt-3">Mật khẩu mới</p>
                                <input type="password" className="text-gray-600 block rounded-lg w-full border outline-none border-gray-400 px-2.5 py-1.5 focus:border-red-normal mt-1"
                                    placeholder="Nhập mật khẩu mới" />

                                <p className="mt-3">Xác nhận mật khẩu mới</p>
                                <input type="password" className="text-gray-600 block rounded-lg w-full border outline-none border-gray-400 px-2.5 py-1.5 focus:border-red-normal mt-1"
                                    placeholder="Nhập lại mật khẩu mới" />
                            </div>
                            <button className="w-full bg-red-normal hover:bg-red-dark text-white font-semibold py-2 rounded-lg mt-6 mb-4"
                                onClick={handleChangePassword}>Lưu</button>

                            {status.status === "SUCCESS" ? (
                                <p className="text-green-600 font-semibold mt-5">Thêm sinh viên thành công</p>
                            ) : status.status === "FAILED" ? (
                                <p className="text-red-500 font-semibold mt-5">{status.message}</p>
                            ) : (<p className="mt-3" />)}
                        </div>
                    </div>
                </div>
            </>, document.body
        )
    };
}

export default Password;