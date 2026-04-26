# Zudel OS Backend

A production-ready SaaS multi-tenant gym management system built with NestJS, Prisma, and PostgreSQL.

## Quick Links

- 📖 [Setup Guide](./SETUP_GUIDE.md) - Complete setup instructions
- 🏗️ [Best Practices](./BEST_PRACTICES.md) - Architecture patterns and guidelines
- 🔧 [Configuration](./src/config) - Environment and app configuration
- 📦 [Prisma Schema](./prisma/schema.prisma) - Database schema

## Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 14+
- **Validation**: class-validator & class-transformer
- **Testing**: Jest

## Features

✅ Modular architecture
✅ Multi-tenant system (isolated via gymId)
✅ Role-Based Access Control (RBAC)
✅ Global Prisma integration
✅ Environment validation
✅ Global validation pipes
✅ Graceful shutdown

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Setup Environment

```bash
cp .env.example .env
# Edit .env with your database URL
```

### Database Setup

```bash
pnpm prisma generate
pnpm prisma migrate dev --name initial
```

### Start Development Server

```bash
pnpm start:dev
```

Server runs on `http://localhost:3000`

## Project Structure

```
src/
├── config/              # Configuration
├── modules/             # Feature modules
│   ├── auth/           # Authentication
│   ├── user/           # User management
│   ├── gym/            # Gym management
│   └── rbac/           # Role-based access control
├── common/             # Shared utilities
│   ├── guards/         # Authorization guards
│   ├── decorators/     # Custom decorators
│   └── interceptors/   # HTTP interceptors
├── prisma/             # Database service
├── app.module.ts       # Root module
└── main.ts             # Entry point
```

## Available Scripts

```bash
# Development
pnpm start:dev      # Run with hot-reload
pnpm start:debug    # Debug mode

# Build & Production
pnpm build          # Build for production
pnpm start:prod     # Run production build

# Code Quality
pnpm lint           # Run ESLint
pnpm format         # Format with Prettier

# Testing
pnpm test           # Run unit tests
pnpm test:watch     # Watch mode
pnpm test:cov       # Coverage report
pnpm test:e2e       # E2E tests

# Database
pnpm prisma studio # Open Prisma GUI
pnpm prisma migrate dev --name <name>  # Create migration
```

## Docker

Run with Docker Compose (includes PostgreSQL):

```bash
docker-compose up -d
```

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing

Optional:
- `NODE_ENV` - Environment (default: development)
- `PORT` - Port to run on (default: 3000)
- `CORS_ORIGIN` - CORS allowed origin
- `DEBUG` - Enable debug logging

See `.env.example` for all options.

## Next Steps

1. Add Prisma schema in `prisma/schema.prisma`
2. Implement auth module (JWT, password hashing)
3. Setup RBAC with role guards
4. Add database migrations
5. Implement feature modules
6. Add tests

## Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup and architecture
- [Best Practices](./BEST_PRACTICES.md) - Code patterns and guidelines

## Support

For issues and questions, refer to:
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)

---

**Version**: 1.0.0  
**Last Updated**: April 2026
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
