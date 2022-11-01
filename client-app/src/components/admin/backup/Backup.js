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
                        <p className="font-semibold text-gray-500 text-xl">Khôi phục dữ liệu</p>
                        <div className="flex my-2">
                            <p className="overflow-hidden">Tải lên tệp sao lưu: {dataFile && dataFile.name && dataFile.name}</p>
                            <button className="ml-auto flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                onClick={() => { inputFile.current.click() }} >
                                <p className="my-auto">Chọn tệp</p>
                            </button>
                            <button className="ml-2 flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                onClick={handleRestore} >
                                <p className="my-auto">Bắt đầu</p>
                            </button>
                        </div>
                    </div>


                    <div className="inline-block float right w-[50%] pl-6">
                        <p className="font-semibold text-gray-500 text-xl">Sao lưu dữ liệu</p>
                        <div className="flex my-2">
                            <p className="my-auto">Tạo bản sao lưu</p>
                            <button className="ml-auto flex border text-sm hover:border-red-normal px-2 text-gray-500 font-semibold rounded-lg hover:text-red-normal"
                                onClick={handleBackup} >
                                <p className="my-auto">Bắt đầu</p>
                            </button>
                        </div>
                    </div>

                    <div className="absolute left-[50%] top-0 clear-both w-[2px] h-full bg-gray-200" />
                </div>

            </div>
            <input ref={inputFile} type="file" onChange={handleFileChange} hidden />
        </>
    )
}

export default Backup