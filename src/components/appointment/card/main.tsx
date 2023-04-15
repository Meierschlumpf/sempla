import { type RouterOutputs } from "~/utils/api";
import { AppointmentEventCard } from "./event";
import { AppointmentExcursionCard } from "./excursion";
import { AppointmentLessonCard } from "./lesson";

type AppointmentCardProps = {
  item: RouterOutputs["appointment"]["all"][number];
  mode: "edit" | "display";
  showSubject?: boolean;
};

export const AppointmentCard = ({
  item,
  mode,
  showSubject = false,
}: AppointmentCardProps) => {
  if (item.type === "lesson") {
    return (
      <AppointmentLessonCard
        item={item}
        mode={mode}
        showSubject={showSubject}
      />
    );
  }

  if (item.type === "event") {
    return <AppointmentEventCard item={item} mode={mode} />;
  }

  return <AppointmentExcursionCard item={item} mode={mode} />;
};
