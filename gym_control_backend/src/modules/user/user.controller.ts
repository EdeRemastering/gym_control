import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PermissionScope } from '@prisma/client';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserListQueryDto } from './dto/user.dto';
import { Permission, Scope } from '../rbac/rbac.decorators';
import { AuthzWhere } from '../rbac/authz-where.decorator';

/**
 * UserController
 * HTTP endpoints for user operations
 */
@Controller('gyms/:gymId/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Permission('user:create')
  @Scope(PermissionScope.GYM)
  create(@Param('gymId') gymId: string, @Body() dto: CreateUserDto) {
    return this.userService.create(gymId, dto);
  }

  @Get()
  @Permission('user:read')
  @Scope(PermissionScope.OWN)
  findAll(
    @Param('gymId') gymId: string,
    @Query() query: UserListQueryDto,
    @AuthzWhere() authzWhere: Record<string, unknown>,
  ) {
    return this.userService.findAllAuthorized(gymId, authzWhere, query.search);
  }

  @Get(':id')
  @Permission('user:read')
  @Scope(PermissionScope.OWN)
  findOne(@Param('gymId') gymId: string, @Param('id') id: string) {
    return this.userService.findOne(gymId, id);
  }

  @Patch(':id')
  @Permission('user:update')
  @Scope(PermissionScope.OWN)
  update(
    @Param('gymId') gymId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(gymId, id, dto);
  }

  @Delete(':id')
  @Permission('user:delete')
  @Scope(PermissionScope.OWN)
  remove(@Param('gymId') gymId: string, @Param('id') id: string) {
    return this.userService.remove(gymId, id);
  }
}
