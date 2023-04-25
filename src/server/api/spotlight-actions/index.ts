import { type Appointment, type Plan, type Topic } from "@prisma/client";
import {
  IconBooks,
  IconCalendarPlus,
  IconChalkboard,
  IconFilePlus,
  IconPencil,
  IconPhotoPlus,
  IconPin,
  IconPinnedOff,
  IconTicket,
  IconTrash,
  IconTrekking,
  type TablerIconsProps,
} from "@tabler/icons-react";

type SpotlightActionDefinition = {
  readonly [key: string]: InnerSpotlightActionDefinition<ActionScope>;
};

export type ActionScope =
  | "global"
  | "plan"
  | "appointment"
  | "material"
  | "topic";

type ActionScopeMapping = {
  global: never;
  plan: Plan;
  appointment: Appointment;
  material: /*Material*/ unknown;
  topic: Topic;
};

export type InnerSpotlightActionDefinition<TScope extends ActionScope> = {
  readonly icon: (props: TablerIconsProps) => JSX.Element;
  readonly scope: TScope;
  readonly roles: readonly ("admin" | "student" | "teacher")[];
  readonly keywords?: readonly string[];
  readonly color?: "red";
  readonly isVisible?: TScope extends "global"
    ? never
    : (entity: ActionScopeMapping[TScope]) => boolean;
};

const validate = <TInput extends SpotlightActionDefinition>(input: TInput) =>
  input;

const actions = {
  "create-plan": {
    icon: IconCalendarPlus,
    scope: "global",
    roles: ["admin", "teacher"],
  },
  "create-plan-template": {
    icon: IconFilePlus,
    scope: "global",
    roles: ["admin"],
  },
  "add-topic": {
    icon: IconPhotoPlus,
    scope: "plan",
    roles: ["admin", "teacher"],
  },
  "add-material": {
    icon: IconBooks,
    scope: "plan",
    roles: ["admin", "teacher"],
  },
  "create-appointment-lesson": {
    icon: IconChalkboard,
    scope: "plan",
    roles: ["admin", "teacher"],
    keywords: ["appointment"],
  },
  "create-appointment-event": {
    icon: IconTicket,
    scope: "plan",
    roles: ["admin", "teacher"],
    keywords: ["appointment"],
  },
  "create-appointment-excursion": {
    icon: IconTrekking,
    scope: "plan",
    roles: ["admin", "teacher"],
    keywords: ["appointment"],
  },
  "pin-appointment": {
    icon: IconPin,
    scope: "appointment",
    roles: ["admin", "teacher"],
    isVisible: (appointment: Appointment) => !appointment.isPinned,
  },
  "unpin-appointment": {
    icon: IconPinnedOff,
    scope: "appointment",
    roles: ["admin", "teacher"],
    isVisible: (appointment: Appointment) => appointment.isPinned,
  },
  "edit-appointment": {
    icon: IconPencil,
    scope: "appointment",
    roles: ["admin", "teacher"],
  },
  "remove-appointment": {
    icon: IconTrash,
    scope: "appointment",
    roles: ["admin", "teacher"],
    color: "red",
  },
} as const;

export default validate(actions);
