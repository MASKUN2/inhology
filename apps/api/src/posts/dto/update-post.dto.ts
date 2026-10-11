import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsOptional } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

// All CreatePostDto fields become optional, keeping their validation rules.
export class UpdatePostDto extends PartialType(CreatePostDto) {
  /** ISO date-time. Overwrites the publication date; omit to keep the current one. */
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
