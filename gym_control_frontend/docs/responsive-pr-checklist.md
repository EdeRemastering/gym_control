# Responsive PR Checklist (Zudel OS)

Usa esta lista en cada PR que toque UI.

## Viewports obligatorios

- [ ] 360 x 800 (mobile)
- [ ] 768 x 1024 (tablet)
- [ ] 1024 x 768 (desktop base)
- [ ] 1280 x 800 (desktop amplio)
- [ ] 1536+ (ultrawide, validación rápida)

## Reglas mobile-first

- [ ] Estilos base pensados para móvil (sin prefijo).
- [ ] Escalado progresivo con `md:` / `lg:` / `xl:`.
- [ ] No se añadieron layouts desktop-first como default.

## Layout y overflow

- [ ] No hay scroll horizontal global en `body`.
- [ ] Todo contenedor de contenido crítico usa `min-w-0` cuando aplica.
- [ ] Sidebars/rails no tapan contenido en mobile.
- [ ] Bottom nav / FAB / CTA no se solapan.

## Formularios y acciones

- [ ] Inputs y botones son full-width en móvil cuando corresponde.
- [ ] Targets táctiles mínimos (`h-10`, ideal `h-11`).
- [ ] Estados `disabled`, `hover`, `focus-visible` verificados.

## Tablas y datos

- [ ] Cada tabla tiene estrategia móvil definida:
  - cards/list en mobile, o
  - scroll horizontal encapsulado y usable.
- [ ] Información crítica visible sin depender de scroll horizontal largo.

## Accesibilidad básica

- [ ] Navegación por teclado funcional.
- [ ] Contraste suficiente en tema activo.
- [ ] Botones/iconos tienen `aria-label` si no hay texto visible.

## Tokens y consistencia

- [ ] Se usaron tokens semánticos (evitar hardcode nuevo innecesario).
- [ ] Spacing consistente (`gap-3/4`, `p-4/5` según contexto).
- [ ] Se respetaron componentes/patrones reutilizables (`ResponsiveDataView`, utilidades globales).

