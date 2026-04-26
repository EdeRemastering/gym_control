# Zudel OS SaaS Operable Architecture

## Principio rector

Every entity must be actionable. Ninguna entidad queda en modo solo lectura.

## Mapa de modulos

- `auth`: login, bootstrap de sesion, asignacion de rol inicial.
- `profile`: identidad del usuario, historial, visibilidad.
- `social`: feed, post, interacciones, moderacion, soft delete.
- `training`: rutinas, ejecucion, tracking, finalizacion y reintento.
- `scheduling`: clases, reservas, cupos, cancelacion, reprogramacion.
- `billing`: planes, pagos, memberships, reintentos y ajustes.
- `users`: RBAC, alta/baja, suspension/reactivacion, acciones masivas.
- `notifications`: eventos, lectura, preferencias, limpieza.
- `analytics`: KPIs, filtros operativos, exportes y drilldowns.

## Contrato por modulo

Cada modulo mantiene esta estructura:

- `components/`: UI operable con acciones primarias y contextuales.
- `hooks/`: acceso de estado y cache con TanStack Query.
- `services/`: llamadas API de backend.
- `ui/`: bloques visuales reutilizables de modulo.
- `flows/`: flujos end-to-end por caso de negocio.
- `actions/`: catalogo operativo de transiciones por entidad.

## Action Layer transversal

- `modules/action-system/components/entity-action-menu.tsx`: menu contextual de acciones de entidad.
- `modules/action-system/components/bulk-action-bar.tsx`: barra de acciones masivas.
- `modules/action-system/types.ts`: tipado de acciones (`state`, `delete`, `restore`, `edit`, `flow`, `bulk`).

## Flujos E2E implementados

1. Onboarding: usuario -> rol -> acceso -> primera accion.
2. Payment -> Membership: plan -> pago -> estado -> reintento/cancelacion.
3. Training Execution: rutina -> sesion -> tracking -> cierre/reinicio.
4. Scheduling: clase -> reserva -> control -> cancelacion/reprogramacion.
5. Social: publicacion -> interaccion -> moderacion -> soft delete/restore.
6. Notifications: evento -> lectura/no lectura -> historial -> preferencia.

## Experiencia multiplataforma

- Mobile: bottom nav + quick actions tipo app nativa.
- Tablet: panel principal + cards operables.
- Desktop: shell multi-panel + command palette + panel lateral de acciones.

## RBAC

- `ADMIN`: control total de todos los modulos.
- `TRAINER`: foco en users/training/scheduling/social.
- `CLIENT`: consumo de perfil, progreso, reservas, feed y notificaciones.

La composicion visible de modulos y acciones se ajusta por rol activo.
