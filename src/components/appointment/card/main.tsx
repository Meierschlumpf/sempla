import { AppointmentEventCard } from "./event";
import { AppointmentExcursionCard } from "./excursion";
import { AppointmentLessonCard } from "./lesson";
import { type AppointmentCardProps } from "./type";

export const AppointmentCard = ({ item, mode }: AppointmentCardProps) => {
  if (item.type === "lesson") {
    return <AppointmentLessonCard item={item} mode={mode} />;
  }

  if (item.type === "event") {
    return <AppointmentEventCard item={item} mode={mode} />;
  }

  return <AppointmentExcursionCard item={item} mode={mode} />;
};
