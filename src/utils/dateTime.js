exports.getUtcTimeStamp = (timeStamp = Date.now()) => {
    const date = new Date(timeStamp);
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth();
    const d = date.getUTCDate();
    const hr = date.getUTCHours();
    const min = date.getUTCMinutes();
    const sec = date.getUTCSeconds();
    const ms = date.getUTCMilliseconds();
    return Date.UTC(y, m, d, hr, min, sec, ms);
};