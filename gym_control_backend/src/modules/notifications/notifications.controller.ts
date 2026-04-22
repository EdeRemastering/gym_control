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
  CreateNotificationDto,
  MarkNotificationAsReadDto,
  UpsertNotificationPreferencesDto,
} from './dto/notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('gyms/:gymId/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Permission('notification:create')
  @Scope(PermissionScope.GYM)
  create(@Param('gymId') gymId: string, @Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(gymId, dto);
  }

  @Get()
  @Permission('notification:read')
  @Scope(PermissionScope.OWN)
  list(
    @Param('gymId') gymId: string,
    @Query('userId') userId?: string,
    @Query('onlyUnread') onlyUnread?: string,
  ) {
    return this.notificationsService.list(gymId, userId, onlyUnread === 'true');
  }

  @Patch(':notificationId/read-status')
  @Permission('notification:update')
  @Scope(PermissionScope.OWN)
  updateReadStatus(
    @Param('gymId') gymId: string,
    @Param('notificationId') notificationId: string,
    @Body() dto: MarkNotificationAsReadDto,
  ) {
    return this.notificationsService.updateReadStatus(
      gymId,
      notificationId,
      dto,
    );
  }

  @Get('preferences/:userId')
  @Permission('notification_preferences:read')
  @Scope(PermissionScope.OWN)
  getPreferences(
    @Param('gymId') gymId: string,
    @Param('userId') userId: string,
  ) {
    return this.notificationsService.getPreferences(gymId, userId);
  }

  @Patch('preferences/:userId')
  @Permission('notification_preferences:update')
  @Scope(PermissionScope.OWN)
  upsertPreferences(
    @Param('gymId') gymId: string,
    @Param('userId') userId: string,
    @Body() dto: UpsertNotificationPreferencesDto,
  ) {
    return this.notificationsService.upsertPreferences(gymId, userId, dto);
  }
}
