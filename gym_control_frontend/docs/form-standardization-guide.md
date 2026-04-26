# Zudel OS - Estandar de Formularios

## Stack obligatorio

- `react-hook-form`
- `zod`
- `@hookform/resolvers/zod`
- TypeScript estricto

## Patrón base

1. Definir schema con Zod.
2. Crear hook reusable (`useCreateXForm`) con:
   - `resolver: zodResolver(schema)`
   - `mode: "onChange"`
   - `defaultValues` consistentes
3. Renderizar campos con componentes reutilizables:
   - `FormField`
   - `FormInput`
   - `FormSelect`
   - `FormTextarea`
4. Mostrar error por campo debajo del input.
5. Botón submit:
   - `disabled` en carga
   - texto de estado (`Guardando...`)
6. En éxito:
   - `reset()`
   - cierre de modal con `onOpenChange(false)`

## Checklist de calidad

- Cada campo tiene `label` visible.
- Cada campo tiene `placeholder` con ejemplo real.
- Sin validaciones sueltas en `useState`.
- Sin `alert` genéricos para errores.
- Errores de backend mapeados a `form.setError("root")` cuando aplique.
- `Controller` solo para controles no nativos (Radix Select, date pickers, etc.).

## Hook ejemplo

```ts
const form = useForm<CreatePlanForm>({
  resolver: zodResolver(createPlanSchema),
  mode: "onChange",
  defaultValues: { name: "", duration: 30, price: 0 },
});
```

## Convención de UX

- Label claro orientado a negocio.
- Placeholder con ejemplo real (`Ej: ...`).
- Feedback inmediato al escribir.
- CTA de envío explícito (`Guardar`, `Crear`, `Actualizar`).
- Cierre automático solo en submit exitoso.
