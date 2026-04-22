import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PermissionScope } from '@prisma/client';
import { Permission, Scope } from '../rbac/rbac.decorators';
import {
  CreateExerciseLogDto,
  CreateSetLogDto,
  CreateWorkoutSessionDto,
  UpdateWorkoutSessionDto,
} from './dto/training-execution.dto';
import { TrainingExecutionService } from './training-execution.service';

@Controller('gyms/:gymId/training-execution')
export class TrainingExecutionController {
  constructor(
    private readonly trainingExecutionService: TrainingExecutionService,
  ) {}

  @Post('workout-sessions')
  @Permission('workout_session:create')
  @Scope(PermissionScope.OWN)
  createWorkoutSession(
    @Param('gymId') gymId: string,
    @Body() dto: CreateWorkoutSessionDto,
  ) {
    return this.trainingExecutionService.createWorkoutSession(gymId, dto);
  }

  @Patch('workout-sessions/:workoutSessionId')
  @Permission('workout_session:update')
  @Scope(PermissionScope.OWN)
  updateWorkoutSession(
    @Param('gymId') gymId: string,
    @Param('workoutSessionId') workoutSessionId: string,
    @Body() dto: UpdateWorkoutSessionDto,
  ) {
    return this.trainingExecutionService.updateWorkoutSession(
      gymId,
      workoutSessionId,
      dto,
    );
  }

  @Get('workout-sessions')
  @Permission('workout_session:read')
  @Scope(PermissionScope.GYM)
  listWorkoutSessions(
    @Param('gymId') gymId: string,
    @Query('userId') userId?: string,
  ) {
    return this.trainingExecutionService.listWorkoutSessions(gymId, userId);
  }

  @Post('exercise-logs')
  @Permission('exercise_log:create')
  @Scope(PermissionScope.OWN)
  createExerciseLog(
    @Param('gymId') gymId: string,
    @Body() dto: CreateExerciseLogDto,
  ) {
    return this.trainingExecutionService.createExerciseLog(gymId, dto);
  }

  @Get('exercise-logs')
  @Permission('exercise_log:read')
  @Scope(PermissionScope.OWN)
  listExerciseLogs(
    @Param('gymId') gymId: string,
    @Query('workoutSessionId') workoutSessionId: string,
  ) {
    return this.trainingExecutionService.listExerciseLogs(
      gymId,
      workoutSessionId,
    );
  }

  @Post('set-logs')
  @Permission('set_log:create')
  @Scope(PermissionScope.OWN)
  createSetLog(@Param('gymId') gymId: string, @Body() dto: CreateSetLogDto) {
    return this.trainingExecutionService.createSetLog(gymId, dto);
  }

  @Get('set-logs')
  @Permission('set_log:read')
  @Scope(PermissionScope.OWN)
  listSetLogs(
    @Param('gymId') gymId: string,
    @Query('exerciseLogId') exerciseLogId: string,
  ) {
    return this.trainingExecutionService.listSetLogs(gymId, exerciseLogId);
  }
}
