import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PermissionScope } from '@prisma/client';
import { Permission, Scope } from '../rbac/rbac.decorators';
import { ActivityService } from './activity.service';
import { CreateCheckinDto, CreateUserActivityDto } from './dto/activity.dto';

@Controller('gyms/:gymId/activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post('checkins')
  @Permission('checkin:create')
  @Scope(PermissionScope.OWN)
  createCheckin(@Param('gymId') gymId: string, @Body() dto: CreateCheckinDto) {
    return this.activityService.createCheckin(gymId, dto);
  }

  @Get('checkins')
  @Permission('checkin:read')
  @Scope(PermissionScope.GYM)
  listCheckins(
    @Param('gymId') gymId: string,
    @Query('userId') userId?: string,
  ) {
    return this.activityService.listCheckins(gymId, userId);
  }

  @Post('user-activities')
  @Permission('user_activity:create')
  @Scope(PermissionScope.GYM)
  createUserActivity(
    @Param('gymId') gymId: string,
    @Body() dto: CreateUserActivityDto,
  ) {
    return this.activityService.createUserActivity(gymId, dto);
  }

  @Get('user-activities')
  @Permission('user_activity:read')
  @Scope(PermissionScope.GYM)
  listUserActivities(
    @Param('gymId') gymId: string,
    @Query('userId') userId?: string,
  ) {
    return this.activityService.listUserActivities(gymId, userId);
  }
}
