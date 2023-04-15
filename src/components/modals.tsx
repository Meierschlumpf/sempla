import { openContextModal as mantineOpenContextModal } from "@mantine/modals";
import { CreateAppointmentModal } from "./appointment/create-appointment-modal";
import { RenameTopicModal } from "./appointment/topics/rename-topic-modal";
import { ShortenTopicModal } from "./appointment/topics/shorten-topic-modal";
import { type OpenContextModal } from "@mantine/modals/lib/context";

export const modals = {
  createAppointment: CreateAppointmentModal,
  renameTopic: RenameTopicModal,
  shortenTopic: ShortenTopicModal,
};

export type MantineModals = typeof modals;
export type MantineModal = keyof MantineModals;

export const openContextModal = <TKey extends MantineModal>(
  payload: OpenContextModal<
    Parameters<MantineModals[TKey]>[0]["innerProps"]
  > & {
    modal: TKey;
  }
) => {
  return mantineOpenContextModal(payload);
};
