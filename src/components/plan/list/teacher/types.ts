import { type RouterOutputs } from "~/utils/api";

export type SubjectPlan = {
  subjectId: string;
  subject: RouterOutputs["plan"]["current"][0]["subject"];
  plans: RouterOutputs["plan"]["current"];
};
