# Supabase + Prisma Setup (Zudel OS)

## 1) Crear proyecto en Supabase

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ve a `Project Settings > Database`.
3. Copia la cadena de conexion **URI** (Connection string) con SSL.

Formato esperado:

`postgresql://<user>:<password>@<host>:5432/postgres?sslmode=require`

## 2) Configurar backend

1. Copia `.env.example` a `.env`.
2. Define `DATABASE_URL` con la URI de Supabase.
3. Completa tambien:
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CORS_ORIGIN` (por ejemplo `http://localhost:3000`)

## 3) Sincronizar esquema Prisma

Si vas iniciando desde cero:

```bash
npm run prisma:generate
npm run prisma:push
```

Si ya trabajas con migraciones:

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
```

## 4) Seed inicial RBAC

El seed crea permisos globales y roles base por gimnasio existente.

```bash
npm run prisma:seed
```

## 5) Validar en Prisma Studio

```bash
npm run prisma:studio
```

Abre tablas clave:

- `gym`
- `user`
- `role`
- `user_role`
- `plan`
- `membership`
- `payment`
- `class`, `class_session`, `workout_session`

## 6) Flujo recomendado real

1. Crear gimnasio (`POST /api/gyms`).
2. Registrar usuario (`POST /api/auth/register`) con `gymId`.
3. Login (`POST /api/auth/login`) y usar `Bearer token`.
4. Ejecutar operaciones por tenant: `/api/gyms/:gymId/...`

Con esto queda lista la base para gestion real desde Supabase.
