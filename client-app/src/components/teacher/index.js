import { Link, Outlet } from "react-router-dom";
import Footer from "../common/Footer";
import Header from "../common/Header";

const Content = ({ className }) => {
    return (
        <div className={className}>
            <div className="container flex mx-auto px-44 py-2.5">
                <Link to="/">
                    <i className="fa-sharp fa-solid fa-house text-gray-500 hover:text-red-dark" />
                </Link>
                <div className="w-[1px] mx-4 bg-gray-200"></div>
                <Link className="text-gray-600 font-semibold hover:text-red-dark"
                    to="">
                    Xem thông tin
                </Link>
                <Link className="text-gray-600 font-semibold hover:text-red-dark ml-4"
                    to="lop-hoc">
                    Lớp học
                </Link>
                <Link className="text-gray-600 font-semibold hover:text-red-dark ml-4"
                    to="phong-thi">
                    Phòng thi
                </Link>
                <Link className="text-gray-600 font-semibold hover:text-red-dark ml-4"
                    to="phuc-khao">
                    Phúc khảo
                </Link>
            </div>
            <hr />
            <div className="container mx-auto px-44"><Outlet /></div>
        </div>
    );
}

const TeacherLayout = () => {
    return (
        <div className="min-h-[100%] flex flex-col text-gray-700">
            <Header />
            <Content className="grow" />
            <Footer className="mt-12" />
        </div>
    );
}

export default TeacherLayout;