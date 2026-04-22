import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PermissionScope } from '@prisma/client';
import { Permission, Scope } from '../rbac/rbac.decorators';
import {
  CreateCommentDto,
  CreateMediaPostDto,
  CreatePostDto,
} from './dto/social.dto';
import { SocialService } from './social.service';

@Controller('gyms/:gymId/social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('posts')
  @Permission('post:create')
  @Scope(PermissionScope.OWN)
  createPost(@Param('gymId') gymId: string, @Body() dto: CreatePostDto) {
    return this.socialService.createPost(gymId, dto);
  }

  @Get('posts')
  @Permission('post:read')
  @Scope(PermissionScope.GYM)
  listPosts(
    @Param('gymId') gymId: string,
    @Query('userId') userId?: string,
    @Query('filter') filter?: 'all' | 'own' | 'liked',
  ) {
    return this.socialService.listPosts(gymId, userId, filter);
  }

  @Post('comments')
  @Permission('comment:create')
  @Scope(PermissionScope.OWN)
  createComment(@Param('gymId') gymId: string, @Body() dto: CreateCommentDto) {
    return this.socialService.createComment(gymId, dto);
  }

  @Post('post-likes')
  @Permission('post_like:create')
  @Scope(PermissionScope.OWN)
  likePost(
    @Param('gymId') gymId: string,
    @Query('postId') postId: string,
    @Query('userId') userId: string,
  ) {
    return this.socialService.likePost(gymId, postId, userId);
  }

  @Post('media-posts')
  @Permission('media_post:create')
  @Scope(PermissionScope.OWN)
  createMediaPost(
    @Param('gymId') gymId: string,
    @Body() dto: CreateMediaPostDto,
  ) {
    return this.socialService.createMediaPost(gymId, dto);
  }

  @Get('media-posts')
  @Permission('media_post:read')
  @Scope(PermissionScope.GYM)
  listMediaPosts(
    @Param('gymId') gymId: string,
    @Query('userId') userId?: string,
  ) {
    return this.socialService.listMediaPosts(gymId, userId);
  }
}
