export function TextInput({ type, text, onChange, className }) {
    const newClassName = className ? className + ' border border-gray-600 rounded px-2 py-0.5'
        : 'border border-gray-600 rounded px-2 py-0.5';
    return (
        <input
            type={type ? type : 'text'}
            value={text} onChange={onChange}
            className={newClassName} />
    )
}