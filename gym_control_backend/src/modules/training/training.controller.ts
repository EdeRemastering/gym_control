import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PermissionScope } from '@prisma/client';
import { Permission, Scope } from '../rbac/rbac.decorators';
import { TrainingService } from './training.service';
import {
  AddRoutineExerciseDto,
  AssignRoutineDto,
  CreateExerciseDto,
  CreateProgressDto,
  CreateRoutineDto,
} from './dto/training.dto';

@Controller('gyms/:gymId/training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post('routines')
  @Permission('routine:create')
  @Scope(PermissionScope.GYM)
  createRoutine(@Param('gymId') gymId: string, @Body() dto: CreateRoutineDto) {
    return this.trainingService.createRoutine(gymId, dto);
  }
  @Get('routines')
  @Permission('routine:read')
  @Scope(PermissionScope.GYM)
  listRoutines(@Param('gymId') gymId: string) {
    return this.trainingService.listRoutines(gymId);
  }

  @Post('exercises')
  @Permission('exercise:create')
  @Scope(PermissionScope.GYM)
  createExercise(
    @Param('gymId') gymId: string,
    @Body() dto: CreateExerciseDto,
  ) {
    return this.trainingService.createExercise(gymId, dto);
  }
  @Get('exercises')
  @Permission('exercise:read')
  @Scope(PermissionScope.GYM)
  listExercises(@Param('gymId') gymId: string) {
    return this.trainingService.listExercises(gymId);
  }

  @Post('routine-exercises')
  @Permission('routine_exercise:create')
  @Scope(PermissionScope.GYM)
  addRoutineExercise(
    @Param('gymId') gymId: string,
    @Body() dto: AddRoutineExerciseDto,
  ) {
    return this.trainingService.addRoutineExercise(gymId, dto);
  }

  @Get('routines/:routineId/exercises')
  @Permission('routine_exercise:read')
  @Scope(PermissionScope.GYM)
  listRoutineExercises(
    @Param('gymId') gymId: string,
    @Param('routineId') routineId: string,
  ) {
    return this.trainingService.listRoutineExercises(gymId, routineId);
  }

  @Post('user-routines')
  @Permission('user_routine:create')
  @Scope(PermissionScope.GYM)
  assignRoutine(@Param('gymId') gymId: string, @Body() dto: AssignRoutineDto) {
    return this.trainingService.assignRoutine(gymId, dto);
  }

  @Post('progress')
  @Permission('progress:create')
  @Scope(PermissionScope.OWN)
  createProgress(
    @Param('gymId') gymId: string,
    @Body() dto: CreateProgressDto,
  ) {
    return this.trainingService.createProgress(gymId, dto);
  }
}
