import {
  Group,
  Checkbox,
  Button,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { IconTrash, IconPhotoEdit, IconTags } from "@tabler/icons-react";
import { create } from "zustand";
import { shallow } from "zustand/shallow";

export const ManyAppointmentSelectedActions = () => {
  const { colors } = useMantineTheme();
  const { selectedAppointments, toggleAll, isIndeterminate, isAllChecked } =
    useAppointmentStore(
      (state) => ({
        selectedAppointments: state.selectedAppointments,
        toggleAll: state.toggleAll,
        isIndeterminate: state.isIndeterminate,
        isAllChecked: state.isAllChecked,
      }),
      shallow
    );

  return (
    <Group pl={16}>
      <Checkbox
        m={3}
        indeterminate={isIndeterminate}
        checked={isAllChecked}
        onChange={toggleAll}
      />
      <Text>{selectedAppointments.length} ausgewählt</Text>

      {selectedAppointments.length > 0 && (
        <Button.Group>
          <Tooltip label="Termine entfernen">
            <Button variant="default" size="xs">
              <IconTrash color={colors.red[6]} size={16} />
            </Button>
          </Tooltip>
          <Tooltip label="Thema anpassen">
            <Button variant="default" size="xs">
              <IconPhotoEdit size={16} />
            </Button>
          </Tooltip>
          <Tooltip label="Tags anpassen">
            <Button variant="default" size="xs">
              <IconTags size={16} />
            </Button>
          </Tooltip>
        </Button.Group>
      )}
    </Group>
  );
};

export const useAppointmentStore = create<AppointmentStore>((set) => ({
  allAppointmentIds: [],
  setAllAppointmentIds(all) {
    set((prev) => {
      const newSelectedAppointments = prev.selectedAppointments.filter((item) =>
        all.includes(item)
      );
      return {
        allAppointmentIds: all,
        selectedAppointments: newSelectedAppointments,
        isAllChecked: newSelectedAppointments.length === all.length,
        isIndeterminate:
          newSelectedAppointments.length < all.length &&
          newSelectedAppointments.length !== 0,
      };
    });
  },
  selectedAppointments: [],
  toggle(id: string) {
    return () =>
      set((state) => {
        const index = state.selectedAppointments.indexOf(id);
        if (index === -1) {
          return {
            selectedAppointments: [...state.selectedAppointments, id],
            isAllChecked:
              state.selectedAppointments.length + 1 ===
              state.allAppointmentIds.length,
            isIndeterminate:
              state.selectedAppointments.length + 1 <
              state.allAppointmentIds.length,
          };
        }
        return {
          selectedAppointments: state.selectedAppointments.filter(
            (item) => item !== id
          ),
          isAllChecked: false,
          isIndeterminate: state.selectedAppointments.length - 1 > 0,
        };
      });
  },
  isIndeterminate: false,
  isAllChecked: false,
  toggleAll() {
    set((state) => {
      if (
        state.allAppointmentIds.length === state.selectedAppointments.length
      ) {
        return {
          selectedAppointments: [],
          isIndeterminate: false,
          isAllChecked: false,
        };
      }
      return {
        selectedAppointments: state.allAppointmentIds,
        isIndeterminate: false,
        isAllChecked: true,
      };
    });
  },
}));

interface AppointmentStore {
  allAppointmentIds: string[];
  setAllAppointmentIds: (all: string[]) => void;
  selectedAppointments: string[];
  toggle: (id: string) => () => void;
  isIndeterminate: boolean;
  isAllChecked: boolean;
  toggleAll: () => void;
}
