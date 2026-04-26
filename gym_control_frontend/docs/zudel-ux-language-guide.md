# Guía de Lenguaje UX de Zudel OS

## Objetivo

Asegurar que todo el producto use un lenguaje:

- Claro
- Natural
- Accionable
- Consistente
- Orientado a dueños de gimnasio y staff no técnico

Esta guía aplica a botones, formularios, modales, notificaciones, toasts, filtros, navegación y ayuda contextual.

---

## Tono de voz

### Principios

- Profesional y cercano.
- Directo, sin tecnicismos innecesarios.
- Enfocado en tareas reales del gimnasio.

### Regla práctica

Si un recepcionista o coordinador no entiende el texto en 3 segundos, el texto no cumple.

---

## Reglas globales de escritura

### 1) Estructura de acciones

Usar siempre:

`Verbo + objeto + contexto opcional`

Ejemplos:

- Registrar pago
- Reprogramar clase
- Asignar permiso al perfil
- Ver reservas de hoy

### 2) Verbos oficiales

Usar preferentemente:

- Crear
- Ver
- Editar
- Eliminar
- Registrar
- Reprogramar
- Asignar
- Quitar
- Guardar
- Actualizar

Evitar:

- Ejecutar
- Submit
- Run
- Trigger
- Action

### 3) Idioma oficial

- Español neutro en toda la interfaz.
- Evitar mezcla inglés/español en etiquetas visibles.
- Mantener nombres técnicos solo a nivel interno de código.

### 4) Consistencia de entidades

Un concepto, un nombre:

- Cliente (no alternar con usuario/miembro/atleta sin contexto)
- Perfil de acceso (no rol en UI de negocio, salvo necesidad puntual)
- Permiso
- Agenda de clases
- Comunidad

### 5) Mensajes de error

Formato recomendado:

`Qué pasó + qué puede hacer ahora`

Ejemplo:

- No pudimos registrar el pago. Verifica el monto e inténtalo de nuevo.

### 6) Placeholders

- Deben guiar, no decorar.
- Incluir ejemplo breve y real.

Ejemplos:

- Ej: Membresía trimestral
- Ej: 129900
- Buscar cliente por nombre...

---

## Diccionario UX oficial

| Técnico | UX recomendado |
|---|---|
| user | cliente |
| role | perfil de acceso |
| permission | permiso |
| resource | área |
| action | acción permitida |
| scope | alcance |
| scheduling | agenda de clases |
| class_session | sesión de clase |
| class_booking | reserva de clase |
| training | entrenamientos |
| workout_session | sesión de entrenamiento |
| set_log | registro de series |
| analytics / insights | análisis |
| feed | comunidad |
| notification | notificación |

---

## Patrones de UI

### Botones

- Primario: acción principal de la pantalla.
  - Ej: Registrar pago, Guardar alerta, Crear plan
- Secundario: apoyo.
  - Ej: Cancelar, Volver, Limpiar filtros

Evitar botones ambiguos:

- Acción rápida (si no hay contexto)
- Confirmar (cuando se puede decir qué confirma)

### Modales

Cada modal debe incluir:

- Título con verbo claro
- Campos con labels descriptivos
- CTA específica

Ejemplo:

- Título: Crear perfil de acceso
- CTA: Guardar perfil

### Filtros y buscadores

- Placeholder orientado a uso real:
  - Buscar por alerta o responsable...
  - Buscar cliente por nombre...
- Nombres claros:
  - Categoría en vez de Tipo (cuando aplica)
  - Perfil en vez de Rol (cuando aplica a negocio)

### Toasts y notificaciones

- Éxito: breve y explícito.
  - Pago registrado correctamente.
- Error: orientar al siguiente paso.
  - No pudimos actualizar la asistencia. Intenta nuevamente.

---

## Conversión de permisos técnicos a UX

Nunca mostrar al usuario final claves como:

- `payment:create`
- `user:update`
- `class_booking:read`

Siempre transformar a etiquetas UX:

- Crear pagos
- Editar clientes
- Ver reservas de clase

---

## Before / After de referencia

- Acción rápida -> Acciones frecuentes
- Crear usuario -> Registrar cliente
- Rol -> Perfil de acceso
- Buscar usuario... -> Buscar cliente por nombre...
- Neon Dark -> Neon oscuro
- Insight registrado -> Análisis guardado
- Quitar publicación -> Ocultar publicación

---

## Checklist para PR (obligatorio)

Antes de merge:

- [ ] ¿Todo el texto visible está en español?
- [ ] ¿Cada acción usa verbo claro + objeto?
- [ ] ¿Hay términos técnicos expuestos al usuario final?
- [ ] ¿Los errores indican siguiente paso?
- [ ] ¿Los placeholders ayudan a completar el campo?
- [ ] ¿Se usa el diccionario UX oficial?
- [ ] ¿La misma entidad mantiene el mismo nombre en todo el flujo?

---

## Gobernanza

### Fuente única de verdad

- Diccionario técnico central: `lib/ux-copy-dictionary.ts`
- Mapeo de permisos: `lib/permission-label.mapper.ts`
- Esta guía: `docs/zudel-ux-language-guide.md`

### Criterio para nuevas pantallas

Si aparece un término nuevo:

1. Definir su versión UX en `ux-copy-dictionary.ts`.
2. Aplicar en componente y mensajes.
3. Validar con checklist de PR.

---

## Nota final

El objetivo no es simplificar funcionalidad, sino simplificar comprensión.
Zudel OS debe sentirse potente por capacidad, y simple por lenguaje.
