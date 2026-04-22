import { useSessionStore } from "@/lib/session-store";

export function useAuth() {
  const user = useSessionStore((state) => state.user);
  const token = useSessionStore((state) => state.accessToken);
  return { user, token, isAuthenticated: Boolean(user && token) };
}
