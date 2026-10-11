import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class ReorderHomeTagsDto {
  /** Ids of the tags shown on the home page, in the wanted order. */
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  ids: string[];
}
