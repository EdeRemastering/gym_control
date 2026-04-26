"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  createPermissionSchema,
  createRoleSchema,
  createUserSchema,
  type CreatePermissionForm,
  type CreateRoleForm,
  type CreateUserForm,
} from "@/modules/users/schemas/users-management.schema";

export function useCreateUserForm() {
  return useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "", phone: "", branch: "Sede Centro", role: "CLIENT" },
  });
}

export function useCreateRoleForm() {
  return useForm<CreateRoleForm>({
    resolver: zodResolver(createRoleSchema),
    mode: "onChange",
    defaultValues: { name: "", description: "" },
  });
}

export function useCreatePermissionForm() {
  return useForm<CreatePermissionForm>({
    resolver: zodResolver(createPermissionSchema),
    mode: "onChange",
    defaultValues: { name: "user.read", resource: "user", action: "read", scope: "GYM" },
  });
}
