import {
  ArrayNotEmpty,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  members: string[];
}
