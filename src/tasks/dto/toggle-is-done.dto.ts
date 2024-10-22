import { IsArray, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class ToggleIsDoneDto {
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  projects: Types.ObjectId[];

  value: boolean;
}
