import { IsMongoId, IsOptional } from 'class-validator';
import mongoose from 'mongoose';
import { Type } from 'class-transformer';

export class TaskQueryDto {
  @IsMongoId()
  @IsOptional()
  userId: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @Type(() => Date)
  date: Date;
}
