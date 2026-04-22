import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCommentDto,
  CreateMediaPostDto,
  CreatePostDto,
} from './dto/social.dto';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(gymId: string, dto: CreatePostDto) {
    await this.ensureUser(gymId, dto.userId);
    return this.prisma.post.create({ data: { gymId, ...dto } });
  }
  async listPosts(
    gymId: string,
    viewerUserId?: string,
    filter: 'all' | 'own' | 'liked' = 'all',
  ) {
    const where: {
      gymId: string;
      deletedAt: null;
      userId?: string;
      likes?: { some: { userId: string } };
    } = { gymId, deletedAt: null };
    if (filter === 'own' && viewerUserId) {
      where.userId = viewerUserId;
    }
    if (filter === 'liked' && viewerUserId) {
      where.likes = { some: { userId: viewerUserId } };
    }

    const posts = await this.prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        _count: { select: { likes: true } },
        likes: viewerUserId
          ? { where: { userId: viewerUserId }, select: { id: true }, take: 1 }
          : false,
        comments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            postId: true,
            userId: true,
            parentId: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });
    return posts.map((post) => ({
      ...post,
      likeCount: post._count.likes,
      isLiked: viewerUserId ? post.likes.length > 0 : false,
    }));
  }
  async createComment(gymId: string, dto: CreateCommentDto) {
    await this.ensureUser(gymId, dto.userId);
    await this.ensurePost(gymId, dto.postId);
    return this.prisma.comment.create({ data: dto });
  }
  async likePost(gymId: string, postId: string, userId: string) {
    await this.ensureUser(gymId, userId);
    await this.ensurePost(gymId, postId);
    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
      select: { id: true },
    });

    if (existing) {
      await this.prisma.postLike.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.postLike.create({ data: { postId, userId } });
    }

    const likeCount = await this.prisma.postLike.count({ where: { postId } });
    return { postId, userId, isLiked: !existing, likeCount };
  }
  async createMediaPost(gymId: string, dto: CreateMediaPostDto) {
    await this.ensureUser(gymId, dto.userId);
    return this.prisma.mediaPost.create({ data: { gymId, ...dto } });
  }
  async listMediaPosts(gymId: string, userId?: string) {
    return this.prisma.mediaPost.findMany({
      where: { gymId, deletedAt: null, ...(userId ? { userId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  private async ensureUser(gymId: string, userId: string) {
    const row = await this.prisma.user.findFirst({
      where: { id: userId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!row) throw new NotFoundException('User not found');
  }
  private async ensurePost(gymId: string, postId: string) {
    const row = await this.prisma.post.findFirst({
      where: { id: postId, gymId, deletedAt: null },
      select: { id: true },
    });
    if (!row) throw new NotFoundException('Post not found');
  }
}
