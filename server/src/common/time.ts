import dayjs from "dayjs";

export function GetNowTime() {
    return dayjs().format("YYYY-MM-DD HH:mm:ss");
}