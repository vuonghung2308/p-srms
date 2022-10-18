import { useRef, useState } from "react";
import { exportData, importData } from "../../../api/ledger";

const Backup = () => {
    const [dataFile, setDataFile] = useState(null);
    const inputFile = useRef(null);


    const handleBackup = () => {
        exportData().then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = "data.json"; link.href = url;
            link.click(); link.remove();
        })
    }
    const handleRestore = () => {
        if (dataFile) {
            importData(dataFile).then(data => {
                if (data.status === "SUCCESS") {
                    alert("Khôi phục dữ liệu thành công.")
                    setDataFile(null);
                } else alert("Có lỗi xảy ra, khôi phục thất bại.")
            })
        }
    }
    const handleFileChange = (e) => {
        setDataFile(e.target.files[0]);
    }

    return (
        <>
            <div className="py-4">
                <p className="inline text-gray-600 font-semibold text-[30px]">Sao lưu & khôi phục</p>
            </div>
            <hr />
            <div className="mt-4">
                <div className="relative">
                    <div className="inline-block float-left w-[50%] pr-6">
                        <p className="font-semibold text-gray-700 text-xl">Khôi phục dữ liệu</p>
                        <div className="flex my-2">
                            <p className="text-gray-700 overflow-hidden">Tải lên tệp sao lưu: {dataFile && dataFile.name && dataFile.name}</p>
                            <button className="ml-auto px-3 font-semibold text-gray-700 hover:text-red-dark"
                                onClick={() => { inputFile.current.click() }}>Chọn tệp</button>
                        </div>
                        <button className="ml-auto px-4 py-0.5 bg-red-normal hover:bg-red-dark text-white rounded font-semibold float-right"
                            onClick={handleRestore}>Bắt đầu</button>
                    </div>


                    <div className="inline-block float right w-[50%] pl-6">
                        <p className="font-semibold text-gray-700 text-xl">Sao lưu dữ liệu</p>
                        <div className="flex my-2">
                            <p className="my-auto text-gray-700">Tạo bản sao lưu</p>
                            <button className="ml-auto px-4 py-0.5 bg-red-normal hover:bg-red-dark text-white rounded font-semibold"
                                onClick={handleBackup}>Bắt đầu</button>
                        </div>
                    </div>

                    <div className="absolute left-[50%] top-0 clear-both w-[1px] h-[100%] bg-gray-300 my-4" />
                </div>

            </div>
            <input ref={inputFile} type="file" onChange={handleFileChange} hidden />
        </>
    )
}

export default Backup