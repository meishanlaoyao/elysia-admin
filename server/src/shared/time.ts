import dayjs from "dayjs";

/**
 * 获取当前时间
 * @returns 当前时间字符串（格式：YYYY-MM-DD HH:mm:ss）
 */
export function GetNowTime() {
    return dayjs().format("YYYY-MM-DD HH:mm:ss");
};

/**
 * 格式化时间字符串
 * @param time 时间字符串
 * @param format 格式化字符串（默认：YYYY-MM-DD HH:mm:ss）
 * @returns 格式化后的时间字符串
 */
export function FormatTime(time: string | number | Date, format: string = "YYYY-MM-DD HH:mm:ss") {
    if (!time) return "";
    return dayjs(time).format(format);
};

/**
 * 把 1d 1h 1m 1s 字符串转换为秒
 * @param time 时间字符串
 * @returns 秒数
 */
export function ConvertTimeToSecond(time: string) {
    let second = 0;
    const regex = /(\d+)([dhms])/g;
    let match;
    while ((match = regex.exec(time)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case "d":
                second += value * 24 * 60 * 60;
                break;
            case "h":
                second += value * 60 * 60;
                break;
            case "m":
                second += value * 60;
                break;
            case "s":
                second += value;
                break;
        }
    }
    return second;
};