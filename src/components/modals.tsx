import { CreateAppointmentModal } from "./appointment/create-appointment-modal";
import { UpdateTopicModal } from "./appointment/topics/update-topic-modal";

export const modals = {
  createAppointment: CreateAppointmentModal,
  updateTopic: UpdateTopicModal,
};

declare module "@mantine/modals" {
  export interface MantineModalsOverride {
    modals: typeof modals;
  }
}
