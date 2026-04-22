import { Module } from '@nestjs/common';
import { GymService } from './gym.service';
import { GymController } from './gym.controller';

/**
 * Gym Module
 * Handles gym management, settings, and multi-tenancy isolation
 * Scope: Gym CRUD operations and gym-specific configurations
 */
@Module({
  controllers: [GymController],
  providers: [GymService],
  exports: [GymService],
})
export class GymModule {}
