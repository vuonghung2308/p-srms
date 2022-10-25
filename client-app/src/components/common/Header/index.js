import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PayloadDispatchContext } from "../../../common/token";
import useModal from "../Modal/use";
import Password from "../Password";

const Header = () => {
    const dispatch = useContext(PayloadDispatchContext);
    const [isHovered, setHovered] = useState(false);
    const { isShowing, toggle } = useModal();
    const navigate = useNavigate();
    const handleLogout = () => dispatch({ type: 'delete' });
    const [isMenuShowing, setIsMenuShowing] = useState(false);
    return (
        <>
            <div className="container mx-auto px-44 py-4">
                <div className="flex">
                    <Link className=" font-bold text-lg text-red-normal" to="">P-SRMS</Link>
                    <div className="w-[1px] mx-4 bg-gray-200"></div>
                    <p className="text-gray-600 text-sm font-semibold my-auto">{getTimeString()}</p>
                    <div className="ml-auto">
                        <div className="flex text-center">
                            <div>
                                <Link className="text-gray-600 font-semibold"
                                    onMouseEnter={() => setHovered(true)}
                                    onMouseLeave={() => setHovered(false)}
                                    onClick={() => setIsMenuShowing(true)}
                                    onBlur={() => setTimeout(() =>
                                        setIsMenuShowing(false), 200)
                                    }>
                                    <i className={`fa-solid fa-user  my-auto mr-3 text-gray-400  ${isHovered && 'text-red-dark'}`} />
                                    <p className={`inline-block ${isHovered && 'text-red-dark'}`}>Tài khoản</p>
                                </Link>
                                {isMenuShowing && (
                                    <div className="absolute text-start bg-white border border-gray-200 rounded shadow-lg mt-2 -ml-10">
                                        <Link className="block ml-4 mr-10 my-2 text-gray-500 hover:text-red-dark"
                                            onMouseDown={() => setTimeout(() => navigate(''), 200)}>
                                            Tài khoản của tôi
                                        </Link>
                                        <hr className="mx-2" />
                                        <Link className="block mx-4 my-2 text-gray-500 hover:text-red-dark"
                                            onMouseDown={() => { setTimeout(toggle, 200) }}>
                                            Đổi mật khẩu
                                        </Link>
                                        <hr className="mx-2" />
                                        <Link className="block mx-4 my-2 text-gray-500 hover:text-red-dark"
                                            onMouseDown={() =>
                                                setTimeout(handleLogout, 200)
                                            } >
                                            Đăng xuất
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <div className="w-[1px] mx-4 bg-gray-200"></div>
                            <Link>
                                <i className=" ml-3 fa-sharp fa-solid fa-bell text-gray-400 hover:text-red-dark my-auto" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <hr />
            <Password
                isShowing={isShowing}
                toggle={toggle} onSuccess={() => {
                    toggle()
                    setTimeout(() => {
                        alert("Đổi mật khẩu thành công!")
                    }, 100)
                }} />
        </>
    );
}

const getTimeString = () => {
    const date = new Date();
    const day = date.getDay();
    let day_name = '';

    switch (day) {
        case 0:
            day_name = "Chủ nhật";
            break;
        case 1:
            day_name = "Thứ hai";
            break;
        case 2:
            day_name = "Thứ ba";
            break;
        case 3:
            day_name = "Thứ tư";
            break;
        case 4:
            day_name = "Thứ năm";
            break;
        case 5:
            day_name = "Thứ sau";
            break;
        case 6: default:
            day_name = "Thứ bảy";
    };
    return `${day_name}, ${date.getDate().toString().padStart(2, '0')}/` +
        `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
        `${date.getFullYear()}`
}

export default Header