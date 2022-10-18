export function format({seconds, nanos}) {
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