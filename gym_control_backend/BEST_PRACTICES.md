# Implementation Best Practices

## Core Principles

### 1. Separation of Concerns
- **Controllers**: Handle HTTP requests/responses only
- **Services**: Contain all business logic
- **DTOs**: Define data contracts with validation
- **Guards/Interceptors**: Handle cross-cutting concerns

### 2. Dependency Injection
Always use NestJS dependency injection:

```typescript
// ✅ Good
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
}

// ❌ Bad - Direct instantiation
export class UserService {
  prisma = new PrismaService();
}
```

### 3. Module Organization

**Feature Module Template:**

```typescript
@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Export if used by other modules
})
export class UserModule {}
```

### 4. Global Providers

Use `@Global()` decorator sparingly. Good candidates:
- `ConfigService` (imported configuration)
- `PrismaService` (database access)
- `LoggerService` (logging)

### 5. Response DTOs with Exclusion

```typescript
export class UserResponseDto {
  id: string;
  email: string;

  @Exclude() // Prevents sending password in responses
  password: string;
}
```

## Multi-Tenancy Implementation

### Request Flow with Tenant Isolation

```
1. User makes request with gymId in params/body
2. Guard validates user has access to gym
3. UseCase/Service adds gymId to all queries
4. Database returns only gym-specific data
```

### Example Implementation

```typescript
// Guard for tenant verification
@Injectable()
export class GymTenantGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { gymId } = request.params;
    const userId = request.user.id;

    // Check if user has access to this gym
    const isAllowed = await this.userService.hasGymAccess(userId, gymId);
    if (!isAllowed) {
      throw new ForbiddenException('No access to this gym');
    }

    // Attach to request for later use
    request.gymId = gymId;
    return true;
  }
}

// Controller usage
@Controller('gyms/:gymId/users')
@UseGuards(AuthGuard, GymTenantGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getGymUsers(@Param('gymId') gymId: string) {
    // gymId is pre-validated and isolated
    return this.userService.findByGymId(gymId);
  }
}

// Service with tenant isolation
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByGymId(gymId: string) {
    return this.prisma.gymMember.findMany({
      where: { gymId }, // Automatic isolation
      include: { user: true },
    });
  }
}
```

## DTO Validation Examples

### Create Operations

```typescript
export class CreateGymDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEmail()
  ownerEmail?: string;
}
```

### Update Operations (Partial)

```typescript
export class UpdateGymDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
```

## Error Handling

Use NestJS exceptions:

```typescript
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

// Usage in services
@Injectable()
export class UserService {
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
```

## Logging Best Practices

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async createUser(dto: CreateUserDto) {
    this.logger.log(`Creating user with email: ${dto.email}`);
    try {
      const user = await this.prisma.user.create({ data: dto });
      this.logger.debug(`User created with ID: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error);
      throw new BadRequestException('Failed to create user');
    }
  }
}
```

## Testing Structure

```typescript
describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should find users by gym', async () => {
    const mockUsers = [{ id: '1', email: 'test@test.com' }];
    jest.spyOn(prisma.user, 'findMany').mockResolvedValue(mockUsers);

    const result = await service.findByGymId('gym123');
    expect(result).toEqual(mockUsers);
  });
});
```

## Common Pitfalls

### ❌ Not Validating Gym Access
```typescript
// WRONG: Returns data for all users in all gyms if gymId matches
async getUsers(@Param('gymId') gymId: string) {
  return this.prisma.user.findMany(); // No gym filter!
}
```

### ❌ Exposing Database Errors
```typescript
// WRONG: Returns raw Prisma errors
async createUser(dto: CreateUserDto) {
  return this.prisma.user.create({ data: dto }); // Prisma error exposed!
}

// CORRECT: Handle and sanitize errors
async createUser(dto: CreateUserDto) {
  try {
    return this.prisma.user.create({ data: dto });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new BadRequestException('Email already exists');
    }
    throw new InternalServerErrorException();
  }
}
```

### ❌ Tight Coupling
```typescript
// WRONG
@Injectable()
export class UserService {
  constructor() {
    this.prisma = new PrismaService(); // Hard-coded dependency
  }
}

// CORRECT
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {} // Injected
}
```

---

**Apply these patterns consistently across all modules for maintainability and scalability.**
