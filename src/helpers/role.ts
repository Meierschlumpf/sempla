type Role = "admin" | "teacher" | "student";

export const useRole = (): Role => {
  return "teacher";
};
