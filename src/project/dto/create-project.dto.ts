import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProjectEnum } from '../../utils/enums/project.enum';
import { Types } from 'mongoose';

export class CreateProjectDto {
  @IsMongoId()
  teamID: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  deadline: string;

  @IsEnum(ProjectEnum)
  type: ProjectEnum;
}
