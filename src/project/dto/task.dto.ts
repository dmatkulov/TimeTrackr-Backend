import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { StatusEnum } from '../../utils/enums/status.enum';
import { Types } from 'mongoose';

export class TaskDto {
  @IsMongoId()
  user: Types.ObjectId;

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

  timeExpected?: string;

  @IsString()
  timeSpent: string;

  timeCalculated?: number;
}
