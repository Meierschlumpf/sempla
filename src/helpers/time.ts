import dayjs from "dayjs";

export const generateTimeRange = (start: Date, end: Date) => {
  return `${dayjs(start).format("HH:mm")} - ${dayjs(end).format("HH:mm")}`;
};

export const timeStringToMinutesFromMidnight = (time: string) => {
  const [hours, minutes] = time.split(":").map((s) => parseInt(s, 10)) as [
    number,
    number
  ];
  return hours * 60 + minutes;
};

export const minutesFromMidnightToTimeString = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const minutesLeft = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutesLeft
    .toString()
    .padStart(2, "0")}`;
};
