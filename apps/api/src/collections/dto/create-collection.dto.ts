import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  // No slug field: the slug is derived from the title.

  /**
   * The rules, as tag names: a post must carry every one. Matched or created like
   * a post's tags. Empty or omitted means the collection shows every post.
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  rules?: string[];
}
