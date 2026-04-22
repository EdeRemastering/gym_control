import { Module } from '@nestjs/common';
import { TrainingExecutionController } from './training-execution.controller';
import { TrainingExecutionService } from './training-execution.service';

@Module({
  controllers: [TrainingExecutionController],
  providers: [TrainingExecutionService],
  exports: [TrainingExecutionService],
})
export class TrainingExecutionModule {}
