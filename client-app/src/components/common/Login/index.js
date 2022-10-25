import { useContext, useEffect, useState } from "react"
import { login } from "../../../api/account";
import { PayloadDispatchContext } from "../../../common/token";

export default function Login() {
    const [isNameFocused, setNameFocused] = useState(false);
    const [isPassFocused, setPassFocused] = useState(false);
    useEffect(() => {
        document.title = 'P-SRMS - Đăng nhập';
    }, []);
    const dispatch = useContext(PayloadDispatchContext)
    const [account, setAccount] = useState({
        username: '',
        password: ''
    })
    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await login(account);
        if (result.status === "FAILED") {
            alert("Tên tài khoản hoặc mật khẩu không chính xác");
        } else {
            dispatch({
                type: 'save',
                payload: result.data
            });
        }
    }
    return (
        <div className="text-gray-700 pt-20 h-[100%] bg-[url(https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg)]">
            <div className="w-fit p-10 rounded-xl border shadow-xl mx-auto">
                <p className="w-fit mx-auto text-red-normal font-bold text-[2rem]">P-SRMS</p>
                <p className="block w-fit mx-auto text-xl font-semibold">Hệ thống quản lý kết quả học tập</p>
                <p className="block w-fit mx-auto mb-4 mt-1">Đăng nhập vào tài khoản</p>
                <p>Tài khoản</p>
                <div className="relative">
                    <input type="text" className="text-gray-600 block rounded-lg w-full border outline-none border-gray-400 pl-10 pr-2.5 py-1.5 focus:border-red-normal mt-1"
                        value={account.username} onFocus={() => setNameFocused(true)} onBlur={() => setNameFocused(false)}
                        placeholder="Tài khoản"
                        onChange={e => setAccount({
                            ...account,
                            username: e.target.value
                        })}
                    />
                    <i className={`fa-solid fa-user absolute top-[50%] translate-y-[-50%] ml-4 ${isNameFocused ? 'text-red-normal' : 'text-gray-400'}`} />
                </div>
                <p className="mt-3">Mật khẩu</p>
                <div className="relative">
                    <input type="password" className="text-gray-600 block rounded-lg w-full border outline-none border-gray-400 pl-10 pr-2.5 py-1.5 focus:border-red-normal mt-1"
                        value={account.password} onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)}
                        placeholder="Mật khẩu"
                        onChange={e => setAccount({
                            ...account,
                            password: e.target.value
                        })}
                    />
                    <i className={`fa-solid fa-lock absolute top-[50%] translate-y-[-50%] ml-4 ${isPassFocused ? 'text-red-normal' : 'text-gray-400'}`} />
                </div>

                <button className="w-full bg-red-normal hover:bg-red-dark text-white font-semibold py-2 rounded-lg my-6" onClick={handleLogin}>Đăng nhập</button>
            </div>
        </div>
    )
}