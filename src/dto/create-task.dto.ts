import { IsMongoId, IsNotEmpty, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';
import { Type } from 'class-transformer';
import { GetTaskInfoDto } from './get-taskInfo.dto';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: mongoose.Schema.Types.ObjectId;

  @Type(() => Date)
  @IsNotEmpty()
  executionDate: Date;

  @ValidateNested({ each: true })
  @Type(() => GetTaskInfoDto)
  tasks: GetTaskInfoDto[];
}
