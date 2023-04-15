import { type RouterOutputs } from "~/utils/api";

export type AppointmentWithType<
  TKey extends RouterOutputs["appointment"]["all"][number]["type"],
  TData = RouterOutputs["appointment"]["all"][number]
> = TData extends { type: TKey } ? TData : never;
