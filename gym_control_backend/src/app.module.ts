import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { validate } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { GymModule } from './modules/gym/gym.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { TrainingExecutionModule } from './modules/training-execution/training-execution.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BillingModule } from './modules/billing/billing.module';
import { TrainingModule } from './modules/training/training.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { ActivityModule } from './modules/activity/activity.module';
import { SocialModule } from './modules/social/social.module';
import { AuditModule } from './modules/audit/audit.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StructuredLoggerService } from './common/logger/structured-logger.service';

/**
 * Root Application Module
 * Configures global modules, providers, and feature modules
 * Follows modular architecture for scalability and maintainability
 */
@Module({
  imports: [
    /**
     * Configuration Module - Load and validate environment variables
     * Global: true makes it available to all modules without importing
     */
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: '.env',
    }),

    /**
     * Global Prisma Module
     * Provides database access throughout the application
     */
    PrismaModule,

    /**
     * Feature Modules
     */
    AuthModule,
    UserModule,
    GymModule,
    RbacModule,
    SchedulingModule,
    TrainingExecutionModule,
    NotificationsModule,
    BillingModule,
    TrainingModule,
    NutritionModule,
    ActivityModule,
    SocialModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService, StructuredLoggerService],
})
export class AppModule {}
