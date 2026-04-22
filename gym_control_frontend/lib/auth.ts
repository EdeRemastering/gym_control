import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/types";
import { roleModules, type ModuleKey } from "@/lib/navigation";

const SESSION_COOKIE = "gc_session";
const DEFAULT_ROLE: Role = "ADMIN";

export interface SessionData {
  role: Role;
}

export async function getSession(): Promise<SessionData | null> {
  const rawCookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!rawCookie) return null;

  try {
    const decoded = JSON.parse(rawCookie) as SessionData;
    if (!["ADMIN", "TRAINER", "CLIENT"].includes(decoded.role)) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireModuleAccess(module: ModuleKey): Promise<Role> {
  const session = await requireSession();
  const allowed = roleModules[session.role] ?? roleModules[DEFAULT_ROLE];
  if (!allowed.includes(module)) {
    redirect(`/${allowed[0]}`);
  }
  return session.role;
}
