# Release Checklist Responsive (Zudel OS)

Checklist operativo para aprobar despliegues con cambios de UI responsive.

## Pre-merge (obligatorio)

- [ ] `pnpm lint` sin errores.
- [ ] Build local OK (`pnpm build`).
- [ ] Smoke rutas principales:
  - [ ] `/` carga sin errores.
  - [ ] `/login` carga sin errores.
- [ ] Verificación visual rápida por módulo crítico:
  - [ ] Dashboard.
  - [ ] Social.
  - [ ] Training.
  - [ ] Scheduling.
  - [ ] Users.
  - [ ] Finance.
- [ ] Confirmar que no hay scroll horizontal global (`body`) en `360/390/768/1024`.
- [ ] Confirmar que modales largos hacen scroll interno y no se cortan.
- [ ] Confirmar que CTA/FAB/nav móvil no se solapan.
- [ ] Confirmar que botones táctiles críticos son cómodos (`h-10` / `h-11`).

## Pre-prod QA (recomendado)

- [ ] Device matrix mínimo:
  - [ ] `360x800`.
  - [ ] `390x844`.
  - [ ] `768x1024`.
  - [ ] `1024x768`.
- [ ] Test de interacción:
  - [ ] abrir/cerrar diálogos grandes.
  - [ ] feed social (like/comentar/compartir).
  - [ ] controles móviles de entrenamiento.
  - [ ] timeline scheduling (mobile + tablet).
- [ ] Test de navegación:
  - [ ] cambio de módulo desde nav móvil.
  - [ ] acción rápida y command palette.
- [ ] Test de tema:
  - [ ] `neon-dark`.
  - [ ] `light`.
- [ ] Revisión accesibilidad básica:
  - [ ] foco visible en inputs/botones.
  - [ ] labels/aria en acciones icon-only.

## Gate de aprobación

- [ ] 0 errores bloqueantes visuales en mobile.
- [ ] 0 regresiones funcionales en rutas core.
- [ ] 0 solapes críticos de capas `fixed/sticky`.
- [ ] 0 componentes core desktop-first sin fallback mobile.

## Post-deploy (monitoreo 24h)

- [ ] Revisar errores de frontend (console/runtime).
- [ ] Validar métricas de interacción móvil (si aplica).
- [ ] Confirmar que no aparezcan reportes de "pantalla rota" o "botón tapado".
- [ ] Crear ticket de hardening para pendientes no bloqueantes.

