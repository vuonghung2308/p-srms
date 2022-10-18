import ReactDOM from 'react-dom';

const Modal = ({ isShowing,  children }) => {
    if (isShowing) {
        return ReactDOM.createPortal(
            <>
                <div className='block fixed top-0 left-0 w-[100%] h-[100%] bg-[rgba(0,0,0,0.2)] pt-[100px] text-gray-700'>
                    <div className='bg-[#fefefe] w-[700px] mx-auto py-4 px-6 border rounded-xl shadow-2xl'>
                        {children}
                    </div>
                </div>
            </>, document.body
        )
    } else return null;
}

export default Modal;