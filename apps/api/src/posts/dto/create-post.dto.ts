import { PostStatus } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  title: string;

  /** Markdown body. */
  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  // No slug field: the slug is service-managed (derived from the title on publish,
  // suffix-deduped). Clients read the generated slug from the response.

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  /**
   * Tag names — the post's only grouping. Each is matched to an existing tag by
   * name (case-insensitive) or slug, or created. On update this replaces the
   * whole tag set.
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  tags?: string[];
}
