import dayjs from "dayjs";

export const generateTimeRange = (start: Date, end: Date) => {
  return `${dayjs(start).format("HH:mm")} - ${dayjs(end).format("HH:mm")}`;
};
