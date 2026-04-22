export type EntityActionKind =
  | "state"
  | "delete"
  | "restore"
  | "edit"
  | "flow"
  | "bulk";

export interface EntityAction<TPayload = void> {
  id: string;
  label: string;
  kind: EntityActionKind;
  danger?: boolean;
  requiresConfirm?: boolean;
  disabled?: boolean;
  payload?: TPayload;
  run: (payload: TPayload) => Promise<void> | void;
}
