import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateTagDto } from './create-tag.dto';

export class UpdateTagDto extends PartialType(
  OmitType(CreateTagDto, ['description'] as const),
) {
  /** null clears the description (@IsOptional() permits null). */
  @IsOptional()
  @IsString()
  description?: string | null;

  /** Show the tag in the home page's list (true: added last) or take it off. */
  @IsOptional()
  @IsBoolean()
  home?: boolean;
}
