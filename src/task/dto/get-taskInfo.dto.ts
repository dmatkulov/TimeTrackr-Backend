import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LabelEnum } from '../../utils/enums/label.enum';

export class GetTaskInfoDto {
  _id: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(LabelEnum)
  label: LabelEnum;

  timeSpent: number;
}
