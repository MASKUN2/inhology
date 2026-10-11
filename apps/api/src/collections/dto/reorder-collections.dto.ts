import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class ReorderCollectionsDto {
  /** Collection ids in the wanted order. */
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  ids: string[];
}
