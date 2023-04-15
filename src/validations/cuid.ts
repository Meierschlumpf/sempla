import { z } from "zod";

const cuidSchema = z.string().cuid();

export const isCuid = (value: unknown) => {
  return cuidSchema.safeParse(value).success;
};
