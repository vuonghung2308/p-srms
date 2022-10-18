export function Th({ children }) {
    return <th className="bg-gray-300 font-semibold border border-gray-400 px-2 py-0.5">{children}</th>
}

export function Td({ children, className, colSpan }) {
    return <td colSpan={colSpan} className={className + " border border-gray-400 px-2 py-0.5 text-center"}>{children}</td>
}