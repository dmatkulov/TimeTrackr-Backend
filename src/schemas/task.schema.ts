import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import mongoose, { Document } from 'mongoose';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GetTasksDto } from '../dto/get-tasks.dto';

@Schema()
export class Task {
  @Prop({ ref: User.name, required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: Date, default: new Date() })
  executionDate: Date;

  @ValidateNested({ each: true })
  @Type(() => GetTasksDto)
  tasks: GetTasksDto[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
export type TaskDocument = Task & Document;
