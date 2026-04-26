import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MediaType, PostType } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  userId: string;
  @IsOptional()
  @IsEnum(PostType)
  postType?: PostType;
  @IsString()
  content: string;
  @IsOptional()
  @IsString()
  mediaUrl?: string;
}

export class CreateCommentDto {
  @IsString()
  postId: string;
  @IsString()
  userId: string;
  @IsOptional()
  @IsString()
  parentId?: string;
  @IsString()
  content: string;
}

export class CreateMediaPostDto {
  @IsString()
  userId: string;
  @IsEnum(MediaType)
  type: MediaType;
  @IsString()
  mediaUrl: string;
  @IsOptional()
  @IsString()
  caption?: string;
}

export class CreateMediaCommentDto {
  @IsString()
  mediaPostId: string;

  @IsString()
  userId: string;

  @IsString()
  content: string;
}
