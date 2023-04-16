import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/de";
dayjs.extend(localeData);
dayjs.locale("de");

export const schoolDays = dayjs.weekdays().slice(1);

export const getSchoolDaySelectionData = () =>
  schoolDays.map((schoolDay, i) => ({
    label: schoolDay,
    value: i.toString(),
  }));
