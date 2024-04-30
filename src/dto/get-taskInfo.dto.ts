import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskLabel } from '../enums/task-label.enum';

export class GetTaskInfoDto {
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
  @IsEnum(TaskLabel)
  label: TaskLabel;
}
