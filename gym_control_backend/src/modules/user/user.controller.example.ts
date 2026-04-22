import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { RbacService } from '../../rbac/rbac.service';
import {
  Permissions,
  AnyPermissions,
  Public,
} from '../../rbac/rbac.decorators';
import { AuthGuard } from '../../rbac/guards/auth.guard';

/**
 * User Controller - Example RBAC Usage
 *
 * Demonstrates:
 * - Permission-based access control
 * - Multi-tenancy (gymId isolation)
 * - Decorator patterns
 */
@Controller('gyms/:gymId/users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly rbacService: RbacService,
  ) {}

  /**
   * Get current user's permissions
   * Useful for frontend to determine available actions
   */
  @Get('me/permissions')
  async getMyPermissions(@Request() req: any, @Param('gymId') gymId: string) {
    const userId = req.user.id;
    const permissions = await this.rbacService.getUserPermissions(
      userId,
      gymId,
    );
    const roles = await this.rbacService.getUserRoles(userId, gymId);

    return {
      userId,
      gymId,
      roles,
      permissions,
    };
  }

  /**
   * Create new user - requires 'user.create' permission
   * Multiple permissions: user must have ALL of them
   */
  @Post()
  @Permissions('user.create')
  async createUser(
    @Param('gymId') gymId: string,
    @Body() dto: CreateUserDto,
    @Request() req: any,
  ) {
    // Gym context is validated and attached by PermissionsGuard
    const createdBy = req.user.id;
    return this.userService.create(gymId, dto, createdBy);
  }

  /**
   * Get user - limited access based on permissions
   * Only users with 'user.read' permission can access
   */
  @Get(':userId')
  @Permissions('user.read')
  async getUser(
    @Param('gymId') gymId: string,
    @Param('userId') userId: string,
  ) {
    return this.userService.findOneInGym(userId, gymId);
  }

  /**
   * List users - requires 'user.read' permission
   */
  @Get()
  @Permissions('user.read')
  async listUsers(@Param('gymId') gymId: string) {
    return this.userService.findAllInGym(gymId);
  }

  /**
   * Update user - requires 'user.update' permission
   * Can also require multiple permissions
   */
  @Post(':userId')
  @Permissions('user.update')
  async updateUser(
    @Param('gymId') gymId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto,
    @Request() req: any,
  ) {
    const updateBy = req.user.id;
    return this.userService.update(userId, gymId, dto, updateBy);
  }

  /**
   * Delete user - requires 'user.delete' permission
   */
  @Post(':userId/delete')
  @Permissions('user.delete')
  async deleteUser(
    @Param('gymId') gymId: string,
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    const deletedBy = req.user.id;
    return this.userService.delete(userId, gymId, deletedBy);
  }

  /**
   * Advanced: Multiple permissions (AND logic)
   * User must have ALL permissions
   */
  @Post(':userId/admin-actions')
  @Permissions('user.read', 'user.update', 'user.delete')
  async performAdminActions(
    @Param('gymId') gymId: string,
    @Param('userId') userId: string,
    @Body() dto: any,
  ) {
    // Only users with ALL three permissions can access
    return this.userService.performAdminActions(userId, gymId, dto);
  }

  /**
   * Advanced: Any permission (OR logic)
   * User needs ANY of the permissions
   * Useful for: "managers OR admins can do this"
   */
  @Get(':userId/stats')
  @AnyPermissions('manager.view_stats', 'admin.full')
  async getUserStats(
    @Param('gymId') gymId: string,
    @Param('userId') userId: string,
  ) {
    return this.userService.getStats(userId, gymId);
  }

  /**
   * Check specific permission dynamically
   * Useful when permission depends on business logic
   */
  @Post(':userId/send-invitation')
  async sendInvitation(
    @Param('gymId') gymId: string,
    @Param('userId') targetUserId: string,
    @Request() req: any,
  ) {
    const currentUserId = req.user.id;

    // Dynamic permission check
    const canInvite = await this.rbacService.hasPermission(
      currentUserId,
      gymId,
      'user.invite',
    );

    if (!canInvite) {
      throw new Error('User cannot invite others');
    }

    return this.userService.sendInvitation(currentUserId, targetUserId, gymId);
  }
}
