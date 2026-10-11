import { PostStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

/** Optional filters for listing posts. */
export class QueryPostsDto {
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  /** Filter by tag slug. */
  @IsOptional()
  @IsString()
  tag?: string;
}
