import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GetTaskInfoDto } from './get-taskInfo.dto';

export class CreateTaskDto {
  @Type(() => Date)
  @IsNotEmpty()
  executionDate: Date;

  @ValidateNested({ each: true })
  @Type(() => GetTaskInfoDto)
  tasks: GetTaskInfoDto[];
}
