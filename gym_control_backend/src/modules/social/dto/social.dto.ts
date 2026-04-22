import { IsOptional, IsString } from 'class-validator';
import { MediaType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CreatePostDto {
  @IsString()
  userId: string;
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
