import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { StatusEnum } from '../../utils/enums/status.enum';

export class TaskDto {
  @IsMongoId()
  user: string;

  @IsString()
  @IsNotEmpty()
  executionDate: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(StatusEnum)
  status: StatusEnum;

  timeExpected: string;

  timeSpent: string;

  timeCalculated: number;
}
