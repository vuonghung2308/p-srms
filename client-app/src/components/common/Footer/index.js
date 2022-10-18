import { Link } from "react-router-dom"

const Footer = ({ className }) => {
    return (
        <div className={`${className} container mx-auto px-44`}>
            <hr />
            <div className="flex py-3">
                <Link className="inline font-bold text-red-normal" to="">P-SRMS</Link>
                <p className="inline font-semibold mx-2.5">-</p>
                <p className="inline font-semibold text-gray-600">Hệ thống quản lý kết quả học tập</p>
                <p className="inline font-semibold text-gray-600 text-sm ml-auto my-auto">© 2022 Copyright: Manh Hung</p>
            </div>
        </div>
    )
}

export default Footer