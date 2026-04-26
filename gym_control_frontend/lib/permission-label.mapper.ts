import { UX_ACTION_LABELS, UX_RESOURCE_LABELS, UX_SCOPE_LABELS } from "@/lib/ux-copy-dictionary";

function toWords(value: string): string {
  return value.replace(/_/g, " ").trim().toLowerCase();
}

function capitalize(value: string): string {
  if (!value) return value;
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

export function getResourceUxLabel(resource: string): string {
  return UX_RESOURCE_LABELS[resource] ?? toWords(resource);
}

export function getActionUxLabel(action: string): string {
  return UX_ACTION_LABELS[action] ?? capitalize(toWords(action));
}

export function getScopeUxLabel(scope: string): string {
  return UX_SCOPE_LABELS[scope] ?? capitalize(toWords(scope));
}

export function getPermissionUxLabel(resource: string, action: string): string {
  return `${getActionUxLabel(action)} ${getResourceUxLabel(resource)}`;
}
