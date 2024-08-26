import { IsArray, IsMongoId, IsOptional } from 'class-validator';

export class UpdateTeamDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  members?: string[];
}
