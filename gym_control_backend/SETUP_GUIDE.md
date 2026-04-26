# Zudel OS Backend - Setup & Architecture Guide

## 🎯 Overview

A production-ready SaaS multi-tenant gym management system built with NestJS, Prisma, and PostgreSQL.

**Key Features:**
- ✅ Multi-tenant architecture (isolated via `gymId`)
- ✅ Role-Based Access Control (RBAC) with dynamic roles per gym
- ✅ Modular architecture for scalability
- ✅ Global Prisma integration
- ✅ Environment validation on startup
- ✅ Request validation via DTOs
- ✅ Graceful shutdown handling

## 📋 Prerequisites

- Node.js 18+ or 20+
- PostgreSQL 14+ (or Supabase PostgreSQL)
- pnpm (preferred) or npm

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
# or npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
DEBUG=false

# Database (Supabase PostgreSQL)
# Format: postgresql://user:password@host:port/database?sslmode=require
DATABASE_URL=postgresql://user:password@localhost:5432/gym_control

# JWT Configuration
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

See `.env.example` for all available variables.

### 3. Setup Prisma Schema

Replace the placeholder schema in `prisma/schema.prisma` with your actual schema.

**Example multi-tenant schema:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  gyms      GymMember[]
}

model Gym {
  id        String   @id @default(cuid())
  name      String
  ownerId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  owner     User          @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  members   GymMember[]

  @@index([ownerId])
}

model GymMember {
  id          String   @id @default(cuid())
  userId      String
  gymId       String
  role        String   @default("member") // admin, manager, member
  permissions String[] @default([])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  gym         Gym      @relation(fields: [gymId], references: [id], onDelete: Cascade)

  @@unique([userId, gymId])
  @@index([gymId])
}
```

## 🔧 Development

### Initialize Prisma

```bash
# Generate Prisma Client
pnpm prisma generate

# Create migrations
pnpm prisma migrate dev --name initial

# Open Prisma Studio (GUI)
pnpm prisma studio
```

### Run Application

```bash
# Development with hot-reload
pnpm start:dev

# Production build
pnpm build
pnpm start:prod

# Debug mode
pnpm start:debug
```

## 📁 Project Structure

```
src/
├── config/                 # Configuration & environment
│   ├── configuration.ts    # Config factory
│   └── env.validation.ts   # Environment validation
├── modules/                # Feature modules
│   ├── auth/              # Authentication & authorization
│   ├── user/              # User management
│   ├── gym/               # Gym management
│   └── rbac/              # Role-based access control
├── common/                # Shared code
│   ├── guards/            # Authorization guards
│   ├── decorators/        # Custom decorators
│   └── interceptors/      # HTTP interceptors
├── prisma/                # Database service
│   ├── prisma.service.ts  # Prisma singleton
│   └── prisma.module.ts   # Prisma module
├── app.controller.ts      # Root controller
├── app.module.ts          # Root module
└── main.ts                # Application entry point
```

## 🏗️ Architecture Patterns

### Modular Structure

Each feature module follows this pattern:

```
modules/featureName/
├── dto/                    # Data Transfer Objects
│   └── create-feature.dto.ts
├── feature.controller.ts   # HTTP endpoints
├── feature.service.ts      # Business logic
└── feature.module.ts       # Module definition
```

### Best Practices

**1. Dependency Injection**
```typescript
// Always use constructor injection
constructor(private readonly prisma: PrismaService) {}
```

**2. DTOs with Validation**
```typescript
export class CreateUserDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsEmail()
  email: string;
}
```

**3. Service Layer**
```typescript
// Business logic in service, not controller
@Injectable()
export class UserService {
  async createUser(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }
}
```

**4. Multi-Tenancy with GymId**

Always include `gymId` in queries to ensure tenant isolation:

```typescript
// ✅ Correct - Tenant-aware query
async getUsersInGym(gymId: string) {
  return this.prisma.gymMember.findMany({
    where: { gymId },
  });
}

// ❌ Wrong - No tenant isolation
async getAllUsers() {
  return this.prisma.user.findMany();
}
```

**5. Global Pipes & Interceptors**

Configured in `main.ts`:
- `ValidationPipe` - Validates DTOs automatically
- `ClassSerializerInterceptor` - Excludes marked fields from responses

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Tenant Isolation**: Always check `gymId` in queries
3. **Password Hashing**: Use bcrypt before saving to database
4. **JWT Validation**: Implement auth guard for protected routes
5. **CORS**: Configure properly for your frontend domain

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov

# E2E tests
pnpm test:e2e
```

## 📦 Build & Deployment

```bash
# Build for production
pnpm build

# Generated files in ./dist/

# Run production build
pnpm start:prod
```

## 🔗 Next Steps

1. **Add Prisma Schema**: Replace placeholder with actual schema
2. **Implement Auth Module**:
   - JWT strategy
   - Password hashing
   - Login/Register endpoints
3. **Implement RBAC**:
   - Role guards decorator
   - Permission checking logic
4. **Add Database Migrations**: `pnpm prisma migrate dev`
5. **Implement Feature Modules**:
   - User CRUD with multi-tenancy
   - Gym management
   - Role assignment

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [NestJS Best Practices](https://docs.nestjs.com/techniques/authentication)
- [Multi-Tenancy Patterns](https://www.prisma.io/docs/orm/prisma-client/queries/filters)

## 📝 Notes

- Global modules (ConfigModule, PrismaModule) are automatically available in all feature modules
- Use DTOs for all API inputs to ensure type safety
- Attach `gymId` to request context in guards for easier access
- Test multi-tenancy isolation thoroughly before production

---

**Last Updated:** April 2026
**NestJS Version:** 11.x
**Prisma Version:** 5.x
**Node Version:** 18+
