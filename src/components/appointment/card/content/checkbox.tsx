import { Checkbox } from "@mantine/core";
import { useAppointmentStore } from "../../many-appointment-selected-actions";

interface AppointmentCheckboxProps {
  id: string;
}

export const AppointmentCheckbox = ({ id }: AppointmentCheckboxProps) => {
  const toggle = useAppointmentStore((x) => x.toggle);
  const selectedAppointments = useAppointmentStore(
    (x) => x.selectedAppointments
  );

  return (
    <Checkbox
      onChange={toggle(id)}
      checked={selectedAppointments.includes(id)}
      m={3}
    />
  );
};
