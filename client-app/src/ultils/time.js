export function format({ seconds, nanos }) {
    const time = new Date(seconds * 1000 + nanos / 1000000)
    const year = time.getFullYear();
    const month = time.getMonth();
    const date = time.getDate();
    const hour = time.getHours();
    const minute = time.getMinutes();
    const second = time.getSeconds();
    const micro = time.getMilliseconds();
    return `${year}/${month}/${date} ${hour}:${minute}:${second}:${micro}`;
}

export function strTime(timestamp) {
    const time = new Date(timestamp * 1000);
    const year = time.getFullYear();
    const month = time.getMonth() + 1;
    const date = time.getDate();
    const hour = time.getHours();
    const minute = time.getMinutes();
    return `${year}/${month.toString().padStart(2, '0')}/` +
        `${date.toString().padStart(2, '0')} ` +
        `${hour.toString().padStart(2, '0')}:` +
        `${minute.toString().padStart(2, '0')}`;
}