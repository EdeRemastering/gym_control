import { api } from "@/lib/api/services";

export const authService = {
  login: api.auth.login,
  me: api.auth.me,
};
