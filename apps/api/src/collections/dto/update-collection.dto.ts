import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateCollectionDto } from './create-collection.dto';

// All CreateCollectionDto fields become optional, keeping their validation rules.
export class UpdateCollectionDto extends PartialType(
  OmitType(CreateCollectionDto, ['description'] as const),
) {
  /** null clears the description (@IsOptional() permits null). */
  @IsOptional()
  @IsString()
  description?: string | null;
}
