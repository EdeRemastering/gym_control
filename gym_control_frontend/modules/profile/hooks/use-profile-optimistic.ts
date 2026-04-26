"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/services";
import { useSessionStore } from "@/lib/session-store";
import type { User } from "@/lib/types";

function getSessionValues() {
  const session = useSessionStore.getState();
  if (!session.accessToken || !session.user?.gymId || !session.user.id) {
    throw new Error("Sesion no disponible");
  }
  return { token: session.accessToken, gymId: session.user.gymId, userId: session.user.id };
}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 2, baseMs = 300): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, baseMs * 2 ** attempt));
    }
  }
  throw lastError;
}

export function useUpdateProfileOptimistic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; email: string; bio: string }) => {
      const session = getSessionValues();
      return retryWithBackoff(() =>
        api.updateUser(session.gymId, session.userId, session.token, {
          name: payload.name,
          email: payload.email,
          bio: payload.bio,
        }),
      );
    },
    onMutate: async (payload) => {
      const session = getSessionValues();
      const usersKey = ["users", session.gymId] as const;
      await queryClient.cancelQueries({ queryKey: usersKey });
      const previousUsers = queryClient.getQueryData<User[]>(usersKey);
      const previousSessionUser = useSessionStore.getState().user;

      queryClient.setQueryData<User[]>(usersKey, (old = []) =>
        old.map((user) =>
          user.id === session.userId
            ? { ...user, name: payload.name, email: payload.email, bio: payload.bio }
            : user,
        ),
      );
      useSessionStore.setState((state) => ({
        ...state,
        user: state.user ? { ...state.user, name: payload.name, email: payload.email } : state.user,
      }));

      return { usersKey, previousUsers, previousSessionUser };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousUsers) queryClient.setQueryData(context.usersKey, context.previousUsers);
      useSessionStore.setState((state) => ({ ...state, user: context?.previousSessionUser ?? state.user }));
      toast.error("No se pudo guardar el perfil. Se revirtieron los cambios.");
    },
    onSettled: (_result, _error, _payload, context) => {
      queryClient.invalidateQueries({ queryKey: context?.usersKey ?? ["users"] });
    },
  });
}

