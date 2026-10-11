import { PostStatus } from '@prisma/client';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

/** Optional filters for listing posts. */
export class QueryPostsDto {
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  /**
   * 'true' asks for the posts the caller may read on the site (published; plus
   * private for the admin, never drafts). Takes precedence over `status`.
   */
  @IsOptional()
  @IsIn(['true', 'false'])
  visible?: string;

  /** Filter by tag slug. */
  @IsOptional()
  @IsString()
  tag?: string;
}
