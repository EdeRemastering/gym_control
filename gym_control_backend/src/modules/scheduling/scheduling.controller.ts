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
import { SchedulingService } from './scheduling.service';
import {
  CreateClassBookingDto,
  CreateClassDto,
  CreateClassScheduleDto,
  CreateClassSessionDto,
  UpdateClassBookingDto,
  UpdateClassDto,
  UpdateClassScheduleDto,
  UpdateClassSessionDto,
} from './dto/scheduling.dto';

@Controller('gyms/:gymId/scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Post('classes')
  @Permission('class:create')
  @Scope(PermissionScope.GYM)
  createClass(@Param('gymId') gymId: string, @Body() dto: CreateClassDto) {
    return this.schedulingService.createClass(gymId, dto);
  }

  @Get('classes')
  @Permission('class:read')
  @Scope(PermissionScope.GYM)
  listClasses(@Param('gymId') gymId: string) {
    return this.schedulingService.listClasses(gymId);
  }

  @Patch('classes/:classId')
  @Permission('class:update')
  @Scope(PermissionScope.GYM)
  updateClass(
    @Param('gymId') gymId: string,
    @Param('classId') classId: string,
    @Body() dto: UpdateClassDto,
  ) {
    return this.schedulingService.updateClass(gymId, classId, dto);
  }

  @Patch('classes/:classId/delete')
  @Permission('class:delete')
  @Scope(PermissionScope.GYM)
  deleteClass(
    @Param('gymId') gymId: string,
    @Param('classId') classId: string,
  ) {
    return this.schedulingService.deleteClass(gymId, classId);
  }

  @Post('schedules')
  @Permission('class_schedule:create')
  @Scope(PermissionScope.GYM)
  createSchedule(
    @Param('gymId') gymId: string,
    @Body() dto: CreateClassScheduleDto,
  ) {
    return this.schedulingService.createSchedule(gymId, dto);
  }

  @Patch('schedules/:scheduleId')
  @Permission('class_schedule:update')
  @Scope(PermissionScope.GYM)
  updateSchedule(
    @Param('gymId') gymId: string,
    @Param('scheduleId') scheduleId: string,
    @Body() dto: UpdateClassScheduleDto,
  ) {
    return this.schedulingService.updateSchedule(gymId, scheduleId, dto);
  }

  @Post('sessions')
  @Permission('class_session:create')
  @Scope(PermissionScope.GYM)
  createSession(
    @Param('gymId') gymId: string,
    @Body() dto: CreateClassSessionDto,
  ) {
    return this.schedulingService.createSession(gymId, dto);
  }

  @Get('sessions')
  @Permission('class_session:read')
  @Scope(PermissionScope.GYM)
  listSessions(
    @Param('gymId') gymId: string,
    @Query('fromDate') fromDate?: string,
  ) {
    return this.schedulingService.listSessions(gymId, fromDate);
  }

  @Patch('sessions/:sessionId')
  @Permission('class_session:update')
  @Scope(PermissionScope.GYM)
  updateSession(
    @Param('gymId') gymId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateClassSessionDto,
  ) {
    return this.schedulingService.updateSession(gymId, sessionId, dto);
  }

  @Post('bookings')
  @Permission('class_booking:create')
  @Scope(PermissionScope.OWN)
  createBooking(
    @Param('gymId') gymId: string,
    @Body() dto: CreateClassBookingDto,
  ) {
    return this.schedulingService.createBooking(gymId, dto);
  }

  @Patch('bookings/:bookingId')
  @Permission('class_booking:update')
  @Scope(PermissionScope.GYM)
  updateBooking(
    @Param('gymId') gymId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: UpdateClassBookingDto,
  ) {
    return this.schedulingService.updateBooking(gymId, bookingId, dto);
  }

  @Get('bookings')
  @Permission('class_booking:read')
  @Scope(PermissionScope.GYM)
  listBookings(
    @Param('gymId') gymId: string,
    @Query('userId') userId?: string,
  ) {
    return this.schedulingService.listBookings(gymId, userId);
  }
}
