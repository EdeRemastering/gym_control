import type { Role } from "@/lib/types";

/** Props comunes que el shell inyecta en cada módulo. */
export type ModuleShellProps = {
  role: Role;
  /** Navega al perfil y enfoca publicaciones de ese usuario (p. ej. desde Área social). */
  onOpenMemberProfile?: (userId: string) => void;
};
