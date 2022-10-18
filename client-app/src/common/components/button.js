export const DefaultButton = ({ text, onClick }) => {
    const className = "bg-gray-400 hover:bg-gray-500 py-1 px-4 rounded font-semibold text-white"
    return (
        <button
            type="button" onClick={onClick}
            className={className}>
            {text}
        </button>
    );
}

export const OutlineButton = ({ text, onClick }) => {
    const className = "text-gray-800 font-bold border border-gray-300 px-4 py-1 rounded hover:bg-gray-100";
    return (
        <button
            onClick={onClick}
            className={className}>
            {text}
        </button>
    );
}