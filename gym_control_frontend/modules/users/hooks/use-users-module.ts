import { useUsers } from "@/hooks/use-gym-query";

export function useUsersModule() {
  return { usersQuery: useUsers() };
}
