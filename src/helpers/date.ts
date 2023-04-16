import dayjs from "dayjs";

export const dateString = (date: Date) => {
  return dayjs(date).format("YYYY-MM-DD");
};
